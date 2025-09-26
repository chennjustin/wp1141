// 遊戲配置管理類別
export class GameConfig {
  // 玩家配置
  static readonly PLAYER = {
    RADIUS: 20,
    SPEED: 4,
    MAX_HP: 100,
    MONEY: 0
  };

  // 敵人配置
  static readonly ENEMIES = {
    mask_dude: {
      BASE_HP: 20,
      HP_PER_WAVE: 10,
      BASE_SPEED: 2.0,
      SPEED_PER_WAVE: 0.2,
      DAMAGE: 1,
      REWARD: 5,
      RADIUS: 25,
      UNLOCK_WAVE: 1
    },
    ninja_frog: {
      BASE_HP: 40,
      HP_PER_WAVE: 15,
      BASE_SPEED: 1.6,
      SPEED_PER_WAVE: 0.15,
      DAMAGE: 2,
      REWARD: 15,
      RADIUS: 28,
      UNLOCK_WAVE: 2
    },
    pink_man: {
      BASE_HP: 60,
      HP_PER_WAVE: 20,
      BASE_SPEED: 10,
      SPEED_PER_WAVE: 0.05,
      DAMAGE: 3,
      REWARD: 20,
      RADIUS: 30,
      UNLOCK_WAVE: 3
    },
    virtual_guy: {
      BASE_HP: 80,
      HP_PER_WAVE: 40,
      BASE_SPEED: 5,
      SPEED_PER_WAVE: 0.1,
      DAMAGE: 4,
      REWARD: 25,
      RADIUS: 32,
      UNLOCK_WAVE: 4
    }
  };

  // 武器配置
  static readonly WEAPONS = {
    weapon_R1: {
      DAMAGE: 5,
      ATTACK_INTERVAL_MS: 800,  // 0.8s per shot
      RANGE: 150,
      COST: 50,
      PELLETS: 1
    },
    weapon_R2: {
      DAMAGE: 3,
      ATTACK_INTERVAL_MS: 200,  // 0.2s per shot
      RANGE: 120,
      COST: 100,
      PELLETS: 1
    },
    weapon_R3: {
      DAMAGE: 4,
      ATTACK_INTERVAL_MS: 1200, // 1.2s per shot
      RANGE: 100,
      COST: 150,
      PELLETS: 3  // 3 pellets per shot
    }
  };

  // 子彈配置
  static readonly PROJECTILE = {
    RADIUS: 3,
    SPEED: 8
  };

  // 遊戲配置
  static readonly GAME = {
    WAVE_DURATION_MS: 30000, // 30秒
    ENEMY_SPAWN_INTERVAL_MS: 2000, // 2秒生成一個敵人
    MAX_ENEMIES_PER_WAVE: 50
  };

  // 動畫配置
  static readonly ANIMATION = {
    PLAYER_IDLE_INTERVAL: 400,
    PLAYER_WALK_INTERVAL: 120,
    PLAYER_DIE_INTERVAL: 180,
    PLAYER_VICTORY_INTERVAL: 140,
    ENEMY_INTERVAL: 200,
    ENEMY_DISAPPEAR_INTERVAL: 100,
    WEAPON_SHOOT_DURATION: 200
  };

  // 武器位置配置
  static readonly WEAPON_POSITIONS = {
    // 武器索引對應的位置偏移 (相對於玩家中心)
    0: { x: 25, y: 15 },    // 右手
    1: { x: -25, y: 15 },   // 左手
    2: { x: 0, y: -8 },   // 上方
    3: { x: 0, y: 12 },   // 下方
    4: { x: 6, y: -6 },   // 右上對角
    5: { x: -6, y: -6 },  // 左上對角
  };

  // 武器邊緣偏移配置 (用於子彈發射位置)
  static readonly WEAPON_EDGE_OFFSETS = {
    0: { x: 15, y: 0 },     // 右手 - 從右側邊緣發射
    1: { x: -15, y: 0 },    // 左手 - 從左側邊緣發射
    2: { x: 0, y: -15 },    // 上方 - 從上側邊緣發射
    3: { x: 0, y: 15 },     // 下方 - 從下側邊緣發射
    4: { x: 10, y: -10 },   // 右上對角 - 從右上邊緣發射
    5: { x: -10, y: -10 },  // 左上對角 - 從左上邊緣發射
  };

  // 武器大小配置 (根據武器類型)
  static readonly WEAPON_TYPE_SCALES = {
    weapon_R1: 0.03,  // 預設大小
    weapon_R2: 0.04,  // 更大
    weapon_R3: 0.04,  // 更大
  };

  // 武器旋轉配置
  static readonly WEAPON_ROTATION = {
    SPEED: 0.3,  // 旋轉速度 (0.1 = 慢，0.3 = 快)
  };

  // 升級系統配置
  static readonly UPGRADES = {
    TRAITS: {
      ATTACK_DAMAGE: { name: 'Attack Damage', value: 1 },  // +100%
      ATTACK_SPEED: { name: 'Attack Speed', value: 0.12 },    // +12%
      MAX_HP: { name: 'Max HP', value: 0.10 },                // +10%
      MOVE_SPEED: { name: 'Move Speed', value: 0.1 }         // +8%
    },
    WEAPON_TRAITS: {
      weapon_R1: ['ATTACK_DAMAGE', 'ATTACK_SPEED'],
      weapon_R2: ['ATTACK_DAMAGE', 'MOVE_SPEED'],
      weapon_R3: ['ATTACK_DAMAGE', 'MAX_HP']
    }
  };

  // 獲取敵人配置
  static getEnemyConfig(type: string) {
    switch (type) {
      case 'mask_dude':
        return this.ENEMIES.mask_dude;
      case 'ninja_frog':
        return this.ENEMIES.ninja_frog;
      case 'pink_man':
        return this.ENEMIES.pink_man;
      case 'virtual_guy':
        return this.ENEMIES.virtual_guy;
      default:
        return this.ENEMIES.mask_dude;
    }
  }

  // 獲取武器配置
  static getWeaponConfig(type: string) {
    switch (type) {
      case 'weapon_R1':
        return this.WEAPONS.weapon_R1;
      case 'weapon_R2':
        return this.WEAPONS.weapon_R2;
      case 'weapon_R3':
        return this.WEAPONS.weapon_R3;
      default:
        return this.WEAPONS.weapon_R1;
    }
  }
}
