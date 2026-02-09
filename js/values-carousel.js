/**
 * Values Carousel - Ferris Wheel Circular Orbit
 * Author: Carlos Garzón López (cgvrzon)
 *
 * Positions value cards in a circle and rotates them clockwise
 * on hover using requestAnimationFrame. Cards stay upright
 * (only position orbits) — the "ferris wheel" effect.
 * Cards freeze on mouseleave and resume from that angle on re-hover.
 */

const ValuesCarousel = (function () {
    'use strict';

    const CONFIG = {
        speed: 0.15,          // radians per second (~42s full revolution)
        radius: 320,          // px - orbit radius
        minWidth: 768,
        cardCount: 6
    };

    let container = null;
    let cards = [];
    let angle = 0;            // current rotation angle in radians
    let animationId = null;
    let lastTimestamp = null;

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function positionCards() {
        const step = (2 * Math.PI) / CONFIG.cardCount;
        cards.forEach(function (card, i) {
            var cardAngle = angle + i * step;
            // Start from top (-PI/2) so first card is at 12 o'clock
            var x = CONFIG.radius * Math.cos(cardAngle - Math.PI / 2);
            var y = CONFIG.radius * Math.sin(cardAngle - Math.PI / 2);
            card.style.transform =
                'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px))';
        });
    }

    function animate(timestamp) {
        if (lastTimestamp === null) lastTimestamp = timestamp;
        var delta = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;
        angle += CONFIG.speed * delta;
        positionCards();
        animationId = requestAnimationFrame(animate);
    }

    function handleMouseEnter() {
        if (window.innerWidth < CONFIG.minWidth) return;
        if (prefersReducedMotion()) return;
        lastTimestamp = null;
        animationId = requestAnimationFrame(animate);
    }

    function handleMouseLeave() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // Debounced resize handler
    var resizeTimer = null;
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth < CONFIG.minWidth) {
                // Reset: let CSS handle stacked layout
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                cards.forEach(function (c) { c.style.transform = ''; });
                angle = 0;
                return;
            }
            // Re-position at current angle
            positionCards();
        }, 150);
    }

    function init() {
        container = document.querySelector('.values-grid');
        if (!container) return;
        cards = Array.from(container.querySelectorAll('.value-card'));
        if (cards.length !== CONFIG.cardCount) return;

        if (window.innerWidth >= CONFIG.minWidth && !prefersReducedMotion()) {
            // Set initial circular positions (static, no animation)
            positionCards();
        }

        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize);
    }

    return { init: init };
})();
