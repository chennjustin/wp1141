// 遊戲配置管理類別
export class GameConfig {
  // 玩家配置
  static readonly PLAYER = {
    RADIUS: 15,
    SPEED: 4,  // 剛好能比慢怪快一點，但比快怪慢一點
    MAX_HP: 100,  // 大約能承受 10-15 次敵人攻擊
    MONEY: 0
  };

  // 敵人配置
  static readonly ENEMIES = {
    mask_dude: {
      BASE_HP: 15,        // 3發子彈能殺死 (weapon_R1傷害5)
      HP_PER_WAVE: 5,     // 每波增加5點HP
      BASE_SPEED: 2.8,    
      SPEED_PER_WAVE: 0.1,
      DAMAGE: 5,         // 對玩家造成10點傷害
      REWARD: 5,
      RADIUS: 25,
      UNLOCK_WAVE: 1,
      SPAWN_INTERVAL_MS: 1300,  // 每1秒出1隻
      MAX_ON_SCREEN: 15         // 場上最多15隻
    },
    ninja_frog: {
      BASE_HP: 30,        // weapon_R1要6發，武器升級後大概3-4發
      HP_PER_WAVE: 8,
      BASE_SPEED: 2,    // 比玩家快，逼玩家走位
      SPEED_PER_WAVE: 0.15,
      DAMAGE: 10,
      REWARD: 15,
      RADIUS: 28,
      UNLOCK_WAVE: 2,
      SPAWN_INTERVAL_MS: 3000,  // 每3秒出1隻
      MAX_ON_SCREEN: 8          // 場上最多8隻
    },
    pink_man: {
      BASE_HP: 60,        // 需要高攻擊武器或散彈
      HP_PER_WAVE: 12,
      BASE_SPEED: 1.0,    // 很慢，但硬扛
      SPEED_PER_WAVE: 0.05,
      DAMAGE: 20,
      REWARD: 20,
      RADIUS: 30,
      UNLOCK_WAVE: 3,
      SPAWN_INTERVAL_MS: 5000,  // 每5秒出1隻
      MAX_ON_SCREEN: 5          // 場上最多5隻
    },
    virtual_guy: {
      BASE_HP: 100,       // 精英怪，需要專注火力
      HP_PER_WAVE: 20,
      BASE_SPEED: 2.0,    // 適中，但因為血厚壓力大
      SPEED_PER_WAVE: 0.1,
      DAMAGE: 25,
      REWARD: 25,
      RADIUS: 32,
      UNLOCK_WAVE: 4,
      SPAWN_INTERVAL_MS: 7000,  // 每7秒出1隻
      MAX_ON_SCREEN: 3          // 場上最多3隻
    }
  };

  // 武器配置
  static readonly WEAPONS = {
    weapon_R1: {
      DAMAGE: 5,               // 基準武器，清小怪用
      ATTACK_INTERVAL_MS: 400, // 0.4s per shot (2.5發/秒)
      RANGE: 200,
      COST: 100,
      PELLETS: 1
    },
    weapon_R2: {
      DAMAGE: 2,               // 速射清雜魚
      ATTACK_INTERVAL_MS: 100, // 0.1s per shot (≈10發/秒)
      RANGE: 200,
      COST: 100,
      PELLETS: 1
    },
    weapon_R3: {
      DAMAGE: 3,               // 一發能清一群，但單體效率低
      ATTACK_INTERVAL_MS: 500, // 1.0s per shot (1發/秒)
      RANGE: 800,
      COST: 100,
      PELLETS: 3  // 3 pellets per shot (4×3散彈)
    }
  };

  // 子彈配置
  static readonly PROJECTILE = {
    RADIUS: 3,
    SPEED: 14
  };

  // 遊戲配置
  static readonly GAME = {
    WAVE_DURATION_MS: 30000, // 30秒每波
    ENEMY_SPAWN_INTERVAL_MS: 2000, // 預設生成間隔（會被各敵人類型覆蓋）
    MAX_ENEMIES_PER_WAVE: 25, // 場上同時存在上限：15-25隻
    WAVE_SCALING: 0.15, // 每波敵人HP與速度都小幅上升（15%）
    ENEMIES_PER_WAVE_TARGET: 30 // 每波目標擊殺數：20-40隻
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
    SPEED: 1,  // 旋轉速度 (0.1 = 慢，0.3 = 快)
  };

  // 升級系統配置
  static readonly UPGRADES = {
    TRAITS: {
      ATTACK_DAMAGE: { name: 'Attack Damage', value: 0.15 },  // +15% 傷害
      ATTACK_SPEED: { name: 'Attack Speed', value: 0.12 },    // +12% 攻速
      MAX_HP: { name: 'Max HP', value: 0.10 },                // +10% HP
      MOVE_SPEED: { name: 'Move Speed', value: 0.08 }         // +8% 移速
    },
    WEAPON_TRAITS: {
      weapon_R1: ['ATTACK_DAMAGE', 'ATTACK_SPEED'],  // R1 → 攻擊力+15% / 攻速+12%
      weapon_R2: ['ATTACK_DAMAGE', 'MOVE_SPEED'],    // R2 → 攻擊力+15% / 移速+8%
      weapon_R3: ['ATTACK_DAMAGE', 'MAX_HP']         // R3 → 攻擊力+15% / HP+10%
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
