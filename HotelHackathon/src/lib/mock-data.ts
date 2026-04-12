import { inferRole } from '$lib/stores/auth';
import { pb } from './pocketbase';

type RoomStatus = 'Occupied' | 'Vacant' | 'Ready For Cleaning';

export type User = {
	id: string;
	email: string;
	name?: string;
	role: 'guest' | 'staff' | 'cleaner';
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
	Location: string;
	num_beds: number;
	Status: RoomStatus;
	Room_Number: number;
	Unlocked: boolean;
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
	created: string;
	room: string;
	user: string;
	read: boolean;
	expand?: {
		room: Room;
		user: User;
	}
};

export type ScanLog = {
	id: string;
	room: string
	user: string;
	action: 'entry' | 'exit';
	created: string;
	expand?: {
		room: Room;
		user: User;
	}
};

export type Roomkey = {
	id: string;
	user: string;
	room: string;
	expand?: {
		room: Room;
	}
}

export type EscalationNotification = {
	id: string;
	user: string;
	content: string;
	severity: 'low' | 'medium' | 'high';
	reference_message: string;
	created: string;
	resolved: boolean;
	expand?: {
		user: User;
	}
};



let messages: Message[] = [];

export const getHomeSnapshot = async (user: { id?: string; email?: string; role?: string } | null) => {
	const role = inferRole(
		user
			? {
				id: user.id || 'local',
				email: user.email || '',
				role: user.role
			}
			: null
	);
	const currentUserId = user?.id || pb.authStore.record?.id;

	if(role === 'cleaner') {
		const rooms: Room[] = await pb.collection('Room').getFullList({
			sort: 'Room_Number',
			filter: 'Status = "Ready For Cleaning"'
		});
		return rooms;
	}else{
		if (!currentUserId) return [];

		let roomkeys: Roomkey[] = [];
		try {
			roomkeys = await pb.collection('Roomkey').getFullList({
				filter: `user = "${currentUserId}"`,
				expand: 'room'
			});
		} catch {
			try {
				roomkeys = await pb.collection('Roomkey').getFullList({
					filter: `roomkey_user = "${currentUserId}"`,
					expand: 'room'
				});
			} catch {
				roomkeys = await pb.collection('Roomkey').getFullList({
					filter: `roomkey_customer = "${currentUserId}"`,
					expand: 'room'
				});
			}
		}

		const rooms = roomkeys.map((rk) => {
			if (rk.expand && rk.expand.room) {
				return rk.expand!.room;
			}
			return null;
		}).filter((room): room is Room => room !== null);
		return rooms;
	}
};

const sendNotificationToCleaners = async (roomId: string) => {
	const cleaners = await pb.collection('users').getFullList({
		filter: 'role = "Cleaner"'
	});
	console.log('Cleaners to notify:', cleaners);
	const room = await getRoomById(roomId);
	cleaners.forEach(async (cleaner) => {
		await pb.collection('Notification').create({
			Title: 'Room Ready for Cleaning',
			Body: `Room ${room.Room_Number} in ${room.Location} is ready for cleaning. Please attend to it as soon as possible.`,
			room: roomId,
			notification_user: cleaner.id
		});
	});
}

export const getRoomById = async (roomId: string): Promise<Room> => {
	const room = await pb.collection<Room>('Room').getOne(roomId);
	return room as Room;
}

const createScanLog = async (roomId: string, action: 'entry' | 'exit', userId?: string) => {
	const actorId = userId || pb.authStore.record?.id;
	if (!actorId) return;

	try {
		await pb.collection('Logs').create({
			room: roomId,
			user: actorId,
			action
		});
		return;
	} catch {
		try {
			await pb.collection('Logs').create({
				room: roomId,
				Log_user: actorId,
				action
			});
			return;
		} catch {
			await pb.collection('Logs').create({
				room: roomId,
				Log_User: actorId,
				action
			});
		}
	}
}

export const unlockRoom = async (roomId: string): Promise<Room> => {
	const updatedRoom = await pb.collection<Room>('Room').update(roomId, {
		Unlocked: true
	});
	await createScanLog(roomId, 'entry');
	return updatedRoom as Room;
}

export const lockRoom = async (roomId: string): Promise<Room> => {
	const updatedRoom = await pb.collection<Room>('Room').update(roomId, {
		Unlocked: false
	});
	await createScanLog(roomId, 'exit');
	return updatedRoom as Room;
}

export const requestRoomCleaning = async (roomId: string): Promise<Room> => {
	const updatedRoom = await pb.collection<Room>('Room').update(roomId, {
		Status: 'Ready For Cleaning'
	});
	sendNotificationToCleaners(roomId);
	return updatedRoom as Room;
}

export const markRoomCleanedAndOccupied = async (roomId: string): Promise<Room> => {
	const updatedRoom = await pb.collection<Room>('Room').update(roomId, {
		Status: 'Occupied'
	});
	return updatedRoom as Room;
}

export const getNotificationsForUser = async (userId: string) => {
	const filters = [
		`notification_user = "${userId}" && read = false`,
	];

	let lastError: unknown;
	for (const filter of filters) {
		try {
			return await pb.collection<AppNotification>('Notification').getFullList({
				filter,
				sort: '-created'
			});
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError instanceof Error ? lastError : new Error('Failed to load unread notifications.');
}

export const getAllNotifications = async () => {
	const filters = ['read = false', 'Read = false', 'notification_read = false'];

	let lastError: unknown;
	for (const filter of filters) {
		try {
			return await pb.collection<AppNotification>('Notification').getFullList({
				filter,
				sort: '-created',
				expand: 'user'
			});
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError instanceof Error ? lastError : new Error('Failed to load unread notifications.');
}

export const markNotificationRead = async (notificationId: string): Promise<AppNotification> => {
	try {
		return (await pb.collection<AppNotification>('Notification').update(notificationId, {
			read: true
		})) as AppNotification;
	} catch {
		try {
			return (await pb.collection<AppNotification>('Notification').update(notificationId, {
				Read: true
			})) as AppNotification;
		} catch {
			return (await pb.collection<AppNotification>('Notification').update(notificationId, {
				notification_read: true
			})) as AppNotification;
		}
	}
}

export const getStaffSnapshot = async () => {
	const escalationNotifications = await pb.collection('EscalationNotifications').getFullList({
		sort: '-created',
		filter: 'resolved = false',
		expand: 'user'
	});
	const scanLogs = await pb.collection('Logs').getFullList({
		sort: '-created',
		expand: 'room,user'
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
	const usersToReturn = await pb.collection<User>('users').getFullList({
		sort: 'email'
	});
	console.log('Fetched users:', await usersToReturn);
	return usersToReturn;
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
