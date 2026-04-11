<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isAuthenticated, authUser } from '$lib/stores/auth';
	import { getAllUsers, getRoomById } from '$lib/mock-data';

	let guestName = $state('');
	let email = $state('');
	let checkInDate = $state('');
	let checkInTime = $state('14:00');
	let checkOutDate = $state('');
	let checkOutTime = $state('11:00');
	let selectedRoomId = $state('r-205');
	let loading = $state(false);
	let successMessage = $state('');

	const rooms = [
		{ id: 'r-410', number: '410', floor: 4 },
		{ id: 'r-312', number: '312', floor: 3 },
		{ id: 'r-205', number: '205', floor: 2 }
	];

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}

		if ($authUser?.email) {
			email = $authUser.email;
		}
		if ($authUser?.name) {
			guestName = $authUser.name;
		}
	});

	const submitBooking = async () => {
		if (!guestName.trim() || !email.trim() || !checkInDate || !checkOutDate) {
			alert('Please fill in all required fields');
			return;
		}

		loading = true;
		try {
			const checkInAt = new Date(`${checkInDate}T${checkInTime}:00Z`).toISOString();
			const checkOutAt = new Date(`${checkOutDate}T${checkOutTime}:00Z`).toISOString();

			if (new Date(checkInAt) >= new Date(checkOutAt)) {
				alert('Check-out date must be after check-in date');
				loading = false;
				return;
			}

			successMessage = `Reservation for ${guestName} in room ${rooms.find((r) => r.id === selectedRoomId)?.number} confirmed! Check-in: ${new Date(checkInAt).toLocaleString()}`;
			guestName = '';
			email = '';
			checkInDate = '';
			checkOutDate = '';

			setTimeout(() => {
				successMessage = '';
			}, 5000);
		} finally {
			loading = false;
		}
	};
</script>

<section class="mx-auto max-w-4xl space-y-6">
	<div>
		<h1 class="text-4xl font-bold">Book a Reservation</h1>
		<p class="mt-2 text-base-content/70">Reserve a room for your next stay at our hotel.</p>
	</div>

	{#if successMessage}
		<div class="alert alert-success shadow-lg">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{successMessage}</span>
		</div>
	{/if}

	<div class="card border border-base-300/60 bg-base-100/85 shadow-lg">
		<div class="card-body space-y-6">
			<form class="space-y-5" onsubmit={(e) => { e.preventDefault(); void submitBooking(); }}>
				<!-- Guest Information -->
				<fieldset class="space-y-3">
					<legend class="font-semibold">Guest Information</legend>

					<div class="form-control">
						<label class="label" for="guestName">
							<span class="label-text">Guest Name *</span>
						</label>
						<input
							id="guestName"
							type="text"
							class="input input-bordered"
							bind:value={guestName}
							placeholder="Full name"
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="email">
							<span class="label-text">Email Address *</span>
						</label>
						<input
							id="email"
							type="email"
							class="input input-bordered"
							bind:value={email}
							placeholder="your@email.com"
							required
						/>
					</div>
				</fieldset>

				<!-- Stay Dates -->
				<fieldset class="space-y-3">
					<legend class="font-semibold">Stay Dates</legend>

					<div class="grid gap-4 sm:grid-cols-2">
						<div class="form-control">
							<label class="label" for="checkInDate">
								<span class="label-text">Check-in Date *</span>
							</label>
							<input
								id="checkInDate"
								type="date"
								class="input input-bordered"
								bind:value={checkInDate}
								required
							/>
						</div>

						<div class="form-control">
							<label class="label" for="checkInTime">
								<span class="label-text">Check-in Time *</span>
							</label>
							<input
								id="checkInTime"
								type="time"
								class="input input-bordered"
								bind:value={checkInTime}
								required
							/>
						</div>

						<div class="form-control">
							<label class="label" for="checkOutDate">
								<span class="label-text">Check-out Date *</span>
							</label>
							<input
								id="checkOutDate"
								type="date"
								class="input input-bordered"
								bind:value={checkOutDate}
								required
							/>
						</div>

						<div class="form-control">
							<label class="label" for="checkOutTime">
								<span class="label-text">Check-out Time *</span>
							</label>
							<input
								id="checkOutTime"
								type="time"
								class="input input-bordered"
								bind:value={checkOutTime}
								required
							/>
						</div>
					</div>
				</fieldset>

				<!-- Room Selection -->
				<fieldset class="space-y-3">
					<legend class="font-semibold">Select Room</legend>

					<div class="grid gap-3 sm:grid-cols-3">
						{#each rooms as room}
							<label class="label cursor-pointer gap-3 rounded-lg border border-base-300/60 p-3">
								<input
									type="radio"
									name="room"
									class="radio"
									value={room.id}
									bind:group={selectedRoomId}
								/>
								<span class="label-text">
									<div class="font-medium">Room {room.number}</div>
									<div class="text-xs text-base-content/60">Floor {room.floor}</div>
								</span>
							</label>
						{/each}
					</div>
				</fieldset>

				<!-- Submit Button -->
				<div class="flex gap-3 pt-3">
					<button
						type="submit"
						class="btn btn-primary"
						disabled={loading || !guestName.trim() || !email.trim() || !checkInDate || !checkOutDate}
					>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
							Booking...
						{:else}
							Complete Reservation
						{/if}
					</button>
					<a href="/admin" class="btn btn-outline">Cancel</a>
				</div>
			</form>
		</div>
	</div>

	<div class="card border border-base-300/60 bg-base-100/85 shadow-lg">
		<div class="card-body">
			<h2 class="card-title">Cancellation Policy</h2>
			<p class="text-sm text-base-content/70">
				Free cancellation up to 48 hours before check-in. After that, one night's stay will be charged. For questions, contact our front desk
				at the help center.
			</p>
		</div>
	</div>
</section>
