<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getMessagesByUserId } from '$lib/mock-data';
	import { authUser, isAuthenticated } from '$lib/stores/auth';

	type ChatMessage = {
		role: 'assistant' | 'user' | 'error';
		sender: 'AI' | 'Staff' | 'User' | 'Error';
		content: string;
	};

	type StoredChatMessage = {
		content: string;
		sender?: 'User' | 'AI' | 'Staff';
	};

	type GeminiResponse = {
		reply?: string;
		error?: string;
	};

	let prompt = $state('');
	let loading = $state(false);
	let errorMessage = $state('');
	let messages = $state<ChatMessage[]>([]);

	const appendMessage = (message: ChatMessage) => {
		messages = [...messages, message];
	};

	const mapStoredMessage = (message: StoredChatMessage): ChatMessage => {
		const sender = message.sender ?? 'AI';
		if (sender === 'User') {
			return {
				role: 'user',
				sender: 'User',
				content: message.content
			};
		}

		if (sender === 'Staff') {
			return {
				role: 'assistant',
				sender: 'Staff',
				content: message.content
			};
		}

		return {
			role: 'assistant',
			sender: 'AI',
			content: message.content
		};
	};

	const toApiHistory = () => {
		return messages
			.filter((entry) => entry.role !== 'error')
			.slice(-8)
			.map((entry) => ({
				role: entry.role === 'user' ? 'user' : 'assistant',
				content: entry.content
			}));
	};

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/login');
			return;
		}

		const normalizedRole =
			typeof $authUser?.role === 'string' ? $authUser.role.toLowerCase().trim() : '';
		if (normalizedRole !== 'customer') {
			await goto('/home');
			return;
		}

		const userId = $authUser?.id;
		if (!userId) {
			errorMessage = 'No authenticated user found for chat history.';
			return;
		}

		try {
			const history = (await getMessagesByUserId(userId)) as StoredChatMessage[];
			if (history.length > 0) {
				messages = [...history].reverse().map(mapStoredMessage);
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not load previous messages.';
		}
	});

	const submitPrompt = async () => {
		const message = prompt.trim();
		if (!message || loading) return;

		loading = true;
		errorMessage = '';
		appendMessage({ role: 'user', sender: 'User', content: message });
		prompt = '';

		const userId = $authUser?.id;

		try {
			const response = await fetch('/api/gemini', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message,
					messages: toApiHistory()
				})
			});

			const data = (await response.json().catch(() => null)) as GeminiResponse | null;

			if (!response.ok) {
				throw new Error(data?.error ?? 'The AI host could not respond right now.');
			}

			const reply = data?.reply ?? 'I could not generate a response.';
			appendMessage({ role: 'assistant', sender: 'AI', content: reply });
		} catch (error) {
			const fallbackMessage = error instanceof Error ? error.message : 'The AI host request failed.';
			errorMessage = fallbackMessage;
			appendMessage({ role: 'error', sender: 'Error', content: fallbackMessage });
		} finally {
			loading = false;
		}
	};
</script>

<section class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.12fr_0.88fr]">
	<div class="card border border-base-300/60 bg-linear-to-b from-base-100 via-base-100 to-base-200/40 shadow-xl">
		<div class="card-body space-y-5">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div class="space-y-2">
					<h1 class="card-title text-3xl">AI Host</h1>
					<p class="max-w-xl text-sm text-base-content/70">
						Live assistant chat powered by the Gemini backend route in
						<span class="font-medium"> src/routes/api/gemini/+server.ts </span>.
					</p>
				</div>
				<div class="badge badge-outline badge-lg">Live Chat</div>
			</div>

			<div class="flex min-h-96 flex-col gap-3 rounded-2xl border border-base-300/70 bg-base-100/70 p-4 shadow-inner">
				<div class="flex-1 space-y-3 overflow-y-auto pr-1">
					{#if messages.length === 0}
						<div class="grid h-full min-h-64 place-items-center rounded-xl border border-dashed border-base-300/80 bg-base-200/30 p-6 text-center">
							<div class="space-y-2">
								<p class="text-sm font-medium">No messages yet</p>
								<p class="text-xs text-base-content/60">Start the conversation below and your transcript will appear here.</p>
							</div>
						</div>
					{:else}
						{#each messages as message}
							<div class={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}>
								<div class={`chat-bubble max-w-[85%] whitespace-pre-wrap shadow-sm ${message.role === 'error' ? 'chat-bubble-error' : message.role === 'user' ? 'chat-bubble-primary' : 'bg-base-200 text-base-content'}`}>
									{message.content}
								</div>
								<div class="chat-footer text-[11px] opacity-70">{message.sender}</div>
							</div>
						{/each}
					{/if}
				</div>

				<form class="space-y-3 border-t border-base-300/70 pt-3" onsubmit={(event) => { event.preventDefault(); void submitPrompt(); }}>
					<textarea
						class="textarea textarea-bordered min-h-28 w-full resize-none bg-base-100"
						bind:value={prompt}
						placeholder="Ask about check-in, access codes, towels, late checkout, or anything else"
					></textarea>
					<div class="flex items-center justify-between gap-3">
						<p class="text-xs text-base-content/60">Press Send to continue the conversation.</p>
						<button class="btn btn-primary gap-2" type="submit" disabled={loading || !prompt.trim()}>
							{#if loading}
								<span class="loading loading-spinner loading-xs"></span>
								Thinking...
							{:else}
								Send message
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<div class="space-y-6">
		<div class="card border border-base-300/60 bg-base-100/90 shadow-lg">
			<div class="card-body space-y-4">
				<h2 class="card-title">Conversation Status</h2>
				<p class="leading-relaxed text-base-content/80">
					Ask about check-in, room access, amenities, checkout timing, or anything else during your stay.
				</p>
				<p class="leading-relaxed text-base-content/80">
					The assistant keeps recent messages as context, so follow-up questions stay in the same thread.
				</p>
				{#if errorMessage}
					<div class="alert alert-error text-sm">
						{errorMessage}
					</div>
				{:else}
					<div class="alert alert-info text-sm">
						If the AI needs staff involvement, it will say so in the reply and you can forward the request from there.
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
