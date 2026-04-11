<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isAuthenticated } from '$lib/stores/auth';

	type ChatMessage = {
		role: 'assistant' | 'user' | 'error';
		content: string;
	};

	let prompt = $state('');
	let loading = $state(false);
	let errorMessage = $state('');
	let messages = $state<ChatMessage[]>([
		{
			role: 'assistant',
			content:
				'Ask me about check-in, room access, amenities, checkout timing, or anything else you need during your stay.'
		}
	]);

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}
	});

	const submitPrompt = async () => {
		const message = prompt.trim();
		if (!message || loading) return;

		loading = true;
		errorMessage = '';
		messages = [...messages, { role: 'user', content: message }];
		prompt = '';

		try {
			const response = await fetch('/api/gemini', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message,
					messages: messages.slice(-8).map((entry) => ({
						role: entry.role === 'user' ? 'user' : 'assistant',
						content: entry.content
					}))
				})
			});

			const data = (await response.json().catch(() => null)) as { reply?: string; error?: string } | null;

			if (!response.ok) {
				throw new Error(data?.error ?? 'The AI host could not respond right now.');
			}

			messages = [...messages, { role: 'assistant', content: data?.reply ?? 'I could not generate a response.' }];
		} catch (error) {
			const fallbackMessage = error instanceof Error ? error.message : 'The AI host request failed.';
			errorMessage = fallbackMessage;
			messages = [...messages, { role: 'error', content: fallbackMessage }];
		} finally {
			loading = false;
		}
	};
</script>

<section class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
	<div class="card border border-base-300/60 bg-base-100/85 shadow-lg">
		<div class="card-body space-y-5">
			<div class="space-y-2">
				<h1 class="card-title text-3xl">AI Host</h1>
				<p class="text-sm text-base-content/70">
					This chat sends messages to the Gemini backend route in <span class="font-medium">src/routes/api/gemini/+server.ts</span>.
				</p>
			</div>

			<div class="flex min-h-96 flex-col gap-3 rounded-2xl border border-base-300/70 bg-base-200/40 p-4">
				<div class="flex-1 space-y-3 overflow-y-auto pr-1">
					{#each messages as message}
						<div class={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}>
							<div class={`chat-bubble max-w-[85%] whitespace-pre-wrap ${message.role === 'error' ? 'chat-bubble-error' : message.role === 'user' ? 'chat-bubble-primary' : ''}`}>
								{message.content}
							</div>
						</div>
					{/each}
				</div>

				<form class="space-y-3" onsubmit={(event) => { event.preventDefault(); void submitPrompt(); }}>
					<textarea
						class="textarea textarea-bordered min-h-28 w-full resize-none"
						bind:value={prompt}
						placeholder="Ask about check-in, access codes, towels, late checkout, or anything else"
					></textarea>
					<div class="flex items-center justify-between gap-3">
						<p class="text-xs text-base-content/60">Press Send to continue the conversation.</p>
						<button class="btn btn-primary" type="submit" disabled={loading || !prompt.trim()}>
							{#if loading}Thinking...{:else}Send message{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<div class="card border border-base-300/60 bg-base-100/85 shadow-lg">
		<div class="card-body space-y-4">
			<h2 class="card-title">Conversation status</h2>
			<p class="leading-relaxed text-base-content/80">
				The assistant keeps the last few messages as context, so follow-up questions stay in the same thread.
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
</section>
