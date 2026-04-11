<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getUserById, getMessagesByUserId, addMessageForUser } from '$lib/mock-data';
	import { authUser, inferRole, isAuthenticated } from '$lib/stores/auth';
	import type { User, Message } from '$lib/mock-data';

	const role = $derived(inferRole($authUser));

	let { params } = $props();
	let user: User | undefined = $state();
	let userMessages: Message[] = $state([]);
	let newMessage = $state('');
	let loading = $state(false);
	let loadingPage = $state(true);
	let pageError = $state('');

	const loadThread = async (userId: string) => {
		const thread = await getMessagesByUserId(userId);
		userMessages = [...thread].reverse();
	};

	const isAgentSender = (sender: Message['sender']) => sender === 'AI' || sender === 'Staff';

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/login');
			return;
		}

		try {
			user = await getUserById(params.user_id);
			await loadThread(params.user_id);
		} catch (error) {
			pageError = error instanceof Error ? error.message : 'Could not load user conversation.';
			await goto('/admin');
		} finally {
			loadingPage = false;
		}
	});

	const sendMessage = async () => {
		if (!newMessage.trim() || !user) return;
		loading = true;

		try {
			const message = newMessage.trim();
			await addMessageForUser(user.id, 'Staff', message);
			await loadThread(user.id);
			newMessage = '';
		} catch (error) {
			pageError = error instanceof Error ? error.message : 'Failed to send message.';
		} finally {
			loading = false;
		}
	};
</script>

<div class="space-y-6">
	<div class="flex items-end justify-between gap-4">
		<div class="flex items-center gap-3">
			<a href="/admin" class="btn btn-ghost btn-sm btn-circle" aria-label="Back to admin">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</a>
			<div>
				<h1 class="text-3xl font-bold">{user?.name || 'Guest'}</h1>
				<p class="text-sm text-base-content/70">{user?.email}</p>
			</div>
		</div>
		{#if role !== 'admin'}
			<div class="badge badge-warning badge-outline">Demo mode</div>
		{/if}
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="card border border-base-300/60 bg-base-100/85 shadow-md lg:col-span-2">
			<div class="card-body space-y-4">
				<h2 class="card-title">Conversation</h2>
				{#if pageError}
					<div class="alert alert-error text-sm">{pageError}</div>
				{/if}

				<div class="flex max-h-96 flex-col gap-3 rounded-xl border border-base-300/70 bg-base-200/40 p-4">
					<div class="flex-1 space-y-3 overflow-y-auto pr-1">
						{#if loadingPage}
							<p class="text-center text-sm text-base-content/60">Loading conversation...</p>
						{:else if userMessages.length === 0}
							<p class="text-center text-sm text-base-content/60">No messages yet. Start the conversation.</p>
						{:else}
							{#each userMessages as message}
								<div class={`chat ${isAgentSender(message.sender) ? 'chat-end' : 'chat-start'}`}>
									<div class={`chat-bubble ${message.sender === 'Staff' ? 'chat-bubble-primary' : message.sender === 'AI' ? '' : ''}`}>
										{message.content}
									</div>
									<div class="chat-footer text-xs opacity-70">
										{message.sender} • {new Date(message.created).toLocaleTimeString()}
									</div>
								</div>
							{/each}
						{/if}
					</div>

					<form class="space-y-2 pt-3 border-t border-base-300/50" onsubmit={(e) => { e.preventDefault(); void sendMessage(); }}>
						<textarea
							class="textarea textarea-bordered w-full resize-none text-sm"
							bind:value={newMessage}
							placeholder="Type a message..."
							rows="3"
						></textarea>
						<div class="flex justify-end">
							<button
								class="btn btn-primary btn-sm"
								type="submit"
								disabled={loading || !newMessage.trim()}
							>
								{#if loading}Sending...{:else}Send{/if}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>

		<div class="space-y-4">
			<div class="card border border-base-300/60 bg-base-100/85 shadow-md">
				<div class="card-body space-y-4">
					<h3 class="card-title text-lg">User Details</h3>
					<div class="space-y-3 text-sm">
						<div>
							<p class="text-xs text-base-content/60">Email</p>
							<p class="font-medium">{user?.email}</p>
						</div>
						<div>
							<p class="text-xs text-base-content/60">Name</p>
							<p class="font-medium">{user?.name}</p>
						</div>
						
					</div>
				</div>
			</div>

			<div class="card border border-base-300/60 bg-base-100/85 shadow-md">
				<div class="card-body space-y-3">
					<h3 class="card-title text-lg">Stay Information</h3>
					<div class="space-y-3 text-sm">
						
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
