// Infinite loop image carousel with seamless transitions, supporting buttons, dots and swipe gestures

// --- DOM elements and initial setup ---

const tape = document.querySelector('.tape');
const originalImages = Array.from(tape.querySelectorAll('img')); // the original images (before adding clones)
const dotsBox = document.querySelector('.dots-box');

// Create clones: one of the first image (appended at the end), one of the last (prepended at the beginning)
// This enables a seamless/infinite carousel experience when looping around
const firstClone = originalImages[0].cloneNode(true);
const lastClone = originalImages[originalImages.length - 1].cloneNode(true);
firstClone.classList.add('clone');
lastClone.classList.add('clone');
tape.appendChild(firstClone); // First image clone added at the end
tape.insertBefore(lastClone, originalImages[0]); // Last image clone added at the start

// Now 'images' contains: [lastClone, ...originalImages, firstClone]
const images = Array.from(tape.querySelectorAll('img'));

// Generate dot navigation only for the real/original slides
dotsBox.innerHTML = '';
for (let i = 0; i < originalImages.length; i++) {
	const btn = document.createElement('button');
	btn.className = 'dot';
	btn.dataset.index = i;
	btn.setAttribute('aria-label', `Picture ${i + 1}`);
	dotsBox.appendChild(btn);
}
const dots = dotsBox.querySelectorAll('.dot');

// --- Carousel state variables ---

// 'currentIndex' starts at 1, pointing to the first real/original image (0 is lastClone, images.length-1 is firstClone)
let currentIndex = 1;
let autoPlay = true;
let intervalId = null;
let lock = false; // Prevents new transitions during animation
let unlockTimeout = null; // Fallback unlock for missed transitionend

// --- Helper Functions ---

// Move the tape to the current slide (with animation by default)
function updateTapePosition(animate = true) {
	const frame = document.querySelector('.frame');
	const frameWidth = frame.offsetWidth;
	if (!animate) tape.style.transition = 'none';
	else tape.style.transition = 'transform 0.6s ease';
	tape.style.transform = `translateX(-${frameWidth * currentIndex}px)`;
}

// Set each image and the tape's container width to match the visible frame, ensuring correct sizing and responsiveness
function updateTapeWidth() {
	const frame = document.querySelector('.frame');
	const frameWidth = frame.offsetWidth;
	tape.style.width = `${images.length * frameWidth}px`;
	images.forEach(img => {
		img.style.width = `${frameWidth}px`;
		img.style.height = '100%';
	});
}

// Highlight the active dot corresponding to the currently visible real/original slide
function updateDotFill() {
	dots.forEach((d, i) => {
		i === realIndex()
			? d.classList.add('dot-filled')
			: d.classList.remove('dot-filled');
	});
}

// Convert 'currentIndex' (which includes clones) to the correct index of the original slides for UI and dots
function realIndex() {
	if (currentIndex === 0) return originalImages.length - 1;
	if (currentIndex === images.length - 1) return 0;
	return currentIndex - 1;
}

// --- Slideshow & autoplay control ---

// Advance to the next slide (if not currently animating)
// Now includes fallback timeout unlock in case transitionend is missed (e.g. tab is unfocused)
function play() {
	if (lock) return;
	lock = true;
	currentIndex++;
	updateTapePosition(true);
	updateDotFill();
	// Fallback unlock in case transitionend is missed (browser tab inactive etc.)
	clearTimeout(unlockTimeout);
	unlockTimeout = setTimeout(() => { lock = false; }, 1000); // fallback for 0.6s+ transitions
}

// Separate function with lock-check for use in setInterval (autoplay)
function playInterval() {
	if (lock) return;
	play();
}

// Start or stop the autoplay interval for automatic sliding
function slideShow() {
	if (autoPlay) {
		if (intervalId !== null) return;
		intervalId = setInterval(playInterval, 5000);
	} else {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}
}

// Restart the slideshow interval (used after user interaction or when autoplay is toggled)
function restartSlideShow() {
	if (intervalId !== null) {
		clearInterval(intervalId);
		intervalId = null;
	}
	if (autoPlay) {
		intervalId = setInterval(playInterval, 5000);
	}
}

// Switch the play/pause button visual state
function markPlayBtn() {
	const playBtn = document.querySelector('.play-btn');
	if (autoPlay) {
		playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
	} else {
		playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
	}
}

// --- Event handling (buttons, dots, play/pause) ---

window.addEventListener('click', e => {
	const prevBtn = e.target.closest('.previous-btn');
	const nextBtn = e.target.closest('.next-btn');
	const dotBtn = e.target.closest('.dot');
	const playPauseBtn = e.target.closest('.play-btn');

	if (!prevBtn && !nextBtn && !playPauseBtn && !dotBtn) {
		return; // Ignore unrelated clicks
	}

	if (lock) return; // Ignore events during animation

	if (prevBtn) {
		lock = true;
		currentIndex--;
		updateTapePosition(true);
		updateDotFill();
		restartSlideShow();
		// Fallback unlock
		clearTimeout(unlockTimeout);
		unlockTimeout = setTimeout(() => { lock = false; }, 1000);
		return;
	}

	if (nextBtn) {
		lock = true;
		currentIndex++;
		updateTapePosition(true);
		updateDotFill();
		restartSlideShow();
		// Fallback unlock
		clearTimeout(unlockTimeout);
		unlockTimeout = setTimeout(() => { lock = false; }, 1000);
		return;
	}

	if (dotBtn) {
		const target = Number(dotBtn.dataset.index);
		if (target === realIndex()) return; // Clicked the already active dot
		lock = true;
		currentIndex = target + 1; // Skip the prepended lastClone
		updateTapePosition(true);
		updateDotFill();
		restartSlideShow();
		// Fallback unlock
		clearTimeout(unlockTimeout);
		unlockTimeout = setTimeout(() => { lock = false; }, 1000);
		return;
	}

	if (playPauseBtn) {
		autoPlay = !autoPlay;
		slideShow();
		markPlayBtn();
		restartSlideShow();
	}
});

// On window resize: recalculate widths so carousel remains correctly aligned
// Now also resets lock and restarts slideshow to avoid stuck gallery after resize
window.addEventListener('resize', () => {
	updateTapeWidth();
	updateTapePosition(false); // Instantly snap to the same slide, no animation
	lock = false;               // Unlock carousel in case animation stuck during resize
	restartSlideShow();
});

// --- Keyboard navigation ---

window.addEventListener('keydown', e => {
	if (lock) return; // do not trigger if animating
	if (e.key === 'ArrowLeft') {
		lock = true;
		currentIndex--;
		updateTapePosition(true);
		updateDotFill();
		restartSlideShow();
		// Fallback unlock
		clearTimeout(unlockTimeout);
		unlockTimeout = setTimeout(() => { lock = false; }, 1000);
		e.preventDefault();
	}
	if (e.key === 'ArrowRight') {
		lock = true;
		currentIndex++;
		updateTapePosition(true);
		updateDotFill();
		restartSlideShow();
		// Fallback unlock
		clearTimeout(unlockTimeout);
		unlockTimeout = setTimeout(() => { lock = false; }, 1000);
		e.preventDefault();
	}
});

// --- Touch/swipe gesture support (mobile devices) ---

let touchStartX = null;
let touchEndX = null;
const frame = document.querySelector('.frame');

// Record the initial touch X position
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

// Track the movement as finger/swipe progresses
frame.addEventListener(
	'touchmove',
	function (e) {
		if (e.touches.length === 1) {
			touchEndX = e.touches[0].clientX;
		}
	},
	{ passive: true }
);

// On touchend, determine if swipe distance is enough to trigger a slide, and direction
frame.addEventListener('touchend', function (e) {
	if (touchStartX !== null && touchEndX !== null && !lock) {
		const deltaX = touchEndX - touchStartX;
		if (Math.abs(deltaX) > 50) {
			lock = true;
			if (deltaX < 0) {
				// Swipe left → next slide
				currentIndex++;
				updateTapePosition(true);
				updateDotFill();
				restartSlideShow();
			} else if (deltaX > 0) {
				// Swipe right → previous slide
				currentIndex--;
				updateTapePosition(true);
				updateDotFill();
				restartSlideShow();
			}
			// Fallback unlock
			clearTimeout(unlockTimeout);
			unlockTimeout = setTimeout(() => { lock = false; }, 1000);
		}
	}
	touchStartX = null;
	touchEndX = null;
});

// --- Seamless looping logic ---

// When a slide animation ends, handle seamless looping if we're at a clone (fake/transition slide)
tape.addEventListener('transitionend', () => {
	const frame = document.querySelector('.frame');
	const frameWidth = frame.offsetWidth;
	// If we've moved to the clone appended at the end, instant jump to first original
	if (currentIndex === images.length - 1) {
		tape.style.transition = 'none';
		currentIndex = 1;
		tape.style.transform = `translateX(-${frameWidth * currentIndex}px)`;
		setTimeout(() => {
			tape.style.transition = 'transform 0.6s ease';
		}, 10);
	}
	// If we've moved to the clone prepended at the start, instant jump to last original
	if (currentIndex === 0) {
		tape.style.transition = 'none';
		currentIndex = originalImages.length;
		tape.style.transform = `translateX(-${frameWidth * currentIndex}px)`;
		setTimeout(() => {
			tape.style.transition = 'transform 0.6s ease';
		}, 10);
	}
	// Always clear fallback-unlock timeout and unlock here as the default unlock
	clearTimeout(unlockTimeout);
	lock = false; // Allow new transitions
});

// --- New: Safety for browser tab/page visibility change/focus ---

// Sometimes, leaving or returning to a browser tab causes animation or autoplay to hang.
// These event listeners will restart and unlock the carousel after the page becomes visible or the window regains focus.
function handleVisibilityOrFocus() {
	lock = false;
	updateTapePosition(false); // Snap to correct position immediately (no animation)
	updateDotFill();
	restartSlideShow();
}

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') handleVisibilityOrFocus();
});
window.addEventListener('focus', handleVisibilityOrFocus);

// --- Initial setup on page load ---

updateTapeWidth();
updateTapePosition(false); // Instantly position to first slide
updateDotFill();
slideShow(); // Start autoplay if enabled
markPlayBtn(); // Set the play/pause button icon
