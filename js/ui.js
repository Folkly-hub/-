/**
 * UI Renderer & Allocation Control Manager (Thai Localized)
 */

class UIManager {
  constructor(gameController) {
    this.game = gameController;

    // Temporary turn allocation draft state
    this.draftAllocation = {
      attack: 0,
      defend: 0,
      charge: 0
    };

    this.initDOM();
  }

  initDOM() {
    const menuAvatar = document.getElementById('menu-avatar');
    if (menuAvatar) {
      menuAvatar.src = Utils.generatePortrait('caocao');
    }

    // Main Menu Mode Buttons
    document.getElementById('btn-start-story-ch1').addEventListener('click', () => {
      this.closeMainMenu();
      this.game.startMode('story_ch1');
    });

    document.getElementById('btn-start-story-ch2').addEventListener('click', () => {
      this.closeMainMenu();
      this.game.startMode('story_ch2');
    });

    document.getElementById('btn-start-story-ch3').addEventListener('click', () => {
      this.closeMainMenu();
      this.game.startMode('story_ch3');
    });

    document.getElementById('btn-start-story-ch4').addEventListener('click', () => {
      this.closeMainMenu();
      this.game.startMode('story_ch4');
    });

    document.getElementById('btn-start-story-ch5').addEventListener('click', () => {
      this.closeMainMenu();
      this.game.startMode('story_ch5');
    });

    document.getElementById('btn-start-story-ch6').addEventListener('click', () => {
      this.closeMainMenu();
      this.game.startMode('story_ch6');
    });

    document.getElementById('btn-start-story-ch7').addEventListener('click', () => {
      this.closeMainMenu();
      this.game.startMode('story_ch7');
    });

    document.getElementById('btn-start-ai-practice').addEventListener('click', () => {
      this.closeMainMenu();
      this.game.startMode('ai');
    });

    document.getElementById('btn-start-passplay').addEventListener('click', () => {
      this.showPassPlaySetupModal();
    });

    // Difficulty Selector Pills
    const btnEasy = document.getElementById('btn-diff-easy');
    const btnMedium = document.getElementById('btn-diff-medium');
    const btnHard = document.getElementById('btn-diff-hard');

    btnEasy.addEventListener('click', () => this.selectDifficulty('easy'));
    btnMedium.addEventListener('click', () => this.selectDifficulty('medium'));
    btnHard.addEventListener('click', () => this.selectDifficulty('hard'));

    // In-game Header Buttons
    document.getElementById('btn-goto-menu').addEventListener('click', () => {
      this.openMainMenu();
    });

    document.getElementById('btn-toggle-mode').addEventListener('click', () => {
      this.game.toggleMode();
    });

    document.getElementById('btn-reset-game').addEventListener('click', () => this.game.resetMatch());
    
    // Victory Modal Action Buttons
    const btnNextChapModal = document.getElementById('btn-next-chapter-modal');
    if (btnNextChapModal) {
      btnNextChapModal.addEventListener('click', () => {
        this.closeVictoryModal();
        this.game.startNextChapter();
      });
    }

    document.getElementById('btn-restart-modal').addEventListener('click', () => {
      this.closeVictoryModal();
      this.game.resetMatch();
    });

    const btnMenuModal = document.getElementById('btn-menu-modal');
    if (btnMenuModal) {
      btnMenuModal.addEventListener('click', () => {
        this.closeVictoryModal();
        this.openMainMenu();
      });
    }

    // Allocation Stepper Buttons
    document.getElementById('btn-atk-plus').addEventListener('click', () => this.adjustAllocation('attack', 1));
    document.getElementById('btn-atk-minus').addEventListener('click', () => this.adjustAllocation('attack', -1));

    document.getElementById('btn-def-plus').addEventListener('click', () => this.adjustAllocation('defend', 1));
    document.getElementById('btn-def-minus').addEventListener('click', () => this.adjustAllocation('defend', -1));

    document.getElementById('btn-chg-plus').addEventListener('click', () => this.adjustAllocation('charge', 1));
    document.getElementById('btn-chg-minus').addEventListener('click', () => this.adjustAllocation('charge', -1));

    // Confirm Turn / Lock Action with Full Energy Allocation Check
    document.getElementById('btn-confirm-turn').addEventListener('click', () => {
      const activePlayer = this.game.getActivePlayer();
      const draft = this.getDraftAllocation();
      const totalSpent = draft.attack + draft.defend + draft.charge;
      const remaining = activePlayer.currentEnergy - totalSpent;

      // Validation Check: Player MUST spend ALL available energy (remaining === 0)
      if (activePlayer.currentEnergy > 0 && remaining > 0) {
        const activeCardId = activePlayer.id === 'p1' ? 'p1-card' : 'p2-card';
        AnimationManager.showFloatingText(activeCardId, 'กรุณาใช้พลังงานให้ครบ!', 'blocked');
        
        this.updateTutorialBanner({
          message: `⚠️ คุณต้องจัดสรรพลังงานที่มีทั้งหมดให้ครบก่อน (พลังงานคงเหลือที่ยังไม่ได้ใช้: ${remaining})!`
        });
        return;
      }

      this.game.confirmCurrentPlayerTurn(draft);
    });

    // Pass & Play Ready Button
    document.getElementById('btn-pass-play-ready').addEventListener('click', () => {
      this.closePassPlayModal();
    });

    document.getElementById('btn-passplay-setup-cancel').addEventListener('click', () => {
      this.closePassPlaySetupModal();
    });

    document.getElementById('btn-passplay-setup-start').addEventListener('click', () => {
      this.confirmPassPlaySetup();
    });
  }

  selectDifficulty(diff) {
    this.game.aiDifficulty = diff;

    const btnEasy = document.getElementById('btn-diff-easy');
    const btnMedium = document.getElementById('btn-diff-medium');
    const btnHard = document.getElementById('btn-diff-hard');

    btnEasy.classList.remove('active');
    btnMedium.classList.remove('active');
    btnHard.classList.remove('active');

    if (diff === 'easy') btnEasy.classList.add('active');
    if (diff === 'medium') btnMedium.classList.add('active');
    if (diff === 'hard') btnHard.classList.add('active');
  }

  openMainMenu() {
    this.updateGoldDisplay(this.game.playerGold);
    this.updateChapterUnlockButtons();
    document.getElementById('main-menu-overlay').classList.add('active');
  }

  closeMainMenu() {
    document.getElementById('main-menu-overlay').classList.remove('active');
  }

  updateChapterUnlockButtons() {
    const btnCh2 = document.getElementById('btn-start-story-ch2');
    const btnCh3 = document.getElementById('btn-start-story-ch3');
    const btnCh4 = document.getElementById('btn-start-story-ch4');
    const btnCh5 = document.getElementById('btn-start-story-ch5');
    const btnCh6 = document.getElementById('btn-start-story-ch6');

    if (btnCh2) {
      if (this.game.isCh2Unlocked) {
        btnCh2.disabled = false;
        btnCh2.textContent = 'บทที่ 2: โจรแห่งหุบเขา';
      } else {
        btnCh2.disabled = true;
        btnCh2.textContent = '🔒 บทที่ 2: โจรแห่งหุบเขา (ล็อกอยู่)';
      }
    }

    if (btnCh3) {
      if (this.game.isCh3Unlocked) {
        btnCh3.disabled = false;
        btnCh3.textContent = 'บทที่ 3: ขุนศึกผู้ภักดี';
      } else {
        btnCh3.disabled = true;
        btnCh3.textContent = '🔒 บทที่ 3: ขุนศึกผู้ภักดี (ล็อกอยู่)';
      }
    }

    if (btnCh4) {
      if (this.game.isCh4Unlocked) {
        btnCh4.disabled = false;
        btnCh4.textContent = 'บทที่ 4: คำสาบานในสวนท้อ';
      } else {
        btnCh4.disabled = true;
        btnCh4.textContent = '🔒 บทที่ 4: คำสาบานในสวนท้อ (ล็อกอยู่)';
      }
    }

    if (btnCh5) {
      if (this.game.isCh5Unlocked) {
        btnCh5.disabled = false;
        btnCh5.textContent = 'บทที่ 5: ศึกแรกของสามพี่น้อง';
      } else {
        btnCh5.disabled = true;
        btnCh5.textContent = '🔒 บทที่ 5: ศึกแรกของสามพี่น้อง (ล็อกอยู่)';
      }
    }

    if (btnCh6) {
      if (this.game.isCh6Unlocked) {
        btnCh6.disabled = false;
        btnCh6.textContent = 'บทที่ 6: เงามืดแห่งตั๋งโต๊ะ';
      } else {
        btnCh6.disabled = true;
        btnCh6.textContent = '🔒 บทที่ 6: เงามืดแห่งตั๋งโต๊ะ (ล็อกอยู่)';
      }
    }

    const btnCh7 = document.getElementById('btn-start-story-ch7');
    if (btnCh7) {
      if (this.game.isCh7Unlocked) {
        btnCh7.disabled = false;
        btnCh7.textContent = 'บทที่ 7: นักรบผู้ยิ่งใหญ่ที่สุด';
      } else {
        btnCh7.disabled = true;
        btnCh7.textContent = '🔒 บทที่ 7: นักรบผู้ยิ่งใหญ่ที่สุด (ล็อกอยู่)';
      }
    }
  }

  updateGoldDisplay(goldAmount) {
    document.getElementById('menu-gold-text').textContent = goldAmount;
    document.getElementById('ingame-gold-text').textContent = goldAmount;
  }

  resetDraftAllocation() {
    this.draftAllocation = { attack: 0, defend: 0, charge: 0 };
    this.updateAllocationUI();
  }

  adjustAllocation(actionType, delta) {
    const activePlayer = this.game.getActivePlayer();
    const currentSpent = this.draftAllocation.attack + this.draftAllocation.defend + this.draftAllocation.charge;
    const remainingEnergy = activePlayer.currentEnergy - currentSpent;

    if (delta > 0 && remainingEnergy <= 0) {
      return;
    }

    if (delta < 0 && this.draftAllocation[actionType] <= 0) {
      return;
    }

    this.draftAllocation[actionType] += delta;
    this.updateAllocationUI();
  }

  getDraftAllocation() {
    const activePlayer = this.game.getActivePlayer();
    const spent = this.draftAllocation.attack + this.draftAllocation.defend + this.draftAllocation.charge;
    const unused = activePlayer.currentEnergy - spent;
    return {
      attack: this.draftAllocation.attack,
      defend: this.draftAllocation.defend,
      charge: this.draftAllocation.charge,
      unused: Math.max(0, unused)
    };
  }

  updateAllocationUI() {
    const activePlayer = this.game.getActivePlayer();
    const spent = this.draftAllocation.attack + this.draftAllocation.defend + this.draftAllocation.charge;
    const remaining = activePlayer.currentEnergy - spent;

    // Numbers display
    document.getElementById('val-atk-num').textContent = this.draftAllocation.attack;
    document.getElementById('val-def-num').textContent = this.draftAllocation.defend;
    document.getElementById('val-chg-num').textContent = this.draftAllocation.charge;

    document.getElementById('val-total-energy').textContent = activePlayer.currentEnergy;
    document.getElementById('val-remaining-energy').textContent = `คงเหลือ: ${remaining}`;

    // Plus buttons state
    document.getElementById('btn-atk-plus').disabled = (remaining <= 0);
    document.getElementById('btn-def-plus').disabled = (remaining <= 0);
    document.getElementById('btn-chg-plus').disabled = (remaining <= 0);

    // Minus buttons state
    document.getElementById('btn-atk-minus').disabled = (this.draftAllocation.attack <= 0);
    document.getElementById('btn-def-minus').disabled = (this.draftAllocation.defend <= 0);
    document.getElementById('btn-chg-minus').disabled = (this.draftAllocation.charge <= 0);
  }

  updateCharacterCards(p1, p2) {
    // Player 1 Card
    document.getElementById('p1-name').textContent = p1.name;
    document.getElementById('p1-hp-text').textContent = `${p1.hp} / ${p1.maxHp}`;
    document.getElementById('p1-hp-bar').style.width = `${(p1.hp / p1.maxHp) * 100}%`;
    document.getElementById('p1-atk').textContent = p1.atk;
    document.getElementById('p1-shield').textContent = p1.shield;
    document.getElementById('p1-energy').textContent = p1.currentEnergy;
    document.getElementById('p1-portrait').src = Utils.generatePortrait(p1.portraitKey);

    // Player 2 Card
    document.getElementById('p2-name').textContent = p2.name;
    document.getElementById('p2-hp-text').textContent = `${p2.hp} / ${p2.maxHp}`;
    document.getElementById('p2-hp-bar').style.width = `${(p2.hp / p2.maxHp) * 100}%`;
    document.getElementById('p2-atk').textContent = p2.atk;
    document.getElementById('p2-shield').textContent = p2.shield;
    document.getElementById('p2-energy').textContent = p2.currentEnergy;
    document.getElementById('p2-portrait').src = Utils.generatePortrait(p2.portraitKey);
  }

  updateHeader(roundNumber, mode, aiDifficulty) {
    document.getElementById('round-counter').textContent = `รอบที่ ${roundNumber}`;
    document.getElementById('round-gain-badge').textContent = `+${roundNumber} พลังงาน`;
    
    let modeText = 'โหมด: เนื้อเรื่อง บทที่ 1';
    if (mode === 'story_ch2') modeText = 'โหมด: เนื้อเรื่อง บทที่ 2';
    if (mode === 'story_ch3') modeText = 'โหมด: เนื้อเรื่อง บทที่ 3';
    if (mode === 'story_ch4') modeText = 'โหมด: เนื้อเรื่อง บทที่ 4';
    if (mode === 'story_ch5') modeText = 'โหมด: เนื้อเรื่อง บทที่ 5';
    if (mode === 'story_ch6') modeText = 'โหมด: เนื้อเรื่อง บทที่ 6';
    if (mode === 'story_ch7') modeText = 'โหมด: เนื้อเรื่อง บทที่ 7';
    if (mode === 'ai') {
      let diffText = 'กลาง';
      if (aiDifficulty === 'easy') diffText = 'ง่าย';
      if (aiDifficulty === 'hard') diffText = 'ยาก';
      modeText = `โหมด: สู้กับ AI (${diffText})`;
    }
    if (mode === 'passplay') modeText = 'โหมด: เล่น 2 คน (สลับกันเลือก)';

    document.getElementById('btn-toggle-mode').textContent = modeText;
  }

  updateTutorialBanner(guide) {
    const banner = document.getElementById('tutorial-banner');
    if (guide) {
      document.getElementById('tutorial-banner-text').textContent = guide.message;
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  }

  showPassPlayModal(nextPlayerName) {
    const modal = document.getElementById('pass-play-modal');
    document.getElementById('pass-play-text').textContent = `ส่งมือถือให้ ${nextPlayerName}`;
    modal.classList.add('active');
  }

  closePassPlayModal() {
    document.getElementById('pass-play-modal').classList.remove('active');
  }

  showPassPlaySetupModal() {
    const cfg = this.game.passPlayConfig;
    document.getElementById('passplay-p1-name').value = cfg.p1.name;
    document.getElementById('passplay-p1-hp').value = cfg.p1.hp;
    document.getElementById('passplay-p1-atk').value = cfg.p1.atk;
    document.getElementById('passplay-p2-name').value = cfg.p2.name;
    document.getElementById('passplay-p2-hp').value = cfg.p2.hp;
    document.getElementById('passplay-p2-atk').value = cfg.p2.atk;

    const errorEl = document.getElementById('passplay-setup-error');
    errorEl.hidden = true;
    errorEl.textContent = '';

    document.getElementById('pass-play-setup-modal').classList.add('active');
  }

  closePassPlaySetupModal() {
    document.getElementById('pass-play-setup-modal').classList.remove('active');
  }

  confirmPassPlaySetup() {
    const errorEl = document.getElementById('passplay-setup-error');
    const p1Name = document.getElementById('passplay-p1-name').value.trim() || 'ผู้เล่น 1';
    const p2Name = document.getElementById('passplay-p2-name').value.trim() || 'ผู้เล่น 2';
    const p1Hp = parseInt(document.getElementById('passplay-p1-hp').value, 10);
    const p1Atk = parseInt(document.getElementById('passplay-p1-atk').value, 10);
    const p2Hp = parseInt(document.getElementById('passplay-p2-hp').value, 10);
    const p2Atk = parseInt(document.getElementById('passplay-p2-atk').value, 10);

    if (!Number.isFinite(p1Hp) || p1Hp < 100 || p1Hp > 9999) {
      errorEl.textContent = 'พลังชีวิตผู้เล่น 1 ต้องอยู่ระหว่าง 100–9999';
      errorEl.hidden = false;
      return;
    }
    if (!Number.isFinite(p1Atk) || p1Atk < 1 || p1Atk > 999) {
      errorEl.textContent = 'พลังโจมตีผู้เล่น 1 ต้องอยู่ระหว่าง 1–999';
      errorEl.hidden = false;
      return;
    }
    if (!Number.isFinite(p2Hp) || p2Hp < 100 || p2Hp > 9999) {
      errorEl.textContent = 'พลังชีวิตผู้เล่น 2 ต้องอยู่ระหว่าง 100–9999';
      errorEl.hidden = false;
      return;
    }
    if (!Number.isFinite(p2Atk) || p2Atk < 1 || p2Atk > 999) {
      errorEl.textContent = 'พลังโจมตีผู้เล่น 2 ต้องอยู่ระหว่าง 1–999';
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;
    this.closePassPlaySetupModal();
    this.closeMainMenu();
    this.game.startPassPlayMode({
      p1: { name: p1Name, hp: p1Hp, atk: p1Atk, portrait: 'guanyu' },
      p2: { name: p2Name, hp: p2Hp, atk: p2Atk, portrait: 'lubu' }
    });
  }

  showVictoryModal(winnerText, subtitleText, rewardGold, unlockText, hasNextChapter = false) {
    const modal = document.getElementById('victory-modal');
    document.getElementById('victory-title').textContent = winnerText;
    document.getElementById('victory-subtitle').textContent = subtitleText;
    
    const rewardBadge = document.getElementById('reward-gold-badge');
    const unlockBadge = document.getElementById('reward-unlock-badge');
    const btnNextChapModal = document.getElementById('btn-next-chapter-modal');

    if (rewardGold && rewardGold > 0) {
      rewardBadge.textContent = `💰 ทอง +${rewardGold}`;
      rewardBadge.style.display = 'inline-flex';
    } else {
      rewardBadge.style.display = 'none';
    }

    if (unlockText) {
      unlockBadge.textContent = `📜 ${unlockText}`;
      unlockBadge.style.display = 'inline-flex';
    } else {
      unlockBadge.style.display = 'none';
    }

    if (btnNextChapModal) {
      if (hasNextChapter) {
        btnNextChapModal.style.display = 'inline-block';
      } else {
        btnNextChapModal.style.display = 'none';
      }
    }

    modal.classList.add('active');
  }

  closeVictoryModal() {
    document.getElementById('victory-modal').classList.remove('active');
  }

  setTurnHighlight(activePlayerId) {
    const p1Card = document.getElementById('p1-card');
    const p2Card = document.getElementById('p2-card');

    if (activePlayerId === 'p1') {
      p1Card.classList.add('active-turn');
      p2Card.classList.remove('active-turn');
    } else {
      p2Card.classList.add('active-turn');
      p1Card.classList.remove('active-turn');
    }
  }
}
