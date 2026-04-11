<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  let {data}: { data: PageData } = $props();

  const code = $derived($page.params.id ?? '');

  type State = 'idle' | 'unlocking' | 'unlocked' | 'error';
  let state: State = 'idle';
  let errorMsg: string = '';

  async function unlockDoor() {
    state = 'unlocking';
    try {
      const res = await fetch('/api/door', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Could not unlock door.');

      state = 'unlocked';
      setTimeout(() => { state = 'idle'; }, 5000);
    } catch (e: any) {
      errorMsg = e.message;
      state = 'error';
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">

  {#if state === 'idle'}
    <div class="text-6xl">🏨</div>
    <h1 class="text-2xl font-bold">Welcome back</h1>
    <p class="text-base-content/60 text-sm max-w-xs">
      Tap the button below to unlock your room door.
      Make sure you're standing at the door first.
    </p>
    <div class="badge badge-outline font-mono text-sm">{code}</div>
    <button class="btn btn-primary btn-lg gap-2" onclick={unlockDoor}>
      🚪 Unlock My Door
    </button>

  {:else if state === 'unlocking'}
    <span class="loading loading-ring loading-lg text-primary"></span>
    <p class="text-base-content/60">Unlocking your door...</p>

  {:else if state === 'unlocked'}
    <div class="text-6xl animate-bounce">✅</div>
    <h2 class="text-2xl font-bold text-success">Door Unlocked!</h2>
    <p class="text-base-content/60 text-sm">Please enter within 10 seconds. The door will re-lock automatically.</p>

  {:else if state === 'error'}
    <div class="text-6xl">❌</div>
    <h2 class="text-xl font-bold text-error">Access Denied</h2>
    <p class="text-sm text-base-content/60 max-w-xs">{errorMsg}</p>
    <button class="btn btn-ghost btn-sm" onclick={() => { state = 'idle'; errorMsg = ''; }}>
      Try again
    </button>
  {/if}

</div>