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

	users.push(user);
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function validateUser(username, password) {
	const users = getUsers();
	return users.find(
		user => user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password
	);
}
