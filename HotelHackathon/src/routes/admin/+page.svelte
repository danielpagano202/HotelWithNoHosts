<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getAdminSnapshot, getAllUsers } from '$lib/mock-data';
	import { authUser, inferRole, isAuthenticated } from '$lib/stores/auth';

	const adminData = getAdminSnapshot();
	const users = getAllUsers();
	const role = $derived(inferRole($authUser));

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}
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
		</div>
	</article>

	<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
		<div class="card-body">
			<h2 class="card-title">AI escalations</h2>
			<div class="space-y-3">
				{#each adminData.aiEscalations as issue}
					<div class="rounded-xl border border-base-300/60 bg-base-200/50 p-4">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="font-semibold">{issue.issue}</p>
							<span class={`badge ${issue.priority === 'high' ? 'badge-error' : issue.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
								{issue.priority}
							</span>
						</div>
						<p class="mt-1 text-sm opacity-80">Guest: {issue.guest} - Room {issue.roomNumber}</p>
						<p class="mt-1 text-xs opacity-60">{new Date(issue.createdAt).toLocaleString()} - {issue.status}</p>
					</div>
				{/each}
			</div>
		</div>
	</article>

	<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
		<div class="card-body overflow-x-auto">
			<h2 class="card-title">Users</h2>
			<table class="table table-zebra">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Room</th>
						<th>Check-in</th>
						<th>Check-out</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user}
						<tr>
							<td class="font-medium">{user.name}</td>
							<td class="text-sm">{user.email}</td>
							<td>{user.roomNumber || '-'}</td>
							<td class="text-sm">{user.checkInAt ? new Date(user.checkInAt).toLocaleDateString() : '-'}</td>
							<td class="text-sm">{user.checkOutAt ? new Date(user.checkOutAt).toLocaleDateString() : '-'}</td>
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
