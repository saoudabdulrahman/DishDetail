const USERS_KEY = 'dishdetail_users';

export function getUsers() {
	try {
		return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
	} catch {
		return [];
	}
}

export function saveUser(user) {
	const users = getUsers();
	
	if (users.some(u => u.username.toLowerCase() === user.username.trim().toLowerCase())) {
		throw new Error('That username is already taken.');
	}

	if (!user.username || !user.password || !user.email) {
		throw new Error('Invalid user data.');
	}

	user.avatar = user.avatar || `https://i.pravatar.cc/150?u=${user.username}`;
	user.bio = user.bio || '';

	users.push(user);
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function updateUser(username, updates) {
	const users = getUsers();
	const index = users.findIndex(u => u.username === username);
	
	if (index !== -1) {
		users[index] = { ...users[index], ...updates };
		localStorage.setItem(USERS_KEY, JSON.stringify(users));
		return users[index];
	}
	throw new Error('User not found');
}

export function validateUser(username, password) {
	const users = getUsers();
	return users.find(
		user => user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password
	);
}
