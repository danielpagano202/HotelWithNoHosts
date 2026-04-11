<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isAuthenticated, login } from '$lib/stores/auth';

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	onMount(() => {
		if ($isAuthenticated) {
			goto('/home');
		}
	});

	const submit = async () => {
		errorMessage = '';
		isSubmitting = true;
		try {
			await login(email, password);
			await goto('/home');
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to log in.';
		} finally {
			isSubmitting = false;
		}
	};
</script>

<section class="mx-auto max-w-md">
	<div class="card border border-base-300/70 bg-base-100/90 shadow-xl backdrop-blur-sm">
		<div class="card-body space-y-4">
			<h1 class="card-title text-3xl">Welcome back</h1>
			<p class="text-sm text-base-content/70">Sign in to manage your room access and stay updates.</p>

			<label class="form-control w-full">
				<span class="label-text mb-2">Email</span>
				<input class="input input-bordered w-full" type="email" bind:value={email} placeholder="you@example.com" />
			</label>

			<label class="form-control w-full">
				<span class="label-text mb-2">Password</span>
				<input class="input input-bordered w-full" type="password" bind:value={password} placeholder="••••••••" />
			</label>

			{#if errorMessage}
				<div class="alert alert-error text-sm">{errorMessage}</div>
			{/if}

			<button class="btn btn-primary" onclick={submit} disabled={isSubmitting || !email || !password}>
				{#if isSubmitting}Signing in...{:else}Login{/if}
			</button>

			<p class="text-sm text-base-content/70">
				No account yet?
				<a class="link link-primary" href="/register">Create one</a>
			</p>
		</div>
	</div>
</section>
