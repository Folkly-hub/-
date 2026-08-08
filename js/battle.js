/**
 * Battle Logic & System Architecture
 * Handles character state, formulas, simultaneous battle resolution, and energy accounting.
 */

class Character {
  constructor(id, name, maxHp, atk, portraitKey, characterId = null) {
    this.id = id;
    this.name = name;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.baseAtk = atk;
    this.atk = atk;
    
    // Energy reserves
    this.currentEnergy = 0;
    this.shield = 0;
    this.preservedCharge = 0;
    this.portraitKey = portraitKey;
    this.characterId = characterId || (portraitKey === 'lubu' ? 'luBu' : (portraitKey === 'guanyu' ? 'guanYu' : portraitKey));

    // Special Power System
    this.guanYuSpecialPowerActivated = false;
    this.zhangFeiSpecialPowerActivated = false;
  }

  // Reset player state for a fresh match
  reset() {
    this.hp = this.maxHp;
    this.atk = this.baseAtk;
    this.currentEnergy = 0;
    this.shield = 0;
    this.preservedCharge = 0;
    this.guanYuSpecialPowerActivated = false;
    this.zhangFeiSpecialPowerActivated = false;
  }

  // Add round bonus and update energy pool
  startNewRound(roundNumber) {
    // Energy for new round = previous unspent energy + preserved charge + round bonus gain
    const roundGain = roundNumber;
    this.currentEnergy += this.preservedCharge + roundGain;
    this.preservedCharge = 0;
    this.shield = 0; // Shield resets at start of round
  }

  // Take damage
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  isDefeated() {
    return this.hp <= 0;
  }
}

class BattleSystem {
  /**
   * Resolve combat round simultaneously according to exact game formulas.
   * 
   * @param {Character} p1 
   * @param {Object} p1Allocation { attack, defend, charge, unused }
   * @param {Character} p2 
   * @param {Object} p2Allocation { attack, defend, charge, unused }
   * @returns {Object} Combat log details for animation and UI update
   */
  static resolveRound(p1, p1Allocation, p2, p2Allocation) {
    // 1. Process Shield Generation (Defend Energy = Shield)
    p1.shield = p1Allocation.defend;
    p2.shield = p2Allocation.defend;

    // 2. Calculate P1 Attack on P2 with Special Power consideration
    // Shield blocks Attack Energy, NOT raw damage!
    const p1BlockedEnergy = Math.min(p1Allocation.attack, p2.shield);
    const p1RemainingAtkEnergy = Math.max(0, p1Allocation.attack - p1BlockedEnergy);
    let p1Damage = p1.atk * p1RemainingAtkEnergy;
    
    // Guan Yu Special Power: Green Dragon Slash (20% damage bonus with 3+ Energy)
    let p1SpecialPowerActivated = false;
    if (p1.portraitKey === 'guanyu' && p1Allocation.attack >= 3 && !p1.specialPowerActivated) {
      p1Damage = Math.floor(p1Damage * 1.2);
      p1SpecialPowerActivated = true;
      p1.specialPowerActivated = true;
    }

    // 3. Calculate P2 Attack on P1 with Special Power consideration
    const p2BlockedEnergy = Math.min(p2Allocation.attack, p1.shield);
    const p2RemainingAtkEnergy = Math.max(0, p2Allocation.attack - p2BlockedEnergy);
    let p2Damage = p2.atk * p2RemainingAtkEnergy;
    
    // Guan Yu Special Power for P2
    let p2SpecialPowerActivated = false;
    if (p2.portraitKey === 'guanyu' && p2Allocation.attack >= 3 && !p2.specialPowerActivated) {
      p2Damage = Math.floor(p2Damage * 1.2);
      p2SpecialPowerActivated = true;
      p2.specialPowerActivated = true;
    }

    // 4. Update HP simultaneously
    p1.takeDamage(p2Damage);
    p2.takeDamage(p1Damage);

    // 5. Update Carried & Preserved Energy for next round
    // Unused energy carries over; Charge energy is preserved.
    p1.currentEnergy = p1Allocation.unused;
    p1.preservedCharge = p1Allocation.charge;

    p2.currentEnergy = p2Allocation.unused;
    p2.preservedCharge = p2Allocation.charge;

    // Return detailed resolution outcome for animation & renderer
    return {
      p1Result: {
        attackEnergy: p1Allocation.attack,
        blockedEnergy: p1BlockedEnergy,
        remainingEnergy: p1RemainingAtkEnergy,
        damageDealt: p1Damage,
        damageReceived: p2Damage,
        shieldCreated: p1Allocation.defend,
        chargeSpent: p1Allocation.charge,
        unusedKept: p1Allocation.unused,
        specialPowerActivated: p1SpecialPowerActivated
      },
      p2Result: {
        attackEnergy: p2Allocation.attack,
        blockedEnergy: p2BlockedEnergy,
        remainingEnergy: p2RemainingAtkEnergy,
        damageDealt: p2Damage,
        damageReceived: p1Damage,
        shieldCreated: p2Allocation.defend,
        chargeSpent: p2Allocation.charge,
        unusedKept: p2Allocation.unused,
        specialPowerActivated: p2SpecialPowerActivated
      }
    };
  }
}
