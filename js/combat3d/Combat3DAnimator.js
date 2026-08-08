/**
 * Combat3DAnimator - Lightweight Animation Engine for 3D Battle Scene
 * Handles character attack sequences scaled by Attack Energy (1 to 4+),
 * defensive block stances, shield barriers, block impact flashes, spark particles, dust puffs, energy aura rings,
 * camera shake, hit stop micro-freezes, character hit flashes, 3D damage popups, KO defeat sequences,
 * 3D Victory Presentations, and concurrent multi-track simultaneous combat resolution.
 */
class Combat3DAnimator {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.p1CharacterId = 'guanYu';
    this.p2CharacterId = 'luBu';

    this.activeAnims = {
      p1: null,
      p2: null,
      guanYu: null,
      luBu: null
    };
    this.activeSparks = [];
    this.activeTrail = null;
    this.activeAura = null;
    this.activeShield = null;
    this.activeFlash = null;
    this.activeVictoryText = null;
    this.activeVictorySparkles = [];
    this.hitStopUntil = 0;
    this.states = {
      p1: 'idle',
      p2: 'idle',
      guanYu: 'idle',
      luBu: 'idle'
    };
  }

  setupCharacters(p1CharacterId = 'guanYu', p2CharacterId = 'luBu') {
    this.p1CharacterId = p1CharacterId;
    this.p2CharacterId = p2CharacterId;
    if (!this.states) this.states = {};
    if (!this.activeAnims) this.activeAnims = {};

    this.states.p1 = 'idle';
    this.states.p2 = 'idle';
    this.states.guanYu = 'idle';
    this.states.luBu = 'idle';
    this.states[p1CharacterId] = 'idle';
    this.states[p2CharacterId] = 'idle';

    this.activeAnims.p1 = null;
    this.activeAnims.p2 = null;
    this.activeAnims.guanYu = null;
    this.activeAnims.luBu = null;
    this.activeAnims[p1CharacterId] = null;
    this.activeAnims[p2CharacterId] = null;
  }

  getSideAndGroup(characterName) {
    if (!this.sceneManager) return { isP1: true, key: 'p1', group: null };

    const lowerName = String(characterName || '').toLowerCase();
    const p1Id = this.p1CharacterId || 'guanYu';
    const p2Id = this.p2CharacterId || 'luBu';

    let isP1 = true;
    if (characterName === 'p2' || lowerName === 'p2') {
      isP1 = false;
    } else if (characterName === p2Id || lowerName === String(p2Id).toLowerCase()) {
      isP1 = false;
    } else if (lowerName === 'lubu' && String(p1Id).toLowerCase() !== 'lubu') {
      isP1 = false;
    }

    const key = isP1 ? p1Id : p2Id;
    const group = isP1 ? (this.sceneManager.p1Group || this.sceneManager.guanYuGroup) : (this.sceneManager.p2Group || this.sceneManager.luBuGroup);

    return { isP1, key, group };
  }

  get isAnimating() {
    if (!this.activeAnims) return false;
    return !!(this.activeAnims.p1 || this.activeAnims.p2 || this.activeAnims.guanYu || this.activeAnims.luBu || (this.p1CharacterId && this.activeAnims[this.p1CharacterId]) || (this.p2CharacterId && this.activeAnims[this.p2CharacterId]));
  }

  /**
   * Helper to resolve Attack Energy configuration (Capped at 4)
   * @param {number} rawEnergy 
   */
  getEnergyConfig(rawEnergy) {
    const energy = Math.min(4, Math.max(1, Math.round(rawEnergy || 1)));
    const configs = {
      1: {
        windupOffset: 0.25,
        trailScale: 1.0,
        trailOpacity: 0.75,
        sparkCount: 8,
        cameraShake: 0.06,
        hitStopMs: 60,
        hasDust: false,
        hasAuraRing: false,
        duration: 1250
      },
      2: {
        windupOffset: 0.35,
        trailScale: 1.3,
        trailOpacity: 0.85,
        sparkCount: 14,
        cameraShake: 0.11,
        hitStopMs: 75,
        hasDust: false,
        hasAuraRing: false,
        duration: 1200
      },
      3: {
        windupOffset: 0.45,
        trailScale: 1.6,
        trailOpacity: 0.95,
        sparkCount: 20,
        cameraShake: 0.18,
        hitStopMs: 90,
        hasDust: true,
        hasAuraRing: false,
        duration: 1150
      },
      4: {
        windupOffset: 0.58,
        trailScale: 1.95,
        trailOpacity: 1.0,
        sparkCount: 26,
        cameraShake: 0.24,
        hitStopMs: 100,
        hasDust: true,
        hasAuraRing: true,
        duration: 1100
      }
    };
    return configs[energy];
  }

  /**
   * Triggers Hit Stop (micro-freeze animation progress for durationMs)
   * @param {number} durationMs 
   */
  triggerHitStop(durationMs = 80) {
    this.hitStopUntil = performance.now() + durationMs;
  }

  /**
   * Triggers Hit Flash (white material flash on target character for durationMs)
   * @param {string} characterName - 'guanYu' | 'luBu'
   * @param {number} durationMs - flash duration in ms
   */
  playHitFlash(characterName = 'guanYu', durationMs = 80) {
    if (!this.sceneManager) return;
    const { group } = this.getSideAndGroup(characterName);
    if (!group) return;

    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92
    });

    const meshList = [];
    group.traverse((child) => {
      if (child.isMesh && child.material) {
        meshList.push({ mesh: child, origMat: child.material });
        child.material = flashMat;
      }
    });

    setTimeout(() => {
      for (const item of meshList) {
        if (item.mesh) {
          item.mesh.material = item.origMat;
        }
      }
      flashMat.dispose();
    }, durationMs);
  }

  /**
   * Trigger attack animation sequence for specified character & energy level
   * @param {string} attackerName - 'guanYu' | 'luBu'
   * @param {number} attackEnergy - 1, 2, 3, 4+ (defaults to 1)
   */
  playAttack(attackerName = 'guanYu', attackEnergy = 1) {
    const { isP1, key, group } = this.getSideAndGroup(attackerName);
    if (!group) return;
    if (this.states[key] === 'ko' || this.states[isP1 ? 'p1' : 'p2'] === 'ko') return;
    if (this.activeAnims[key] || this.activeAnims[isP1 ? 'p1' : 'p2']) return;

    const config = this.getEnergyConfig(attackEnergy);

    if (isP1) {
      this.startP1Attack(config, key, group);
    } else {
      this.startP2Attack(config, key, group);
    }
  }

  /**
   * Trigger Character 3D Special Power Animation Sequence
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  playSpecial(characterName = 'guanYu') {
    const { isP1, key } = this.getSideAndGroup(characterName);
    if (this.states[key] === 'ko' || this.states[isP1 ? 'p1' : 'p2'] === 'ko') return;
    if (this.activeAnims[key] || this.activeAnims[isP1 ? 'p1' : 'p2']) return;
    if (!this.sceneManager) return;

    const specialConfig = this.getEnergyConfig(4);
    specialConfig.cameraShake = 0.28;
    specialConfig.hitStopMs = 110;

    if (isP1) {
      this.startP1Attack(specialConfig, key);
    } else {
      this.startP2Attack(specialConfig, key);
    }
  }

  /**
   * Trigger 3D Defend / Block Stance Animation
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  playDefend(characterName = 'guanYu') {
    const { isP1, key, group } = this.getSideAndGroup(characterName);
    if (!group) return;
    if (this.states[key] === 'ko' || this.states[isP1 ? 'p1' : 'p2'] === 'ko') return;
    if (this.activeAnims[key] || this.activeAnims[isP1 ? 'p1' : 'p2']) return;

    const startTime = performance.now();
    const duration = 850; // Block duration in ms

    const startPos = { x: isP1 ? -3.2 : 3.2, y: 0, z: 0 };
    const stepBackOffset = isP1 ? -0.15 : 0.15;
    const startRotY = isP1 ? Math.PI / 2 : -Math.PI / 2;
    const blockRotZ = isP1 ? -0.55 : 0.55;
    const blockRotY = startRotY + (isP1 ? 0.35 : -0.35);

    // Create Energy Shield Barrier
    this.createShieldBarrier(characterName);

    const anim = {
      name: 'defendAnim',
      startTime,
      duration,
      update: (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / duration);

        if (progress < 0.25) {
          const p = progress / 0.25;
          group.position.x = THREE.MathUtils.lerp(startPos.x, startPos.x + stepBackOffset, p);
          group.position.y = THREE.MathUtils.lerp(0, -0.12, p);
          group.rotation.y = THREE.MathUtils.lerp(startRotY, blockRotY, p);
          group.rotation.z = THREE.MathUtils.lerp(0, blockRotZ, p);

          if (this.activeShield) {
            this.activeShield.material.opacity = Math.min(0.85, p * 0.85);
          }
        } else if (progress < 0.70) {
          const p = (progress - 0.25) / 0.45;
          group.position.x = startPos.x + stepBackOffset;
          group.position.y = -0.12 + Math.sin(p * Math.PI * 2) * 0.02;
          group.rotation.y = blockRotY;
          group.rotation.z = blockRotZ;

          if (this.activeShield) {
            const pulse = 0.75 + Math.sin(p * Math.PI * 4) * 0.15;
            this.activeShield.material.opacity = pulse;
          }
        } else {
          const p = (progress - 0.70) / 0.30;
          const easeReturn = 1 - Math.pow(1 - p, 2);
          group.position.x = THREE.MathUtils.lerp(startPos.x + stepBackOffset, startPos.x, easeReturn);
          group.position.y = THREE.MathUtils.lerp(-0.12, 0, easeReturn);
          group.rotation.y = THREE.MathUtils.lerp(blockRotY, startRotY, easeReturn);
          group.rotation.z = THREE.MathUtils.lerp(blockRotZ, 0, easeReturn);

          if (this.activeShield) {
            this.activeShield.material.opacity = (1 - easeReturn) * 0.85;
          }
        }

        this.updateEffects(elapsed);

        if (progress >= 1.0) {
          group.position.set(startPos.x, startPos.y, startPos.z);
          group.rotation.set(0, startRotY, 0);
          this.cleanupEffects();
          this.activeAnims[key] = null;
          this.activeAnims[isP1 ? 'p1' : 'p2'] = null;
        }
      }
    };

    this.activeAnims[key] = anim;
    this.activeAnims[isP1 ? 'p1' : 'p2'] = anim;
  }

  /**
   * Trigger 3D KO / Defeat Animation
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  playKO(characterName = 'guanYu') {
    if (!this.sceneManager) return;
    const { isP1, key, group } = this.getSideAndGroup(characterName);
    if (!group) return;

    if (this.states[key] === 'ko') return;

    this.states[key] = 'ko';
    this.states[isP1 ? 'p1' : 'p2'] = 'ko';

    const startTime = performance.now();
    const duration = 1300;

    const startPos = { x: isP1 ? -3.2 : 3.2, y: group.position.y || 0, z: 0 };
    const startRotY = isP1 ? Math.PI / 2 : -Math.PI / 2;

    const fallOffsetX = isP1 ? -0.35 : 0.35;
    const fallTargetY = -0.38;
    const fallRotZ = isP1 ? -1.15 : 1.15;

    this.playHitFlash(characterName, 90);
    this.triggerCameraShake(0.14);

    const anim = {
      name: 'koAnim',
      startTime,
      duration,
      update: (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / duration);

        if (progress < 0.25) {
          const p = progress / 0.25;
          group.position.x = THREE.MathUtils.lerp(startPos.x, startPos.x + fallOffsetX * 0.5, p);
          group.position.y = THREE.MathUtils.lerp(startPos.y, 0.1, p);
          group.rotation.z = THREE.MathUtils.lerp(0, fallRotZ * 0.25, p);
        } else if (progress < 0.75) {
          const p = (progress - 0.25) / 0.50;
          const easeFall = p * p;
          group.position.x = THREE.MathUtils.lerp(startPos.x + fallOffsetX * 0.5, startPos.x + fallOffsetX, easeFall);
          group.position.y = THREE.MathUtils.lerp(0.1, fallTargetY, easeFall);
          group.rotation.z = THREE.MathUtils.lerp(fallRotZ * 0.25, fallRotZ, easeFall);

          if (p >= 0.4 && !anim.hasSpawnedDust) {
            anim.hasSpawnedDust = true;
            this.createDustPuff({ x: startPos.x + fallOffsetX, y: 0.1, z: 0 });
          }
        } else {
          group.position.x = startPos.x + fallOffsetX;
          group.position.y = fallTargetY;
          group.rotation.z = fallRotZ;
        }

        this.updateEffects(elapsed);

        if (progress >= 1.0) {
          group.position.set(startPos.x + fallOffsetX, fallTargetY, 0);
          group.rotation.set(0, startRotY, fallRotZ);
          this.cleanupEffects();
          this.activeAnims[key] = null;
          this.activeAnims[isP1 ? 'p1' : 'p2'] = null;
        }
      }
    };

    this.activeAnims[key] = anim;
    this.activeAnims[isP1 ? 'p1' : 'p2'] = anim;
  }

  /**
   * Trigger 3D Victory Presentation
   * @param {string} winnerName - 'guanYu' | 'luBu'
   */
  playVictory(winnerName = 'guanYu') {
    if (!this.sceneManager) return;
    const { isP1 } = this.getSideAndGroup(winnerName);
    const winnerX = isP1 ? -3.2 : 3.2;
    const themeColor = isP1 ? 0x2ecc71 : 0xe74c3c;

    if (window.combat3D && window.combat3D.cameraManager) {
      window.combat3D.cameraManager.zoomTo(
        winnerX * 0.6, 2.5, 6.2,
        winnerX, 1.4, 0,
        1800
      );
    }

    this.createVictoryText(winnerName);
    this.createEnergyAuraRing({ x: winnerX, y: 0.05, z: 0 }, themeColor);
    this.createVictorySparkles({ x: winnerX, y: 1.4, z: 0 }, themeColor);
  }

  /**
   * Creates dynamic 3D "VICTORY" Text Sprite above winner
   */
  createVictoryText(winnerName) {
    if (this.activeVictoryText && this.sceneManager && this.sceneManager.scene) {
      this.sceneManager.scene.remove(this.activeVictoryText);
    }

    const { isP1 } = this.getSideAndGroup(winnerName);
    const posX = isP1 ? -3.2 : 3.2;
    const startPosY = 2.4;

    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.font = '900 64px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#000000';
    ctx.fillText('VICTORY', 194, 66);
    ctx.fillText('VICTORY', 190, 62);

    ctx.fillStyle = '#f1c40f';
    ctx.fillText('VICTORY', 192, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthTest: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.4, 1.15, 1);
    sprite.position.set(posX, startPosY, 0.3);

    this.sceneManager.scene.add(sprite);
    this.activeVictoryText = sprite;

    const startTime = performance.now();
    const duration = 2400;

    const animateVictoryText = () => {
      if (!this.activeVictoryText) return;
      const elapsed = performance.now() - startTime;
      const p = Math.min(1.0, elapsed / duration);

      if (p < 0.25) {
        spriteMat.opacity = p / 0.25;
        sprite.scale.set((3.0 + p * 0.4), 1.15, 1);
      } else if (p < 0.80) {
        spriteMat.opacity = 1.0;
        const pulse = Math.sin((p - 0.25) * Math.PI * 4) * 0.08;
        sprite.scale.set(3.4 + pulse, 1.15 + pulse * 0.3, 1);
      } else {
        const fadeP = (p - 0.80) / 0.20;
        spriteMat.opacity = 1 - fadeP;
      }

      if (p < 1.0) {
        requestAnimationFrame(animateVictoryText);
      } else {
        if (this.activeVictoryText) {
          this.sceneManager.scene.remove(this.activeVictoryText);
          texture.dispose();
          spriteMat.dispose();
          this.activeVictoryText = null;
        }
      }
    };

    requestAnimationFrame(animateVictoryText);
  }

  /**
   * Creates ambient floating victory sparkles around winner
   */
  createVictorySparkles(pos, colorHex) {
    const sparkCount = 18;
    const sparkMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < sparkCount; i++) {
      const sparkGeo = new THREE.OctahedronGeometry(0.05 + Math.random() * 0.04, 0);
      const spark = new THREE.Mesh(sparkGeo, sparkMat.clone());
      spark.position.set(
        pos.x + (Math.random() - 0.5) * 1.4,
        pos.y + (Math.random() - 0.5) * 1.2,
        pos.z + (Math.random() - 0.5) * 0.8
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        0.02 + Math.random() * 0.03,
        (Math.random() - 0.5) * 0.02
      );

      this.sceneManager.scene.add(spark);
      this.activeVictorySparkles.push({ mesh: spark, velocity, life: 1.5 });
    }
  }

  /**
   * Resets character 3D state & transforms for fresh match
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  resetCharacter(characterName = 'guanYu') {
    const { isP1, key, group } = this.getSideAndGroup(characterName);
    this.states[key] = 'idle';
    this.states[isP1 ? 'p1' : 'p2'] = 'idle';
    if (this.activeAnims) {
      this.activeAnims[key] = null;
      this.activeAnims[isP1 ? 'p1' : 'p2'] = null;
    }

    if (group) {
      const startPos = isP1 ? -3.2 : 3.2;
      const startRotY = isP1 ? Math.PI / 2 : -Math.PI / 2;
      group.position.set(startPos, 0, 0);
      group.rotation.set(0, startRotY, 0);
    }
    this.cleanupEffects();
  }

  /**
   * Resets both characters & all visual effects for a clean new battle.
   * Called between Story Mode chapters and after any match.
   * Ensures no visual state leaks from Battle A into Battle B.
   */
  resetAll() {
    // Reset both sides by side key (works for any characterId)
    this.resetCharacter('p1');
    this.resetCharacter('p2');

    // Clear ALL activeAnims and states entries (including any character-id keys)
    if (this.activeAnims) {
      Object.keys(this.activeAnims).forEach(k => { this.activeAnims[k] = null; });
    }
    if (this.states) {
      Object.keys(this.states).forEach(k => { this.states[k] = 'idle'; });
    }

    // Force-clear all scene effects (trail, aura, shield, flash, victory text, sparkles, sparks)
    this.cleanupEffects();

    // Reset hit stop timer
    this.hitStopUntil = 0;

    // Reset camera to default position
    if (window.combat3D && window.combat3D.cameraManager) {
      window.combat3D.cameraManager.resetCamera();
    }
  }

  /**
   * Trigger Block Impact Effect (Sparks, Impact Flash, Camera Shake, Hit Stop)
   * @param {string} characterName - 'guanYu' | 'luBu'
   */
  playBlockImpact(characterName = 'guanYu') {
    if (!this.sceneManager) return;
    const { isP1 } = this.getSideAndGroup(characterName);
    const impactPoint = { x: isP1 ? -2.7 : 2.7, y: 1.2, z: 0 };

    const colorHex = isP1 ? 0x2ecc71 : 0xe74c3c;
    this.createBlockFlashRing(impactPoint, colorHex);
    this.createHitSparks(impactPoint, 0xffeaa7, 10);
    this.triggerHitStop(50);
    this.triggerCameraShake(0.08);
  }

  /**
   * Trigger 3D Damage Feedback Popup, Hit Reaction & Hit Flash
   * @param {string} characterName - 'guanYu' | 'luBu'
   * @param {number} damageVal - actual final damage
   * @param {boolean} isFullBlock - true if attack was 100% blocked
   */
  showDamage(characterName = 'guanYu', damageVal = 0, isFullBlock = false) {
    if (!this.sceneManager) return;
    const { isP1, group } = this.getSideAndGroup(characterName);

    if (isFullBlock || damageVal <= 0) {
      this.createDamagePopup(characterName, 'BLOCK', 0xf1c40f, false);
      this.playHitFlash(characterName, 50);
      if (group) this.triggerFlinch(group, isP1 ? -0.15 : 0.15);
      this.triggerHitStop(50);
      this.triggerCameraShake(0.08);
    } else {
      const isLarge = damageVal >= 300;
      const textStr = `-${damageVal}`;
      const textColor = isLarge ? 0xe74c3c : 0xf39c12;
      const shakeIntensity = isLarge ? 0.22 : (damageVal > 150 ? 0.14 : 0.07);
      const hitStopMs = isLarge ? 100 : (damageVal > 150 ? 80 : 60);

      this.createDamagePopup(characterName, textStr, textColor, isLarge);
      this.playHitFlash(characterName, isLarge ? 90 : 70);
      if (group) this.triggerFlinch(group, isP1 ? -0.28 : 0.28);
      this.createHitSparks({ x: isP1 ? -3.2 : 3.2, y: 1.2, z: 0 }, 0xe74c3c, isLarge ? 16 : 8);

      this.triggerHitStop(hitStopMs);
      this.triggerCameraShake(shakeIntensity);
    }
  }

  /**
   * Creates sharp 3D Floating Damage / Block Canvas Sprite
   */
  createDamagePopup(targetKey, text, colorHex = 0xe74c3c, isLarge = false) {
    if (!this.sceneManager || !this.sceneManager.scene) return;

    const { isP1 } = this.getSideAndGroup(targetKey);
    const posX = isP1 ? -3.2 : 3.2;
    const startPosY = 2.1;

    // Create 2D Canvas for crisp text rendering
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const fontSize = isLarge ? 54 : 44;
    ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black Drop Shadow for high readability
    ctx.fillStyle = '#000000';
    ctx.fillText(text, 130, 66);
    ctx.fillText(text, 126, 62);

    // Text Fill Color
    const colorStr = typeof colorHex === 'number' ? `#${colorHex.toString(16).padStart(6, '0')}` : colorHex;
    ctx.fillStyle = colorStr;
    ctx.fillText(text, 128, 64);

    // Build Three.js Texture & Sprite
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1.0,
      depthTest: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    const scaleFactor = isLarge ? 1.45 : 1.1;
    sprite.scale.set(2.2 * scaleFactor, 1.1 * scaleFactor, 1);
    sprite.position.set(posX, startPosY, 0.2);

    this.sceneManager.scene.add(sprite);

    // Floating Animation Loop
    const startTime = performance.now();
    const duration = 900;

    const animatePopup = () => {
      const elapsed = performance.now() - startTime;
      const p = Math.min(1.0, elapsed / duration);

      if (p < 1.0) {
        sprite.position.y = startPosY + p * 0.75;
        sprite.scale.set((2.2 + p * 0.3) * scaleFactor, (1.1 + p * 0.15) * scaleFactor, 1);
        
        if (p > 0.6) {
          const fadeP = (p - 0.6) / 0.4;
          spriteMat.opacity = 1 - fadeP;
        }
        requestAnimationFrame(animatePopup);
      } else {
        this.sceneManager.scene.remove(sprite);
        texture.dispose();
        spriteMat.dispose();
      }
    };

    requestAnimationFrame(animatePopup);
  }

  /**
   * Creates Energy Shield Barrier Mesh (Emerald Green for Guan Yu, Crimson Red for Lu Bu)
   */
  createShieldBarrier(characterName) {
    if (this.activeShield) {
      this.sceneManager.scene.remove(this.activeShield);
    }

    const { isP1 } = this.getSideAndGroup(characterName);
    const shieldColor = isP1 ? 0x2ecc71 : 0xe74c3c;
    const rimColor = isP1 ? 0xd4af37 : 0x900c3f;

    const shieldGroup = new THREE.Group();

    // Outer Ring
    const ringGeo = new THREE.RingGeometry(0.7, 1.25, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: shieldColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    shieldGroup.add(ring);

    // Inner Rim Accent
    const innerRimGeo = new THREE.RingGeometry(1.22, 1.3, 24);
    const innerRimMat = new THREE.MeshBasicMaterial({
      color: rimColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const innerRim = new THREE.Mesh(innerRimGeo, innerRimMat);
    shieldGroup.add(innerRim);

    // Position shield barrier in front of character
    const posX = isP1 ? -2.6 : 2.6;
    shieldGroup.position.set(posX, 1.15, 0.1);
    shieldGroup.rotation.y = isP1 ? Math.PI / 6 : -Math.PI / 6;

    this.sceneManager.scene.add(shieldGroup);
    this.activeShield = shieldGroup;
  }

  /**
   * Creates Expanding Block Flash Ring Mesh
   */
  createBlockFlashRing(impactPoint, colorHex) {
    if (this.activeFlash) {
      this.sceneManager.scene.remove(this.activeFlash);
    }

    const flashGeo = new THREE.RingGeometry(0.3, 0.9, 16);
    const flashMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.activeFlash = new THREE.Mesh(flashGeo, flashMat);
    this.activeFlash.position.set(impactPoint.x, impactPoint.y, impactPoint.z + 0.1);
    this.sceneManager.scene.add(this.activeFlash);
  }

  /**
   * Guan Yu 3D Attack Sequence (Green Dragon Slash)
   * Scaled by Attack Energy Config
   */
  startGuanYuAttack(cfg) {
    this.startP1Attack(cfg, 'guanYu', this.sceneManager ? (this.sceneManager.guanYuGroup || this.sceneManager.p1Group) : null);
  }

  startLuBuAttack(cfg) {
    this.startP2Attack(cfg, 'luBu', this.sceneManager ? (this.sceneManager.luBuGroup || this.sceneManager.p2Group) : null);
  }

  startP1Attack(cfg, key = 'p1', targetGroup = null) {
    const group = targetGroup || (this.sceneManager ? (this.sceneManager.p1Group || this.sceneManager.guanYuGroup) : null);
    if (!group) return;

    const startTime = performance.now();
    const duration = cfg.duration;
    const startPos = { x: -3.2, y: 0, z: 0 };
    const targetPos = { x: 1.2, y: 0, z: 0 };
    const startRotY = Math.PI / 2;

    const anim = {
      name: 'p1Attack',
      startTime,
      duration,
      update: (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / duration);

        if (progress < 0.18) {
          const p = progress / 0.18;
          group.position.x = THREE.MathUtils.lerp(startPos.x, startPos.x - cfg.windupOffset, p);
          group.rotation.y = startRotY - 0.25 * p;
          group.rotation.z = -0.15 * p;
        } else if (progress < 0.40) {
          const p = (progress - 0.18) / 0.22;
          const easeDash = p * p * (3 - 2 * p);
          group.position.x = THREE.MathUtils.lerp(startPos.x - cfg.windupOffset, targetPos.x, easeDash);
          group.rotation.y = startRotY;
          group.rotation.z = 0.1;
        } else if (progress < 0.62) {
          const p = (progress - 0.40) / 0.22;
          group.position.x = targetPos.x + Math.sin(p * Math.PI) * 0.15;
          group.rotation.y = startRotY + Math.sin(p * Math.PI) * 0.4;
          group.rotation.z = 0.1 - Math.sin(p * Math.PI) * 0.45;

          if (p >= 0.15 && !anim.hasTriggeredImpact) {
            anim.hasTriggeredImpact = true;
            this.createSlashTrail(targetPos, 0x2ecc71, 1.0, cfg.trailScale, cfg.trailOpacity);
            if (cfg.hasDust) this.createDustPuff({ x: 2.0, y: 0.1, z: 0 });
            if (cfg.hasAuraRing) this.createEnergyAuraRing({ x: 2.2, y: 1.2, z: 0 }, 0x2ecc71);
            this.triggerHitStop(cfg.hitStopMs);
            if (cfg.cameraShake > 0) this.triggerCameraShake(cfg.cameraShake);
          }
        } else {
          const p = (progress - 0.62) / 0.38;
          const easeReturn = 1 - Math.pow(1 - p, 2);
          group.position.x = THREE.MathUtils.lerp(targetPos.x, startPos.x, easeReturn);
          group.position.y = 0;
          group.rotation.y = THREE.MathUtils.lerp(startRotY + 0.4, startRotY, easeReturn);
          group.rotation.z = THREE.MathUtils.lerp(-0.35, 0, easeReturn);
        }

        this.updateEffects(elapsed);

        if (progress >= 1.0) {
          group.position.set(startPos.x, startPos.y, startPos.z);
          group.rotation.set(0, startRotY, 0);
          this.cleanupEffects();
          this.activeAnims[key] = null;
          this.activeAnims.p1 = null;
          if (key === 'guanYu') this.activeAnims.guanYu = null;
        }
      }
    };

    this.activeAnims[key] = anim;
    this.activeAnims.p1 = anim;
    if (key === 'guanYu') this.activeAnims.guanYu = anim;
  }

  startP2Attack(cfg, key = 'p2', targetGroup = null) {
    const group = targetGroup || (this.sceneManager ? (this.sceneManager.p2Group || this.sceneManager.luBuGroup) : null);
    if (!group) return;

    const startTime = performance.now();
    const duration = cfg.duration + 100;
    const startPos = { x: 3.2, y: 0, z: 0 };
    const targetPos = { x: -1.2, y: 0, z: 0 };
    const startRotY = -Math.PI / 2;

    const anim = {
      name: 'p2Attack',
      startTime,
      duration,
      update: (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / duration);

        if (progress < 0.18) {
          const p = progress / 0.18;
          group.position.x = THREE.MathUtils.lerp(startPos.x, startPos.x + cfg.windupOffset, p);
          group.rotation.y = startRotY + 0.25 * p;
          group.rotation.z = 0.15 * p;
        } else if (progress < 0.40) {
          const p = (progress - 0.18) / 0.22;
          const easeDash = p * p * (3 - 2 * p);
          group.position.x = THREE.MathUtils.lerp(startPos.x + cfg.windupOffset, targetPos.x, easeDash);
          group.rotation.y = startRotY;
          group.rotation.z = -0.1;
        } else if (progress < 0.62) {
          const p = (progress - 0.40) / 0.22;
          group.position.x = targetPos.x - Math.sin(p * Math.PI) * 0.15;
          group.rotation.y = startRotY - Math.sin(p * Math.PI) * 0.4;
          group.rotation.z = -0.1 + Math.sin(p * Math.PI) * 0.45;

          if (p >= 0.15 && !anim.hasTriggeredImpact) {
            anim.hasTriggeredImpact = true;
            this.createSlashTrail(targetPos, 0xe74c3c, 1.0, cfg.trailScale, cfg.trailOpacity);
            if (cfg.hasDust) this.createDustPuff({ x: -2.0, y: 0.1, z: 0 });
            if (cfg.hasAuraRing) this.createEnergyAuraRing({ x: -2.2, y: 1.2, z: 0 }, 0xe74c3c);
            this.triggerHitStop(cfg.hitStopMs);
            if (cfg.cameraShake > 0) this.triggerCameraShake(cfg.cameraShake);
          }
        } else {
          const p = (progress - 0.62) / 0.38;
          const easeReturn = 1 - Math.pow(1 - p, 2);
          group.position.x = THREE.MathUtils.lerp(targetPos.x, startPos.x, easeReturn);
          group.position.y = 0;
          group.rotation.y = THREE.MathUtils.lerp(startRotY - 0.4, startRotY, easeReturn);
          group.rotation.z = THREE.MathUtils.lerp(0.35, 0, easeReturn);
        }

        this.updateEffects(elapsed);

        if (progress >= 1.0) {
          group.position.set(startPos.x, startPos.y, startPos.z);
          group.rotation.set(0, startRotY, 0);
          this.cleanupEffects();
          this.activeAnims[key] = null;
          this.activeAnims.p2 = null;
          if (key === 'luBu') this.activeAnims.luBu = null;
        }
      }
    };

    this.activeAnims[key] = anim;
    this.activeAnims.p2 = anim;
    if (key === 'luBu') this.activeAnims.luBu = anim;
  }

  createSlashTrail(pos, colorHex = 0x2ecc71, offsetXMultiplier = 1.0, scaleMultiplier = 1.0, opacityVal = 0.85) {
    if (this.activeTrail) {
      this.sceneManager.scene.remove(this.activeTrail);
    }

    const trailGeo = new THREE.RingGeometry(0.85 * scaleMultiplier, 1.5 * scaleMultiplier, 16, 1, 0, Math.PI * 0.85);
    const trailMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacityVal,
      blending: THREE.AdditiveBlending
    });
    this.activeTrail = new THREE.Mesh(trailGeo, trailMat);
    const offsetDir = offsetXMultiplier > 0 ? 0.5 : -0.5;
    this.activeTrail.position.set(pos.x + offsetDir, 1.3, pos.z + 0.1);
    this.activeTrail.rotation.x = Math.PI / 4;
    this.activeTrail.rotation.y = offsetXMultiplier > 0 ? Math.PI / 3 : -Math.PI / 3;
    this.sceneManager.scene.add(this.activeTrail);
  }

  createHitSparks(impactPoint, colorHex = 0xf39c12, sparkCount = 12) {
    const sparkMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < sparkCount; i++) {
      const sparkGeo = new THREE.OctahedronGeometry(0.06 + Math.random() * 0.05, 0);
      const spark = new THREE.Mesh(sparkGeo, sparkMat.clone());
      spark.position.set(
        impactPoint.x + (Math.random() - 0.5) * 0.35,
        impactPoint.y + (Math.random() - 0.5) * 0.45,
        impactPoint.z + (Math.random() - 0.5) * 0.35
      );
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.18,
        (Math.random() - 0.1) * 0.18,
        (Math.random() - 0.5) * 0.18
      );

      this.sceneManager.scene.add(spark);
      this.activeSparks.push({ mesh: spark, velocity, life: 1.0 });
    }
  }

  createDustPuff(pos) {
    const dustCount = 10;
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0x785a3c,
      transparent: true,
      opacity: 0.65
    });

    for (let i = 0; i < dustCount; i++) {
      const dustGeo = new THREE.DodecahedronGeometry(0.14 + Math.random() * 0.08, 0);
      const dust = new THREE.Mesh(dustGeo, dustMat.clone());
      dust.position.set(
        pos.x + (Math.random() - 0.5) * 0.4,
        pos.y + Math.random() * 0.1,
        pos.z + (Math.random() - 0.5) * 0.4
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.09,
        0.04 + Math.random() * 0.05,
        (Math.random() - 0.5) * 0.09
      );

      this.sceneManager.scene.add(dust);
      this.activeSparks.push({ mesh: dust, velocity, life: 0.85, isDust: true });
    }
  }

  createEnergyAuraRing(impactPoint, colorHex) {
    if (this.activeAura) {
      this.sceneManager.scene.remove(this.activeAura);
    }

    const auraGeo = new THREE.TorusGeometry(0.4, 0.1, 8, 24);
    const auraMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.activeAura = new THREE.Mesh(auraGeo, auraMat);
    this.activeAura.position.set(impactPoint.x, impactPoint.y, impactPoint.z);
    this.activeAura.rotation.x = Math.PI / 2;
    this.sceneManager.scene.add(this.activeAura);
  }

  triggerFlinch(targetGroup, direction = -0.22) {
    if (!targetGroup) return;
    const origRotZ = targetGroup.rotation.z || 0;
    const origRotY = targetGroup.rotation.y || (direction > 0 ? Math.PI / 2 : -Math.PI / 2);

    const flinchStart = performance.now();
    const flinchDuration = 250;

    requestAnimationFrame(function animateFlinch() {
      const p = (performance.now() - flinchStart) / flinchDuration;
      if (p < 1.0) {
        targetGroup.rotation.z = Math.sin(p * Math.PI) * direction;
        targetGroup.rotation.y = origRotY + Math.sin(p * Math.PI) * (direction > 0 ? -0.15 : 0.15);
        requestAnimationFrame(animateFlinch);
      } else {
        targetGroup.rotation.z = origRotZ;
        targetGroup.rotation.y = origRotY;
      }
    });
  }

  triggerCameraShake(intensity = 0.14) {
    if (!window.combat3D || !window.combat3D.cameraManager) return;
    const camera = window.combat3D.cameraManager.getCamera();
    if (!camera) return;

    const basePos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const shakeStart = performance.now();
    const shakeDuration = 200;

    requestAnimationFrame(function animateShake() {
      const p = (performance.now() - shakeStart) / shakeDuration;
      if (p < 1.0) {
        const curIntensity = (1 - p) * intensity;
        camera.position.x = basePos.x + (Math.random() - 0.5) * curIntensity;
        camera.position.y = basePos.y + (Math.random() - 0.5) * curIntensity;
        requestAnimationFrame(animateShake);
      } else {
        camera.position.set(basePos.x, basePos.y, basePos.z);
      }
    });
  }

  updateEffects(elapsed) {
    // Update Slash Trail Opacity & Fade
    if (this.activeTrail) {
      this.activeTrail.material.opacity *= 0.88;
      this.activeTrail.scale.multiplyScalar(1.03);
      if (this.activeTrail.material.opacity < 0.05) {
        this.sceneManager.scene.remove(this.activeTrail);
        this.activeTrail = null;
      }
    }

    // Update Extra Energy Aura Ring
    if (this.activeAura) {
      this.activeAura.scale.multiplyScalar(1.12);
      this.activeAura.material.opacity *= 0.82;
      if (this.activeAura.material.opacity < 0.05) {
        this.sceneManager.scene.remove(this.activeAura);
        this.activeAura = null;
      }
    }

    // Update Block Flash Ring
    if (this.activeFlash) {
      this.activeFlash.scale.multiplyScalar(1.18);
      this.activeFlash.material.opacity *= 0.78;
      if (this.activeFlash.material.opacity < 0.05) {
        this.sceneManager.scene.remove(this.activeFlash);
        this.activeFlash = null;
      }
    }

    // Update Victory Sparkles
    for (let i = this.activeVictorySparkles.length - 1; i >= 0; i--) {
      const v = this.activeVictorySparkles[i];
      v.mesh.position.add(v.velocity);
      v.life -= 0.015;
      v.mesh.material.opacity = Math.max(0, v.life * 0.9);
      if (v.life <= 0) {
        this.sceneManager.scene.remove(v.mesh);
        this.activeVictorySparkles.splice(i, 1);
      }
    }

    // Update Spark & Dust Particles
    for (let i = this.activeSparks.length - 1; i >= 0; i--) {
      const s = this.activeSparks[i];
      s.mesh.position.add(s.velocity);
      s.life -= s.isDust ? 0.04 : 0.06;
      s.mesh.material.opacity = Math.max(0, s.life * (s.isDust ? 0.65 : 1.0));
      s.mesh.scale.multiplyScalar(s.isDust ? 1.02 : 0.94);

      if (s.life <= 0) {
        this.sceneManager.scene.remove(s.mesh);
        this.activeSparks.splice(i, 1);
      }
    }
  }

  cleanupEffects() {
    if (this.activeTrail) {
      this.sceneManager.scene.remove(this.activeTrail);
      this.activeTrail = null;
    }
    if (this.activeAura) {
      this.sceneManager.scene.remove(this.activeAura);
      this.activeAura = null;
    }
    if (this.activeShield) {
      this.sceneManager.scene.remove(this.activeShield);
      this.activeShield = null;
    }
    if (this.activeFlash) {
      this.sceneManager.scene.remove(this.activeFlash);
      this.activeFlash = null;
    }
    if (this.activeVictoryText) {
      this.sceneManager.scene.remove(this.activeVictoryText);
      this.activeVictoryText = null;
    }
    for (const v of this.activeVictorySparkles) {
      this.sceneManager.scene.remove(v.mesh);
    }
    this.activeVictorySparkles = [];
    for (const s of this.activeSparks) {
      this.sceneManager.scene.remove(s.mesh);
    }
    this.activeSparks = [];
  }

  update() {
    const now = performance.now();
    // Hit Stop micro-freeze check: skip keyframe update if inside hit stop window
    if (now < this.hitStopUntil) {
      return;
    }

    // Drive animations via P1/P2 side keys — these are always set by playAttack/playDefend/etc.
    // regardless of which character is assigned to each side.
    if (this.activeAnims.p1) {
      this.activeAnims.p1.update(now);
    }
    if (this.activeAnims.p2) {
      this.activeAnims.p2.update(now);
    }

    // Backwards-compatible: also tick legacy guanYu/luBu keys if they exist and
    // are not already covered by p1/p2 (avoids double-ticking the same animation object).
    if (this.activeAnims.guanYu && this.activeAnims.guanYu !== this.activeAnims.p1 && this.activeAnims.guanYu !== this.activeAnims.p2) {
      this.activeAnims.guanYu.update(now);
    }
    if (this.activeAnims.luBu && this.activeAnims.luBu !== this.activeAnims.p1 && this.activeAnims.luBu !== this.activeAnims.p2) {
      this.activeAnims.luBu.update(now);
    }
  }
}

window.Combat3DAnimator = Combat3DAnimator;
