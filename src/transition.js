import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let active = null;
let follow = null;
let seq = 0; // Only the latest transition may report that it settled.

// A reader who scrolls mid-transition takes over from the follow.
const stopFollow = () => {
  follow?.kill();
  follow = null;
};
window.addEventListener('wheel', stopFollow, { passive: true });
window.addEventListener('touchstart', stopFollow, { passive: true });

// Where the followed name should sit on screen: where it already is,
// kept clear of the top edge and of the stepper at the bottom.
function anchorFor(el) {
  const top = el.getBoundingClientRect().top;
  return Math.min(Math.max(top, innerHeight * 0.2), innerHeight * 0.55);
}

// Moves the same elements into a new arrangement.
// Safe to call mid-flight: positions are captured where the names are on screen right now,
// the previous animation is killed, and the new one starts from there.
// With `followEl`, the page scrolls in step with the move so that element stays in view;
// `maxScroll()` is read after the new layout is in place.
export function transition(targets, change, onSettle, { duration = 0.85, followEl = null, maxScroll } = {}) {
  const id = ++seq;
  const settle = () => {
    if (id === seq) onSettle?.();
  };
  const anchor = followEl ? anchorFor(followEl) : 0;
  const state = Flip.getState(targets);
  active?.kill();
  active = null;
  stopFollow();
  gsap.set(targets, { clearProps: 'transform' });

  change();

  let scrollTo = null;
  if (followEl) {
    const docTop = followEl.getBoundingClientRect().top + window.scrollY;
    scrollTo = Math.min(Math.max(0, docTop - anchor), maxScroll?.() ?? Infinity);
  }

  if (reduceMotion.matches) {
    if (scrollTo !== null) window.scrollTo(0, scrollTo);
    settle();
    return;
  }

  active = Flip.from(state, {
    duration,
    ease: 'power2.inOut',
    // The followed name leaves on time so it moves exactly with the scroll.
    stagger: (i, el) => (el === followEl ? 0 : Math.random() * 0.25),
    onComplete: () => {
      if (id === seq) active = null;
      settle();
    },
  });

  if (scrollTo !== null) {
    const pos = { y: window.scrollY };
    follow = gsap.to(pos, {
      y: scrollTo,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => window.scrollTo(0, pos.y),
    });
  }
}

export const prefersReducedMotion = () => reduceMotion.matches;
