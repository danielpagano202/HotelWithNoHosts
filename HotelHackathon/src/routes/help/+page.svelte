<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { askMockAiHost } from '$lib/mock-data';
	import { isAuthenticated } from '$lib/stores/auth';

	let prompt = $state('');
	let answer = $state('Ask anything about check-in, room access, amenities, or checkout.');
	let escalated = $state(false);
	let loading = $state(false);

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}
	});

	const submitPrompt = async () => {
		if (!prompt.trim()) return;
		loading = true;
		const response = await askMockAiHost(prompt);
		answer = response.answer;
		escalated = response.escalated;
		loading = false;
	};
</script>

<section class="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
	<div class="card border border-base-300/60 bg-base-100/85 shadow-lg">
		<div class="card-body space-y-4">
			<h1 class="card-title text-3xl">AI Host</h1>
			<p class="text-sm text-base-content/70">This is mock AI behavior. Replace askMockAiHost with a PocketBase-triggered endpoint when ready.</p>

			<textarea
				class="textarea textarea-bordered min-h-44 w-full"
				bind:value={prompt}
				placeholder="Example: Can I get late checkout and two extra towels?"
			></textarea>

			<button class="btn btn-primary" onclick={submitPrompt} disabled={loading || !prompt.trim()}>
				{#if loading}Thinking...{:else}Send to AI Host{/if}
			</button>
		</div>
	</div>

	<div class="card border border-base-300/60 bg-base-100/85 shadow-lg">
		<div class="card-body space-y-4">
			<h2 class="card-title">Assistant response</h2>
			<p class="leading-relaxed">{answer}</p>
			{#if escalated}
				<div class="alert alert-warning text-sm">
					This request was forwarded to staff and will appear in the admin escalation feed.
				</div>
			{/if}
		</div>
	</div>
</section>
