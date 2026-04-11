<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		getAdminSnapshot,
		getAllUsers,
		markEscalationNotificationResolved
	} from '$lib/mock-data';
	import { authUser, inferRole, isAuthenticated } from '$lib/stores/auth';

	type AdminSnapshot = Awaited<ReturnType<typeof getAdminSnapshot>>;

	let adminData = $state<AdminSnapshot | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	let resolvingId = $state('');
	let users = $state<Awaited<ReturnType<typeof getAllUsers>>>([]);
	const role = $derived(inferRole($authUser));

	const loadAdminData = async () => {
		loadError = '';
		loading = true;

		try {
			adminData = await getAdminSnapshot();
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load admin data.';
		} finally {
			loading = false;
		}
	};

	const loadUsers = async () => {
		try {
			users = await getAllUsers();
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load users.';
		}
	};

	const markComplete = async (id: string) => {
		resolvingId = id;
		loadError = '';

		try {
			await markEscalationNotificationResolved(id);
			await loadAdminData();
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to mark notification as complete.';
		} finally {
			resolvingId = '';
		}
	};

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/login');
			return;
		}

		await Promise.all([loadAdminData(), loadUsers()]);
	});
</script>

<section class="space-y-6">
	<div class="flex items-end justify-between gap-4">
		<div>
			<h1 class="text-4xl font-bold">Admin Console</h1>
			<p class="text-base-content/70">Entry/exit scans and AI escalation notifications.</p>
		</div>
		{#if role !== 'admin'}
			<div class="badge badge-warning badge-outline">Viewing in demo mode (role inferred from email)</div>
		{/if}
	</div>

	<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
		<div class="card-body overflow-x-auto">
			<h2 class="card-title">Scan logs</h2>
			{#if loading}
				<div class="py-6 text-sm text-base-content/70">Loading scan logs...</div>
			{:else if loadError}
				<div class="alert alert-error text-sm">{loadError}</div>
			{:else if adminData}
				<table class="table table-zebra">
					<thead>
						<tr>
							<th>Timestamp</th>
							<th>Room</th>
							<th>User</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{#each adminData.scanLogs as log}
							<tr>
								<td>{new Date(log.createdAt).toLocaleString()}</td>
								<td>{log.roomNumber}</td>
								<td>{log.userEmail}</td>
								<td>
									<span class={`badge ${log.action === 'entry' ? 'badge-success' : 'badge-neutral'}`}>
										{log.action}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</article>

	<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
		<div class="card-body">
			<h2 class="card-title">AI escalations</h2>
			{#if loading}
				<div class="py-2 text-sm text-base-content/70">Loading escalation notifications...</div>
			{:else if loadError}
				<div class="alert alert-error text-sm">{loadError}</div>
			{:else if adminData}
				<div class="space-y-3">
					{#each adminData.escalationNotifications as issue}
						<div class="rounded-xl border border-base-300/60 bg-base-200/50 p-4">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<p class="font-semibold">{issue.content}</p>
								<div class="flex items-center gap-2">
									<span class={`badge ${issue.severity === 'high' ? 'badge-error' : issue.severity === 'medium' ? 'badge-warning' : 'badge-info'}`}>
										{issue.severity}
									</span>
									<button
										class="btn btn-success btn-xs"
										onclick={() => markComplete(issue.id)}
										disabled={resolvingId === issue.id}
									>
										{#if resolvingId === issue.id}Saving...{:else}Mark Complete{/if}
									</button>
								</div>
							</div>
							<p class="mt-1 text-sm opacity-80">User: {issue.expand?.user?.name || issue.user}</p>
							<p class="mt-1 text-xs opacity-60">
								{new Date(issue.created).toLocaleString()} - {issue.resolved ? 'resolved' : 'open'}
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</article>

	<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
		<div class="card-body overflow-x-auto">
			<h2 class="card-title">Users</h2>
			<table class="table table-zebra">
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Email</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user}
						<tr>
							<td class="text-xs opacity-70">{user.id}</td>
							<td class="font-medium">{user.name || 'Guest'}</td>
							<td class="text-sm">{user.email}</td>
							<td>
								<a href="/admin/user/{user.id}" class="btn btn-ghost btn-xs">View</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</article>
</section>
