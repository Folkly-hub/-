/**
 * CharacterRegistry - Central Character Identity & Configuration System
 * 
 * Serves as the single source of truth connecting:
 * Story Mode Character -> Character ID -> Battle Character -> 3D Character Model -> 3D Animation
 */
class CharacterRegistry {
  constructor() {
    this.characters = new Map();
    
    // Default fallback configuration for characters without a 3D model or unknown IDs
    this.defaultFallback = {
      id: 'fallback',
      name: 'Guan Yu',
      modelKey: 'guanYu',
      animationKey: 'guanYu',
      has3DModel: false,
      isFallback: true
    };

    this._initRegistry();
  }

  /**
   * Initialize character registry with existing and future character profiles
   */
  _initRegistry() {
    // -------------------------------------------------------------------------
    // Existing 3D Characters — real procedural mesh builders in Combat3DScene
    // -------------------------------------------------------------------------
    this.register({
      id: 'guanYu',
      name: 'Guan Yu',
      modelKey: 'guanYu',
      animationKey: 'guanYu',
      has3DModel: true
    });

    this.register({
      id: 'luBu',
      name: 'Lu Bu',
      modelKey: 'luBu',
      animationKey: 'luBu',
      has3DModel: true
    });

    // -------------------------------------------------------------------------
    // Story Mode Characters — real procedural 3D meshes added in Combat3DScene
    // -------------------------------------------------------------------------
    this.register({
      id: 'liuBei',
      name: 'Liu Bei',
      modelKey: 'liuBei',
      animationKey: 'liuBei',
      has3DModel: true
    });

    this.register({
      id: 'caoCao',
      name: 'Cao Cao',
      modelKey: 'caoCao',
      animationKey: 'caoCao',
      has3DModel: true
    });

    this.register({
      id: 'xiahouDun',
      name: 'Xiahou Dun',
      modelKey: 'xiahouDun',
      animationKey: 'xiahouDun',
      has3DModel: true,
      portraitKey: 'xiahou_dun'
    });

    this.register({
      id: 'banditLeader',
      name: 'Bandit Leader',
      modelKey: 'banditLeader',
      animationKey: 'banditLeader',
      has3DModel: true,
      portraitKey: 'bandit_leader'
    });

    this.register({
      id: 'mountainBanditLeader',
      name: 'Mountain Bandit Leader',
      modelKey: 'mountainBanditLeader',
      animationKey: 'mountainBanditLeader',
      has3DModel: true,
      portraitKey: 'mountain_bandit_leader'
    });

    this.register({
      id: 'yellowTurbanCommander',
      name: 'Yellow Turban Commander',
      modelKey: 'yellowTurbanCommander',
      animationKey: 'yellowTurbanCommander',
      has3DModel: true,
      portraitKey: 'yellowturban_commander'
    });

    this.register({
      id: 'dongZhuoVanguard',
      name: 'Dong Zhuo Vanguard',
      modelKey: 'dongZhuoVanguard',
      animationKey: 'dongZhuoVanguard',
      has3DModel: true,
      portraitKey: 'dongzhuo_vanguard'
    });

    // -------------------------------------------------------------------------
    // Other Characters — no real 3D model yet, will use placeholder safely
    // -------------------------------------------------------------------------
    this.register({
      id: 'zhangFei',
      name: 'Zhang Fei',
      modelKey: null,
      animationKey: null,
      has3DModel: false
    });

    this.register({
      id: 'zhaoYun',
      name: 'Zhao Yun',
      modelKey: null,
      animationKey: null,
      has3DModel: false
    });

    this.register({
      id: 'diaoChan',
      name: 'Diao Chan',
      modelKey: null,
      animationKey: null,
      has3DModel: false
    });

    this.register({
      id: 'yellowTurban',
      name: 'Yellow Turban',
      modelKey: null,
      animationKey: null,
      has3DModel: false,
      portraitKey: 'yellowturban'
    });
  }

  /**
   * Register or update a character configuration
   * @param {Object} config - Character configuration object
   */
  register(config) {
    if (!config || !config.id) {
      console.warn('CharacterRegistry: Invalid character configuration provided.');
      return;
    }

    const characterEntry = {
      id: config.id,
      name: config.name || config.id,
      modelKey: config.modelKey || null,
      animationKey: config.animationKey || null,
      has3DModel: !!(config.has3DModel || (config.modelKey && config.animationKey))
    };

    this.characters.set(config.id, characterEntry);
    
    // Also register lower-case lookup key for tolerance (e.g., 'guanyu' -> 'guanYu')
    const lowerId = config.id.toLowerCase();
    if (lowerId !== config.id && !this.characters.has(lowerId)) {
      this.characters.set(lowerId, characterEntry);
    }
  }

  /**
   * Get raw character configuration by ID
   * @param {string} characterId 
   * @returns {Object|null}
   */
  get(characterId) {
    if (!characterId) return this.get3DConfig(characterId);
    
    if (this.characters.has(characterId)) {
      return this.characters.get(characterId);
    }

    const lowerId = String(characterId).toLowerCase();
    if (this.characters.has(lowerId)) {
      return this.characters.get(lowerId);
    }

    return null;
  }

  /**
   * Get 3D Model / Animation Configuration for a character.
   * If the character does not have a registered 3D model or is unknown:
   * - Logs a clear warning
   * - Returns safe fallback configuration without crashing the game
   * 
   * @param {string} characterId 
   * @returns {Object} 3D character configuration with valid modelKey and animationKey
   */
  get3DConfig(characterId) {
    const char = this.get(characterId);

    if (char && char.has3DModel && char.modelKey && char.animationKey) {
      return char;
    }

    // Safety fallback & warning when 3D model is missing or unregistered
    const displayId = characterId || 'unknown';
    console.warn(`Character "${displayId}" does not have a 3D model registered yet.\nUsing fallback configuration.`);

    return {
      ...this.defaultFallback,
      id: displayId,
      name: char ? char.name : displayId
    };
  }

  /**
   * Check if a character ID exists in the registry
   * @param {string} characterId 
   * @returns {boolean}
   */
  has(characterId) {
    if (!characterId) return false;
    return this.characters.has(characterId) || this.characters.has(String(characterId).toLowerCase());
  }

  /**
   * Check if a character has an active 3D model implementation
   * @param {string} characterId 
   * @returns {boolean}
   */
  has3DModel(characterId) {
    const char = this.get(characterId);
    return !!(char && char.has3DModel);
  }

  /**
   * Get list of all registered character IDs
   * @returns {Array<string>}
   */
  getAllCharacterIds() {
    return Array.from(new Set(Array.from(this.characters.values()).map(c => c.id)));
  }
}

// Global Singleton Instance (Browser environment)
if (typeof window !== 'undefined') {
  window.CharacterRegistry = new CharacterRegistry();
}

// Export for Node.js environment verification testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterRegistry;
}
