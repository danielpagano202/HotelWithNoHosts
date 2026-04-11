<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authUser, isAuthenticated, logout } from '$lib/stores/auth';

	let { children } = $props();

	onMount(() => {
		const unsub = isAuthenticated.subscribe(() => {
			// subscribing ensures the auth store initializes on first render
		});

		return () => {
			unsub();
		};
	});

	const signOut = async () => {
		logout();
		await goto('/');
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Space+Grotesk:wght@400;500;700&display=swap"
	/>
	<title>Hotel With No Hosts</title>
</svelte:head>

<div class="app-shell min-h-screen">
	<div class="aurora one"></div>
	<div class="aurora two"></div>

	<div class="content-layer">
		<header class="mx-auto max-w-7xl px-4 py-5 md:px-8">
			<div class="navbar rounded-2xl border border-base-300/50 bg-base-100/85 shadow-lg backdrop-blur-sm">
				<div class="navbar-start">
					<a href="/" class="btn btn-ghost text-lg font-semibold">Hotel With No Hosts</a>
				</div>
				<div class="navbar-center hidden lg:flex">
					<ul class="menu menu-horizontal gap-1 px-1">
						<li><a href="/home">Home</a></li>
						<li><a href="/help">Help</a></li>					<li><a href="/book">Book</a></li>						<li><a href="/admin">Admin</a></li>
					</ul>
				</div>
				<div class="navbar-end gap-2">
					{#if $isAuthenticated}
						<div class="hidden text-right text-xs sm:block">
							<p class="font-medium">{$authUser?.name || $authUser?.email}</p>
							<p class="opacity-70">Signed in</p>
						</div>
						<button class="btn btn-outline btn-sm" onclick={signOut}>Logout</button>
					{:else}
						<a class="btn btn-sm btn-ghost" href="/login">Login</a>
						<a class="btn btn-sm btn-primary" href="/register">Register</a>
					{/if}
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-7xl px-4 pb-14 md:px-8">{@render children()}</main>
	</div>
</div>
