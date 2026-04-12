<script lang="ts">
  import type { PageData } from '../$types';
../api/door/$types
  let { data }: { data: PageData } = $props();

  type State = 'idle' | 'unlocking' | 'unlocked' | 'error';

  // Using $state correctly so Svelte tracks reactivity
  let state: State = $state('idle');
  let errorMsg: string = $state('');

  async function unlockDoor() {
    state = 'unlocking';
    try {
      const res = await fetch(`/api/door/${data.code}`, { method: 'POST' });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Could not unlock door.');

      state = 'unlocked';
      setTimeout(() => { state = 'idle'; }, 5000);
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Unknown error';
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
    <div class="badge badge-outline font-mono text-sm">{data.code}</div>
    <button class="btn btn-primary btn-lg gap-2" onclick={unlockDoor}>
      🚪 Unlock My Door
    </button>

  {:else if state === 'unlocking'}
    <span class="loading loading-ring loading-lg text-primary"></span>
    <p class="text-base-content/60">Unlocking your door...</p>

  {:else if state === 'unlocked'}
    <div class="text-6xl animate-bounce">✅</div>
    <h2 class="text-2xl font-bold text-success">Door Unlocked!</h2>
    <p class="text-base-content/60 text-sm">
      Please enter within 10 seconds. The door will re-lock automatically.
    </p>

  {:else if state === 'error'}
    <div class="text-6xl">❌</div>
    <h2 class="text-xl font-bold text-error">Access Denied</h2>
    <p class="text-sm text-base-content/60 max-w-xs">{errorMsg}</p>
    <button class="btn btn-ghost btn-sm" onclick={() => { state = 'idle'; errorMsg = ''; }}>
      Try again
    </button>
  {/if}

</div>