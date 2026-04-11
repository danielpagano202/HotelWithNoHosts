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

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}

		const foundUser = getUserById(params.user_id);
		if (!foundUser) {
			goto('/admin');
		}

		user = foundUser;
		userMessages = getMessagesByUserId(params.user_id);
	});

	const sendMessage = async () => {
		if (!newMessage.trim() || !user) return;
		loading = true;

		try {
			const message = newMessage.trim();
			addMessageForUser(user.id, 'admin', message);
			userMessages = getMessagesByUserId(user.id);
			newMessage = '';
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
				<h1 class="text-3xl font-bold">{user?.name || 'User'}</h1>
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

				<div class="flex max-h-96 flex-col gap-3 rounded-xl border border-base-300/70 bg-base-200/40 p-4">
					<div class="flex-1 space-y-3 overflow-y-auto pr-1">
						{#if userMessages.length === 0}
							<p class="text-center text-sm text-base-content/60">No messages yet. Start the conversation.</p>
						{:else}
							{#each userMessages as message}
								<div class={`chat ${message.role === 'admin' ? 'chat-end' : 'chat-start'}`}>
									<div class={`chat-bubble ${message.role === 'admin' ? 'chat-bubble-primary' : ''}`}>
										{message.content}
									</div>
									<div class="chat-footer text-xs opacity-70">
										{new Date(message.createdAt).toLocaleTimeString()}
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
						{#if user?.phone}
							<div>
								<p class="text-xs text-base-content/60">Phone</p>
								<p class="font-medium">{user.phone}</p>
							</div>
						{/if}
						{#if user?.roomNumber}
							<div>
								<p class="text-xs text-base-content/60">Current Room</p>
								<p class="font-medium">{user.roomNumber}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="card border border-base-300/60 bg-base-100/85 shadow-md">
				<div class="card-body space-y-3">
					<h3 class="card-title text-lg">Stay Information</h3>
					<div class="space-y-3 text-sm">
						{#if user?.checkInAt}
							<div>
								<p class="text-xs text-base-content/60">Check-in</p>
								<p class="font-medium">{new Date(user.checkInAt).toLocaleString()}</p>
							</div>
						{/if}
						{#if user?.checkOutAt}
							<div>
								<p class="text-xs text-base-content/60">Check-out</p>
								<p class="font-medium">{new Date(user.checkOutAt).toLocaleString()}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
