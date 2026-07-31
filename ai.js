/**
 * Advanced AI Engine for Practice Mode with Distinct Skill Levels
 * Easy, Medium, and Hard (Tactical Grandmaster)
 */

class AIEngine {
  /**
   * Decide action allocation based on selected difficulty level
   * @param {string} difficulty - 'easy', 'medium', 'hard'
   * @param {Character} aiChar - AI Character instance
   * @param {Character} opponentChar - Human Opponent Character instance
   * @returns {Object} { attack, defend, charge, unused }
   */
  static chooseAllocation(difficulty, aiChar, opponentChar) {
    if (difficulty === 'easy') {
      return this.easyAI(aiChar, opponentChar);
    } else if (difficulty === 'hard') {
      return this.hardAI(aiChar, opponentChar);
    } else {
      return this.mediumAI(aiChar, opponentChar);
    }
  }

  // 🟢 Easy AI: Naive, sub-optimal distribution, wastefully leaves unused energy
  static easyAI(aiChar, opponentChar) {
    let available = aiChar.currentEnergy;
    if (available <= 0) return { attack: 0, defend: 0, charge: 0, unused: 0 };

    let attack = 0;
    let defend = 0;
    let charge = 0;

    // Easy AI does not calculate lethal damage and randomly splits
    const roll = Math.random();
    if (roll < 0.5) {
      attack = Math.max(1, Math.floor(available * 0.5));
      available -= attack;
      // Leaves some energy unspent wastefully
      if (available > 1 && Math.random() < 0.5) {
        charge = 1;
        available -= 1;
      }
    } else {
      defend = Math.max(1, Math.floor(available * 0.4));
      available -= defend;
      attack = Math.min(available, 1);
      available -= attack;
    }

    return { attack, defend, charge, unused: Math.max(0, available) };
  }

  // 🟡 Medium AI: Balanced strategic distribution
  static mediumAI(aiChar, opponentChar) {
    let availableEnergy = aiChar.currentEnergy;
    let attack = 0;
    let defend = 0;
    let charge = 0;

    if (availableEnergy <= 0) {
      return { attack: 0, defend: 0, charge: 0, unused: 0 };
    }

    const aiHpPct = aiChar.hp / aiChar.maxHp;
    const oppHpPct = opponentChar.hp / opponentChar.maxHp;

    // Lethal check: Can finish opponent right now?
    const lethalAttackEnergy = Math.ceil(opponentChar.hp / aiChar.atk);
    if (availableEnergy >= lethalAttackEnergy) {
      attack = lethalAttackEnergy;
      availableEnergy -= attack;
      return { attack, defend: 0, charge: 0, unused: availableEnergy };
    }

    // Defensive priority when low HP
    if (aiHpPct < 0.4 && opponentChar.currentEnergy > 1) {
      defend = Math.min(availableEnergy, Math.ceil(availableEnergy * 0.5));
      availableEnergy -= defend;
    }

    if (availableEnergy > 0) {
      if (oppHpPct < 0.5) {
        attack = availableEnergy;
        availableEnergy = 0;
      } else {
        const toAttack = Math.floor(availableEnergy * 0.6);
        attack = toAttack;
        availableEnergy -= attack;

        charge = availableEnergy;
        availableEnergy = 0;
      }
    }

    return { attack, defend, charge, unused: 0 };
  }

  // 🔴 Hard AI: Grandmaster Tactical AI (Predictive Counter & Burst Combos)
  static hardAI(aiChar, opponentChar) {
    let available = aiChar.currentEnergy;
    if (available <= 0) return { attack: 0, defend: 0, charge: 0, unused: 0 };

    let attack = 0;
    let defend = 0;
    let charge = 0;

    // 1. Instantly check for Lethal Finish
    const lethalNeeded = Math.ceil(opponentChar.hp / aiChar.atk);
    if (available >= lethalNeeded) {
      return { attack: lethalNeeded, defend: 0, charge: 0, unused: available - lethalNeeded };
    }

    // 2. Threat & Lethal Defense Analysis
    const maxPlayerAtkEnergy = opponentChar.currentEnergy;
    const maxPlayerPotentialDamage = maxPlayerAtkEnergy * opponentChar.atk;

    // If human player can deal lethal damage to AI, Hard AI MUST calculate precise Shield!
    if (maxPlayerPotentialDamage >= aiChar.hp && maxPlayerAtkEnergy > 0) {
      // Calculate exact minimum Shield energy required so AI survives
      const minShieldNeeded = Math.min(available, maxPlayerAtkEnergy);
      defend = minShieldNeeded;
      available -= defend;
    } else if (opponentChar.currentEnergy >= 3) {
      // Player has high energy pool (>= 3). Hard AI predicts heavy attack and sets up 2-3 Shields
      defend = Math.min(available, Math.min(3, opponentChar.currentEnergy - 1));
      available -= defend;
    }

    // 3. Counter Attack or Charge Burst Build
    if (available > 0) {
      const oppHpPct = opponentChar.hp / opponentChar.maxHp;
      const aiHpPct = aiChar.hp / aiChar.maxHp;

      if (oppHpPct <= 0.4 || aiHpPct < oppHpPct) {
        // Aggressive Push: All remaining energy to Attack!
        attack = available;
        available = 0;
      } else if (aiChar.currentEnergy >= 4) {
        // High energy burst: 75% Attack, 25% Charge
        attack = Math.ceil(available * 0.75);
        available -= attack;
        charge = available;
        available = 0;
      } else {
        // Build up energy for future turn burst
        charge = Math.ceil(available * 0.6);
        available -= charge;
        attack = available;
        available = 0;
      }
    }

    return { attack, defend, charge, unused: 0 };
  }
}
