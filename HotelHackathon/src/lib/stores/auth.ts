import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import { pb } from '$lib/pocketbase';
import Cookies from 'js-cookie';
type AuthUser = {
	id: string;
	email: string;
	name?: string;
	role?: 'guest' | 'customer' | 'staff' | 'cleaner' | 'admin' | string;
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
	console.log('Login successful, user:', response.record);
	Cookies.set('pb_auth', pb.authStore.exportToCookie());
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
	Cookies.remove('pb_auth');
};

export const getDisplayName = (user: AuthUser | null) => {
	if (!user) return 'Guest';
	if (user.name && user.name.trim().length > 0) return user.name;
	return user.email;
};

export const inferRole = (user: AuthUser | null): 'guest' | 'customer' | 'cleaner' | 'staff' => {
	if (!user) return 'guest';

	const normalizedRole = typeof user.role === 'string' ? user.role.toLowerCase().trim() : '';
	if (normalizedRole === 'customer') return 'customer';
	if (normalizedRole === 'cleaner') return 'cleaner';
	if (normalizedRole === 'staff' || normalizedRole === 'admin') return 'staff';

	// Backward compatibility for records that still don't have role populated.
	if (!user.email) return 'guest';
	const email = user.email.toLowerCase();
	if (email.includes('admin') || email.includes('staff')) return 'staff';
	if (email.includes('clean')) return 'cleaner';
	return 'customer';
};

if (browser) {
	// Ensures auth state is restored from local storage on hydration.
	authUser.set((pb.authStore.model as AuthUser | null) ?? null);
}
