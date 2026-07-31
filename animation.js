/**
 * Visual Animation & Floating Text Engine
 */

class AnimationManager {
  /**
   * Spawn floating text over character card
   * @param {string} cardId - 'p1-card' or 'p2-card'
   * @param {string} text - Display text (e.g. "-360", "BLOCKED!")
   * @param {string} type - 'damage', 'blocked', 'charge', 'shield'
   */
  static showFloatingText(cardId, text, type = 'damage') {
    const container = document.getElementById('floating-text-container');
    const cardEl = document.getElementById(cardId);

    if (!container || !cardEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate position relative to container
    const x = cardRect.left - containerRect.left + cardRect.width / 2 + (Math.random() * 40 - 20);
    const y = cardRect.top - containerRect.top + cardRect.height / 3 + (Math.random() * 20 - 10);

    const el = document.createElement('div');
    el.className = `floating-text ${type}`;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    container.appendChild(el);

    // Remove element when animation finishes
    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 1250);
  }

  /**
   * Trigger card hit shake animation
   * @param {string} cardId 
   */
  static shakeCard(cardId) {
    const cardEl = document.getElementById(cardId);
    if (!cardEl) return;

    cardEl.classList.remove('shake-hit');
    // Force reflow
    void cardEl.offsetWidth;
    cardEl.classList.add('shake-hit');

    setTimeout(() => {
      cardEl.classList.remove('shake-hit');
    }, 450);
  }
}
