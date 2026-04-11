<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getRoomById } from '$lib/mock-data';
	import { isAuthenticated } from '$lib/stores/auth';

	const roomId = $derived($page.params.id ?? '');
	const room = $derived(getRoomById(roomId));

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}
	});
</script>

{#if room}
	<section class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_1fr]">
		<article class="card border border-base-300/60 bg-base-100/90 shadow-lg">
			<div class="card-body">
				<h1 class="card-title text-3xl">Room {room.number}</h1>
				<p class="text-base-content/70">Floor {room.floor} - status: {room.status.replace('_', ' ')}</p>
				<div class="divider"></div>
				<p><span class="font-semibold">Check-in:</span> {new Date(room.checkInAt).toLocaleString()}</p>
				<p><span class="font-semibold">Check-out:</span> {new Date(room.checkOutAt).toLocaleString()}</p>
				{#if room.guestName}
					<p><span class="font-semibold">Guest:</span> {room.guestName}</p>
				{/if}
			</div>
		</article>

		<article class="card border border-base-300/60 bg-base-100/90 shadow-lg">
			<div class="card-body items-center text-center">
				<h2 class="card-title">Door Scan Pass</h2>
				<div class="grid h-52 w-52 place-content-center rounded-2xl border-4 border-dashed border-primary bg-base-200 text-xs tracking-widest">
					QR PLACEHOLDER
				</div>
				<p class="font-mono text-sm">{room.accessCode}</p>
				<p class="text-xs opacity-70">Replace this with a generated wallet pass/QR from PocketBase-backed endpoint.</p>
			</div>
		</article>
	</section>
{:else}
	<section class="mx-auto max-w-xl">
		<div class="alert alert-warning">Room not found.</div>
	</section>
{/if}
