/**
 * Values Carousel - Continuous Smooth Rotation
 * Author: Carlos Garzón López (cgvrzon)
 *
 * Smoothly rotates value cards clockwise around the hexagonal grid
 * on hover using requestAnimationFrame. Cards freeze in place on
 * mouseleave and resume from that position on re-hover.
 */

const ValuesCarousel = (function () {
    'use strict';

    const CONFIG = {
        speed: 0.45,        // positions per second (~40s full cycle)
        minWidth: 768,
        ringOrder: [0, 1, 3, 5, 4, 2]  // clockwise through hexagonal layout
    };

    let grid = null;
    let cards = [];
    let basePositions = [];   // each card's natural {x, y} relative to grid
    let progress = 0;         // continuous float: how far we've rotated (in positions)
    let animationId = null;
    let lastTimestamp = null;
    let positionsCaptured = false;

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // ------------------------------------------------------------------
    // Position capture
    // ------------------------------------------------------------------

    function captureBasePositions() {
        const savedTransforms = cards.map(c => c.style.transform);

        // Temporarily strip transforms to read natural positions
        cards.forEach(c => { c.style.transform = ''; });
        grid.offsetHeight; // force reflow

        const gridRect = grid.getBoundingClientRect();

        basePositions = cards.map(c => {
            const r = c.getBoundingClientRect();
            return {
                x: r.left - gridRect.left,
                y: r.top - gridRect.top
            };
        });

        // Restore transforms (so frozen cards don't jump)
        cards.forEach((c, i) => { c.style.transform = savedTransforms[i]; });

        positionsCaptured = true;
    }

    // ------------------------------------------------------------------
    // Animation loop
    // ------------------------------------------------------------------

    function applyPositions() {
        const ring = CONFIG.ringOrder;
        const len = ring.length;

        cards.forEach((card, cardIndex) => {
            const ringPos = ring.indexOf(cardIndex);
            if (ringPos === -1) return;

            // Effective position along the ring (fractional)
            const effective = (ringPos + progress) % len;
            const posA = Math.floor(effective) % len;
            const posB = (posA + 1) % len;
            const t = effective - Math.floor(effective);

            // Physical slot indices in the card array
            const slotA = ring[posA];
            const slotB = ring[posB];

            // Interpolated target position
            const tx = lerp(basePositions[slotA].x, basePositions[slotB].x, t);
            const ty = lerp(basePositions[slotA].y, basePositions[slotB].y, t);

            // Offset from card's own natural position
            const dx = tx - basePositions[cardIndex].x;
            const dy = ty - basePositions[cardIndex].y;

            card.style.transform = `translate(${dx}px, ${dy}px)`;
        });
    }

    function animate(timestamp) {
        if (lastTimestamp === null) {
            lastTimestamp = timestamp;
        }

        const delta = (timestamp - lastTimestamp) / 1000; // seconds
        lastTimestamp = timestamp;

        progress += CONFIG.speed * delta;

        applyPositions();

        animationId = requestAnimationFrame(animate);
    }

    // ------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------

    function handleMouseEnter() {
        if (window.innerWidth < CONFIG.minWidth) return;
        if (prefersReducedMotion()) return;

        if (!positionsCaptured) {
            captureBasePositions();
        }

        lastTimestamp = null;
        animationId = requestAnimationFrame(animate);
    }

    function handleMouseLeave() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        // Cards keep their current transforms — freeze in place
    }

    let resizeTimer = null;

    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!positionsCaptured) return;

            const wasAnimating = animationId !== null;

            if (wasAnimating) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            if (window.innerWidth < CONFIG.minWidth) {
                // Reset on mobile
                cards.forEach(c => { c.style.transform = ''; });
                positionsCaptured = false;
                progress = 0;
                return;
            }

            captureBasePositions();
            applyPositions();

            if (wasAnimating) {
                lastTimestamp = null;
                animationId = requestAnimationFrame(animate);
            }
        }, 150);
    }

    // ------------------------------------------------------------------
    // Init
    // ------------------------------------------------------------------

    function init() {
        grid = document.querySelector('.values-grid');
        if (!grid) return;

        cards = Array.from(grid.querySelectorAll('.value-card'));
        if (cards.length !== 6) return;

        if (prefersReducedMotion()) return;

        grid.addEventListener('mouseenter', handleMouseEnter);
        grid.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize);
    }

    return { init };
})();
