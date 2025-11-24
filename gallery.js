// Karuzela z idealną pętlą: bez "skoku" przy przechodzeniu 1↔️n, obsługa dla kliknięć i swipe

const tape = document.querySelector('.tape');
const originalImages = Array.from(tape.querySelectorAll('img')); // tylko oryginały, bez klonów
const dotsBox = document.querySelector('.dots-box');

// 1. Klonuj pierwszy i ostatni obrazek dla seamless infinite
const firstClone = originalImages[0].cloneNode(true);
const lastClone = originalImages[originalImages.length - 1].cloneNode(true);
firstClone.classList.add('clone');
lastClone.classList.add('clone');
tape.appendChild(firstClone); // pierwszy klon na sam koniec
tape.insertBefore(lastClone, originalImages[0]); // ostatni klon na początek

// 2. Nowe "images" - cała taśma (klony + oryginały)
const images = Array.from(tape.querySelectorAll('img')); // teraz klony również w kolekcji

// 3. Genereuj dots (kropki) tylko dla oryginalnych slajdów (bez klonów)
dotsBox.innerHTML = '';
for (let i = 0; i < originalImages.length; i++) {
	const btn = document.createElement('button');
	btn.className = 'dot';
	btn.dataset.index = i;
	btn.setAttribute('aria-label', `Picture ${i + 1}`);
	dotsBox.appendChild(btn);
}
const dots = dotsBox.querySelectorAll('.dot');

// 4. Stan
let currentIndex = 1; // zaczynamy na pierwszym oryginale ⇒ index=1 (0 to klon ostatni)
let autoPlay = true;
let intervalId = null;

// 5. Pozycjonowanie taśmy, ustawiamy translateX zależnie od currentIndex
function updateTapePosition(animate = true) {
	const frame = document.querySelector('.frame');
	const frameWidth = frame.offsetWidth;
	if (!animate) tape.style.transition = 'none';
	else tape.style.transition = 'transform 0.3s ease-in-out';
	tape.style.transform = `translateX(-${frameWidth * currentIndex}px)`;
}

// 6. Ustaw rozmiary: szerokość taśmy i obrazków wg fizycznej ramki
function updateTapeWidth() {
	const frame = document.querySelector('.frame');
	const frameWidth = frame.offsetWidth;
	tape.style.width = `${images.length * frameWidth}px`;
	images.forEach(img => {
		img.style.width = `${frameWidth}px`;
		img.style.height = '100%';
	});
}

// 7. Ustaw aktywne kropki (tylko oryginały: currentIndex-1)
function updateDotFill() {
	dots.forEach((d, i) => {
		i === realIndex()
			? d.classList.add('dot-filled')
			: d.classList.remove('dot-filled');
	});
}

// "realny slajd" (odnosi się do oryginałów): currentIndex 1..N
function realIndex() {
	if (currentIndex === 0) return originalImages.length - 1;
	if (currentIndex === images.length - 1) return 0;
	return currentIndex - 1;
}

// Autoplay, slajd do przodu
function play() {
	if (lock) return;
	// Zwiększ indeks, potem śledź transitionend!
	currentIndex++;
	updateTapePosition(true);
	updateDotFill();
}

// Autoplay obsługa
function slideShow() {
	if (autoPlay) {
		if (intervalId !== null) return;
		intervalId = setInterval(play, 5000);
	} else {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}
}

function restartSlideShow() {
	if (intervalId !== null) {
		clearInterval(intervalId);
		intervalId = null;
	}
	if (autoPlay) {
		intervalId = setInterval(play, 5000);
	}
}

function markPlayBtn() {
	const playBtn = document.querySelector('.play-btn');
	if (autoPlay) {
		playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
	} else {
		playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
	}
}

// 8. Strzałki, doty, play/pause
// Prosty lock na czas animacji
let lock = false;

window.addEventListener('click', e => {
	const prevBtn = e.target.closest('.previous-btn');
	const nextBtn = e.target.closest('.next-btn');
	const dotBtn = e.target.closest('.dot');
	const playPauseBtn = e.target.closest('.play-btn');

	if (!prevBtn && !nextBtn && !playPauseBtn && !dotBtn) {
		return;
	}

	if (lock) return;

	if (prevBtn) {
		lock = true;
		currentIndex--;
		updateTapePosition(true);
		updateDotFill();
		restartSlideShow();
		return;
	}

	if (nextBtn) {
		lock = true;
		currentIndex++;
		updateTapePosition(true);
		updateDotFill();
		restartSlideShow();
		return;
	}

	if (dotBtn) {
		const target = Number(dotBtn.dataset.index);
		if (target === realIndex()) return; // kliknięta aktualna kropka
		lock = true;
		currentIndex = target + 1; // bo 0 to klon ostatni
		updateTapePosition(true);
		updateDotFill();
		restartSlideShow();
		return;
	}

	if (playPauseBtn) {
		autoPlay = !autoPlay;
		slideShow();
		markPlayBtn();
		restartSlideShow();
	}
});

window.addEventListener('resize', () => {
	updateTapeWidth();
	updateTapePosition(false);
});

// 9. Obsługa gesture: swipe, także infinite
let touchStartX = null;
let touchEndX = null;
const frame = document.querySelector('.frame');

frame.addEventListener(
	'touchstart',
	function (e) {
		if (e.touches.length === 1) {
			touchStartX = e.touches[0].clientX;
			touchEndX = null;
		}
	},
	{ passive: true }
);

frame.addEventListener(
	'touchmove',
	function (e) {
		if (e.touches.length === 1) {
			touchEndX = e.touches[0].clientX;
		}
	},
	{ passive: true }
);

frame.addEventListener('touchend', function (e) {
	if (touchStartX !== null && touchEndX !== null && !lock) {
		const deltaX = touchEndX - touchStartX;
		if (Math.abs(deltaX) > 50) {
			lock = true;
			if (deltaX < 0) {
				// swipe w lewo
				currentIndex++;
				updateTapePosition(true);
				updateDotFill();
				restartSlideShow();
			} else if (deltaX > 0) {
				// swipe w prawo
				currentIndex--;
				updateTapePosition(true);
				updateDotFill();
				restartSlideShow();
			}
		}
	}
	touchStartX = null;
	touchEndX = null;
});

// 10. Najważniejsze – obsługa transitionend, bez tej magii nie będzie seamless!
tape.addEventListener('transitionend', () => {
	const frame = document.querySelector('.frame');
	const frameWidth = frame.offsetWidth;
	// Jeżeli jesteśmy na klonie pierwszego na końcu – przeskocz bez animacji!
	if (currentIndex === images.length - 1) {
		tape.style.transition = 'none';
		currentIndex = 1;
		tape.style.transform = `translateX(-${frameWidth * currentIndex}px)`;
		setTimeout(() => {
			tape.style.transition = 'transform 0.3s ease-in-out';
		}, 10);
	}
	// Jeżeli na klonie ostatniego na początku – przeskocz bez animacji!
	if (currentIndex === 0) {
		tape.style.transition = 'none';
		currentIndex = originalImages.length;
		tape.style.transform = `translateX(-${frameWidth * currentIndex}px)`;
		setTimeout(() => {
			tape.style.transition = 'transform 0.3s ease-in-out';
		}, 10);
	}
	lock = false;
});

// 11. Inicjalizacja – od razu wszystko ustawia!
updateTapeWidth();
updateTapePosition(false);
updateDotFill();
slideShow();
markPlayBtn();
