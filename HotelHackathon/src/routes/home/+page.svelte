<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getHomeSnapshot, getRoomById } from '$lib/mock-data';
	import { authUser, getDisplayName, inferRole, isAuthenticated } from '$lib/stores/auth';

	const displayName = $derived(getDisplayName($authUser));
	const role = $derived(inferRole($authUser));

	let rooms = $state<Awaited<ReturnType<typeof getHomeSnapshot>>>([]);
	let primaryRoom = $state<Awaited<ReturnType<typeof getRoomById>> | null>(null);
	let loading = $state(true);
	let loadError = $state('');

	const loadDashboard = async () => {
		loading = true;
		loadError = '';

		try {
			rooms = await getHomeSnapshot($authUser);
			console.log('Loaded rooms for home snapshot:', rooms);
			if (rooms.length > 0) {
				primaryRoom = await getRoomById(rooms[0].id);
			} else {
				primaryRoom = null;
			}
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load home data.';
			rooms = [];
			primaryRoom = null;
		} finally {
			loading = false;
		}
	};

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/login');
			return;
		}

		await loadDashboard();
	});
</script>

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-4xl font-bold">Welcome, {displayName}</h1>
			<p class="text-base-content/70">Role: {role}. This page now reads live room data from PocketBase.</p>
		</div>
		<div class="flex gap-2">
			<a class="btn btn-primary gap-2" href="/booking">
				<span class="text-lg">🔑</span>
				Book a Room
			</a>
			<a class="btn btn-outline" href="/help">Ask AI Host</a>
		</div>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
			<div class="card-body">
				<h2 class="card-title">Primary room</h2>
				{#if loading}
					<p class="opacity-70">Loading room details...</p>
				{:else if loadError}
					<div class="alert alert-error text-sm">{loadError}</div>
				{:else if primaryRoom}
					<p class="text-lg font-semibold">Room {primaryRoom.Room_Number}</p>
					<p class="text-sm opacity-70">Location: {primaryRoom.Location}</p>
					<p class="text-sm opacity-70">Beds: {primaryRoom.num_beds}</p>
					<p class="text-sm opacity-70">Status: {primaryRoom.Status}</p>
					<div class="card-actions justify-end">
						<a class="btn btn-primary btn-sm" href={`/room/${primaryRoom.id}`}>View room</a>
					</div>
				{:else}
					<p class="opacity-70">No room found for this account.</p>
				{/if}
			</div>
		</article>

		<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
			<div class="card-body">
				<h2 class="card-title">{role === 'cleaner' ? 'Rooms to clean' : 'Assigned rooms'}</h2>
				{#if loading}
					<p class="opacity-70">Loading rooms...</p>
				{:else if loadError}
					<div class="alert alert-error text-sm">{loadError}</div>
				{:else if rooms.length > 0}
					<ul class="space-y-2">
						{#each rooms as room}
							<li class="flex items-center justify-between rounded-lg bg-base-200/70 p-3">
								<div>
									<p class="font-medium">Room {room.Room_Number}</p>
									<p class="text-xs opacity-70">{room.Location} - {room.Status}</p>
								</div>
								<a class="btn btn-xs btn-outline" href={`/room/${room.id}`}>Open</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="opacity-70">No rooms available for your role.</p>
				{/if}
			</div>
		</article>
	</div>

	<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
		<div class="card-body">
			<h2 class="card-title">Room Summary</h2>
			{#if loading}
				<p class="opacity-70">Preparing summary...</p>
			{:else if loadError}
				<div class="alert alert-error text-sm">{loadError}</div>
			{:else}
				<p class="text-sm opacity-80">
					{rooms.length} room{rooms.length === 1 ? '' : 's'} available in your current snapshot.
				</p>
			{/if}
		</div>
	</article>
</section>
