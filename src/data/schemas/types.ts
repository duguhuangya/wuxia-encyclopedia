// ================================================
// 江湖百晓生 — 数据类型定义
// ================================================

/** 唯一 ID 格式: `${类型缩写}_${拼音/英文名}` */
export type ID = string

// ---------- 作者与作品 ----------
export type AuthorTag = '金庸' | '古龙' | '梁羽生' | '温瑞安' | '黄易' | '其他'

export interface Novel {
  id: ID              // e.g. 'novel_shendiaoxialv'
  title: string       // 《神雕侠侣》
  author: AuthorTag
  era?: string        // 故事时代背景，如 '南宋'
  description: string
  characterIds: ID[]
  weaponIds: ID[]
  skillIds: ID[]
  factionIds: ID[]
}

// ---------- 人物 ----------
export type Camp = '正派' | '邪派' | '隐世' | '中立'
export type Gender = '男' | '女' | '未知'
export type CharacterStatus = '在世' | '已故' | '出家' | '隐退' | '未知'

export interface CharacterRadar {
  internal: number    // 内功 0-100
  technique: number   // 招式 0-100
  agility: number     // 身法 0-100
  combat: number      // 实战 0-100
  defense: number     // 防御 0-100
}

export interface Character {
  id: ID              // e.g. 'char_yangguo'
  name: string
  aliases: string[]   // 别名/绰号，如 ['神雕侠', '杨康之子']
  gender: Gender
  camp: Camp
  status: CharacterStatus
  novelIds: ID[]      // 出场小说
  factionId?: ID      // 所属门派
  masterId?: ID       // 主要师父（保留兼容）
  masterIds: ID[]     // 师父（支持多位，如江南七怪、洪七公等）
  apprenticeIds: ID[] // 徒弟
  rivalIds: ID[]      // 宿敌
  allyIds: ID[]       // 同盟/密友
  weaponIds: ID[]     // 使用兵器
  skillIds: ID[]      // 掌握武功
  radar: CharacterRadar
  description: string // 人物简介
  bio: string         // 详细生平
}

// ---------- 兵器 ----------
export type WeaponRank = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C'
export type WeaponType = '剑' | '刀' | '枪' | '鞭' | '暗器' | '奇门' | '其他'

export interface Weapon {
  id: ID              // e.g. 'weap_xuantiechongjian'
  name: string
  type: WeaponType
  rank: WeaponRank
  description: string
  features: string[]  // 特性，如 ['玄铁铸就', '重逾百斤', '磁力特性']
  ownerHistory: {     // 持有者历史
    characterId: ID
    period: string    // 如 '独孤求败四十岁前'
  }[]
  novelIds: ID[]
  relatedSkillIds: ID[]
}

// ---------- 武功 ----------
export type SkillCategory = '内功' | '掌法' | '拳法' | '剑法' | '刀法' | '轻功' | '暗器' | '指法' | '其他'
export type SkillLevel = 1 | 2 | 3 | 4 | 5  // 威力等级 1-5星

export interface SkillMove {
  name: string       // 招式名，如 '亢龙有悔'
  description: string
}

export interface Skill {
  id: ID              // e.g. 'skill_xianglongshibazhang'
  name: string
  category: SkillCategory
  level: SkillLevel
  description: string
  moves: SkillMove[]
  novelIds: ID[]
  practitionerIds: ID[]  // 修炼者
  prerequisiteIds: ID[]  // 前置武功
  counterIds: ID[]       // 克制武功
}

// ---------- 门派 ----------
export type FactionAlignment = '正' | '邪' | '中立' | '隐世'

export interface FactionRelation {
  targetFactionId: ID
  type: '宿敌' | '同盟' | '从属' | '师承' | '中立'
  description?: string
}

export interface Faction {
  id: ID              // e.g. 'fact_shaolin'
  name: string
  alternativeName?: string
  alignment: FactionAlignment
  location?: string   // 门派所在地
  leaderId?: ID       // 掌门/首领
  memberIds: ID[]
  skillIds: ID[]      // 门派武功
  relations: FactionRelation[]
  description: string
}

// ---------- 剧情/时间轴 ----------
export interface TimelineEvent {
  id: ID
  novelId: ID
  title: string
  description: string
  participants: ID[]  // 涉及人物
  type: '主线' | '战役' | '奇遇' | '门派事件' | '其他'
  order: number       // 排序号
}

// ---------- 关系（用于拓扑图） ----------
export type RelationType = '师徒' | '宿敌' | '同盟' | '恋人' | '血亲' | '同门'

export interface Relation {
  sourceId: ID        // 人物/门派 ID
  targetId: ID
  type: RelationType
  description?: string
}

// ---------- 搜索索引类型 ----------
export type SearchableType = 'character' | 'weapon' | 'skill' | 'faction' | 'novel'

export interface SearchItem {
  id: ID
  type: SearchableType
  name: string
  aliases: string[]
  tags: string[]
  description: string
}
