document.addEventListener('DOMContentLoaded', function () {
	function filterSections(facility) {
		const allSections = document.querySelectorAll('section[data-facility]');
		allSections.forEach(function (section) {
			if (section.dataset.facility === facility) {
				section.style.display = '';
				section.classList.add('show');
			} else {
				section.style.display = 'none';
				section.classList.remove('show');
			}
			// Remove dynemaic classes for reset
			section.classList.remove('even-bg', 'odd-bg');
		});

		// Dynamically repaint alternately only visible sub-containers
		const visibleSections = Array.from(
			document.querySelectorAll('section[data-facility].show')
		);
		visibleSections.forEach((section, idx) => {
			section.classList.add(idx % 2 === 0 ? 'even-bg' : 'odd-bg');
		});
		// Highlight active button / filter
		document
			.querySelectorAll('.filter-btns-container button[data-facility]')
			.forEach(function (btn) {
				if (btn.dataset.facility === facility) {
					btn.classList.add('active');
				} else {
					btn.classList.remove('active');
				}
			});

		// Highlight proper contact data
		document
			.querySelectorAll('.filtered-contact-container > .filtered-contact')
			.forEach(function (div) {
				if (div.dataset.facility === facility) {
					div.style.display = 'flex';
				} else {
					div.style.display = 'none';
				}
			});
	}

	// Handling clicks on filters on target subpage
	document
		.querySelectorAll('.filter-btns-container button')
		.forEach(function (btn) {
			// Event click
			btn.addEventListener('click', function () {
				filterSections(btn.dataset.facility);
				// Set ?facility in URL in order to refresh/copy link with proper filter
				const url = new URL(window.location);
				url.searchParams.set('facility', btn.dataset.facility);
				window.history.replaceState({}, '', url);
			});
		});

	// After enter the page, check URL and show filtered content
	const params = new URLSearchParams(window.location.search);
	const facilityFromURL = params.get('facility');

	// Check if facility exists and if not, set the first one to be displayed
	const allFacilities = Array.from(
		document.querySelectorAll('section[data-facility]')
	).map(sec => sec.dataset.facility);
	let toShow =
		facilityFromURL && allFacilities.includes(facilityFromURL)
			? facilityFromURL
			: allFacilities[0];

	// Init for safety
	filterSections(toShow);
});
