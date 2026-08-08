/**
 * Combat3DController - Main Controller for 3D Battle Scene Prototype
 * Handles lifecycle, rendering loop, visibility toggles, responsive updates, and attack animations.
 */
class Combat3DController {
  constructor(containerId = 'combat-3d-container') {
    this.containerId = containerId;
    this.container = null;
    this.cameraManager = null;
    this.sceneManager = null;
    this.animator = null;
    this.isVisible = false;
    this.animationFrameId = null;
    this.isInitialized = false;

    // Auto setup on window load or DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    if (this.isInitialized) return;
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`Combat3DController: Element #${this.containerId} not found in DOM yet.`);
      return;
    }

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.cameraManager = new Combat3DCamera(width, height);
    this.sceneManager = new Combat3DScene(this.container);
    this.animator = new Combat3DAnimator(this.sceneManager);

    window.addEventListener('resize', () => this.handleResize());
    this.isInitialized = true;

    // Apply any setupCharacters called prior to init
    if (this.pendingSetup) {
      this.setupCharacters(this.pendingSetup.playerCharacterId, this.pendingSetup.enemyCharacterId);
      this.pendingSetup = null;
    }
  }

  /**
   * Setup 3D Characters dynamically for Player (Left) and Enemy (Right)
   * @param {string} playerCharacterId - e.g. "guanYu"
   * @param {string} enemyCharacterId - e.g. "luBu"
   */
  setupCharacters(playerCharacterId = 'guanYu', enemyCharacterId = 'luBu') {
    if (!this.isInitialized) {
      this.pendingSetup = { playerCharacterId, enemyCharacterId };
      return;
    }
    this.p1CharacterId = playerCharacterId;
    this.p2CharacterId = enemyCharacterId;

    if (this.sceneManager && this.sceneManager.setupCharacters) {
      this.sceneManager.setupCharacters(playerCharacterId, enemyCharacterId);
    }
    if (this.animator && this.animator.setupCharacters) {
      this.animator.setupCharacters(playerCharacterId, enemyCharacterId);
    }
  }

  handleResize() {
    if (!this.isInitialized || !this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    if (this.cameraManager) {
      this.cameraManager.updateAspect(width, height);
    }
    if (this.sceneManager) {
      this.sceneManager.resize(width, height);
    }
  }

  startRenderLoop() {
    if (this.animationFrameId) return;

    const animate = () => {
      if (!this.isVisible) {
        this.animationFrameId = null;
        return;
      }
      this.animationFrameId = requestAnimationFrame(animate);

      // Update Attack Animation Engine
      if (this.animator) {
        this.animator.update();
      }

      // Subtle breathing / idle motion for character placeholders when not performing action/KO
      if (this.sceneManager && (this.sceneManager.p1Group || this.sceneManager.guanYuGroup) && (this.sceneManager.p2Group || this.sceneManager.luBuGroup)) {
        const time = Date.now() * 0.002;
        const p1Group = this.sceneManager.p1Group || this.sceneManager.guanYuGroup;
        const p2Group = this.sceneManager.p2Group || this.sceneManager.luBuGroup;
        const p1Active = this.animator && this.animator.activeAnims && (this.animator.activeAnims.p1 || this.animator.activeAnims.guanYu);
        const p2Active = this.animator && this.animator.activeAnims && (this.animator.activeAnims.p2 || this.animator.activeAnims.luBu);

        if (this.animator && this.animator.states) {
          if (p1Group && !p1Active && this.animator.states.p1 !== 'ko' && this.animator.states.guanYu !== 'ko') {
            p1Group.position.y = Math.sin(time) * 0.04;
          }
          if (p2Group && !p2Active && this.animator.states.p2 !== 'ko' && this.animator.states.luBu !== 'ko') {
            p2Group.position.y = Math.sin(time + 1) * 0.04;
          }
        }
      }

      // Update Camera Transitions (e.g. Victory Zoom)
      if (this.cameraManager) {
        this.cameraManager.update();
      }

      if (this.sceneManager && this.cameraManager) {
        this.sceneManager.render(this.cameraManager.getCamera());
      }
    };

    animate();
  }

  stopRenderLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Show 3D Battle Scene
   */
  show() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.container) {
      this.container.classList.add('active');
      this.container.style.display = 'block';
    }
    this.isVisible = true;
    this.handleResize();
    this.startRenderLoop();
  }

  /**
   * Hide 3D Battle Scene
   */
  hide() {
    this.isVisible = false;
    this.stopRenderLoop();
    if (this.container) {
      this.container.classList.remove('active');
      this.container.style.display = 'none';
    }
  }

  /**
   * Passes characterId directly to the animator.
   * The animator's getSideAndGroup() resolves side (P1/P2) by matching against
   * p1CharacterId / p2CharacterId set via setupCharacters() — so the raw
   * characterId must be forwarded as-is, not converted to modelKey.
   * @param {string} characterId
   * @returns {string} characterId (unchanged)
   */
  _resolveCharacterKey(characterId) {
    return characterId || 'guanYu';
  }

  /**
   * Trigger 3D Attack Animation (e.g. combat3D.playAttack("guanYu", 2))
   * @param {string} attackerName - 'guanYu' | 'luBu'
   * @param {number} attackEnergy - 1, 2, 3, 4+ (defaults to 1)
   */
  playAttack(attackerName = 'guanYu', attackEnergy = 1) {
    this.show();
    const key = this._resolveCharacterKey(attackerName);
    if (this.animator) {
      this.animator.playAttack(key, attackEnergy);
    }
  }

  /**
   * Trigger 3D Special Power Animation (e.g. combat3D.playSpecial("guanYu"))
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  playSpecial(characterName = 'guanYu') {
    this.show();
    const key = this._resolveCharacterKey(characterName);
    if (this.animator) {
      this.animator.playSpecial(key);
    }
  }

  /**
   * Trigger 3D Defend / Block Animation (e.g. combat3D.playDefend("guanYu"))
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  playDefend(characterName = 'guanYu') {
    this.show();
    const key = this._resolveCharacterKey(characterName);
    if (this.animator) {
      this.animator.playDefend(key);
    }
  }

  /**
   * Trigger 3D Block Impact Effect (e.g. combat3D.playBlockImpact("guanYu"))
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  playBlockImpact(characterName = 'guanYu') {
    this.show();
    const key = this._resolveCharacterKey(characterName);
    if (this.animator) {
      this.animator.playBlockImpact(key);
    }
  }

  /**
   * Trigger 3D Damage / Block Feedback Popup (e.g. combat3D.showDamage("luBu", 240))
   * @param {string} characterName - 'guanYu' | 'luBu'
   * @param {number} damage - damage value
   * @param {boolean} isFullBlock - true if attack was 100% blocked
   */
  showDamage(characterName = 'guanYu', damage = 0, isFullBlock = false) {
    this.show();
    const key = this._resolveCharacterKey(characterName);
    if (this.animator) {
      this.animator.showDamage(key, damage, isFullBlock);
    }
  }

  /**
   * Trigger 3D KO / Defeat Animation (e.g. combat3D.playKO("luBu"))
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  playKO(characterName = 'guanYu') {
    this.show();
    const key = this._resolveCharacterKey(characterName);
    if (this.animator) {
      this.animator.playKO(key);
    }
  }

  /**
   * Trigger 3D Victory Presentation (e.g. combat3D.playVictory("guanYu"))
   * @param {string} winnerName - 'guanYu' | 'luBu'
   */
  playVictory(winnerName = 'guanYu') {
    this.show();
    const key = this._resolveCharacterKey(winnerName);
    if (this.animator) {
      this.animator.playVictory(key);
    }
  }

  /**
   * Reset 3D character state & position for a new match
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  resetCharacter(characterName = 'guanYu') {
    const key = this._resolveCharacterKey(characterName);
    if (this.animator) {
      this.animator.resetCharacter(key);
    }
  }

  /**
   * Reset all 3D characters for a new match
   */
  resetAll() {
    if (this.animator) {
      this.animator.resetAll();
    }
  }

  /**
   * Trigger 3D Hit Stop (micro-freeze 3D animation for durationMs)
   * @param {number} durationMs - freeze duration in ms (default 80ms)
   */
  hitStop(durationMs = 80) {
    if (this.animator) {
      this.animator.triggerHitStop(durationMs);
    }
  }

  /**
   * Trigger 3D Hit Flash (white material flash on target character for durationMs)
   * @param {string} characterName - 'guanYu' | 'luBu'
   * @param {number} durationMs - flash duration in ms (default 80ms)
   */
  playHitFlash(characterName = 'guanYu', durationMs = 80) {
    const key = this._resolveCharacterKey(characterName);
    if (this.animator) {
      this.animator.playHitFlash(key, durationMs);
    }
  }
}

// Global Singleton Instance
window.combat3D = new Combat3DController();


