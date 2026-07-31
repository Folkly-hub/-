/**
 * Main Game Controller & Story Orchestrator (Thai Localized)
 * Includes Modular Ally Assist System (Brotherhood Rescue System)
 */

class GameController {
  constructor() {
    this.p1 = new Character('p1', 'โจโฉ', 1000, 100, 'caocao');
    this.p2 = new Character('p2', 'โจรผ้าเหลือง', 500, 50, 'yellowturban');

    this.roundNumber = 1;
    this.mode = 'story_ch1'; // 'story_ch1', 'story_ch2', 'story_ch3', 'story_ch4', 'story_ch5', 'ai', 'passplay'
    this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
    this.activePlayerId = 'p1';

    // Save States & Unlocks
    const savedGold = localStorage.getItem('3k_player_gold');
    this.playerGold = savedGold ? parseInt(savedGold, 10) : 500;

    this.isCh2Unlocked = localStorage.getItem('3k_ch2_unlocked') === '1';
    this.isCh3Unlocked = localStorage.getItem('3k_ch3_unlocked') === '1';
    this.isCh4Unlocked = localStorage.getItem('3k_ch4_unlocked') === '1';
    this.isCh5Unlocked = localStorage.getItem('3k_ch5_unlocked') === '1';
    this.isCh6Unlocked = localStorage.getItem('3k_ch6_unlocked') === '1';

    this.isXiahouDunUnlocked = localStorage.getItem('3k_unlocked_xiahou_dun') === '1';
    this.isLiuBeiUnlocked = localStorage.getItem('3k_unlocked_liubei') === '1';
    this.isGuanYuUnlocked = localStorage.getItem('3k_unlocked_guanyu') === '1';
    this.isZhangFeiUnlocked = localStorage.getItem('3k_unlocked_zhangfei') === '1';

    // Brotherhood Rescue System Trackers
    this.hasTriggeredGuanYuAssist = false;
    this.hasTriggeredZhangFeiAssist = false;

    this.p1Allocation = null;
    this.p2Allocation = null;

    this.isResolving = false;

    this.story = new StoryManager(this);
    this.ui = new UIManager(this);

    this.ui.updateGoldDisplay(this.playerGold);
    this.ui.updateChapterUnlockButtons();
    this.startNewGame();
  }

  addGold(amount) {
    this.playerGold += amount;
    localStorage.setItem('3k_player_gold', this.playerGold);
    this.ui.updateGoldDisplay(this.playerGold);
  }

  unlockChapter2() {
    this.isCh2Unlocked = true;
    localStorage.setItem('3k_ch2_unlocked', '1');
    this.ui.updateChapterUnlockButtons();
  }

  unlockChapter3() {
    this.isCh3Unlocked = true;
    localStorage.setItem('3k_ch3_unlocked', '1');
    this.ui.updateChapterUnlockButtons();
  }

  unlockChapter4() {
    this.isCh4Unlocked = true;
    localStorage.setItem('3k_ch4_unlocked', '1');
    this.ui.updateChapterUnlockButtons();
  }

  unlockChapter5() {
    this.isCh5Unlocked = true;
    localStorage.setItem('3k_ch5_unlocked', '1');
    this.ui.updateChapterUnlockButtons();
  }

  unlockChapter6() {
    this.isCh6Unlocked = true;
    localStorage.setItem('3k_ch6_unlocked', '1');
  }

  unlockXiahouDunCharacter() {
    this.isXiahouDunUnlocked = true;
    localStorage.setItem('3k_unlocked_xiahou_dun', '1');
  }

  unlockLiuBeiCharacter() {
    this.isLiuBeiUnlocked = true;
    localStorage.setItem('3k_unlocked_liubei', '1');
  }

  unlockGuanYuCharacter() {
    this.isGuanYuUnlocked = true;
    localStorage.setItem('3k_unlocked_guanyu', '1');
  }

  unlockZhangFeiCharacter() {
    this.isZhangFeiUnlocked = true;
    localStorage.setItem('3k_unlocked_zhangfei', '1');
  }

  startMode(newMode) {
    this.mode = newMode;
    this.startNewGame();
  }

  startNextChapter() {
    if (this.mode === 'story_ch1' && this.isCh2Unlocked) {
      this.startMode('story_ch2');
    } else if (this.mode === 'story_ch2' && this.isCh3Unlocked) {
      this.startMode('story_ch3');
    } else if (this.mode === 'story_ch3' && this.isCh4Unlocked) {
      this.startMode('story_ch4');
    } else if (this.mode === 'story_ch4' && this.isCh5Unlocked) {
      this.startMode('story_ch5');
    } else if (this.mode === 'story_ch5' && this.isCh6Unlocked) {
      this.startMode('story_ch6');
    } else {
      this.ui.openMainMenu();
    }
  }

  startNewGame() {
    this.roundNumber = 1;
    this.isResolving = false;
    this.activePlayerId = 'p1';
    this.hasTriggeredGuanYuAssist = false;
    this.hasTriggeredZhangFeiAssist = false;

    this.p1Allocation = null;
    this.p2Allocation = null;

    if (this.story) {
      this.story.resetTriggers();
    }

    if (this.mode === 'story_ch1') {
      // Chapter 1 Setup (Cao Cao vs Yellow Turban)
      this.p1 = new Character('p1', 'โจโฉ', 1000, 100, 'caocao');
      this.p2 = new Character('p2', 'โจรผ้าเหลือง', 500, 50, 'yellowturban');
    } else if (this.mode === 'story_ch2') {
      // Chapter 2 Setup (Cao Cao vs Bandit Leader)
      this.p1 = new Character('p1', 'โจโฉ', 1000, 100, 'caocao');
      this.p2 = new Character('p2', 'หัวหน้าโจร', 900, 90, 'bandit_leader');
    } else if (this.mode === 'story_ch3') {
      // Chapter 3 Setup (Xiahou Dun vs Mountain Bandit Leader)
      this.p1 = new Character('p1', 'แฮหัวตุ้น', 1500, 120, 'xiahou_dun');
      this.p2 = new Character('p2', 'หัวหน้าโจรภูเขา', 1200, 110, 'mountain_bandit_leader');
    } else if (this.mode === 'story_ch4') {
      // Chapter 4 Setup (Liu Bei HP 1100, ATK 90 vs Yellow Turban Commander HP 1500, ATK 120)
      this.p1 = new Character('p1', 'เล่าปี่', 1100, 90, 'liubei');
      this.p2 = new Character('p2', 'ผู้บัญชาการโจรผ้าเหลือง', 1500, 120, 'yellowturban_commander');
    } else if (this.mode === 'story_ch5') {
      // Chapter 5 Setup (Liu Bei HP 1100, ATK 90 vs Bandit Commander HP 1800, ATK 140)
      this.p1 = new Character('p1', 'เล่าปี่', 1100, 90, 'liubei');
      this.p2 = new Character('p2', 'ผู้บัญชาการกลุ่มโจร', 1800, 140, 'bandit_commander');
    } else {
      // Custom Practice Battle Setup (Guan Yu vs Lu Bu)
      this.p1 = new Character('p1', 'กวนอู', 1000, 120, 'guanyu');
      this.p2 = new Character('p2', 'ลิโป้', 1000, 120, 'lubu');
    }

    this.p1.reset();
    this.p2.reset();

    // Round 1 Energy Gain (+1)
    this.p1.startNewRound(this.roundNumber);
    this.p2.startNewRound(this.roundNumber);

    this.ui.resetDraftAllocation();
    this.ui.updateCharacterCards(this.p1, this.p2);
    this.ui.updateHeader(this.roundNumber, this.mode, this.aiDifficulty);
    this.ui.setTurnHighlight('p1');

    // Handle Story Cutscenes & Guidance
    if (this.mode === 'story_ch1') {
      this.story.startChapter1Opening(() => {
        this.updateTutorialGuidance();
      });
    } else if (this.mode === 'story_ch2') {
      this.story.startChapter2Opening(() => {
        this.updateTutorialGuidance();
      });
    } else if (this.mode === 'story_ch3') {
      this.story.startChapter3Opening(() => {
        this.updateTutorialGuidance();
      });
    } else if (this.mode === 'story_ch4') {
      this.story.startChapter4Opening(() => {
        this.updateTutorialGuidance();
      });
    } else if (this.mode === 'story_ch5') {
      this.story.startChapter5Opening(() => {
        this.updateTutorialGuidance();
      });
    } else {
      this.ui.updateTutorialBanner(null);
    }
  }

  resetMatch() {
    this.startNewGame();
  }

  toggleMode() {
    if (this.mode === 'story_ch1') {
      if (this.isCh2Unlocked) this.mode = 'story_ch2';
      else this.mode = 'ai';
    } else if (this.mode === 'story_ch2') {
      if (this.isCh3Unlocked) this.mode = 'story_ch3';
      else this.mode = 'ai';
    } else if (this.mode === 'story_ch3') {
      if (this.isCh4Unlocked) this.mode = 'story_ch4';
      else this.mode = 'ai';
    } else if (this.mode === 'story_ch4') {
      if (this.isCh5Unlocked) this.mode = 'story_ch5';
      else this.mode = 'ai';
    } else if (this.mode === 'story_ch5') {
      this.mode = 'ai';
    } else if (this.mode === 'ai') {
      this.mode = 'passplay';
    } else {
      this.mode = 'story_ch1';
    }
    this.startNewGame();
  }

  getActivePlayer() {
    return this.activePlayerId === 'p1' ? this.p1 : this.p2;
  }

  updateTutorialGuidance() {
    if (this.mode.startsWith('story_')) {
      const guide = this.story.getTutorialStepGuide(this.mode, this.roundNumber);
      this.ui.updateTutorialBanner(guide);
    } else {
      this.ui.updateTutorialBanner(null);
    }
  }

  confirmCurrentPlayerTurn(allocation) {
    if (this.isResolving) return;

    if (this.mode === 'story_ch1') {
      // Story Chapter 1 AI Pattern
      this.p1Allocation = allocation;

      if (this.roundNumber === 1) {
        this.p2Allocation = { attack: 1, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 2) {
        this.p2Allocation = { attack: 2, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 3) {
        this.p2Allocation = { attack: 2, defend: 0, charge: 1, unused: 0 };
      } else {
        this.p2Allocation = AIEngine.chooseAllocation(this.aiDifficulty, this.p2, this.p1);
      }

      this.executeRoundResolution();
    } else if (this.mode === 'story_ch2') {
      // Story Chapter 2 AI Pattern
      this.p1Allocation = allocation;

      if (this.roundNumber === 1) {
        this.p2Allocation = { attack: 1, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 2) {
        this.p2Allocation = { attack: 0, defend: 0, charge: 2, unused: 0 };
      } else if (this.roundNumber === 3) {
        this.p2Allocation = { attack: 5, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 4) {
        this.p2Allocation = { attack: 2, defend: 2, charge: 0, unused: 0 };
      } else {
        this.p2Allocation = AIEngine.chooseAllocation(this.aiDifficulty, this.p2, this.p1);
      }

      this.executeRoundResolution();
    } else if (this.mode === 'story_ch3') {
      // Story Chapter 3 AI Pattern
      this.p1Allocation = allocation;

      if (this.roundNumber === 1) {
        this.p2Allocation = { attack: 1, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 2) {
        this.p2Allocation = { attack: 0, defend: 0, charge: 2, unused: 0 };
      } else if (this.roundNumber === 3) {
        this.p2Allocation = { attack: 5, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 4) {
        this.p2Allocation = { attack: 2, defend: 2, charge: 0, unused: 0 };
      } else {
        this.p2Allocation = AIEngine.chooseAllocation(this.aiDifficulty, this.p2, this.p1);
      }

      this.executeRoundResolution();
    } else if (this.mode === 'story_ch4') {
      // Story Chapter 4 AI Pattern (Yellow Turban Commander)
      this.p1Allocation = allocation;

      if (this.roundNumber === 1) {
        this.p2Allocation = { attack: 1, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 2) {
        this.p2Allocation = { attack: 0, defend: 0, charge: 2, unused: 0 };
      } else if (this.roundNumber === 3) {
        this.p2Allocation = { attack: 5, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 4) {
        this.p2Allocation = { attack: 2, defend: 2, charge: 0, unused: 0 };
      } else {
        this.p2Allocation = AIEngine.chooseAllocation(this.aiDifficulty, this.p2, this.p1);
      }

      this.executeRoundResolution();
    } else if (this.mode === 'story_ch5') {
      // Story Chapter 5 AI Pattern (Bandit Commander)
      this.p1Allocation = allocation;

      if (this.roundNumber === 1) {
        this.p2Allocation = { attack: 1, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 2) {
        this.p2Allocation = { attack: 0, defend: 0, charge: 2, unused: 0 };
      } else if (this.roundNumber === 3) {
        this.p2Allocation = { attack: 6, defend: 0, charge: 0, unused: 0 };
      } else if (this.roundNumber === 4) {
        this.p2Allocation = { attack: 2, defend: 2, charge: 0, unused: 0 };
      } else {
        this.p2Allocation = AIEngine.chooseAllocation(this.aiDifficulty, this.p2, this.p1);
      }

      this.executeRoundResolution();
    } else if (this.mode === 'ai') {
      // Practice Mode vs AI
      this.p1Allocation = allocation;
      this.p2Allocation = AIEngine.chooseAllocation(this.aiDifficulty, this.p2, this.p1);

      this.executeRoundResolution();
    } else {
      // Pass & Play Mode (2 Players)
      if (this.activePlayerId === 'p1') {
        this.p1Allocation = allocation;
        this.activePlayerId = 'p2';
        this.ui.resetDraftAllocation();
        this.ui.setTurnHighlight('p2');
        this.ui.showPassPlayModal(this.p2.name);
      } else {
        this.p2Allocation = allocation;
        this.executeRoundResolution();
      }
    }
  }

  async executeRoundResolution() {
    this.isResolving = true;

    // 1. Resolve standard turn mathematics
    const res = BattleSystem.resolveRound(this.p1, this.p1Allocation, this.p2, this.p2Allocation);

    // 2. Combat Animations & Floating Numbers
    if (res.p1Result.attackEnergy > 0) {
      if (res.p1Result.blockedEnergy > 0) {
        AnimationManager.showFloatingText('p2-card', `กันดาเมจ (${res.p1Result.blockedEnergy})`, 'blocked');
      }
      if (res.p1Result.damageDealt > 0) {
        AnimationManager.showFloatingText('p2-card', `-${res.p1Result.damageDealt}`, 'damage');
        AnimationManager.shakeCard('p2-card');
      }
    }

    if (res.p2Result.attackEnergy > 0) {
      if (res.p2Result.blockedEnergy > 0) {
        AnimationManager.showFloatingText('p1-card', `กันดาเมจ (${res.p2Result.blockedEnergy})`, 'blocked');
      }
      if (res.p2Result.damageDealt > 0) {
        AnimationManager.showFloatingText('p1-card', `-${res.p2Result.damageDealt}`, 'damage');
        AnimationManager.shakeCard('p1-card');
      }
    }

    if (res.p1Result.shieldCreated > 0) {
      AnimationManager.showFloatingText('p1-card', `+${res.p1Result.shieldCreated} เกราะ`, 'shield');
    }
    if (res.p1Result.chargeSpent > 0) {
      AnimationManager.showFloatingText('p1-card', `+${res.p1Result.chargeSpent} ชาร์จ`, 'charge');
    }

    if (res.p2Result.shieldCreated > 0) {
      AnimationManager.showFloatingText('p2-card', `+${res.p2Result.shieldCreated} เกราะ`, 'shield');
    }
    if (res.p2Result.chargeSpent > 0) {
      AnimationManager.showFloatingText('p2-card', `+${res.p2Result.chargeSpent} ชาร์จ`, 'charge');
    }

    // Update HP UI smoothly
    this.ui.updateCharacterCards(this.p1, this.p2);

    await new Promise(resolve => setTimeout(resolve, 1200));

    // 3. Modular Ally Assist Check (Brotherhood Rescue System)
    await this.checkAllyAssistTriggers();

    // 4. Check Mid-battle Dialogue Triggers
    if (this.mode === 'story_ch1' && !this.p2.isDefeated()) {
      const enemyHpPct = this.p2.hp / this.p2.maxHp;
      this.story.checkMidBattleTriggersCh1(enemyHpPct);
    } else if (this.mode === 'story_ch2' && !this.p2.isDefeated()) {
      const enemyHpPct = this.p2.hp / this.p2.maxHp;
      this.story.checkMidBattleTriggersCh2(enemyHpPct);
    } else if (this.mode === 'story_ch3' && !this.p2.isDefeated()) {
      const enemyHpPct = this.p2.hp / this.p2.maxHp;
      this.story.checkMidBattleTriggersCh3(enemyHpPct);
    } else if (this.mode === 'story_ch4' && !this.p2.isDefeated()) {
      const enemyHpPct = this.p2.hp / this.p2.maxHp;
      this.story.checkMidBattleTriggersCh4(enemyHpPct);
    } else if (this.mode === 'story_ch5' && !this.p2.isDefeated()) {
      const enemyHpPct = this.p2.hp / this.p2.maxHp;
      this.story.checkMidBattleTriggersCh5(enemyHpPct);
    }

    // 5. Check Victory Conditions
    const p1Defeated = this.p1.isDefeated();
    const p2Defeated = this.p2.isDefeated();

    if (p1Defeated && p2Defeated) {
      if (res.p1Result.damageDealt > res.p2Result.damageDealt) {
        this.handleMatchVictory(this.p1.name, `ล้มลงทั้งคู่ แต่${this.p1.name}โจมตีได้รุนแรงกว่า! (${res.p1Result.damageDealt} vs ${res.p2Result.damageDealt} ดาเมจ)`);
      } else if (res.p2Result.damageDealt > res.p1Result.damageDealt) {
        this.handleMatchVictory(this.p2.name, `ล้มลงทั้งคู่ แต่${this.p2.name}โจมตีได้รุนแรงกว่า! (${res.p2Result.damageDealt} vs ${res.p1Result.damageDealt} ดาเมจ)`);
      } else {
        this.ui.showVictoryModal('เสมอ!', `ขุนศึกทั้งสองล้มลงพร้อมกันด้วยความรุนแรงเท่ากัน! (${res.p1Result.damageDealt} ดาเมจ)`, 0);
      }
      return;
    } else if (p2Defeated) {
      this.handleMatchVictory(this.p1.name, 'ศัตรูถูกปราบปรามราบพนาสูญ!');
      return;
    } else if (p1Defeated) {
      this.ui.showVictoryModal(`${this.p2.name} เป็นฝ่ายชนะ!`, 'พ่ายแพ้ในการรบ! กรุณาลองใหม่อีกครั้ง', 0);
      return;
    }

    // Advance to Next Round
    this.roundNumber++;
    this.p1.startNewRound(this.roundNumber);
    this.p2.startNewRound(this.roundNumber);

    this.activePlayerId = 'p1';
    this.isResolving = false;
    this.p1Allocation = null;
    this.p2Allocation = null;

    this.ui.resetDraftAllocation();
    this.ui.updateCharacterCards(this.p1, this.p2);
    this.ui.updateHeader(this.roundNumber, this.mode, this.aiDifficulty);
    this.ui.setTurnHighlight('p1');

    this.updateTutorialGuidance();
  }

  /**
   * Modular Ally Assist System Trigger Handler
   * Allows specific story chapters to trigger special rescue events.
   */
  async checkAllyAssistTriggers() {
    if (this.mode === 'story_ch4' && !this.hasTriggeredGuanYuAssist && this.p1.hp < 300 && this.p1.hp > 0) {
      this.hasTriggeredGuanYuAssist = true;

      // 1. Trigger Guan Yu Rescue Cutscene
      await new Promise(resolve => {
        this.story.startGuanYuRescueCutscene(() => resolve());
      });

      // 2. Perform Guan Yu Special Attack (Green Dragon Slash: Guan Yu ATK 180 x 2 = 360 Damage)
      const appContainer = document.getElementById('app-container');
      if (appContainer) {
        appContainer.classList.add('green-flash-effect');
        setTimeout(() => appContainer.classList.remove('green-flash-effect'), 600);
      }

      const guanYuDamage = 360;
      this.p2.hp = Math.max(0, this.p2.hp - guanYuDamage);
      
      AnimationManager.showFloatingText('p2-card', `🐉 เพลงดาบมังกรเขียว -${guanYuDamage}!`, 'dragon');
      AnimationManager.shakeCard('p2-card');
      this.ui.updateCharacterCards(this.p1, this.p2);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Post-attack Departure Cutscene
      await new Promise(resolve => {
        this.story.startGuanYuPostAttackCutscene(() => resolve());
      });
    } else if (this.mode === 'story_ch5' && !this.hasTriggeredZhangFeiAssist && (this.p1.hp / this.p1.maxHp) < 0.5 && this.p1.hp > 0) {
      // Zhang Fei Passive Trigger (HP < 50%)
      this.hasTriggeredZhangFeiAssist = true;

      // 1. Trigger Zhang Fei Rescue Cutscene
      await new Promise(resolve => {
        this.story.startZhangFeiRescueCutscene(() => resolve());
      });

      // 2. Perform Zhang Fei Special Attack (Thunderous Roar: Zhang Fei ATK 150 x 2 = 300 Damage)
      const zhangFeiDamage = 300;
      this.p2.hp = Math.max(0, this.p2.hp - zhangFeiDamage);

      AnimationManager.showFloatingText('p2-card', `⚡ เสียงคำรามสะท้านแผ่นดิน -${zhangFeiDamage}!`, 'charge');
      AnimationManager.shakeCard('p2-card');
      this.ui.updateCharacterCards(this.p1, this.p2);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Post-attack Cutscene
      await new Promise(resolve => {
        this.story.startZhangFeiPostAttackCutscene(() => resolve());
      });
    }
  }

  handleMatchVictory(winnerName, subText) {
    let earnedGold = 100;
    let unlockText = null;
    let hasNextChapter = false;

    if (this.mode === 'story_ch1') {
      earnedGold = 300;
      this.unlockChapter2();
      unlockText = 'ปลดล็อกบทที่ 2: โจรแห่งหุบเขา';
      hasNextChapter = true;
    } else if (this.mode === 'story_ch2') {
      earnedGold = 300;
      this.unlockChapter3();
      unlockText = 'ปลดล็อกบทที่ 3: ขุนศึกผู้ภักดี';
      hasNextChapter = true;
    } else if (this.mode === 'story_ch3') {
      earnedGold = 500;
      this.unlockChapter4();
      this.unlockXiahouDunCharacter();
      unlockText = 'ปลดล็อกบทที่ 4 & ขุนศึกแฮหัวตุ้น!';
      hasNextChapter = true;
    } else if (this.mode === 'story_ch4') {
      earnedGold = 500;
      this.unlockChapter5();
      this.unlockGuanYuCharacter();
      unlockText = 'ปลดล็อกบทที่ 5 & ขุนศึกกวนอู!';
      hasNextChapter = true;
    } else if (this.mode === 'story_ch5') {
      earnedGold = 700;
      this.unlockChapter6();
      this.unlockGuanYuCharacter();
      this.unlockZhangFeiCharacter();
      unlockText = 'ปลดล็อกบทที่ 6 & ขุนศึกเตียวหุย!';
      hasNextChapter = true;
    } else if (this.mode === 'ai') {
      if (this.aiDifficulty === 'easy') earnedGold = 50;
      if (this.aiDifficulty === 'medium') earnedGold = 100;
      if (this.aiDifficulty === 'hard') earnedGold = 200;
    }

    this.addGold(earnedGold);

    if (this.mode === 'story_ch1' && winnerName === 'โจโฉ') {
      this.story.startChapter1Victory(() => {
        this.ui.showVictoryModal('พิชิตบทที่ 1 สำเร็จ!', 'ปกป้องหมู่บ้านนอกเมืองฮูโต๋สำเร็จ!', earnedGold, unlockText, hasNextChapter);
      });
    } else if (this.mode === 'story_ch2' && winnerName === 'โจโฉ') {
      this.story.startChapter2Victory(() => {
        this.ui.showVictoryModal('พิชิตบทที่ 2 สำเร็จ!', 'ปราบกลุ่มโจรและกอบกู้เสบียงอาหารสำเร็จ!', earnedGold, unlockText, hasNextChapter);
      });
    } else if (this.mode === 'story_ch3' && winnerName === 'แฮหัวตุ้น') {
      this.story.startChapter3Victory(() => {
        this.ui.showVictoryModal('พิชิตบทที่ 3 สำเร็จ!', 'ปราบกลุ่มโจรภูเขา และต้อนรับขุนศึกแฮหัวตุ้น!', earnedGold, unlockText, hasNextChapter);
      });
    } else if (this.mode === 'story_ch4' && winnerName === 'เล่าปี่') {
      this.story.startChapter4Victory(() => {
        this.ui.showVictoryModal('พิชิตบทที่ 4 สำเร็จ!', 'คำสาบานในสวนท้อสมบูรณ์แล้ว!', earnedGold, unlockText, hasNextChapter);
      });
    } else if (this.mode === 'story_ch5' && winnerName === 'เล่าปี่') {
      this.story.startChapter5Victory(() => {
        this.ui.showVictoryModal('พิชิตบทที่ 5 สำเร็จ!', 'การรวมตัวของสามพี่น้องสมบูรณ์แล้ว!', earnedGold, unlockText, hasNextChapter);
      });
    } else {
      this.ui.showVictoryModal(`${winnerName} เป็นฝ่ายชนะ!`, subText, earnedGold, unlockText, false);
    }
  }
}

// Global init on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  window.gameController = new GameController();
});
