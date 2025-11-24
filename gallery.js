const tape = document.querySelector('.tape');
const images = tape.querySelectorAll('img');

// Generating dots
const dotsBox = document.querySelector('.dots-box');

for (let i = 0; i < images.length; i++) {
	const btn = document.createElement('button');
	btn.className = 'dot';
	btn.dataset.index = i;
	btn.setAttribute('aria-label', `Picture ${i + 1}`);
	dotsBox.appendChild(btn);
}

const dots = dotsBox.querySelectorAll('.dot');

let currentIndex = 0;
let autoPlay = true;
let intervalId = null;

function updateTapePosition() {
	const frame = document.querySelector('.frame');
	const frameWidth = frame.offsetWidth;
	tape.style.transform = `translateX(-${frameWidth * currentIndex}px)`;
}

function updateTapeWidth() {
	const frame = document.querySelector('.frame');
	const frameWidth = frame.offsetWidth;
	tape.style.width = `${images.length * frameWidth}px`;
	images.forEach(img => {
		img.style.width = `${frameWidth}px`;
		img.style.height = '100%';
	});
}

function updateDotFill() {
	dots.forEach(d => {
		Number(d.dataset.index) === currentIndex
			? d.classList.add('dot-filled')
			: d.classList.remove('dot-filled');
	});
}

function play() {
	if (currentIndex === images.length - 1) {
		currentIndex = 0;
	} else {
		currentIndex = currentIndex + 1;
	}
	updateTapePosition();
	updateDotFill();
}

function slideShow() {
	if (autoPlay) {
		if (intervalId !== null) return; // Don't run new interval if one exists
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
		playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
	} else {
		playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
	}
}

window.addEventListener('click', e => {
	const prevBtn = e.target.closest('.previous-btn');
	const nextBtn = e.target.closest('.next-btn');
	const dotBtn = e.target.closest('.dot');
	const playPauseBtn = e.target.closest('.play-btn');

	if (!prevBtn && !nextBtn && !playPauseBtn && !dotBtn) {
		return;
	}

	if (prevBtn) {
		if (currentIndex !== 0 && currentIndex > 0) {
			currentIndex = currentIndex - 1;
		} else {
			currentIndex = images.length - 1;
		}
		updateTapePosition();
		updateDotFill();
		restartSlideShow(); // reset licznik po akcji
		return;
	}

	if (nextBtn) {
		if (currentIndex === images.length - 1) {
			currentIndex = 0;
		} else {
			currentIndex = currentIndex + 1;
		}
		updateTapePosition();
		updateDotFill();
		restartSlideShow();
		return;
	}

	if (dotBtn) {
		currentIndex = Number(dotBtn.dataset.index);
		updateTapePosition();
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
	updateTapePosition();
});

// swipe gestures handling

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
	if (touchStartX !== null && touchEndX !== null) {
		const deltaX = touchEndX - touchStartX;
		if (Math.abs(deltaX) > 50) {
			if (deltaX < 0 && currentIndex < images.length - 1) {
				currentIndex++;
				updateTapePosition();
				updateDotFill();
				restartSlideShow();
			} else if (deltaX > 0 && currentIndex > 0) {
				currentIndex--;
				updateTapePosition();
				updateDotFill();
				restartSlideShow();
			}
		}
	}
	touchStartX = null;
	touchEndX = null;
});

// init
updateTapeWidth();
updateTapePosition();
updateDotFill();
slideShow();
markPlayBtn();
