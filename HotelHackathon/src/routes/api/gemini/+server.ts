import { GoogleGenAI } from '@google/genai';
import { error, json } from '@sveltejs/kit';
import { GEMINI_API_KEY } from '$env/static/private';

type ChatMessage = {
	role: 'user' | 'assistant';
	content: string;
};

const GEMINI_MODEL = 'gemini-3-flash-preview';

const ai = new GoogleGenAI({
	apiKey: GEMINI_API_KEY
});

const toGeminiRole = (role: ChatMessage['role']) => (role === 'assistant' ? 'model' : 'user');

export const POST = async ({ request }) => {
	if (!GEMINI_API_KEY) {
		throw error(500, 'Set GEMINI_API_KEY in your environment before using this route.');
	}

	const body = (await request.json().catch(() => null)) as
		| { message?: unknown; messages?: unknown }
		| null;

	if (!body || typeof body.message !== 'string' || !body.message.trim()) {
		throw error(400, 'A non-empty message is required.');
	}

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
				'You are the AI hotel host for a guest-facing help desk. Keep replies concise, friendly, and practical. Help with check-in, room access, amenities, checkout, and basic troubleshooting. If a request needs staff intervention, say so clearly and recommend contacting staff directly saying: "A staff member is being notified."',
			temperature: 0.4,
			maxOutputTokens: 256
		}
	});

	const reply = response.text?.trim();

	if (!reply) {
		throw error(502, 'Gemini returned an empty response.');
	}

	return json({ reply });
};