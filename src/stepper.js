// Bottom stepper. Guided (prev/next only) until the walk is finished,
// then the progress strip becomes tabs for free exploration.
const KEY = 'epsilon.walkDone';
const read = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
const save = () => {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* private mode: unlock for this visit only */
  }
};

export function createStepper({ order, isBuilt, onGo }) {
  const nav = document.getElementById('stepper');
  const strip = nav.querySelector('.stepper__strip');
  const question = nav.querySelector('.stepper__question');
  const prev = nav.querySelector('[data-dir="-1"]');
  const next = nav.querySelector('[data-dir="1"]');
  let index = 0;
  let unlocked = read();

  function renderStrip() {
    strip.replaceChildren(
      ...order.map((v, i) => {
        const li = document.createElement('li');
        const item = document.createElement(unlocked ? 'button' : 'span');
        item.className = 'stepper__item';
        item.textContent = v.label;
        if (unlocked) {
          item.type = 'button';
          item.disabled = !isBuilt(v.id);
          item.addEventListener('click', () => go(i));
        }
        li.append(item);
        return li;
      }),
    );
    strip.setAttribute('aria-label', unlocked ? 'Views' : 'Progress');
  }

  function sync(questionText) {
    question.textContent = questionText;
    prev.disabled = index === 0;
    next.disabled = index === order.length - 1 || !isBuilt(order[index + 1].id);
    strip.querySelectorAll('.stepper__item').forEach((el, i) => {
      el.classList.toggle('is-current', i === index);
      el.classList.toggle('is-past', i < index);
      if (i === index) el.setAttribute('aria-current', unlocked ? 'page' : 'step');
      else el.removeAttribute('aria-current');
    });
  }

  function go(i) {
    if (i < 0 || i >= order.length || !isBuilt(order[i].id)) return;
    index = i;
    onGo(order[i].id);
  }

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  renderStrip();

  return {
    sync,
    // Called when the closing line is reached.
    unlock() {
      if (unlocked) return;
      unlocked = true;
      save();
      renderStrip();
    },
    get index() {
      return index;
    },
  };
}
