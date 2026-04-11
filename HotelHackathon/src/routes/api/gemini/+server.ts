import { GoogleGenAI } from '@google/genai';
import { error, json } from '@sveltejs/kit';
import { GEMINI_API_KEY } from '$env/static/private';
import { pb } from '$lib/pocketbase.js';
type ChatMessage = {
	role: 'user' | 'assistant';
	content: string;
};

const GEMINI_MODEL = 'gemini-2.5-flash-lite';

const ai = new GoogleGenAI({
	apiKey: GEMINI_API_KEY
});

const toGeminiRole = (role: ChatMessage['role']) => (role === 'assistant' ? 'model' : 'user');

export const POST = async ({ request, cookies }) => {

    const authToken = cookies.get('pb_auth') || '';
    pb.authStore.loadFromCookie(authToken);

	if (!GEMINI_API_KEY || !pb.authStore.isValid) {
		throw error(500, 'Set GEMINI_API_KEY in your environment before using this route.');
	}

	const body = (await request.json().catch(() => null)) as { message?: string; messages: { role: string, content: string} } | null;

	if (!body || typeof body.message !== 'string' || !body.message.trim()) {
		throw error(400, 'A non-empty message is required.');
	}

    pb.collection('Chatmessages').create({
        user_chat: pb.authStore.record!.id,
        sender: 'User',
        content: body.message,
    });

	const history = Array.isArray(body.messages)
		? body.messages
				.filter((item): item is ChatMessage => {
					return (
						typeof item === 'object' &&
						item !== null &&
						'role' in item &&
						'content' in item &&
						typeof (item as ChatMessage).role === 'string' &&
						typeof (item as ChatMessage).content === 'string' &&
						((item as ChatMessage).role === 'user' || (item as ChatMessage).role === 'assistant')
					);
				})
				.map((item) => ({
					role: toGeminiRole(item.role),
					parts: [{ text: item.content }]
				}))
		: [];

    type ResponseFormat = {
        type: 'message' | 'intervention';
        severity: 'low' | 'medium' | 'high';
        title: string;
        body: string;
    };

	const response = await ai.models.generateContent({
		model: GEMINI_MODEL,
		contents: [
			...history,
			{
				role: 'user',
				parts: [{ text: body.message }]
			}
		],
		config: {
			systemInstruction:
				"Act as an AI hotel host for a guest-facing help desk. Your role is to provide concise, friendly, and practical assistance regarding check-in, room access, amenities, checkout, and basic troubleshooting. You must output every response in a valid JSON format with the following keys: 'type', 'severity', 'title', and 'body'. The 'type' value should either be 'message' or 'intervention' based on whether it is just informing the user who sent it or if a staff member needs to intervene. The 'title' value should be a quick summary of the message. The 'severity' value must be one of 'low', 'medium', or 'high'. Assign 'high' for urgent issues like room access or safety, 'medium' for check-in/out help, and 'low' for general amenities. If a request requires staff intervention, state 'A staff member is being notified.' in the body. Do not include any text, markdown, or explanations outside of the JSON object.",
			temperature: 0.4,
			maxOutputTokens: 10000,
            responseJsonSchema: {
                "type": "object",
                "additionalProperties": false,
                "required": ["type", "severity", "title", "body"],
                "properties": {
                    "type": {
                    "type": "string",
                    "description": "Indicates whether this is a normal message or requires staff action.",
                    "enum": ["message", "intervention"]
                    },
                    "severity": {
                    "type": "string",
                    "description": "Priority level of the issue.",
                    "enum": ["low", "medium", "high"]
                    },
                    "title": {
                    "type": "string",
                    "description": "Short summary of the response."
                    },
                    "body": {
                    "type": "string",
                    "description": "Main response content. If type is 'intervention', must include: 'A staff member is being notified.'"
                    }
                }
            }
		}
	});

	const reply = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();

    console.log('Gemini response:', reply);

	if (!reply) {
		throw error(502, 'Gemini returned an empty response.');
	}

    const parsedReply: ResponseFormat = JSON.parse(reply); 

    pb.collection('Chatmessages').create({
        user_chat: pb.authStore.record!.id,
        sender: 'AI',
        content: parsedReply.body,
    });

    if (parsedReply.type === 'intervention') {
        await pb.collection('EscalationNotifications').create({
            user: pb.authStore.record!.id,
            content: `AI Escalation: ${parsedReply.title}`,
            severity: parsedReply.severity,
            resolved: false,
        });

        if (parsedReply.severity === 'high') {
            // TODO: Email staff or trigger real-time alert for immediate attention
        }
    }

	return json({ reply: parsedReply.body });
};