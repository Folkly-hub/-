/**
 * Story Mode Chapters 1 - 7 System (Thai Localized)
 * Chapter 1: "จุดเริ่มต้นแห่งความโกลาหล"
 * Chapter 2: "โจรแห่งหุบเขา"
 * Chapter 3: "ขุนศึกผู้ภักดี"
 * Chapter 4: "คำสาบานในสวนท้อ"
 * Chapter 5: "ศึกแรกของสามพี่น้อง"
 * Chapter 6: "เงามืดแห่งตั๋งโต๊ะ"
 * Chapter 7: "นักรบผู้ยิ่งใหญ่ที่สุด"
 */

class StoryManager {
  constructor(gameController) {
    this.game = gameController;

    // Dialogue State
    this.currentDialogueList = [];
    this.dialogueIndex = 0;
    this.onDialogueCompleteCallback = null;

    // Mid-Battle Dialogue Triggers Tracking
    this.triggeredHp50 = false;
    this.triggeredHp20 = false;
    this.triggeredHp70Ch2 = false;
    this.triggeredHp30Ch2 = false;
    this.triggeredHp70Ch3 = false;
    this.triggeredHp30Ch3 = false;
    this.triggeredHp70Ch4 = false;
    this.triggeredHp30Ch4 = false;
    this.triggeredHp70Ch5 = false;
    this.triggeredHp30Ch5 = false;
    this.triggeredHp50Ch6 = false;
    this.triggeredHp70Ch6 = false;
    this.triggeredHp30Ch6 = false;
    this.triggeredHp50Ch7 = false;
    this.triggeredHpLowCh7 = false;

    // Episode Character & Battle Configurations mapped to Character Registry IDs
    this.episodes = {
      story_ch1: {
        id: 1,
        modeKey: 'story_ch1',
        title: 'บทที่ 1: เริ่มต้นโกลาหล',
        playerCharacterId: 'guanYu',
        enemyCharacterId: 'luBu',
        playerHp: 1000,
        playerAtk: 100,
        enemyHp: 500,
        enemyAtk: 50,
        enemyName: 'โจรผ้าเหลือง'
      },
      story_ch2: {
        id: 2,
        modeKey: 'story_ch2',
        title: 'บทที่ 2: โจรแห่งหุบเขา',
        playerCharacterId: 'caoCao',
        enemyCharacterId: 'banditLeader',
        playerHp: 1000,
        playerAtk: 100,
        enemyHp: 900,
        enemyAtk: 90,
        enemyName: 'หัวหน้าโจร'
      },
      story_ch3: {
        id: 3,
        modeKey: 'story_ch3',
        title: 'บทที่ 3: ขุนศึกผู้ภักดี',
        playerCharacterId: 'xiahouDun',
        enemyCharacterId: 'mountainBanditLeader',
        playerHp: 1500,
        playerAtk: 120,
        enemyHp: 1200,
        enemyAtk: 110,
        enemyName: 'หัวหน้าโจรภูเขา'
      },
      story_ch4: {
        id: 4,
        modeKey: 'story_ch4',
        title: 'บทที่ 4: คำสาบานในสวนท้อ',
        playerCharacterId: 'liuBei',
        enemyCharacterId: 'yellowTurbanCommander',
        playerHp: 1100,
        playerAtk: 90,
        enemyHp: 1500,
        enemyAtk: 120,
        enemyName: 'ผู้บัญชาการโจรผ้าเหลือง'
      },
      story_ch5: {
        id: 5,
        modeKey: 'story_ch5',
        title: 'บทที่ 5: ศึกแรกของสามพี่น้อง',
        playerCharacterId: 'liuBei',
        enemyCharacterId: 'yellowTurbanCommander',
        playerHp: 1100,
        playerAtk: 90,
        enemyHp: 1800,
        enemyAtk: 140,
        enemyName: 'ผู้บัญชาการโจรผ้าเหลือง'
      },
      story_ch6: {
        id: 6,
        modeKey: 'story_ch6',
        title: 'บทที่ 6: เงามืดแห่งตั๋งโต๊ะ',
        playerCharacterId: 'guanYu',
        enemyCharacterId: 'dongZhuoVanguard',
        playerHp: 1600,
        playerAtk: 180,
        enemyHp: 1900,
        enemyAtk: 145,
        enemyName: 'กองหน้าตั๋งโต๊ะ'
      },
      story_ch7: {
        id: 7,
        modeKey: 'story_ch7',
        title: 'บทที่ 7: นักรบผู้ยิ่งใหญ่ที่สุด',
        playerCharacterId: 'guanYu',
        enemyCharacterId: 'luBu',
        playerHp: 1300,
        playerAtk: 180,
        enemyHp: 2500,
        enemyAtk: 230,
        enemyName: 'ลิโป้'
      }
    };

    this.initDOM();
    this.validateEpisodes();
  }

  /**
   * Validate all Story Mode episodes to ensure playerCharacterId and enemyCharacterId are specified.
   * Logs warnings for any incomplete episode data.
   */
  validateEpisodes() {
    if (!this.episodes) return;
    for (const [key, ep] of Object.entries(this.episodes)) {
      if (!ep.playerCharacterId) {
        console.warn(`StoryManager Warning: Episode "${key}" is missing playerCharacterId.`);
      }
      if (!ep.enemyCharacterId) {
        console.warn(`StoryManager Warning: Episode "${key}" is missing enemyCharacterId.`);
      }
    }
  }

  /**
   * Get Episode configuration object by story mode key
   * @param {string} modeKey - e.g. 'story_ch1', 'story_ch2'
   * @returns {Object|null} Episode configuration
   */
  getEpisode(modeKey) {
    if (this.episodes && this.episodes[modeKey]) {
      return this.episodes[modeKey];
    }
    return null;
  }

  initDOM() {
    const btnNext = document.getElementById('btn-dialogue-next');
    const btnSkip = document.getElementById('btn-dialogue-skip');

    if (btnNext) btnNext.addEventListener('click', () => this.nextDialogue());
    if (btnSkip) btnSkip.addEventListener('click', () => this.skipCutscene());
  }

  playCutscene(dialogues, onComplete) {
    if (this.game.mode === 'passplay') {
      if (onComplete) onComplete();
      return;
    }

    this.currentDialogueList = dialogues;
    this.dialogueIndex = 0;
    this.onDialogueCompleteCallback = onComplete;

    const overlay = document.getElementById('dialogue-overlay');
    if (overlay) overlay.classList.add('active');

    this.renderCurrentDialogue();
  }

  renderCurrentDialogue() {
    if (this.dialogueIndex >= this.currentDialogueList.length) {
      this.closeDialogueOverlay();
      if (this.onDialogueCompleteCallback) {
        this.onDialogueCompleteCallback();
      }
      return;
    }

    const current = this.currentDialogueList[this.dialogueIndex];
    document.getElementById('dialogue-speaker-name').textContent = current.speaker;
    document.getElementById('dialogue-text').textContent = current.text;
    document.getElementById('dialogue-speaker-portrait').src = Utils.generatePortrait(current.portraitKey);
  }

  nextDialogue() {
    this.dialogueIndex++;
    this.renderCurrentDialogue();
  }

  skipCutscene() {
    this.closeDialogueOverlay();
    if (this.onDialogueCompleteCallback) {
      this.onDialogueCompleteCallback();
    }
  }

  closeDialogueOverlay() {
    const overlay = document.getElementById('dialogue-overlay');
    if (overlay) overlay.classList.remove('active');
    this.currentDialogueList = [];
    this.dialogueIndex = 0;
  }

  // --- Chapter 1 Cutscenes ---
  startChapter1Opening(onComplete) {
    this.playCutscene([
      { speaker: 'ทหาร', text: 'นายท่าน! โจรผ้าเหลืองบุกโจมตีหมู่บ้านอีกแล้วครับ!', portraitKey: 'soldier' },
      { speaker: 'โจโฉ', text: 'พวกมันมากันกี่คน?', portraitKey: 'caocao' },
      { speaker: 'ทหาร', text: 'เป็นเพียงกลุ่มเล็กๆ... แต่กองกำลังในพื้นที่ของเราไม่พอรับมือครับ', portraitKey: 'soldier' },
      { speaker: 'โจโฉ', text: 'เช่นนั้นวันนี้... ข้าจะลงสนามนำทัพด้วยตัวเอง', portraitKey: 'caocao' }
    ], onComplete);
  }

  startChapter1Victory(onComplete) {
    this.playCutscene([
      { speaker: 'ทหารโจรผ้าเหลือง', text: 'อ๊าก! ถอย! ถอยทัพเร็ว!', portraitKey: 'yellowturban' },
      { speaker: 'ผู้นำหมู่บ้าน', text: 'ขอบพระคุณท่านโจโฉมากๆ ครับที่ช่วยพวกเราไว้', portraitKey: 'elder' },
      { speaker: 'โจโฉ', text: 'นี่เป็นเพียงจุดเริ่มต้นเท่านั้น หากความโกลาหลยังไม่จบสิ้น ศัตรูที่แข็งแกร่งกว่านี้จะต้องปรากฏตัวขึ้นอีกแน่', portraitKey: 'caocao' },
      { speaker: 'ผู้บรรยาย', text: 'ยอดขุนศึกผู้ลึกลับเฝ้ามองลงมาจากยอดเขาอันห่างไกล... การเดินทางของโจโฉเพิ่งเริ่มต้นขึ้นเท่านั้น', portraitKey: 'caocao' }
    ], onComplete);
  }

  // --- Chapter 2 Cutscenes ---
  startChapter2Opening(onComplete) {
    this.playCutscene([
      { speaker: 'ทหาร', text: 'นายท่าน! ขบวนเสบียงของเราถูกซุ่มโจมตีครับ! เสบียงอาหารทั้งหมดถูกปล้นไปแล้ว!', portraitKey: 'soldier' },
      { speaker: 'โจโฉ', text: 'หากสูญเสียเสบียง... กองทัพของเราคงไม่อาจเดินทัพต่อได้ พวกเราจะบุกเข้าหุบเขาทันที!', portraitKey: 'caocao' }
    ], onComplete);
  }

  startChapter2Victory(onComplete) {
    this.playCutscene([
      { speaker: 'ผู้นำหมู่บ้าน', text: 'เสบียงอาหารของพวกเราปลอดภัยแล้ว ขอบพระคุณท่านโจโฉอย่างสุดซึ้งครับ', portraitKey: 'elder' },
      { speaker: 'ทหาร', text: 'นายท่าน มีขุนศึกผู้หนึ่งส่งจดหมายลับปรารถนาจะเข้าร่วมกองทัพของท่านครับ', portraitKey: 'soldier' },
      { speaker: 'โจโฉ', text: 'ลงลายมือชื่อไว้ว่า... "แฮหัวตุ้น (Xiahou Dun)"!', portraitKey: 'caocao' },
      { speaker: 'โจโฉ', text: 'กำลังทัพของเราแข็งแกร่งขึ้นเรื่อยๆ แล้ว!', portraitKey: 'caocao' }
    ], onComplete);
  }

  // --- Chapter 3 Cutscenes ---
  startChapter3Opening(onComplete) {
    this.playCutscene([
      { speaker: 'แฮหัวตุ้น', text: 'ท่านคือท่านโจโฉใช่หรือไม่?', portraitKey: 'xiahou_dun' },
      { speaker: 'โจโฉ', text: 'ถูกต้อง ข้าเอง แล้วท่านคือใคร?', portraitKey: 'caocao' },
      { speaker: 'แฮหัวตุ้น', text: 'ข้ามีนามว่า แฮหัวตุ้น ข้าได้ยินถึงปณิธานของท่าน หากท่านปรารถนาจะคืนความสงบสุขให้แผ่นดินอย่างแท้จริง... ข้าจะเคียงข้างรบไปพร้อมกับท่าน', portraitKey: 'xiahou_dun' },
      { speaker: 'ทหาร', text: 'นายท่าน! กลุ่มโจรภูเขากลุ่มใหญ่กำลังบุกโจมตีค่ายของเราครับ!', portraitKey: 'soldier' },
      { speaker: 'แฮหัวตุ้น', text: 'โปรดอนุญาตให้ข้าได้พิสูจน์ความภักดีด้วยเถิด!', portraitKey: 'xiahou_dun' },
      { speaker: 'โจโฉ', text: 'ดีมาก! แสดงความสามารถของเจ้าให้ข้าเห็นสิ', portraitKey: 'caocao' }
    ], onComplete);
  }

  startChapter3Victory(onComplete) {
    this.playCutscene([
      { speaker: 'แฮหัวตุ้น', text: 'นายท่าน หากท่านยินดีรับข้า... ข้าขอถวายตัวเป็นขุนศึกทหารเอกของท่าน', portraitKey: 'xiahou_dun' },
      { speaker: 'โจโฉ', text: 'ลุกขึ้นเถิด ตั้งแต่วันนี้เป็นต้นไป... พวกเราจะร่วมมือกันฟื้นฟูสันติภาพด้วยกัน!', portraitKey: 'caocao' },
      { speaker: 'ผู้บรรยาย', text: 'กองทัพของโจโฉยังคงเติบโตอย่างต่อเนื่อง... ทว่า ณ ดินแดนอันห่างไกลออกไป วีรบุรุษ 3 คนกำลังจะเปลี่ยนประวัติศาสตร์', portraitKey: 'caocao' },
      { speaker: 'ผู้บรรยาย', text: '(เงาร่างทั้งสามยกจอกสุราขึ้นพร้อมกัน ณ สวนดอกท้อ...)', portraitKey: 'guanyu' }
    ], onComplete);
  }

  // --- Chapter 4 Cutscenes (Peach Garden Oath & Guan Yu Rescue) ---
  startChapter4Opening(onComplete) {
    this.playCutscene([
      { speaker: 'เล่าปี่', text: 'ผู้บริสุทธิ์ไม่สมควรต้องมาเดือดร้อนเพราะสงคราม ข้าจะปกป้องพวกเจ้าเอง!', portraitKey: 'liubei' },
      { speaker: 'เตียวหุย', text: 'ใครมันกล้าบุกมาอาละวาดที่บ้านเกิดของข้า!', portraitKey: 'zhangfei' },
      { speaker: 'กวนอู', text: 'หากท่านผดุงความยุติธรรม... ข้าขอก้าวร่วมรบไปพร้อมกับท่าน', portraitKey: 'guanyu' },
      { speaker: 'เล่าปี่', text: 'แม้เราสามคนไม่ได้เกิดวัน เดือน ปี เดียวกัน...', portraitKey: 'liubei' },
      { speaker: 'กวนอู', text: '...แต่พวกเราจะยืนหยัดร่วมกัน...', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: '...และพวกเราขอร่วมสุข ร่วมทุกข์ และตายในฐานะพี่น้อง!', portraitKey: 'zhangfei' },
      { speaker: 'ผู้บรรยาย', text: '🌸 คำสาบานในสวนท้อ (Oath of the Peach Garden) 🌸', portraitKey: 'liubei' }
    ], onComplete);
  }

  startGuanYuRescueCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'กวนอู', text: 'นายท่าน... ถอยไปก่อนครับ! ศัตรูผู้นี้ ข้าจะจัดการเอง!', portraitKey: 'guanyu' },
      { speaker: 'ผู้บัญชาการโจรผ้าเหลือง', text: 'เป็นไปไม่ได้! อาวุธนั่นมัน... ง้าวเขียวมังกรจันทร์เสี้ยว!', portraitKey: 'yellowturban_commander' }
    ], onComplete);
  }

  startGuanYuPostAttackCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'กวนอู', text: 'เส้นทางของนายท่าน... จะไม่มีวันจบลงตรงนี้!', portraitKey: 'guanyu' },
      { speaker: 'กวนอู', text: 'เส้นทางถูกเปิดออกแล้ว ข้าจะกลับมาช่วยเหลือเมื่อนายท่านต้องการ', portraitKey: 'guanyu' }
    ], onComplete);
  }

  startChapter4Victory(onComplete) {
    this.playCutscene([
      { speaker: 'ผู้นำหมู่บ้าน', text: 'พวกท่านช่วยหมู่บ้านของเราไว้ได้แล้ว ขอบพระคุณมากๆ ครับ!', portraitKey: 'elder' },
      { speaker: 'เล่าปี่', text: 'วันนี้พวกเราช่วยหมู่บ้านได้หนึ่งแห่ง... แต่ยังมีผู้คนอีกมากมายที่กำลังเดือดร้อน', portraitKey: 'liubei' },
      { speaker: 'กวนอู', text: 'เช่นนั้น การเดินทางของพวกเราก็ต้องดำเนินต่อไป', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: 'ยังมีศึกอีกมากมายรอเราอยู่!', portraitKey: 'zhangfei' },
      { speaker: 'ทหาร', text: 'นายท่าน! มีวีรบุรุษ 3 คนกำลังรวบรวมผู้ติดตามทางภาคใต้ครับ', portraitKey: 'soldier' },
      { speaker: 'โจโฉ', text: 'เช่นนั้นหรือ... ใต้หล้าเริ่มเคลื่อนไหวแล้วสินะ', portraitKey: 'caocao' }
    ], onComplete);
  }

  // --- Chapter 5 Cutscenes (First Battle of the Three Brothers) ---
  startChapter5Opening(onComplete) {
    this.playCutscene([
      { speaker: 'ผู้บรรยาย', text: 'เล่าปี่ กวนอู และเตียวหุย เดินทางร่วมกันต่อจากบทก่อน... ควันดำลอยขึ้นจากเมืองเล็กแห่งหนึ่ง ชาวบ้านกำลังหนีตาย', portraitKey: 'liubei' },
      { speaker: 'เล่าปี่', text: 'อีกหนึ่งเมืองที่ตกอยู่ในความโกลาหล', portraitKey: 'liubei' },
      { speaker: 'กวนอู', text: 'ธงนั่นเป็นของพวกโจรผ้าเหลือง', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ!', portraitKey: 'zhangfei' },
      { speaker: 'เตียวหุย', text: 'งั้นไล่พวกมันออกไปซะ!', portraitKey: 'zhangfei' },
      { speaker: 'เล่าปี่', text: 'อย่าประมาทศัตรู', portraitKey: 'liubei' },
      { speaker: 'เล่าปี่', text: 'เราจะสู้ด้วยกัน แต่การปกป้องประชาชนต้องมาก่อน', portraitKey: 'liubei' },
      { speaker: 'เตียวหุย', text: 'เข้าใจแล้วพี่!', portraitKey: 'zhangfei' },
      { speaker: 'กวนอู', text: 'งั้น... เริ่มกันเถอะ', portraitKey: 'guanyu' }
    ], onComplete);
  }

  startChapter5BrothersRescueCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'กวนอู', text: 'น้องชาย... ศัตรูตนนี้ปล่อยให้ข้าจัดการเอง', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: 'พี่! ไม่มีใครแตะต้องท่านได้ตราบใดที่ข้ายังอยู่!', portraitKey: 'zhangfei' },
      { speaker: 'ผู้บัญชาการโจรผ้าเหลือง', text: 'เป็นไปไม่ได้! ง้าวเขียวมังกรจันทร์เสี้ยว! และเสียงคำรามนั่น...!', portraitKey: 'yellowturban_commander' }
    ], onComplete);
  }

  startChapter5BrothersPostAttackCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'กวนอู', text: 'ศัตรูอ่อนแอลงแล้ว', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ! จบมันเลย!', portraitKey: 'zhangfei' }
    ], onComplete);
  }

  startChapter5GuanYuRescueCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'กวนอู', text: 'น้องชาย... ศัตรูตนนี้ปล่อยให้ข้าจัดการเอง', portraitKey: 'guanyu' },
      { speaker: 'ผู้บัญชาการโจรผ้าเหลือง', text: 'เป็นไปไม่ได้! ง้าวเขียวมังกรจันทร์เสี้ยว!', portraitKey: 'yellowturban_commander' }
    ], onComplete);
  }

  startChapter5GuanYuPostAttackCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'กวนอู', text: 'ศัตรูอ่อนแอลงแล้ว', portraitKey: 'guanyu' }
    ], onComplete);
  }

  startZhangFeiRescueCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เตียวหุย', text: 'พี่!', portraitKey: 'zhangfei' },
      { speaker: 'เตียวหุย', text: 'ไม่มีใครแตะต้องท่านได้ตราบใดที่ข้ายังอยู่!', portraitKey: 'zhangfei' },
      { speaker: 'ผู้บัญชาการโจรผ้าเหลือง', text: 'อ๊าก! เสียงคำรามนั่นมันอะไรกัน?!', portraitKey: 'yellowturban_commander' }
    ], onComplete);
  }

  startZhangFeiPostAttackCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ!', portraitKey: 'zhangfei' },
      { speaker: 'เตียวหุย', text: 'จบมันเลย!', portraitKey: 'zhangfei' }
    ], onComplete);
  }

  startChapter5Victory(onComplete) {
    this.playCutscene([
      { speaker: 'ผู้บรรยาย', text: 'ทหารโจรผ้าเหลืองถอยทัพ... เมืองได้รับการช่วยเหลือแล้ว', portraitKey: 'elder' },
      { speaker: 'ผู้นำหมู่บ้าน', text: 'ท่านช่วยเมืองของเราไว้แล้ว', portraitKey: 'elder' },
      { speaker: 'เล่าปี่', text: 'เราทำเพียงสิ่งที่ใครๆ ก็ควรทำ', portraitKey: 'liubei' },
      { speaker: 'กวนอู', text: 'พี่ ยังมีศึกอีกมากรอเราอยู่', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ!', portraitKey: 'zhangfei' },
      { speaker: 'เตียวหุย', text: 'งั้นให้พวกมันมาเลย!', portraitKey: 'zhangfei' },
      { speaker: 'เล่าปี่', text: 'การเดินทางของเราเพิ่งเริ่มต้น', portraitKey: 'liubei' },
      { speaker: 'ผู้บรรยาย', text: '--- ค่ายทหารของโจโฉ ---', portraitKey: 'caocao' },
      { speaker: 'ทหาร', text: 'นายท่าน มีรายงานว่ามีนักรบสามคนกำลังต่อสู้กับพวกโจรผ้าเหลือง', portraitKey: 'soldier' },
      { speaker: 'โจโฉ', text: 'สามพี่น้อง...', portraitKey: 'caocao' },
      { speaker: 'โจโฉ', text: 'น่าสนใจ', portraitKey: 'caocao' }
    ], onComplete);
  }

  startChapter6LiuBeiRescueCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เล่าปี่', text: 'น้องชายกวนอู! พี่ชายจะช่วย!', portraitKey: 'liubei' },
      { speaker: 'กองหน้าตั๋งโต๊ะ', text: 'เล่าปี่มาแล้ว!', portraitKey: 'dongzhuo_vanguard' }
    ], onComplete);
  }

  startChapter6LiuBeiPostAttackCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เล่าปี่', text: 'พี่น้องต้องช่วยกัน', portraitKey: 'liubei' }
    ], onComplete);
  }

  startChapter6ZhangFeiRescueCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เตียวหุย', text: 'พี่ชายกวนอู!', portraitKey: 'zhangfei' },
      { speaker: 'เตียวหุย', text: 'ไม่มีใครแตะต้องท่านได้ตราบใดที่ข้ายังอยู่!', portraitKey: 'zhangfei' },
      { speaker: 'กองหน้าตั๋งโต๊ะ', text: 'อ๊าก! เสียงคำรามนั่นมันอะไรกัน?!', portraitKey: 'dongzhuo_vanguard' }
    ], onComplete);
  }

  startChapter6ZhangFeiPostAttackCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ!', portraitKey: 'zhangfei' },
      { speaker: 'เตียวหุย', text: 'จบมันเลย!', portraitKey: 'zhangfei' }
    ], onComplete);
  }

  // --- Chapter 6 Cutscenes (Shadow of Dong Zhuo) ---
  startChapter6Opening(onComplete) {
    this.playCutscene([
      { speaker: 'ผู้สื่อข่าว', text: 'ข่าวจากเมืองหลวง!', portraitKey: 'messenger' },
      { speaker: 'ผู้สื่อข่าว', text: 'ตั๋งโต๊ะได้ยึดอำนาจราชสำนักแล้ว!', portraitKey: 'messenger' },
      { speaker: 'กวนอู', text: 'ตั๋งโต๊ะ...', portraitKey: 'guanyu' },
      { speaker: 'กวนอู', text: 'แผ่นดินกำลังอันตรายขึ้น', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: 'พี่ชาย ข้าจะช่วยสู้ด้วย!', portraitKey: 'zhangfei' }
    ], onComplete);
  }

  startChapter6SpecialPowerTutorial(onComplete) {
    this.playCutscene([
      { speaker: 'ระบบใหม่', text: 'พลังพิเศษ', portraitKey: 'system' },
      { speaker: 'ระบบใหม่', text: 'ทุกขุนศึกมีความสามารถเฉพาะตัว', portraitKey: 'system' },
      { speaker: 'ระบบใหม่', text: 'ใช้ความสามารถเหล่านี้ในจังหวะที่เหมาะสม', portraitKey: 'system' }
    ], onComplete);
  }

  startChapter6Victory(onComplete) {
    this.playCutscene([
      { speaker: 'กวนอู', text: 'กองทัพนี้แข็งแกร่งกว่าก่อน', portraitKey: 'guanyu' },
      { speaker: 'เล่าปี่', text: 'พี่น้องเราก็ต้องแข็งแกร่งขึ้นด้วย', portraitKey: 'liubei' },
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ! ให้พวกเขามาเลย!', portraitKey: 'zhangfei' },
      { speaker: 'ผู้บรรยาย', text: '--- ค่ายทหารของตั๋งโต๊ะ ---', portraitKey: 'dongzhuo' },
      { speaker: 'ทหาร', text: 'ลอร์ดตั๋งโต๊ะ', portraitKey: 'soldier' },
      { speaker: 'ทหาร', text: 'นักรบสามคนปราบกองกำลังหน้าของเราแล้ว', portraitKey: 'soldier' },
      { speaker: 'ตั๋งโต๊ะ', text: 'นักรบสามคน?', portraitKey: 'dongzhuo' },
      { speaker: 'ตั๋งโต๊ะ', text: 'ส่งลิโป้ไป', portraitKey: 'dongzhuo' },
      { speaker: 'ผู้บรรยาย', text: '(ลิโป้เดินเข้ามาในฉาก)', portraitKey: 'lubu' },
      { speaker: 'ลิโป้', text: 'ปล่อยให้ข้าจัดการ', portraitKey: 'lubu' },
      { speaker: 'ผู้บรรยาย', text: '--- ต่อไป ---', portraitKey: 'system' }
    ], onComplete);
  }

  // --- Chapter 7 Cutscenes (The Unstoppable Warrior) ---
  startChapter7Opening(onComplete) {
    this.playCutscene([
      { speaker: 'เตียวหุย', text: 'เสียงนั่นคืออะไร?', portraitKey: 'zhangfei' },
      { speaker: 'กวนอู', text: 'กองทัพมาแล้ว', portraitKey: 'guanyu' },
      { speaker: 'ผู้บรรยาย', text: '(นักรบผู้ทรงอำนาจขี่ม้าแดงปรากฏขึ้น)', portraitKey: 'lubu' },
      { speaker: 'ลิโป้', text: 'พวกเจ้าคือสามพี่น้องที่ปราบกองหน้าตั๋งโต๊ะใช่ไหม', portraitKey: 'lubu' },
      { speaker: 'กวนอู', text: 'ใช่', portraitKey: 'guanyu' },
      { speaker: 'ลิโป้', text: 'แล้วแสดงพลังให้ข้าดูสิ', portraitKey: 'lubu' }
    ], onComplete);
  }

  startChapter7Victory(onComplete) {
    this.playCutscene([
      { speaker: 'ลิโป้', text: 'น่าสนใจ...', portraitKey: 'lubu' },
      { speaker: 'ลิโป้', text: 'พวกเจ้าแข็งกว่าที่ข้าคาด', portraitKey: 'lubu' },
      { speaker: 'กวนอู', text: 'พลังของท่านน่ากลัว', portraitKey: 'guanyu' },
      { speaker: 'ลิโป้', text: 'ยังไม่จบ', portraitKey: 'lubu' },
      { speaker: 'ผู้บรรยาย', text: '(ลิโป้ถอยทัพ)', portraitKey: 'lubu' },
      { speaker: 'เล่าปี่', text: 'นักรบผู้นั้นแตกต่างจากศัตรูที่เราเคยเผชิญ', portraitKey: 'liubei' },
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ! คราวหน้ามาจะทุ่มหนักกว่านี้!', portraitKey: 'zhangfei' },
      { speaker: 'กวนอู', text: 'เขาจะกลับมาแน่', portraitKey: 'guanyu' },
      { speaker: 'ผู้บรรยาย', text: '--- จบ ---', portraitKey: 'system' }
    ], onComplete);
  }

  startChapter7LiuBeiHealCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เล่าปี่', text: 'น้องชายกวนอู! ยืนหยัดแหละ!', portraitKey: 'liubei' }
    ], onComplete);
  }

  // --- Tutorial Guidance Steps ---
  getTutorialStepGuide(chapterMode, roundNumber) {
    if (chapterMode === 'story_ch1') {
      if (roundNumber === 1) {
        return { message: "คำแนะนำ: ในแต่ละรอบคุณจะได้พลังงาน (+1 พลังงาน) ลองใส่ 1 พลังงานที่ 'โจมตี' แล้วกด 'ยืนยันการกระทำ'!" };
      } else if (roundNumber === 2) {
        return { message: "คำแนะนำ: คุณสามารถแบ่งพลังงานได้อย่างอิสระ ลองใส่ โจมตี 1 + ป้องกัน 1! เกราะจะช่วยบล็อกพลังงานโจมตีของศัตรู" };
      } else if (roundNumber === 3) {
        return { message: "คำแนะนำ: การ 'สะสมพลัง' จะช่วยเก็บพลังงานไว้ใช้ในรอบถัดไป ลองเลือก ชาร์จ เพื่อสะสมพลังไว้บุกหนัก!" };
      }
    } else if (chapterMode === 'story_ch2') {
      if (roundNumber === 2) {
        return { message: "คำแนะนำ: ศัตรูแต่ละคนมีรูปแบบการต่อสู้ที่แตกต่างกัน จงสังเกตคู่แข่งอย่างระมัดระวัง!" };
      } else if (roundNumber === 3) {
        return { message: "คำแนะนำ: ศัตรูกำลังชาร์จสะสมพลังงาน! ในรอบถัดไปอาจมีการโจมตีที่รุนแรงมาก ควรเตรียมตั้งรับด้วย 'ป้องกัน'!" };
      }
    } else if (chapterMode === 'story_ch3') {
      if (roundNumber === 2) {
        return { message: "คำแนะนำ: จงสังเกตคู่แข่งอย่างรายละเอียด ในบางครั้งการตั้งรับด้วย 'ป้องกัน' อาจแข็งแกร่งกว่าการทุ่มพลังโจมตี!" };
      }
    } else if (chapterMode === 'story_ch4') {
      if (roundNumber === 2) {
        return { message: "คำแนะนำ: เล่าปี่มีพลังโจมตี 90 ซึ่งเน้นการตั้งรับและวางแผนอย่างรอบคอบ! หาก HP ต่ำกว่า 300 พี่น้องร่วมสาบานจะยื่นมือเข้าช่วย!" };
      }
    } else if (chapterMode === 'story_ch5') {
      if (roundNumber === 2) {
        return { message: "บทที่ 5: เมื่อ HP ต่ำกว่า 300 กวนอูและเตียวหุยจะลงมาช่วยพร้อมกัน! (660 ดาเมจรวม + ลด ATK ศัตรู 20%) ช่วยได้เพียงครั้งเดียว" };
      }
    } else if (chapterMode === 'story_ch6') {
      if (roundNumber === 2) {
        return { message: "บทที่ 6: ใช้ 3+ พลังงานโจมตีเพื่อเปิดใช้ง้าวมังกรเขียว (ดาเมจ +20%)! | เมื่อ HP < 50% เตียวหุยจะเพิ่ม ATK 30% (เปิดใช้ได้ครั้งเดียว)" };
      }
    } else if (chapterMode === 'story_ch7') {
      if (roundNumber === 2) {
        return { message: "บทที่ 7: ใช้ Defend 3 เพื่อเปิดใช้ท่าคุณธรรมผู้ยิ่งใหญ่ของเล่าปี่ (ฮีล 300 HP)! | ลิโป้มีพลังพิเศษเมื่อ HP < 50%" };
      }
    }
    return null;
  }

  // --- Mid-Battle Dialogue Triggers ---
  checkMidBattleTriggersCh1(enemyHpPct) {
    if (enemyHpPct < 0.5 && !this.triggeredHp50) {
      this.triggeredHp50 = true;
      this.playCutscene([
        { speaker: 'ทหารโจรผ้าเหลือง', text: 'แก... ฝีมือไม่ธรรมดาอย่างที่คิด!', portraitKey: 'yellowturban' },
        { speaker: 'โจโฉ', text: 'สนามรบเป็นของผู้ที่รู้จักคิดการณ์ไกล', portraitKey: 'caocao' }
      ]);
    } else if (enemyHpPct < 0.2 && !this.triggeredHp20) {
      this.triggeredHp20 = true;
      this.playCutscene([
        { speaker: 'ทหารโจรผ้าเหลือง', text: 'ข้า... ข้าจะมาพ่ายแพ้ตรงนี้ไม่ได้!', portraitKey: 'yellowturban' },
        { speaker: 'โจโฉ', text: 'ถอยทัพไปซะตอนนี้ แล้วข้าจะไว้ชีวิตพวกเจ้า', portraitKey: 'caocao' }
      ]);
    }
  }

  checkMidBattleTriggersCh2(enemyHpPct) {
    if (enemyHpPct < 0.7 && !this.triggeredHp70Ch2) {
      this.triggeredHp70Ch2 = true;
      this.playCutscene([
        { speaker: 'หัวหน้าโจร', text: 'ที่แท้เจ้าคือโจโฉ... มิน่าเล่าถึงมีชื่อเสียงลือลั่น', portraitKey: 'bandit_leader' },
        { speaker: 'โจโฉ', text: 'ข้าไม่ได้สนใจเรื่องชื่อเสียง ข้าสู้เพื่อความเป็นระเบียบเรียบร้อยของบ้านเมือง', portraitKey: 'caocao' }
      ]);
    } else if (enemyHpPct < 0.3 && !this.triggeredHp30Ch2) {
      this.triggeredHp30Ch2 = true;
      this.playCutscene([
        { speaker: 'หัวหน้าโจร', text: 'เป็นไปไม่ได้! ข้าจะมาพ่ายแพ้ตรงนี้ไม่ได้!', portraitKey: 'bandit_leader' },
        { speaker: 'โจโฉ', text: 'ความละโมบของเจ้าจบลงตรงนี้แล้ว', portraitKey: 'caocao' }
      ]);
    }
  }

  checkMidBattleTriggersCh3(enemyHpPct) {
    if (enemyHpPct < 0.7 && !this.triggeredHp70Ch3) {
      this.triggeredHp70Ch3 = true;
      this.playCutscene([
        { speaker: 'หัวหน้าโจรภูเขา', text: 'นี่หรือโจโฉ? ข้าคาดหวังไว้มากกว่านี้เสียอีก', portraitKey: 'mountain_bandit_leader' },
        { speaker: 'โจโฉ', text: 'ลำพังคำพูดไม่อาจชนะศึกได้หรอก', portraitKey: 'caocao' },
        { speaker: 'แฮหัวตุ้น', text: 'นายท่าน... ข้าจะฟันฟาดทุกคนที่ขวางทางท่านเอง', portraitKey: 'xiahou_dun' }
      ]);
    } else if (enemyHpPct < 0.3 && !this.triggeredHp30Ch3) {
      this.triggeredHp30Ch3 = true;
      this.playCutscene([
        { speaker: 'หัวหน้าโจรภูเขา', text: 'ไม่นะ... ข้าจะพ่ายแพ้ไม่ได้!', portraitKey: 'mountain_bandit_leader' },
        { speaker: 'แฮหัวตุ้น', text: 'ความพ่ายแพ้ของเจ้าถูกกำหนดไว้แล้ว', portraitKey: 'xiahou_dun' },
        { speaker: 'โจโฉ', text: 'เผด็จศึกซะ!', portraitKey: 'caocao' }
      ]);
    }
  }

  checkMidBattleTriggersCh4(enemyHpPct) {
    if (enemyHpPct < 0.7 && !this.triggeredHp70Ch4) {
      this.triggeredHp70Ch4 = true;
      this.playCutscene([
        { speaker: 'ผู้บัญชาการโจรผ้าเหลือง', text: 'นี่หรือเล่าปี่? แม่ทัพผู้อ่อนแอที่เอาแต่หลบอยู่หลังผู้อื่นงั้นรึ?', portraitKey: 'yellowturban_commander' },
        { speaker: 'เล่าปี่', text: 'ผู้นำที่แท้จริง ไม่ได้รบเพียงลำพัง!', portraitKey: 'liubei' }
      ]);
    } else if (enemyHpPct < 0.3 && !this.triggeredHp30Ch4) {
      this.triggeredHp30Ch4 = true;
      this.playCutscene([
        { speaker: 'เล่าปี่', text: 'ความแข็งแกร่ง ไม่ได้วัดกันที่คมดาบเพียงอย่างเดียว... แต่วัดจากผู้คนที่ยืนหยัดอยู่เคียงข้างท่านต่างหาก!', portraitKey: 'liubei' }
      ]);
    }
  }

  checkMidBattleTriggersCh5(enemyHpPct) {
    if (enemyHpPct < 0.7 && !this.triggeredHp70Ch5) {
      this.triggeredHp70Ch5 = true;
      this.playCutscene([
        { speaker: 'ผู้บัญชาการโจรผ้าเหลือง', text: 'พวกแกสามคนคิดว่าจะชนะกองทัพข้าได้งั้นรึ?', portraitKey: 'yellowturban_commander' },
        { speaker: 'เตียวหุย', text: 'เราไม่ต้องการกองทัพ! เรามีกัน!', portraitKey: 'zhangfei' },
        { speaker: 'กวนอู', text: 'อย่าประมาทความมุ่งมั่นของเรา', portraitKey: 'guanyu' }
      ]);
    } else if (enemyHpPct < 0.3 && !this.triggeredHp30Ch5) {
      this.triggeredHp30Ch5 = true;
      this.playCutscene([
        { speaker: 'ผู้บัญชาการโจรผ้าเหลือง', text: 'ทำไมพวกแกยังไม่ล้ม?!', portraitKey: 'yellowturban_commander' },
        { speaker: 'เล่าปี่', text: 'เพราะเรายืนหยัดด้วยกัน', portraitKey: 'liubei' }
      ]);
    }
  }

  checkMidBattleTriggersCh6(enemyHpPct) {
    if (enemyHpPct < 0.5 && !this.triggeredHp50Ch6) {
      this.triggeredHp50Ch6 = true;
      this.playCutscene([
        { speaker: 'กองหน้าตั๋งโต๊ะ', text: 'พวกแกไม่อาจหยุดลอร์ดตั๋งโต๊ะได้!', portraitKey: 'dongzhuo_vanguard' },
        { speaker: 'กวนอู', text: 'เราจะปกป้องประชาชน', portraitKey: 'guanyu' }
      ]);
    }
  }

  checkMidBattleTriggersCh7(enemyHpPct, playerHpPct) {
    // Lü Bu Unstoppable trigger at 50% HP
    if (enemyHpPct < 0.5 && !this.triggeredHp50Ch7) {
      this.triggeredHp50Ch7 = true;
      this.playCutscene([
        { speaker: 'ลิโป้', text: 'ตอนนี้...', portraitKey: 'lubu' },
        { speaker: 'ลิโป้', text: 'ข้าจะแสดงพลังที่แท้จริงให้ดู', portraitKey: 'lubu' }
      ]);
    }

    // Guan Yu low HP trigger
    if (playerHpPct < 0.2 && !this.triggeredHpLowCh7) {
      this.triggeredHpLowCh7 = true;
      this.playCutscene([
        { speaker: 'กวนอู', text: 'ข้าจะไม่ล้ม', portraitKey: 'guanyu' }
      ]);
    }
  }

  resetTriggers() {
    this.triggeredHp50 = false;
    this.triggeredHp20 = false;
    this.triggeredHp70Ch2 = false;
    this.triggeredHp30Ch2 = false;
    this.triggeredHp70Ch3 = false;
    this.triggeredHp30Ch3 = false;
    this.triggeredHp70Ch4 = false;
    this.triggeredHp30Ch4 = false;
    this.triggeredHp70Ch5 = false;
    this.triggeredHp30Ch5 = false;
    this.triggeredHp50Ch6 = false;
    this.triggeredHp70Ch6 = false;
    this.triggeredHp30Ch6 = false;
    this.triggeredHp50Ch7 = false;
    this.triggeredHpLowCh7 = false;
  }
}
