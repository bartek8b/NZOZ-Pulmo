// Dark/light theme

const lightIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

const darkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

const themeDark = window.matchMedia("(prefers-color-scheme: dark)");
const colorSchemeBtn = document.querySelector(".color-scheme-btn");
const logoWelcome = document.querySelector(".logo-big");
let isDark = themeDark.matches;

function applyTheme(isThemeDark) {
	isDark = isThemeDark;
	document.documentElement.setAttribute(
		"data-theme",
		isThemeDark ? "dark" : "light"
	);
	if (isDark) {
		colorSchemeBtn.innerHTML = darkIcon;
		if (logoWelcome) logoWelcome.src = "assets/logo/logo_big_darkmode.png";
	} else {
		colorSchemeBtn.innerHTML = lightIcon;
		if (logoWelcome) logoWelcome.src = "assets/logo/logo_big_lightmode.png";
	}
}

function toggleTheme() {
	isDark = !isDark;
	applyTheme(isDark);
	localStorage.setItem("theme", isDark ? "dark" : "light");
}

document.addEventListener("DOMContentLoaded", () => {
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme) {
		applyTheme(savedTheme === "dark");
	} else {
		applyTheme(isDark);
	}
	colorSchemeBtn.addEventListener("click", toggleTheme);
});

// Hamburger menu

const openNav = document.querySelector(".open-nav");
const closeNav = document.querySelector(".close-nav");
const nav = document.querySelector("header > nav");
const partnersGroup = document.querySelectorAll(".partners-group");

function updateWidth() {
	const windowWidth = window.innerWidth;
	closeNav.style.display = "none";
	nav.classList.remove("translate-out-menu");
	if (partnersGroup)
		partnersGroup.forEach(g => (g.style.transform = "scale(1)"));
	if (windowWidth > 768) {
		openNav.style.display = "none";
		nav.style.display = "flex";
	} else {
		openNav.style.display = "flex";
		nav.style.display = "none";
	}
}

openNav.addEventListener("click", () => {
	const headerRect = document.querySelector("header").getBoundingClientRect();
	nav.style.top = headerRect.bottom + "px";
	nav.style.display = "flex";
	openNav.style.display = "none";
	closeNav.style.display = "flex";
	nav.classList.remove("translate-out-menu");
	nav.classList.add("translate-in-menu");
	if (partnersGroup)
		partnersGroup.forEach(g => (g.style.transform = "scale(0)"));
});
closeNav.addEventListener("click", () => {
	openNav.style.display = "flex";
	closeNav.style.display = "none";
	nav.classList.remove("translate-in-menu");
	nav.classList.add("translate-out-menu");
	if (partnersGroup)
		partnersGroup.forEach(g => (g.style.transform = "scale(1)"));
});

window.addEventListener("resize", updateWidth);
window.addEventListener("scroll", updateWidth);

// Header visible on scroll

let lastScrollTop = 0;

window.addEventListener("scroll", () => {
	let header = document.querySelector("header");
	let scrollToTop = window.pageYOffset || document.documentElement.scrollTop;

	if (scrollToTop > lastScrollTop) {
		header.style.top = "-100%";
	} else {
		header.style.top = "0";
	}
	lastScrollTop = scrollToTop;
});
