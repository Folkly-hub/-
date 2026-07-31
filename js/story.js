/**
 * Story Mode Chapters 1 - 5 System (Thai Localized)
 * Chapter 1: "จุดเริ่มต้นแห่งความโกลาหล"
 * Chapter 2: "โจรแห่งหุบเขา"
 * Chapter 3: "ขุนศึกผู้ภักดี"
 * Chapter 4: "คำสาบานในสวนท้อ"
 * Chapter 5: "การรวมตัวของสามพี่น้อง"
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

    this.initDOM();
  }

  initDOM() {
    const btnNext = document.getElementById('btn-dialogue-next');
    const btnSkip = document.getElementById('btn-dialogue-skip');

    if (btnNext) btnNext.addEventListener('click', () => this.nextDialogue());
    if (btnSkip) btnSkip.addEventListener('click', () => this.skipCutscene());
  }

  playCutscene(dialogues, onComplete) {
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

  // --- Chapter 5 Cutscenes (Oath Brothers Unite & Zhang Fei Passive) ---
  startChapter5Opening(onComplete) {
    this.playCutscene([
      { speaker: 'เล่าปี่', text: 'อีกหมู่บ้านหนึ่งที่ต้องรับความเดือดร้อนเพราะสงคราม... พวกเราไม่อาจนิ่งดูดายได้', portraitKey: 'liubei' },
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ! โจรพวกนี้คือใครกัน? กล้าทำร้ายประชาชนผู้บริสุทธิ์งั้นรึ!', portraitKey: 'zhangfei' },
      { speaker: 'เล่าปี่', text: 'ท่านคือใคร?', portraitKey: 'liubei' },
      { speaker: 'เตียวหุย', text: 'ข้าชื่อเตียวหุย! ข้าเกลียดพวกกร่างรังแกคนอ่อนแอที่สุด!', portraitKey: 'zhangfei' },
      { speaker: 'กวนอู', text: 'ชายผู้นี้มีจิตวิญญาณแห่งยอดนักรบแท้จริง', portraitKey: 'guanyu' }
    ], onComplete);
  }

  startZhangFeiRescueCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เตียวหุย', text: 'ย๊ากก! หลบไปก่อนพี่ใหญ่! เจ้าพวกโจรหน้าไหนมันกล้าทำร้ายพี่ชายข้า!', portraitKey: 'zhangfei' },
      { speaker: 'ผู้บัญชาการกลุ่มโจร', text: 'อ๊าก! เสียงคำรามนั่นมันอะไรกัน?!', portraitKey: 'bandit_commander' }
    ], onComplete);
  }

  startZhangFeiPostAttackCutscene(onComplete) {
    this.playCutscene([
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ! โดนพลังคำรามสะท้านแผ่นดินของข้าเข้าไปเป็นไงบ้าง!', portraitKey: 'zhangfei' },
      { speaker: 'เล่าปี่', text: 'ขอบใจมากน้องสาม!', portraitKey: 'liubei' }
    ], onComplete);
  }

  startChapter5Victory(onComplete) {
    this.playCutscene([
      { speaker: 'เตียวหุย', text: 'ฮ่าๆๆ! สนุกจริงๆ!', portraitKey: 'zhangfei' },
      { speaker: 'กวนอู', text: 'ท่านเป็นนักรบที่แข็งแกร่งมาก', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: 'พวกท่านสองคนน่าสนใจดี ข้าขอร่วมเดินทางไปกับพวกท่านด้วย!', portraitKey: 'zhangfei' },
      { speaker: 'เล่าปี่', text: 'แม้พวกเราจะมาจากสถานที่ต่างกัน...', portraitKey: 'liubei' },
      { speaker: 'กวนอู', text: '...แต่หัวใจของเราเป็นหนึ่งเดียวกัน', portraitKey: 'guanyu' },
      { speaker: 'เตียวหุย', text: 'ตั้งแต่วันนี้เป็นต้นไป... พวกเราจะร่วมรบด้วยกัน!', portraitKey: 'zhangfei' },
      { speaker: 'ผู้บรรยาย', text: '🌸 กำเนิดสามพี่น้องร่วมสาบาน (The Three Brothers Are Born) 🌸', portraitKey: 'liubei' },
      { speaker: 'ทหาร', text: 'นายท่าน! มีสามนักรบปรากฏตัวขึ้นทางภาคใต้ครับ', portraitKey: 'soldier' },
      { speaker: 'โจโฉ', text: 'สามพี่น้องงั้นรึ... ใต้หล้าเริ่มน่าสนใจขึ้นเรื่อยๆ แล้วสิ', portraitKey: 'caocao' }
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
        return { message: "บทที่ 5: พาสซีฟ 'ความกริ้วของเตียวหุย' จะทำงานเมื่อ HP ต่ำกว่า 50%! เตียวหุยจะปล่อยเสียงคำรามสะท้านแผ่นดิน (300 ดาเมจ)!" };
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
        { speaker: 'ผู้บัญชาการกลุ่มโจร', text: 'มากันแค่สามคนเนี่ยนะ? คิดว่าจะล้มพวกเราได้รึไง!', portraitKey: 'bandit_commander' },
        { speaker: 'เตียวหุย', text: 'แค่สามคนก็เกินพอแล้วเว้ย!', portraitKey: 'zhangfei' }
      ]);
    } else if (enemyHpPct < 0.3 && !this.triggeredHp30Ch5) {
      this.triggeredHp30Ch5 = true;
      this.playCutscene([
        { speaker: 'ผู้บัญชาการกลุ่มโจร', text: 'เป็นไปไม่ได้...', portraitKey: 'bandit_commander' },
        { speaker: 'เล่าปี่', text: 'พวกเรารบ เพราะผู้คนต้องการเรา!', portraitKey: 'liubei' }
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
  }
}
