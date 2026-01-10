// =============================
//    1. DARK/LIGHT THEME TOGGLE
// =============================

const lightIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

const darkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

const colorSchemeBtn = document.querySelector('.color-scheme-btn');
let isDark = document.documentElement.getAttribute('data-theme') === 'dark';

function applyTheme(isThemeDark) {
	isDark = isThemeDark;
	document.documentElement.setAttribute(
		'data-theme',
		isThemeDark ? 'dark' : 'light'
	);
	if (isDark) {
		colorSchemeBtn.innerHTML = darkIcon;
	} else {
		colorSchemeBtn.innerHTML = lightIcon;
	}
}

function toggleTheme() {
	isDark = !isDark;
	applyTheme(isDark);
	try {
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	} catch (e) {
		// jeśli localStorage niedostępne
	}
}

document.addEventListener('DOMContentLoaded', () => {
	applyTheme(isDark);
	colorSchemeBtn.addEventListener('click', toggleTheme);
});

// =====================
//    2. HAMBURGER MENU
// =====================

const openNav = document.querySelector('.open-nav');
const closeNav = document.querySelector('.close-nav');
const nav = document.getElementById('main-nav');

function updateWidth() {
	const windowWidth = window.innerWidth;
	closeNav.style.display = 'none';
	nav.classList.remove('translate-out-menu');
	if (windowWidth > 768) {
		openNav.style.display = 'none';
		nav.style.display = 'flex';
	} else {
		openNav.style.display = 'flex';
		nav.style.display = 'none';
	}
}

openNav.addEventListener('click', () => {
	openNav.setAttribute('aria-expanded', 'true');
	nav.setAttribute('aria-hidden', 'false');
	const headerRect = document.querySelector('header').getBoundingClientRect();
	nav.style.top = headerRect.bottom + 'px';
	nav.style.display = 'flex';
	openNav.style.display = 'none';
	closeNav.style.display = 'flex';
	nav.classList.remove('translate-out-menu');
	nav.classList.add('translate-in-menu');

	// Focus on first interactive element: <a> or <button> inside nav
	const focusable = Array.from(nav.querySelectorAll('a, button'));
	const firstNavItem = focusable.find(
		el => el.offsetParent !== null && !el.disabled
	);
	if (firstNavItem) firstNavItem.focus();
});
closeNav.addEventListener('click', () => {
	openNav.setAttribute('aria-expanded', 'false');
	nav.setAttribute('aria-hidden', 'true');
	openNav.style.display = 'flex';
	closeNav.style.display = 'none';
	nav.classList.remove('translate-in-menu');
	nav.classList.add('translate-out-menu');
});

nav.addEventListener('transitionend', e => {
	if (nav.classList.contains('translate-out-menu')) {
		nav.style.display = 'none';
	}
});

// Escape btn closes menu
document.addEventListener('keydown', e => {
	if (e.key === 'Escape' || e.key === 'Esc') {
		if (openNav.getAttribute('aria-expanded') === 'true') {
			closeNav.click();
		}
	}
});

window.addEventListener('resize', updateWidth);
window.addEventListener('scroll', updateWidth);

// ========================================
// 3. FOCUS TRAP (when hamburger menu open)
// ========================================

function trapFocus(e) {
	if (
		nav.style.display !== 'flex' ||
		window.innerWidth > 768 // tylko mobilnie
	)
		return;

	// Catch all visible <a> & <button> in nav
	const focusable = Array.from(nav.querySelectorAll('a, button')).filter(
		el => el.offsetParent !== null && !el.disabled
	);

	if (focusable.length === 0) return;
	const first = focusable[0];
	const last = focusable[focusable.length - 1];

	// "Tab" trap
	if (e.key === 'Tab') {
		if (e.shiftKey) {
			// shift+tab = back
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			// tab = forward
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}
}

nav.addEventListener('keydown', trapFocus);

// ==================================================
// 4. HEADER & SCROLL-TO-TOP-BTN VISIBILITY ON SCROLL
// ==================================================

let lastScrollTop = 0;

window.addEventListener('scroll', () => {
	let header = document.querySelector('header');
	let scrollBtn = document.getElementById('scroll-to-top-btn');
	let scrollToTop = window.pageYOffset || document.documentElement.scrollTop;

	if (scrollToTop > lastScrollTop) {
		header.style.top = '-100%';
	} else {
		header.style.top = '0';
	}

	lastScrollTop = scrollToTop;

	if (lastScrollTop === 0) {
		scrollBtn.classList.remove('show');
	} else {
		scrollBtn.classList.add('show');
	}
});

// =====================================
// 5. ANIMATIONS (INTERSECTION OBSERVER)
// =====================================

const animatedElems = document.querySelectorAll(
	'.sub-container.sub-container-mono > *, .left-child:not(.left-child.footer-descendant) > *, .right-child:not(.right-child.footer-descendant) > *, #arrow-down'
);

const observer = new IntersectionObserver(
	entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('show');
				// console.log(entry.target);
				observer.unobserve(entry.target);
			}
		});
	},
	{
		rootMargin: '0px 0px 20px 0px',
	}
);

animatedElems.forEach(elem => observer.observe(elem));
