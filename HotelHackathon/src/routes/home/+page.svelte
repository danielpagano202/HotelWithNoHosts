<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getHomeSnapshot } from '$lib/mock-data';
	import { authUser, getDisplayName, inferRole, isAuthenticated } from '$lib/stores/auth';

	const displayName = $derived(getDisplayName($authUser));
	const role = $derived(inferRole($authUser));
	const dashboard = $derived(getHomeSnapshot($authUser));

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}
	});
</script>

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-4xl font-bold">Welcome, {displayName}</h1>
			<p class="text-base-content/70">Role: {role}. This page uses mock data and is ready for PocketBase collection queries.</p>
		</div>
		<a class="btn btn-outline" href="/help">Ask AI Host</a>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
			<div class="card-body">
				<h2 class="card-title">Your room</h2>
				{#if dashboard.myRoom}
					<p class="text-lg font-semibold">Room {dashboard.myRoom.number}</p>
					<p class="text-sm opacity-70">Check-in: {new Date(dashboard.myRoom.checkInAt).toLocaleString()}</p>
					<p class="text-sm opacity-70">Check-out: {new Date(dashboard.myRoom.checkOutAt).toLocaleString()}</p>
					<div class="card-actions justify-end">
						<a class="btn btn-primary btn-sm" href={`/room/${dashboard.myRoom.id}`}>View QR + stay info</a>
					</div>
				{:else}
					<p class="opacity-70">No active room assigned.</p>
				{/if}
			</div>
		</article>

		<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
			<div class="card-body">
				<h2 class="card-title">Rooms to clean</h2>
				{#if dashboard.roomsToClean.length > 0}
					<ul class="space-y-2">
						{#each dashboard.roomsToClean as room}
							<li class="flex items-center justify-between rounded-lg bg-base-200/70 p-3">
								<div>
									<p class="font-medium">Room {room.number}</p>
									<p class="text-xs opacity-70">Floor {room.floor}</p>
								</div>
								<a class="btn btn-xs btn-outline" href={`/room/${room.id}`}>Open</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="opacity-70">No cleaning assignments for your role.</p>
				{/if}
			</div>
		</article>
	</div>

	<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
		<div class="card-body">
			<h2 class="card-title">Notifications</h2>
			<div class="space-y-3">
				{#each dashboard.notifications as notice}
					<div class="rounded-xl border border-base-300/60 bg-base-200/60 p-3">
						<p class="font-semibold">{notice.title}</p>
						<p class="text-sm opacity-80">{notice.body}</p>
						<div class="mt-2 flex items-center gap-3 text-xs opacity-70">
							<span>{new Date(notice.createdAt).toLocaleString()}</span>
							{#if notice.roomId}
								<a class="link link-primary" href={`/room/${notice.roomId}`}>Open room</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</article>
</section>
