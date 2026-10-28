import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let active = null;
let seq = 0; // Only the latest transition may report that it settled.

// Moves the same elements into a new arrangement.
// Safe to call mid-flight: positions are captured where the names are on screen right now,
// the previous animation is killed, and the new one starts from there.
export function transition(targets, change, onSettle) {
  const id = ++seq;
  const settle = () => {
    if (id === seq) onSettle?.();
  };
  const state = Flip.getState(targets);
  if (active) {
    active.kill();
    active = null;
  }
  gsap.set(targets, { clearProps: 'transform' });

  change();

  if (reduceMotion.matches) {
    settle();
    return;
  }

  active = Flip.from(state, {
    duration: 0.85,
    ease: 'power2.inOut',
    stagger: { amount: 0.25, from: 'random' },
    onComplete: () => {
      if (id === seq) active = null;
      settle();
    },
  });
}

export const prefersReducedMotion = () => reduceMotion.matches;
