<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isAuthenticated, register } from '$lib/stores/auth';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	onMount(() => {
		if ($isAuthenticated) {
			goto('/home');
		}
	});

	const submit = async () => {
		errorMessage = '';
		if (password !== passwordConfirm) {
			errorMessage = 'Passwords do not match.';
			return;
		}

		isSubmitting = true;
		try {
			await register({ name, email, password, passwordConfirm });
			await goto('/home');
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to register.';
		} finally {
			isSubmitting = false;
		}
	};
</script>

<section class="mx-auto max-w-md">
	<div class="card border border-base-300/70 bg-base-100/90 shadow-xl backdrop-blur-sm">
		<div class="card-body space-y-4">
			<h1 class="card-title text-3xl">Create your account</h1>
			<p class="text-sm text-base-content/70">Get your digital key and manage your hotel stay from one place.</p>

			<label class="form-control w-full">
				<span class="label-text mb-2">Name</span>
				<input class="input input-bordered w-full" bind:value={name} placeholder="Alex Morgan" />
			</label>

			<label class="form-control w-full">
				<span class="label-text mb-2">Email</span>
				<input class="input input-bordered w-full" type="email" bind:value={email} placeholder="you@example.com" />
			</label>

			<label class="form-control w-full">
				<span class="label-text mb-2">Password</span>
				<input class="input input-bordered w-full" type="password" bind:value={password} placeholder="At least 8 characters" />
			</label>

			<label class="form-control w-full">
				<span class="label-text mb-2">Confirm Password</span>
				<input class="input input-bordered w-full" type="password" bind:value={passwordConfirm} placeholder="Repeat password" />
			</label>

			{#if errorMessage}
				<div class="alert alert-error text-sm">{errorMessage}</div>
			{/if}

			<button class="btn btn-primary" onclick={submit} disabled={isSubmitting || !email || !password || !name}>
				{#if isSubmitting}Creating account...{:else}Register{/if}
			</button>

			<p class="text-sm text-base-content/70">
				Already have an account?
				<a class="link link-primary" href="/login">Login</a>
			</p>
		</div>
	</div>
</section>
