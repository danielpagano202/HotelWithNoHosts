<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authUser, inferRole, isAuthenticated } from '$lib/stores/auth';

  let guestName = $state('');
  let guestEmail = $state('');
  let checkIn = $state('');
  let checkOut = $state('');
  let loading = $state(false);
  let error = $state('');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  checkIn = today.toISOString().split('T')[0];
  checkOut = tomorrow.toISOString().split('T')[0];

  onMount(async () => {
    if ($isAuthenticated) {
      const role = inferRole($authUser);
      if (role === 'staff' || role === 'cleaner') {
        await goto('/home');
      }
    }
  });

  async function handleSubmit() {
    error = '';
    if (!guestName || !guestEmail || !checkIn || !checkOut) {
      error = 'Please fill in all fields.';
      return;
    }

    loading = true;
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, guestEmail, checkIn, checkOut }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      const params = new URLSearchParams({
        name: guestName,
        code: data.confirmationCode,
        checkIn,
        checkOut,
        addToWalletLink: data.addToWalletLink,
      });
      goto(`/confirmation?${params}`);
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col gap-6 max-w-2xl mx-auto">
  <div class="alert alert-info gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <div>
      <h3 class="font-bold">Complete your reservation</h3>
      <p class="text-sm">Book your room and receive a digital key in Google Wallet instantly — no front desk needed!</p>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-3 text-center">
    <div class="bg-base-200/50 rounded-xl p-4">
      <div class="text-2xl mb-2">🔑</div>
      <p class="text-sm font-medium">Digital Key</p>
      <p class="text-xs text-base-content/60">In your wallet</p>
    </div>
    <div class="bg-base-200/50 rounded-xl p-4">
      <div class="text-2xl mb-2">🚪</div>
      <p class="text-sm font-medium">Unlock Door</p>
      <p class="text-xs text-base-content/60">From your phone</p>
    </div>
    <div class="bg-base-200/50 rounded-xl p-4">
      <div class="text-2xl mb-2">⚡</div>
      <p class="text-sm font-medium">Instant</p>
      <p class="text-xs text-base-content/60">No waiting</p>
    </div>
  </div>

  <div class="card bg-base-100 shadow-md">
  <div class="card-body gap-5">
    <div>
      <h2 class="card-title text-3xl gap-2">🔑 Reserve Your Room</h2>
      <p class="text-base-content/70 text-sm mt-1">Get instant digital key access — skip the front desk entirely</p>
    </div>

    {#if error}
      <div class="alert alert-error text-sm">{error}</div>
    {/if}

    <div class="form-control gap-1">
      <label class="label label-text font-medium" for="name">Full Name</label>
      <input id="name" type="text" placeholder="Jane Smith"
        class="input input-bordered w-full" bind:value={guestName} />
    </div>

    <div class="form-control gap-1">
      <label class="label label-text font-medium" for="email">Email Address</label>
      <input id="email" type="email" placeholder="jane@example.com"
        class="input input-bordered w-full" bind:value={guestEmail} />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="form-control gap-1">
        <label class="label label-text font-medium" for="checkin">Check-in</label>
        <input id="checkin" type="date" class="input input-bordered w-full" bind:value={checkIn} />
      </div>
      <div class="form-control gap-1">
        <label class="label label-text font-medium" for="checkout">Check-out</label>
        <input id="checkout" type="date" class="input input-bordered w-full" bind:value={checkOut} />
      </div>
    </div>

    <div class="card-actions pt-2">
      <button class="btn btn-primary w-full gap-2" onclick={handleSubmit} disabled={loading}>
        {#if loading}
          <span class="loading loading-spinner loading-sm"></span>
          Getting Your Digital Key...
        {:else}
          <span>🔑</span>
          Get Digital Key & Confirm Booking
        {/if}
      </button>
    </div>
  </div>
</div>
</div>