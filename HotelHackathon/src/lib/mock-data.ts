import { inferRole } from '$lib/stores/auth';

type RoomStatus = 'occupied' | 'ready' | 'needs_cleaning';

export type User = {
	id: string;
	email: string;
	name: string;
	phone?: string;
	checkInAt?: string;
	checkOutAt?: string;
	roomNumber?: string;
};

export type Message = {
	id: string;
	userId: string;
	role: 'user' | 'admin';
	content: string;
	createdAt: string;
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

export type AiEscalation = {
	id: string;
	guest: string;
	roomNumber: string;
	issue: string;
	priority: 'low' | 'medium' | 'high';
	createdAt: string;
	status: 'open' | 'resolved';
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

const aiEscalations: AiEscalation[] = [
	{
		id: 'a-1',
		guest: 'Tori Hayes',
		roomNumber: '410',
		issue: 'Need baby crib in room before 8 PM.',
		priority: 'high',
		createdAt: '2026-04-11T16:22:00Z',
		status: 'open'
	},
	{
		id: 'a-2',
		guest: 'Mike Patel',
		roomNumber: '205',
		issue: 'Late checkout request.',
		priority: 'medium',
		createdAt: '2026-04-11T15:10:00Z',
		status: 'resolved'
	}
];

const users: User[] = [
	{
		id: 'u-1',
		email: 'tori@example.com',
		name: 'Tori Hayes',
		phone: '555-0101',
		checkInAt: '2026-04-11T14:00:00Z',
		checkOutAt: '2026-04-14T11:00:00Z',
		roomNumber: '410'
	},
	{
		id: 'u-2',
		email: 'mike@example.com',
		name: 'Mike Patel',
		phone: '555-0102',
		checkInAt: '2026-04-12T15:00:00Z',
		checkOutAt: '2026-04-15T11:00:00Z',
		roomNumber: '205'
	},
	{
		id: 'u-3',
		email: 'cleaner@hotel.com',
		name: 'Jane Smith',
		phone: '555-0103'
	}
];

const messages: Message[] = [
	{ id: 'm-1', userId: 'u-1', role: 'user', content: 'Can I get a baby crib for the room?', createdAt: '2026-04-11T16:22:00Z' },
	{ id: 'm-2', userId: 'u-1', role: 'admin', content: 'Yes, we can arrange that. We will have it delivered by 8 PM.', createdAt: '2026-04-11T16:25:00Z' },
	{ id: 'm-3', userId: 'u-1', role: 'user', content: 'Great! Can I also get late checkout on my last day?', createdAt: '2026-04-11T17:00:00Z' },
	{ id: 'm-4', userId: 'u-2', role: 'user', content: 'Is there a late checkout option available?', createdAt: '2026-04-11T15:10:00Z' },
	{ id: 'm-5', userId: 'u-2', role: 'admin', content: 'Late checkout until 2 PM can be arranged for a small fee. Would you like that?', createdAt: '2026-04-11T15:15:00Z' }
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

export const getHomeSnapshot = (user: { email?: string } | null) => {
	const role = inferRole(user ? { id: 'local', email: user.email || '' } : null);

	return {
		myRoom: rooms[0],
		roomsToClean: role === 'cleaner' ? rooms.filter((room) => room.status === 'needs_cleaning') : [],
		notifications
	};
};

export const getRoomById = (roomId: string) => rooms.find((room) => room.id === roomId);

export const getAdminSnapshot = () => ({
	scanLogs,
	aiEscalations
});

export const getUserById = (userId: string) => users.find((user) => user.id === userId);

export const getAllUsers = () => users;

export const getMessagesByUserId = (userId: string) => messages.filter((msg) => msg.userId === userId);

export const addMessageForUser = (userId: string, role: 'user' | 'admin', content: string) => {
	const newMessage: Message = {
		id: `m-${messages.length + 1}`,
		userId,
		role,
		content,
		createdAt: new Date().toISOString()
	};
	messages.push(newMessage);
	return newMessage;
};

export const askMockAiHost = async (prompt: string) => {
	const normalized = prompt.toLowerCase();
	if (normalized.includes('late checkout')) {
		return {
			answer: 'I can request a late checkout. I have forwarded this to the property manager and will notify you once approved.',
			escalated: true
		};
	}

	if (normalized.includes('wifi')) {
		return {
			answer: 'The Wi-Fi network is HotelNoHost_Guest and your passphrase is in the room tablet under Connectivity.',
			escalated: false
		};
	}

	return {
		answer: 'I can help with room access, amenities, checkout timing, and maintenance requests. If needed, I can escalate to staff.',
		escalated: false
	};
};

// Swap each function here with PocketBase queries when backend collections are ready.
