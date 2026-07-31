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

  /**
   * Trigger dramatic screen shake for special powers
   */
  static screenShake() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    appContainer.classList.remove('screen-shake');
    void appContainer.offsetWidth;
    appContainer.classList.add('screen-shake');

    setTimeout(() => {
      appContainer.classList.remove('screen-shake');
    }, 600);
  }

  /**
   * Trigger screen flash effect for special powers
   * @param {string} color - 'green', 'red', 'blue', 'gold'
   */
  static screenFlash(color = 'green') {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    appContainer.classList.remove('green-flash-effect', 'red-flash-effect', 'blue-flash-effect', 'gold-flash-effect');
    void appContainer.offsetWidth;
    
    const flashClass = `${color}-flash-effect`;
    appContainer.classList.add(flashClass);

    setTimeout(() => {
      appContainer.classList.remove(flashClass);
    }, 800);
  }

  /**
   * Trigger special power activation effect
   * @param {string} cardId - 'p1-card' or 'p2-card'
   * @param {string} effectType - 'dragon', 'thunder', 'virtue'
   */
  static triggerSpecialPowerEffect(cardId, effectType = 'dragon') {
    const cardEl = document.getElementById(cardId);
    if (!cardEl) return;

    // Remove all special power classes
    cardEl.classList.remove('special-dragon', 'special-thunder', 'special-virtue');
    void cardEl.offsetWidth;
    
    // Add specific effect class
    const effectClass = `special-${effectType}`;
    cardEl.classList.add(effectClass);

    // Screen shake and flash
    this.screenShake();
    
    if (effectType === 'dragon') {
      this.screenFlash('green');
    } else if (effectType === 'thunder') {
      this.screenFlash('red');
    } else if (effectType === 'virtue') {
      this.screenFlash('gold');
    }

    setTimeout(() => {
      cardEl.classList.remove(effectClass);
    }, 1200);
  }
}
