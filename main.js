/* ==========================================================================
   Tiny enhancements (optional)
   - Smooth scroll to sections (respects reduced motion)
   - Scroll reveal animation for blocks
   - Staggered text animation
   - Ambient card glow + hero accents
   - Active state for nav links by section
   - Copy-to-clipboard for email
   - Current year in footer
   ========================================================================== */

(() => {
	const prefersReducedMotion =
		window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

	const setActiveNavLink = (sectionId) => {
		const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
		navLinks.forEach((link) => {
			const hash = link.getAttribute("href");
			link.classList.toggle("is-active", hash === `#${sectionId}`);
		});
	};

	const initAmbientAnimations = () => {
		const logoDot = document.querySelector(".logo__dot");
		if (logoDot) logoDot.classList.add("is-pulse");

		const heroName = document.querySelector(".hero__name");
		if (heroName) heroName.classList.add("is-animated-name");

		if (prefersReducedMotion) return;

		const ambientSelectors = [".hero__tiles .tile", ".facts .fact", ".projects .project"];
		const ambientItems = [];
		const seen = new Set();

		ambientSelectors.forEach((selector) => {
			document.querySelectorAll(selector).forEach((item) => {
				if (seen.has(item)) return;
				seen.add(item);
				ambientItems.push(item);
			});
		});

		ambientItems.forEach((item, index) => {
			item.classList.add("is-ambient");
			item.style.setProperty("--ambient-delay", `${index * 180}ms`);
			item.style.setProperty("--ambient-duration", `${5600 + index * 380}ms`);
		});
	};

	const initTextStaggerAnimations = () => {
		if (prefersReducedMotion) return;

		const selectors = [
			".hero__name",
			".hero__role",
			".section__title",
			".card__title",
			".tile__title",
			".fact__key",
		];

		const animatedNodes = [];
		const seen = new Set();

		selectors.forEach((selector) => {
			document.querySelectorAll(selector).forEach((node, nodeIndex) => {
				if (seen.has(node) || node.classList.contains("text-stagger")) return;
				seen.add(node);

				const originalText = node.textContent?.trim() || "";
				if (!originalText) return;

				const fragments = document.createDocumentFragment();
				const tokens = originalText.split(/(\s+)/);
				let wordIndex = 0;

				tokens.forEach((token) => {
					if (!token) return;
					if (/^\s+$/.test(token)) {
						fragments.append(document.createTextNode(token));
						return;
					}

					const word = document.createElement("span");
					word.className = "word";
					word.style.setProperty("--word-index", String(wordIndex));
					word.setAttribute("aria-hidden", "true");
					word.textContent = token;
					fragments.append(word);
					wordIndex += 1;
				});

				node.textContent = "";
				node.append(fragments);
				node.classList.add("text-stagger");
				node.style.setProperty("--text-delay", `${Math.min(nodeIndex * 40, 180)}ms`);
				node.setAttribute("aria-label", originalText);
				animatedNodes.push(node);
			});
		});

		if (!animatedNodes.length) return;
		if (!("IntersectionObserver" in window)) {
			animatedNodes.forEach((node) => node.classList.add("is-visible"));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					entry.target.classList.toggle("is-visible", entry.isIntersecting);
				});
			},
			{
				threshold: 0.4,
				rootMargin: "0px 0px -8% 0px",
			}
		);

		animatedNodes.forEach((node) => observer.observe(node));
	};

	const initRevealAnimations = () => {
		const revealSelectors = [
			".hero__copy > *",
			".hero__tiles > *",
			".facts > *",
			"#about .about > *",
			"#about .skills",
			"#projects .projects > *",
			"#contact .contact > *",
			".footer__inner > *",
		];

		const revealElements = [];
		const seen = new Set();

		revealSelectors.forEach((selector) => {
			const elements = document.querySelectorAll(selector);
			elements.forEach((element, index) => {
				if (seen.has(element)) return;
				seen.add(element);

				element.classList.add("reveal");
				element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
				revealElements.push(element);
			});
		});

		if (!revealElements.length) return;

		if (prefersReducedMotion || !("IntersectionObserver" in window)) {
			revealElements.forEach((element) => element.classList.add("is-visible"));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					entry.target.classList.toggle("is-visible", entry.isIntersecting);
				});
			},
			{
				threshold: 0.2,
				rootMargin: "0px 0px -10% 0px",
			}
		);

		revealElements.forEach((element) => observer.observe(element));
	};

	const initActiveNavBySection = () => {
		const navLinks = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));
		if (!navLinks.length) return;

		const sections = navLinks
			.map((link) => link.getAttribute("href")?.slice(1))
			.filter(Boolean)
			.map((id) => document.getElementById(id))
			.filter(Boolean);

		if (!sections.length) return;
		if (!("IntersectionObserver" in window)) return;

		const visibilityBySection = new Map();
		sections.forEach((section) => visibilityBySection.set(section.id, 0));

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					visibilityBySection.set(
						entry.target.id,
						entry.isIntersecting ? entry.intersectionRatio : 0
					);
				});

				let bestSectionId = "";
				let bestRatio = 0;

				visibilityBySection.forEach((ratio, sectionId) => {
					if (ratio > bestRatio) {
						bestRatio = ratio;
						bestSectionId = sectionId;
					}
				});

				if (bestSectionId) setActiveNavLink(bestSectionId);
			},
			{
				threshold: [0.2, 0.4, 0.6, 0.8],
				rootMargin: "-25% 0px -45% 0px",
			}
		);

		sections.forEach((section) => observer.observe(section));
		setActiveNavLink(sections[0].id);
	};

	// Smooth scroll for internal anchors
	document.addEventListener("click", (event) => {
		const link = event.target?.closest?.('a[href^="#"]');
		if (!link) return;

		const hash = link.getAttribute("href");
		if (!hash || hash === "#") return;

		const target = document.querySelector(hash);
		if (!target) return;

		event.preventDefault();
		target.scrollIntoView({
			behavior: prefersReducedMotion ? "auto" : "smooth",
			block: "start",
		});
		history.pushState(null, "", hash);
	});

	// Copy-to-clipboard (used in Contacts)
	document.addEventListener("click", async (event) => {
		const button = event.target?.closest?.("[data-copy]");
		if (!button) return;

		const value = button.getAttribute("data-copy") || "";
		if (!value) return;

		const originalText = button.textContent || "Копировать";
		button.disabled = true;

		try {
			await navigator.clipboard.writeText(value);
			button.textContent = "Скопировано";
			window.setTimeout(() => {
				button.textContent = originalText;
				button.disabled = false;
			}, 1300);
		} catch {
			button.disabled = false;
			window.prompt("Скопируйте значение:", value);
		}
	});

	// Current year
	const year = document.querySelector("[data-year]");
	if (year) year.textContent = String(new Date().getFullYear());

	initAmbientAnimations();
	initRevealAnimations();
	initTextStaggerAnimations();
	initActiveNavBySection();
})();
