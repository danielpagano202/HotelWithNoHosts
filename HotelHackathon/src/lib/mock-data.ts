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
	return updatedRoom as Room;
}

export const markRoomCleanedAndOccupied = async (roomId: string): Promise<Room> => {
	const updatedRoom = await pb.collection<Room>('Room').update(roomId, {
		Status: 'Occupied'
	});
	return updatedRoom as Room;
}

export const getNotificationsForUser = async (userId: string) => {
	try {
		return await pb.collection<AppNotification>('Notification').getFullList({
			filter: `notification_user = "${userId}"`,
			sort: '-created'
		});
	} catch {
		try {
			return await pb.collection<AppNotification>('Notification').getFullList({
				filter: `user = "${userId}"`,
				sort: '-created'
			});
		} catch {
			const allNotifications = await pb.collection<AppNotification>('Notification').getFullList({
				sort: '-created'
			});
			return allNotifications.filter((notice) => {
				const candidateUser = (notice as { notification_user?: string; user?: string }).notification_user ||
					(notice as { notification_user?: string; user?: string }).user;
				return candidateUser === userId;
			});
		}
	}
}

export const getAllNotifications = async () => {
	const notifications = await pb.collection<AppNotification>('Notification').getFullList({
		sort: '-created',
		expand: 'user'
	});
	return notifications;
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
