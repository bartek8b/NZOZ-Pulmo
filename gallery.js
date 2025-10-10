// To be set manually
const frameWidth = 375;
const imagesLength = 8;
// End of To be set manually

const tape = document.querySelector(".tape");
const dots = document.querySelectorAll(".dot");

let currentIndex = 0;
let autoPlay = true;
let intervalId = null;

function updateTapePosition() {
	tape.style.right = `${frameWidth * currentIndex}px`;
}

function updateDotFill() {
	dots.forEach(d => {
		Number(d.dataset.index) === currentIndex
			? d.classList.add("dot-filled")
			: d.classList.remove("dot-filled");
	});
}
function play() {
	if (currentIndex === imagesLength - 1) {
		currentIndex = 0;
		updateTapePosition();
		updateDotFill();
	} else {
		currentIndex = currentIndex + 1;
		updateTapePosition();
		updateDotFill();
	}
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
function markPlayBtn() {
	const playBtn = document.querySelector(".play-btn");
	if (autoPlay) {
		playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
	} else {
		playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
	}
}

window.addEventListener("click", e => {
	const prevBtn = e.target.closest(".previous-btn");
	const nextBtn = e.target.closest(".next-btn");
	const dotBtn = e.target.closest(".dot");
	const playPauseBtn = e.target.closest(".play-btn");

	if (!prevBtn && !nextBtn && !playPauseBtn && !dotBtn) {
		return;
	}

	if (prevBtn) {
		if (currentIndex !== 0 && currentIndex > 0) {
			currentIndex = currentIndex - 1;
			updateTapePosition();
			updateDotFill();
		} else {
			currentIndex = imagesLength - 1;
			updateTapePosition();
			updateDotFill();
		}
		return;
	}

	if (nextBtn) {
		if (currentIndex === imagesLength - 1) {
			currentIndex = 0;
			updateTapePosition();
			updateDotFill();
		} else {
			currentIndex = currentIndex + 1;
			updateTapePosition();
			updateDotFill();
		}
		return;
	}

	if (dotBtn) {
		currentIndex = Number(dotBtn.dataset.index);
		updateTapePosition();
		updateDotFill();
		return;
	}

	if (playPauseBtn) {
		autoPlay ? (autoPlay = false) : (autoPlay = true);
		slideShow();
		markPlayBtn();
	}
});

//swipe gestures handling

let touchStartX = null;
let touchEndX = null;

const frame = document.querySelector(".frame");

frame.addEventListener(
	"touchstart",
	function (e) {
		if (e.touches.length === 1) {
			touchStartX = e.touches[0].clientX;
			touchEndX = null;
		}
	},
	{ passive: true }
);

frame.addEventListener(
	"touchmove",
	function (e) {
		if (e.touches.length === 1) {
			touchEndX = e.touches[0].clientX;
		}
	},
	{ passive: true }
);

frame.addEventListener("touchend", function (e) {
	if (touchStartX !== null && touchEndX !== null) {
		const deltaX = touchEndX - touchStartX;
		if (Math.abs(deltaX) > 50) {
			if (deltaX < 0) {
				if (currentIndex < imagesLength - 1) {
					currentIndex++;
					updateTapePosition();
					updateDotFill();
				}
			} else {
				if (currentIndex > 0) {
					currentIndex--;
					updateTapePosition();
					updateDotFill();
				}
			}
		}
	}
	touchStartX = null;
	touchEndX = null;
});

// init
updateTapePosition();
updateDotFill();
slideShow();
markPlayBtn();
