// --- Hamburger menu toggle ---
const hamburgerBtn = document.getElementById('hamburger-btn');
const headerActions = document.querySelector('.header-actions');

hamburgerBtn.addEventListener('click', () => {
	headerActions.classList.toggle('open');
});

// --- Search functionality ---
const searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-btn');

function performSearch() {
	const query = searchBox.value.trim().toLowerCase();
	const reviewItems = document.querySelectorAll('.review-item');

	reviewItems.forEach((item) => {
		const title = item.querySelector('h3').textContent.toLowerCase();
		const body = item.querySelector('p:last-of-type').textContent.toLowerCase();
		const matches = !query || title.includes(query) || body.includes(query);
		item.style.display = matches ? '' : 'none';
	});
}

searchBtn.addEventListener('click', performSearch);
searchBox.addEventListener('keyup', (e) => {
	if (e.key === 'Enter') performSearch();
});

// --- Review card click ---
const reviewItems = document.querySelectorAll('.review-item');
reviewItems.forEach((item) => {
	item.addEventListener('click', () => {
		const title = item.querySelector('h3').textContent;
		alert(
			`You clicked on "${title}". This would navigate to the full review page.`,
		);
	});
});

// --- Login / Sign Up buttons ---
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');

loginBtn.addEventListener('click', () => {
	alert('Login form would appear here.');
});

signupBtn.addEventListener('click', () => {
	alert('Sign-up form would appear here.');
});

// --- Contact Us button ---
const contactBtn = document.getElementById('contact-btn');
contactBtn.addEventListener('click', () => {
	alert('Contact form would appear here.');
});
