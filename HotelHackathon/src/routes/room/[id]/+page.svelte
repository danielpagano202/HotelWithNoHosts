<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		getRoomById,
		lockRoom,
		markRoomCleanedAndOccupied,
		requestRoomCleaning,
		unlockRoom
	} from '$lib/mock-data';
	import { authUser, inferRole, isAuthenticated } from '$lib/stores/auth';

	const roomId = $derived($page.params.id ?? '');
	const role = $derived(inferRole($authUser));
	let room = $state<Awaited<ReturnType<typeof getRoomById>> | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	let accessActionLoading = $state(false);
	let accessActionError = $state('');
	let accessActionSuccess = $state('');
	let serviceActionLoading = $state(false);
	let serviceActionError = $state('');
	let serviceActionSuccess = $state('');

	const loadRoom = async () => {
		loading = true;
		loadError = '';

		try {
			if (!roomId) {
				room = null;
				return;
			}
			room = await getRoomById(roomId);
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load room.';
			room = null;
		} finally {
			loading = false;
		}
	};

	const handleAccessToggle = async () => {
		if (!room || accessActionLoading) return;

		accessActionLoading = true;
		accessActionError = '';
		accessActionSuccess = '';

		try {
			if (room.Unlocked) {
				room = await lockRoom(room.id);
				accessActionSuccess = `Room ${room.Room_Number} locked.`;
			} else {
				room = await unlockRoom(room.id);
				accessActionSuccess = `Room ${room.Room_Number} unlocked.`;
			}
		} catch (error) {
			accessActionError = error instanceof Error ? error.message : 'Failed to update door state.';
		} finally {
			accessActionLoading = false;
		}
	};

	const handleServiceAction = async () => {
		if (!room || serviceActionLoading) return;

		serviceActionLoading = true;
		serviceActionError = '';
		serviceActionSuccess = '';

		try {
			if (role === 'cleaner') {
				room = await markRoomCleanedAndOccupied(room.id);
				serviceActionSuccess = `Room ${room.Room_Number} marked cleaned and occupied.`;
			} else if (role === 'guest' || role === 'customer') {
				room = await requestRoomCleaning(room.id);
				serviceActionSuccess = `Cleaning requested for room ${room.Room_Number}.`;
			}
		} catch (error) {
			serviceActionError =
				error instanceof Error ? error.message : 'Failed to update room cleaning status.';
		} finally {
			serviceActionLoading = false;
		}
	};

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/login');
			return;
		}

		await loadRoom();
	});
</script>

{#if loading}
	<section class="mx-auto max-w-xl">
		<div class="alert alert-info">Loading room details...</div>
	</section>
{:else if loadError}
	<section class="mx-auto max-w-xl">
		<div class="alert alert-error">{loadError}</div>
	</section>
{:else if room}
	<section class="mx-auto max-w-5xl space-y-6">
		<div class="flex items-center justify-between gap-3">
			<div>
				<p class="text-xs uppercase tracking-[0.24em] text-base-content/50">Room Details</p>
				<h1 class="text-4xl font-bold">Room {room.Room_Number}</h1>
			</div>
			<a class="btn btn-outline btn-sm" href="/home">Back to Home</a>
		</div>

		<div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
		<article class="card border border-base-300/60 bg-base-100/90 shadow-lg">
			<div class="card-body">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<h2 class="card-title text-2xl">Stay Overview</h2>
					<span class={`badge ${room.Status === 'Occupied' ? 'badge-error' : room.Status === 'Vacant' ? 'badge-success' : 'badge-warning'} badge-lg`}>
						{room.Status}
					</span>
				</div>

				<div class="mt-2 grid gap-3 sm:grid-cols-2">
					<div class="rounded-xl border border-base-300/60 bg-base-200/40 p-4">
						<p class="text-xs uppercase tracking-wide text-base-content/60">Location</p>
						<p class="mt-1 text-lg font-semibold">{room.Location}</p>
					</div>
					<div class="rounded-xl border border-base-300/60 bg-base-200/40 p-4">
						<p class="text-xs uppercase tracking-wide text-base-content/60">Beds</p>
						<p class="mt-1 text-lg font-semibold">{room.num_beds}</p>
					</div>
				</div>

				<p class="mt-2 text-sm text-base-content/70">
					Use this page as the base for room-specific controls like checkout, maintenance requests, and in-stay actions.
				</p>
			</div>
		</article>

		<article class="card border border-base-300/60 bg-base-100/90 shadow-lg">
			<div class="card-body items-center text-center">
				<h2 class="card-title">Access Panel</h2>
				<div class="grid h-56 w-56 place-content-center rounded-3xl border-4 border-dashed border-primary/70 bg-base-200/70 text-[11px] font-semibold tracking-[0.18em] text-base-content/70">
					DOOR KEY QR
				</div>
				<p class="text-xs opacity-70">Connect this block to your generated wallet pass / room key endpoint.</p>
				<p class={`text-xs font-semibold ${room.Unlocked ? 'text-success' : 'text-warning'}`}>
					{room.Unlocked ? 'Door state: Unlocked' : 'Door state: Locked'}
				</p>
				<button
					class="btn btn-primary btn-sm mt-2"
					onclick={handleAccessToggle}
					disabled={accessActionLoading}
				>
					{#if accessActionLoading}
						{room.Unlocked ? 'Locking...' : 'Unlocking...'}
					{:else if room.Unlocked}
						Lock Room
					{:else}
						Unlock Room
					{/if}
				</button>
				{#if accessActionError}
					<p class="text-xs text-error">{accessActionError}</p>
				{/if}
				{#if accessActionSuccess}
					<p class="text-xs text-success">{accessActionSuccess}</p>
				{/if}

				{#if role === 'guest' || role === 'customer' || role === 'cleaner'}
					<div class="mt-3 w-full border-t border-base-300/60 pt-3">
						<p class="text-xs opacity-70 mb-2">
							{#if role === 'cleaner'}Cleaner controls{:else}Guest services{/if}
						</p>
						<button
							class={`btn btn-sm w-full ${role === 'cleaner' ? 'btn-success' : 'btn-secondary'}`}
							onclick={handleServiceAction}
							disabled={serviceActionLoading || (role !== 'cleaner' && room.Status === 'Ready For Cleaning') || (role === 'cleaner' && room.Status === 'Occupied')}
						>
							{#if serviceActionLoading}
								{#if role === 'cleaner'}Marking...{:else}Requesting...{/if}
							{:else if role === 'cleaner'}
								{room.Status === 'Occupied' ? 'Already Occupied' : 'Mark Cleaned and Occupied'}
							{:else}
								{room.Status === 'Ready For Cleaning' ? 'Cleaning Requested' : 'Request Cleaning'}
							{/if}
						</button>
						{#if serviceActionError}
							<p class="mt-2 text-xs text-error">{serviceActionError}</p>
						{/if}
						{#if serviceActionSuccess}
							<p class="mt-2 text-xs text-success">{serviceActionSuccess}</p>
						{/if}
					</div>
				{/if}
			</div>
		</article>
		</div>
	</section>
{:else}
	<section class="mx-auto max-w-xl">
		<div class="alert alert-warning">Room not found.</div>
	</section>
{/if}
