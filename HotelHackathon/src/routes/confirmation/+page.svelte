<script lang="ts">
  import { page } from '$app/stores';

  const name           = $derived($page.url.searchParams.get('name') ?? '');
  const code           = $derived($page.url.searchParams.get('code') ?? '');
  const checkIn        = $derived($page.url.searchParams.get('checkIn') ?? '');
  const checkOut       = $derived($page.url.searchParams.get('checkOut') ?? '');
  const addToWalletLink = $derived($page.url.searchParams.get('addToWalletLink') ?? '');

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    }) : '';
</script>

<div class="flex flex-col gap-6">

  <div class="alert alert-success">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>Reservation confirmed! Check your email for details.</span>
  </div>

  <div class="card bg-base-100 shadow-md">
    <div class="card-body gap-4">
      <h2 class="card-title text-xl">Booking Summary</h2>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="bg-base-200 rounded-xl p-4">
          <p class="text-base-content/50 text-xs mb-1">Guest</p>
          <p class="font-semibold">{name}</p>
        </div>
        <div class="bg-base-200 rounded-xl p-4">
          <p class="text-base-content/50 text-xs mb-1">Confirmation</p>
          <p class="font-semibold font-mono">{code}</p>
        </div>
        <div class="bg-base-200 rounded-xl p-4">
          <p class="text-base-content/50 text-xs mb-1">Check-in</p>
          <p class="font-semibold">{fmt(checkIn)}</p>
        </div>
        <div class="bg-base-200 rounded-xl p-4">
          <p class="text-base-content/50 text-xs mb-1">Check-out</p>
          <p class="font-semibold">{fmt(checkOut)}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-md">
    <div class="card-body items-center text-center gap-4">
      <h3 class="font-bold text-lg">Add your room key to Google Wallet</h3>
      <p class="text-base-content/60 text-sm max-w-sm">
        On check-in day, open Google Wallet, tap your pass, then tap
        "Open My Door" to unlock your room. No front desk needed.
      </p>
      {#if addToWalletLink}
        <a href={addToWalletLink} target="_blank" rel="noopener">
          <img
            src="https://pay.google.com/about/static_kcs/images/badges/googlepay_savebutton_withtitle_dark.svg"
            alt="Add to Google Wallet"
            class="h-14"
          />
        </a>
      {:else}
        <div class="text-sm text-error">Wallet link unavailable — check your server config.</div>
      {/if}
    </div>
  </div>

  <a href="/" class="btn btn-ghost btn-sm self-start">← Back to home</a>
</div>