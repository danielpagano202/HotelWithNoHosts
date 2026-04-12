<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		getAllNotifications,
		getHomeSnapshot,
		getNotificationsForUser,
		getRoomById,
		markNotificationRead
	} from '$lib/mock-data';
	import { authUser, getDisplayName, inferRole, isAuthenticated } from '$lib/stores/auth';

	const displayName = $derived(getDisplayName($authUser));
	const role = $derived(inferRole($authUser));
	const canUseHelp = $derived(role === 'guest' || role === 'customer');
	const isGuestView = $derived(role === 'guest' || role === 'customer');

	let rooms = $state<Awaited<ReturnType<typeof getHomeSnapshot>>>([]);
	let primaryRoom = $state<Awaited<ReturnType<typeof getRoomById>> | null>(null);
	let notifications = $state<Awaited<ReturnType<typeof getAllNotifications>>>([]);
	let loading = $state(true);
	let loadError = $state('');
	let markingReadById = $state<Record<string, boolean>>({});
	let markReadErrorById = $state<Record<string, string>>({});
	type NotificationItem = Awaited<ReturnType<typeof getAllNotifications>>[number];

	const getNotificationTitle = (notice: NotificationItem) =>
		(notice as { title?: string; Title?: string }).title ||
		(notice as { title?: string; Title?: string }).Title ||
		'Notification';

	const getNotificationBody = (notice: NotificationItem) =>
		(notice as { body?: string; Body?: string; content?: string; text?: string }).body ||
		(notice as { body?: string; Body?: string; content?: string; text?: string }).Body ||
		(notice as { body?: string; Body?: string; content?: string; text?: string }).content ||
		(notice as { body?: string; Body?: string; content?: string; text?: string }).text ||
		'No details provided.';

	const handleMarkRead = async (noticeId: string) => {
		if (markingReadById[noticeId]) return;

		markingReadById = { ...markingReadById, [noticeId]: true };
		markReadErrorById = { ...markReadErrorById, [noticeId]: '' };

		try {
			await markNotificationRead(noticeId);
			notifications = notifications.filter((notice) => notice.id !== noticeId);
		} catch (error) {
			markReadErrorById = {
				...markReadErrorById,
				[noticeId]: error instanceof Error ? error.message : 'Failed to mark notification as read.'
			};
		} finally {
			markingReadById = { ...markingReadById, [noticeId]: false };
		}
	};

	const loadDashboard = async () => {
		loading = true;
		loadError = '';

		try {
			if (role === 'cleaner' || role === 'guest' || role === 'customer') {
				const snapshotUser = $authUser
					? {
						id: $authUser.id,
						email: $authUser.email,
						role: inferRole($authUser)
					}
					: null;
				rooms = await getHomeSnapshot(snapshotUser);
				if (rooms.length > 0) {
					primaryRoom = await getRoomById(rooms[0].id);
				} else {
					primaryRoom = null;
				}
			} else {
				rooms = [];
				primaryRoom = null;
			}

			if (role === 'cleaner' && $authUser?.id) {
				notifications = await getNotificationsForUser($authUser.id);
			} else {
				notifications = await getAllNotifications();
			}
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load home data.';
			rooms = [];
			primaryRoom = null;
			notifications = [];
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
	{#if role === 'cleaner'}
		<div class="rounded-2xl border border-warning/40 bg-warning/10 p-4 shadow-sm">
			<p class="text-xs font-semibold uppercase tracking-wide text-warning">Cleaner Shift View</p>
			<p class="mt-1 text-sm text-base-content/80">
				Your dashboard is focused on room readiness and cleaning assignments.
			</p>
		</div>
	{/if}

	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-4xl font-bold">Welcome, {displayName}</h1>
			<p class="text-base-content/70">
				{role === 'cleaner'
					? 'Focus on ready-for-cleaning rooms and complete tasks quickly.'
					: isGuestView
						? 'Here are your room reservations and notifications.'
						: 'Here are the latest app notifications.'}
			</p>
		</div>
		<div class="flex gap-2">
			{#if canUseHelp}
				<a class="btn btn-outline" href="/help">Ask AI Host</a>
			{/if}
		</div>
	</div>

	{#if role === 'cleaner'}
		<div class="grid gap-4 lg:grid-cols-2">
			<article class="card border border-warning/50 bg-warning/5 shadow-md">
				<div class="card-body">
					<h2 class="card-title">Next assignment</h2>
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

			<article class="card border border-warning/50 bg-warning/5 shadow-md">
				<div class="card-body">
					<h2 class="card-title">Rooms to clean</h2>
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
	{/if}

	{#if isGuestView}
		<div class="grid gap-4 lg:grid-cols-2">
			<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
				<div class="card-body">
					<h2 class="card-title">My primary reservation</h2>
					{#if loading}
						<p class="opacity-70">Loading reservation...</p>
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
						<p class="opacity-70">No reservation room found for your account.</p>
					{/if}
				</div>
			</article>

			<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
				<div class="card-body">
					<h2 class="card-title">My reserved rooms</h2>
					{#if loading}
						<p class="opacity-70">Loading reservations...</p>
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
						<p class="opacity-70">No rooms reserved yet for your account.</p>
					{/if}
				</div>
			</article>
		</div>
	{/if}

	<article class="card border border-base-300/60 bg-base-100/85 shadow-md">
		<div class="card-body">
			<h2 class="card-title">Notifications</h2>
			{#if loading}
				<p class="opacity-70">Loading notifications...</p>
			{:else if loadError}
				<div class="alert alert-error text-sm">{loadError}</div>
			{:else if notifications.length === 0}
				<p class="text-sm opacity-80">No notifications yet.</p>
			{:else}
				<div class="space-y-3">
					{#each notifications as notice}
						<div class="rounded-xl border border-base-300/60 bg-base-200/60 p-3">
							<div class="flex items-start justify-between gap-3">
								<p class="font-semibold">{getNotificationTitle(notice)}</p>
								<button
									class="btn btn-xs btn-outline"
									onclick={() => handleMarkRead(notice.id)}
									disabled={markingReadById[notice.id]}
								>
									{#if markingReadById[notice.id]}Saving...{:else}Mark as read{/if}
								</button>
							</div>
							<p class="mt-1 text-sm opacity-80 whitespace-pre-wrap">{getNotificationBody(notice)}</p>
							{#if markReadErrorById[notice.id]}
								<p class="mt-1 text-xs text-error">{markReadErrorById[notice.id]}</p>
							{/if}

							<div class="mt-2 flex items-center gap-3 text-xs opacity-70">
								<span>{new Date(notice.created).toLocaleString()}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</article>
</section>
