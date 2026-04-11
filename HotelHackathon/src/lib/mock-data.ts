import { inferRole } from '$lib/stores/auth';
import { pb } from './pocketbase';

type RoomStatus = 'occupied' | 'ready' | 'needs_cleaning';

export type User = {
	id: string;
	email: string;
	name?: string;
};

export type Message = {
	id: string;
	user_chat: string;
	sender: 'User' | 'AI' | 'Staff';
	content: string;
	created: string;
};

export type Room = {
	id: string;
	number: string;
	floor: number;
	status: RoomStatus;
	guestName?: string;
	checkInAt: string;
	checkOutAt: string;
	accessCode: string;
};

export type Reservation = {
	id: string;
	userId: string;
	guestName: string;
	checkInAt: string;
	checkOutAt: string;
	roomId: string;
};

export type AppNotification = {
	id: string;
	title: string;
	body: string;
	createdAt: string;
	roomId?: string;
};

export type ScanLog = {
	id: string;
	roomNumber: string;
	userEmail: string;
	action: 'entry' | 'exit';
	createdAt: string;
};

export type EscalationNotification = {
	id: string;
	user: string;
	content: string;
	severity: 'low' | 'medium' | 'high';
	created: string;
	resolved: boolean;
	expand?: {
		user: User;
	}
};

const rooms: Room[] = [
	{
		id: 'r-410',
		number: '410',
		floor: 4,
		status: 'occupied',
		guestName: 'Tori Hayes',
		checkInAt: '2026-04-11T14:00:00Z',
		checkOutAt: '2026-04-14T11:00:00Z',
		accessCode: 'SCAN-410-9D2K'
	},
	{
		id: 'r-312',
		number: '312',
		floor: 3,
		status: 'needs_cleaning',
		checkInAt: '2026-04-11T10:30:00Z',
		checkOutAt: '2026-04-12T11:00:00Z',
		accessCode: 'SCAN-312-4MQA'
	},
	{
		id: 'r-205',
		number: '205',
		floor: 2,
		status: 'ready',
		checkInAt: '2026-04-12T15:00:00Z',
		checkOutAt: '2026-04-15T11:00:00Z',
		accessCode: 'SCAN-205-7LVP'
	}
];

const notifications: AppNotification[] = [
	{
		id: 'n-1',
		title: 'Room 410 ready',
		body: 'Your room has been prepared and your wallet key is active.',
		createdAt: '2026-04-11T13:55:00Z',
		roomId: 'r-410'
	},
	{
		id: 'n-2',
		title: 'AI host update',
		body: 'Your request for a late checkout was sent to the property manager.',
		createdAt: '2026-04-11T16:20:00Z'
	},
	{
		id: 'n-3',
		title: 'Cleaner dispatch',
		body: 'Room 312 has been assigned for cleaning.',
		createdAt: '2026-04-11T17:00:00Z',
		roomId: 'r-312'
	}
];

const scanLogs: ScanLog[] = [
	{ id: 's-1', roomNumber: '410', userEmail: 'tori@example.com', action: 'entry', createdAt: '2026-04-11T14:03:21Z' },
	{ id: 's-2', roomNumber: '410', userEmail: 'tori@example.com', action: 'exit', createdAt: '2026-04-11T18:11:13Z' },
	{ id: 's-3', roomNumber: '312', userEmail: 'cleaner@hotel.com', action: 'entry', createdAt: '2026-04-11T17:08:42Z' }
];

const reservations: Reservation[] = [
	{
		id: 'res-1',
		userId: 'u-1',
		guestName: 'Tori Hayes',
		checkInAt: '2026-04-11T14:00:00Z',
		checkOutAt: '2026-04-14T11:00:00Z',
		roomId: 'r-410'
	},
	{
		id: 'res-2',
		userId: 'u-2',
		guestName: 'Mike Patel',
		checkInAt: '2026-04-12T15:00:00Z',
		checkOutAt: '2026-04-15T11:00:00Z',
		roomId: 'r-205'
	}
];

let messages: Message[] = [];

export const getHomeSnapshot = (user: { email?: string } | null) => {
	const role = inferRole(user ? { id: 'local', email: user.email || '' } : null);

	return {
		myRoom: rooms[0],
		roomsToClean: role === 'cleaner' ? rooms.filter((room) => room.status === 'needs_cleaning') : [],
		notifications
	};
};

export const getRoomById = (roomId: string) => rooms.find((room) => room.id === roomId);

export const getAdminSnapshot = async () => {
	const escalationNotifications = await pb.collection('EscalationNotifications').getFullList({
		sort: '-created',
		filter: 'resolved = false',
		expand: 'user'
	});
	return {
		scanLogs,
		escalationNotifications
	};
};
export const markEscalationNotificationResolved = async (id: string) => {
	await pb.collection('EscalationNotifications').update(id, {
		resolved: true
	});
};

export const getUserById = async (userId: string) => {
	return pb.collection<User>('users').getOne(userId);
};

export const getAllUsers = async () => {
	return pb.collection<User>('users').getFullList({
		sort: 'email'
	});
};

export const getMessagesByUserId = async (userId: string) => {
	messages = await pb.collection<Message>('Chatmessages').getFullList({
		filter: `user_chat = "${userId}"`,
		sort: '-created'
	});
	return messages;
};

export const addMessageForUser = async (userId: string, role: 'User' | 'AI' | 'Staff', content: string) => {
	const newMessage = await pb.collection<Message>('Chatmessages').create({
		user_chat: userId,
		sender: role,
		content
	});
	messages = [newMessage, ...messages];
	return newMessage;
};
// Swap each function here with PocketBase queries when backend collections are ready.
