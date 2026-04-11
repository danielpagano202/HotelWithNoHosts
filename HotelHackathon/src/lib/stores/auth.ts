import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import { pb } from '$lib/pocketbase';

type AuthUser = {
	id: string;
	email: string;
	name?: string;
};

const initialUser = (pb.authStore.model as AuthUser | null) ?? null;

export const authUser = writable<AuthUser | null>(initialUser);

pb.authStore.onChange((_token, model) => {
	authUser.set((model as AuthUser | null) ?? null);
});

export const isAuthenticated = derived(authUser, ($authUser) => Boolean($authUser?.id));

export const login = async (email: string, password: string) => {
	const response = await pb.collection('users').authWithPassword(email, password);
	authUser.set((response.record as unknown as AuthUser) ?? null);
	return response;
};

export const register = async (payload: {
	email: string;
	password: string;
	passwordConfirm: string;
	name: string;
}) => {
	await pb.collection('users').create({
		email: payload.email,
		password: payload.password,
		passwordConfirm: payload.passwordConfirm,
		emailVisibility: true,
		name: payload.name
	});

	return login(payload.email, payload.password);
};

export const logout = () => {
	pb.authStore.clear();
	authUser.set(null);
};

export const getDisplayName = (user: AuthUser | null) => {
	if (!user) return 'Guest';
	if (user.name && user.name.trim().length > 0) return user.name;
	return user.email;
};

export const inferRole = (user: AuthUser | null): 'guest' | 'cleaner' | 'admin' => {
	if (!user?.email) return 'guest';
	const email = user.email.toLowerCase();
	if (email.includes('admin')) return 'admin';
	if (email.includes('clean')) return 'cleaner';
	return 'guest';
};

if (browser) {
	// Ensures auth state is restored from local storage on hydration.
	authUser.set((pb.authStore.model as AuthUser | null) ?? null);
}
