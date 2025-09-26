# 遊戲架構說明

## 📁 專案結構

```
src/
├── game/                          # 遊戲核心邏輯
│   ├── entities/                  # 遊戲實體類別
│   │   ├── Player.ts             # 玩家類別
│   │   ├── Enemy.ts              # 敵人類別
│   │   ├── Weapon.ts             # 武器類別
│   │   └── Projectile.ts         # 子彈類別
│   ├── config/                   # 配置管理
│   │   └── GameConfig.ts         # 遊戲配置類別
│   ├── GameManager.ts            # 遊戲管理器
│   ├── GameContext.tsx           # React Context
│   ├── constants.ts              # 常數定義
│   ├── types.ts                  # 型別定義
│   └── utils.ts                  # 工具函數
├── components/                    # React 組件
│   ├── Game.tsx                  # 主遊戲組件
│   ├── GameCanvas.tsx            # 遊戲畫布
│   ├── HUD.tsx                   # 遊戲介面
│   ├── Screens.tsx               # 遊戲畫面
│   ├── ShopModal.tsx             # 商店模態框
│   └── WeaponSelect.tsx          # 武器選擇
└── asset/                        # 遊戲資源
    ├── main_character/           # 主角動畫圖片
    ├── enemy/                    # 敵人動畫圖片
    └── *.png                     # 其他圖片資源
```

## 🎮 遊戲實體類別

### Player 類別 (`src/game/entities/Player.ts`)
管理玩家狀態和行為：
- **位置和移動**：`position`, `move()`
- **生命值**：`hp`, `maxHp`, `takeDamage()`, `heal()`
- **金錢**：`money`, `addMoney()`, `spendMoney()`
- **攻擊**：`damage`, `attackIntervalMs`, `canAttack()`, `attack()`
- **動畫**：`anim`, `frame`, `updateAnimation()`
- **武器**：`weapons`, `addWeapon()`

### Enemy 類別 (`src/game/entities/Enemy.ts`)
管理敵人狀態和行為：
- **基本屬性**：`position`, `hp`, `speed`, `damage`
- **動畫**：`frame`, `updateAnimation()`
- **死亡動畫**：`dying`, `disappearFrame`, `startDying()`
- **類型**：`type` (mask_dude, ninja_frog, pink_man, virtual_guy)

### Weapon 類別 (`src/game/entities/Weapon.ts`)
管理武器狀態和行為：
- **基本屬性**：`damage`, `attackIntervalMs`, `range`, `level`
- **攻擊**：`canAttack()`, `attack()`
- **升級**：`upgrade()`

### Projectile 類別 (`src/game/entities/Projectile.ts`)
管理子彈狀態和行為：
- **基本屬性**：`position`, `velocity`, `damage`
- **更新**：`update()`
- **邊界檢查**：`isOutOfBounds()`

## ⚙️ 配置管理

### GameConfig 類別 (`src/game/config/GameConfig.ts`)
集中管理所有遊戲參數：

#### 玩家配置
```typescript
static readonly PLAYER = {
  RADIUS: 20,           // 玩家半徑
  SPEED: 3.2,           // 移動速度
  MAX_HP: 10,           // 最大生命值
  MONEY: 0              // 初始金錢
};
```

#### 敵人配置
```typescript
static readonly ENEMIES = {
  MASK_DUDE: {
    SPEED: 1.0,         // 移動速度
    HP: 2,              // 生命值
    DAMAGE: 1,          // 攻擊力
    REWARD: 10          // 擊殺獎勵
  },
  // ... 其他敵人
};
```

#### 武器配置
```typescript
static readonly WEAPONS = {
  WEAPON_R1: {
    DAMAGE: 8,          // 攻擊力
    ATTACK_INTERVAL_MS: 600,  // 攻擊間隔
    RANGE: 150,         // 射程
    COST: 50            // 價格
  },
  // ... 其他武器
};

// 武器位置配置
static readonly WEAPON_POSITIONS = {
  0: { x: 25, y: 15 },    // 右手
  1: { x: -25, y: 15 },   // 左手
  2: { x: 0, y: -8 },     // 上方
  3: { x: 0, y: 12 },     // 下方
  4: { x: 6, y: -6 },     // 右上對角
  5: { x: -6, y: -6 },    // 左上對角
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
  weaponR1: 0.03,  // 預設大小
  weaponR2: 0.04,  // 更大
  weaponR3: 0.04,  // 更大
};

// 武器旋轉配置
static readonly WEAPON_ROTATION = {
  SPEED: 0.15,  // 旋轉速度 (0.1 = 慢，0.3 = 快)
  SMOOTH: true,  // 是否啟用平滑旋轉
};
```

## 🎯 如何調整遊戲參數

### 1. 調整主角參數
編輯 `src/game/config/GameConfig.ts` 中的 `PLAYER` 配置：

```typescript
static readonly PLAYER = {
  RADIUS: 20,           // 調整主角大小
  SPEED: 3.2,           // 調整移動速度
  MAX_HP: 10,           // 調整最大生命值
  MONEY: 0              // 調整初始金錢
};
```

### 2. 調整敵人參數
編輯 `src/game/config/GameConfig.ts` 中的 `ENEMIES` 配置：

```typescript
static readonly ENEMIES = {
  MASK_DUDE: {
    SPEED: 1.0,         // 調整移動速度
    HP: 2,              // 調整生命值
    DAMAGE: 1,          // 調整攻擊力
    REWARD: 10          // 調整擊殺獎勵
  },
  // 調整其他敵人...
};
```

### 3. 調整武器參數
編輯 `src/game/config/GameConfig.ts` 中的 `WEAPONS` 配置：

```typescript
static readonly WEAPONS = {
  weapon_R1: {
    DAMAGE: 8,          // 武器攻擊力
    ATTACK_INTERVAL_MS: 600,  // 武器攻擊間隔
    RANGE: 150,         // 武器射程
    COST: 50,           // 武器價格
    PELLETS: 1          // 彈丸數量
  },
  // 其他武器...
};
```

**注意**：攻擊力、攻擊速度、射程等屬性現在完全屬於武器，玩家本身沒有這些屬性。
```

### 4. 調整武器位置
編輯 `src/game/config/GameConfig.ts` 中的 `WEAPON_POSITIONS` 配置：

```typescript
static readonly WEAPON_POSITIONS = {
  0: { x: 25, y: 15 },    // 調整第1把武器位置 (右手)
  1: { x: -25, y: 15 },   // 調整第2把武器位置 (左手)
  2: { x: 0, y: -8 },     // 調整第3把武器位置 (上方)
  3: { x: 0, y: 12 },     // 調整第4把武器位置 (下方)
  4: { x: 6, y: -6 },     // 調整第5把武器位置 (右上對角)
  5: { x: -6, y: -6 },    // 調整第6把武器位置 (左上對角)
};

// 調整武器邊緣偏移 (子彈發射位置)
static readonly WEAPON_EDGE_OFFSETS = {
  0: { x: 15, y: 0 },     // 右手 - 從右側邊緣發射
  1: { x: -15, y: 0 },    // 左手 - 從左側邊緣發射
  2: { x: 0, y: -15 },    // 上方 - 從上側邊緣發射
  3: { x: 0, y: 15 },     // 下方 - 從下側邊緣發射
  4: { x: 10, y: -10 },   // 右上對角 - 從右上邊緣發射
  5: { x: -10, y: -10 },  // 左上對角 - 從左上邊緣發射
};

// 調整武器大小 (根據武器類型)
static readonly WEAPON_TYPE_SCALES = {
  weaponR1: 0.03,  // 預設大小
  weaponR2: 0.04,  // 更大
  weaponR3: 0.04,  // 更大
};

// 調整武器旋轉
static readonly WEAPON_ROTATION = {
  SPEED: 0.15,  // 旋轉速度 (0.1 = 慢，0.3 = 快)
  SMOOTH: true,  // 是否啟用平滑旋轉
};
```

### 5. 調整遊戲配置
編輯 `src/game/config/GameConfig.ts` 中的 `GAME` 配置：

```typescript
static readonly GAME = {
  WAVE_DURATION_MS: 30000,      // 調整關卡時間
  ENEMY_SPAWN_INTERVAL_MS: 2000, // 調整敵人生成間隔
  MAX_ENEMIES_PER_WAVE: 50      // 調整每關最大敵人數
};
```

### 6. 調整動畫配置
編輯 `src/game/config/GameConfig.ts` 中的 `ANIMATION` 配置：

```typescript
static readonly ANIMATION = {
  PLAYER_IDLE_INTERVAL: 400,    // 調整主角待機動畫速度
  PLAYER_WALK_INTERVAL: 120,    // 調整主角走路動畫速度
  ENEMY_INTERVAL: 200,          // 調整敵人動畫速度
  WEAPON_SHOOT_DURATION: 200    // 調整武器射擊動畫持續時間
};
```

## 🔄 遊戲管理器

### GameManager 類別 (`src/game/GameManager.ts`)
統一管理所有遊戲實體：
- **實體管理**：`getPlayer()`, `getEnemies()`, `getWeapons()`
- **遊戲邏輯**：`update()`, `checkCollisions()`
- **敵人生成**：`spawnEnemy()`
- **武器管理**：`addWeapon()`, `upgradeWeapon()`
- **子彈管理**：`createProjectile()`, `updateProjectiles()`

## 📝 注意事項

1. **配置修改後需要重新編譯**：修改 `GameConfig.ts` 後需要重新啟動開發服務器
2. **保持平衡性**：調整參數時要注意遊戲平衡性
3. **測試建議**：每次修改後都要測試遊戲是否正常運行
4. **備份配置**：建議在修改前備份原始配置

## 🚀 擴展建議

1. **添加新敵人**：在 `GameConfig.ENEMIES` 中添加新配置
2. **添加新武器**：在 `GameConfig.WEAPONS` 中添加新配置
3. **添加新動畫**：在 `GameConfig.ANIMATION` 中添加新配置
4. **添加新功能**：在對應的實體類別中添加新方法
