# AI智能起名顾问 - 业务接口文档

> 版本: v2.1  
> 更新日期: 2026-02-03  
> 状态: H5 Web + AI Agent 接口

## 1. 概述

本文档定义 AI智能起名顾问 的业务接口，核心特点是**所有内容（八字、名字、解析）均由 AI Agent 实时生成**。

---

## 2. 认证

### 2.1 登录方式

- 微信授权登录（推荐）
- 手机号登录
- 游客模式（无需登录，数据存本地）

### 2.2 获取 Token

```http
POST /api/auth/login
Content-Type: application/json
```

**微信登录：**
```typescript
// 请求
{
  "type": "wechat",
  "code": "auth_code_from_wechat"
}

// 响应
{
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "expiresIn": 7200,
  "user": {
    "id": "user_uuid",
    "nickname": "微信昵称",
    "avatar": "avatar_url"
  }
}
```

---

## 3. AI Agent 核心接口

> **核心设计原则**: 所有 AI 输出必须是**结构化 JSON**，前端组件基于预设的数据结构直接渲染 UI，不解析自由文本。

### 3.1 AI 生成八字分析

**重要**: 
- 八字分析由 AI Agent 实时生成，非查表
- **AI 必须返回严格的 JSON 结构**，前端 `BaziAnalysis` 组件直接消费渲染

```http
POST /api/ai/analyze-bazi
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：**
```typescript
interface AnalyzeBaziRequest {
  birthDate: string;              // YYYY-MM-DD
  birthTime: string;              // HH:MM
  gender: 'boy' | 'girl';
}
```

**响应数据（AI 生成）：**
```typescript
interface BaziAnalysisResponse {
  // AI 计算的八字四柱
  bazi: {
    yearPillar: string;           // 年柱，如"丙午"
    monthPillar: string;          // 月柱
    dayPillar: string;            // 日柱
    hourPillar: string;           // 时柱
    yearWuxing: string;           // 年柱五行
    monthWuxing: string;
    dayWuxing: string;
    hourWuxing: string;
    yearCanggan: string;          // 年柱藏干
    monthCanggan: string;
    dayCanggan: string;
    hourCanggan: string;
    yearNayin: string;            // 年柱纳音
    monthNayin: string;
    dayNayin: string;
    hourNayin: string;
    benming: string;              // 本命
  };
  
  // AI 计算的五行分析
  wuxing: {
    gold: number;                 // 金个数
    wood: number;
    water: number;
    fire: number;
    earth: number;
    goldValue: number;            // 金含量（0-5）
    woodValue: number;
    waterValue: number;
    fireValue: number;
    earthValue: number;
    xiyong: string[];             // AI 推理的喜用神
    jiyong: string[];             // AI 推理的忌用神
    rizhu: string;                // 日主天干
    rizhuWuxing: string;          // 日主五行
    tonglei: string[];            // AI 判定的同类
    yilei: string[];              // AI 判定的异类
    tongleiScore: number;         // AI 计算的同类得分
    yileiScore: number;
    wangshuai: string;            // AI 判定的旺衰
  };
  
  // AI 生成的文字分析
  analysis: string;               // 八字分析说明
  suggestion: string;             // AI 起名建议
  
  // 缓存信息
  cached: boolean;                // 是否来自缓存
  generatedAt: string;            // 生成时间
}
```

**AI 生成说明：**
- AI 根据历法知识计算四柱
- AI 根据五行理论分析喜用
- 结果缓存 7 天，相同输入直接返回缓存

---

### 3.2 AI 生成名字

**重要**: 
- 名字由 AI Agent 实时生成，非查表
- **AI 必须返回严格的 `NameDetail[]` JSON 数组**，前端 `NameList` 组件直接遍历渲染

```http
POST /api/ai/generate-names
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：**
```typescript
interface GenerateNamesRequest {
  sessionId: string;              // 会话ID
  directionId: string;            // 系列ID（poetic/mountain/modern）
  directionName: string;          // 系列名称
  count?: number;                 // 生成数量，默认6个
}
```

**响应数据（AI 生成）：**
```typescript
interface GenerateNamesResponse {
  direction: {
    id: string;
    title: string;
  };
  names: {
    name: string;                 // AI 生成的名字
    pinyin: string;               // AI 标注的拼音
    characters: {
      char: string;
      pinyin: string;
      wuxing: string;             // AI 判定的五行
      meaning: string;            // AI 生成的字义
      explanation: string;        // AI 生成的解释
      source: string;             // AI 检索的出处
      kangxi: {
        strokes: number;          // AI 计算的笔画
        page: string;
        original: string;
      };
    }[];
    meaning: string;              // AI 生成的整体寓意
    source: string;               // AI 检索的典籍出处
    wuxing: string;               // AI 判定的五行组合
    baziMatch: string;            // AI 分析的八字匹配
    score: number;                // AI 评分（0-100）
    uniqueness: string;           // AI 估算的重名度
    uniquenessCount: string;      // AI 估算的数量
    yinyun: {
      tone: string;               // AI 分析的声调
      initials: string;           // AI 分析的声母
      score: number;              // AI 音韵评分
    };
    personalizedMeaning: string;  // AI 生成的专属寓意
    generatedBy: 'ai';
    generatedAt: string;
  }[];
  generatedAt: string;
  cached: boolean;                // 是否来自缓存
}
```

**AI 生成说明：**
- AI 根据八字喜用筛选宜用字
- AI 根据风格要求组合名字
- AI 为每个名字生成详细解析
- 结果缓存 24 小时

---

### 3.3 AI 生成名字详情（流式输出）

```http
POST /api/ai/interpret-name
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：**
```typescript
interface InterpretNameRequest {
  name: string;                   // 名字
  surname: string;                // 姓氏
  baziData: BaziAnalysis;         // 八字数据
  sessionId: string;
}
```

**响应（流式 SSE）：**
```
event: start
data: {"type": "start"}

event: content
data: {"type": "character", "char": "沐", "content": "..."}

event: content
data: {"type": "yinyun", "content": "..."}

event: content
data: {"type": "wuxing", "content": "..."}

event: complete
data: {"type": "complete", "detail": {...}}
```

---

## 4. 起名会话接口

### 4.1 创建会话

```http
POST /api/naming-sessions
Content-Type: application/json
Authorization: Bearer {token}

{
  "babyInfo": {
    "surname": "李",
    "gender": "boy",
    "birthDate": "2026-02-03",
    "birthTime": "14:30",
    "birthLocation": "北京"
  }
}
```

**响应：**
```typescript
interface CreateSessionResponse {
  session: {
    id: string;
    babyInfo: BabyInfo;
    currentStep: 'babyInfo';
    createdAt: string;
  };
  // 自动创建第一条AI消息
  firstMessage: ChatMessage;
}
```

### 4.2 获取会话详情

```http
GET /api/naming-sessions/{sessionId}
Authorization: Bearer {token}
```

**响应：**
```typescript
interface GetSessionResponse {
  session: {
    id: string;
    babyInfo: BabyInfo;
    messages: ChatMessage[];
    currentStep: string;
    
    // AI 生成的内容（可能为空，触发生成后填充）
    baziData?: BaziAnalysis;
    generatedNames?: {
      [directionId: string]: {
        names: NameDetail[];
        generatedAt: string;
      }
    };
    
    // 解锁状态
    unlockStatus: {
      isUnlocked: boolean;
      unlockType?: 'single' | 'all';
      unlockedDirections: string[];
    };
    
    selectedName?: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### 4.3 触发 AI 生成八字

```http
POST /api/naming-sessions/{sessionId}/generate-bazi
Authorization: Bearer {token}
```

**响应：**
```typescript
{
  "baziData": BaziAnalysis;       // AI 生成的八字分析
  "aiMessage": ChatMessage;       // AI 发送的分析消息
}
```

### 4.4 触发 AI 生成名字

```http
POST /api/naming-sessions/{sessionId}/generate-names
Content-Type: application/json
Authorization: Bearer {token}

{
  "directionId": "poetic"          // 指定生成哪个系列
}
```

**响应：**
```typescript
{
  "names": NameDetail[];           // AI 生成的名字列表
  "aiMessage": ChatMessage;        // AI 发送的推荐消息
}
```

---

## 5. 解锁与支付相关

### 5.1 检查解锁状态

```http
GET /api/sessions/{sessionId}/unlock-status
Authorization: Bearer {token}
```

**响应：**
```typescript
interface UnlockStatusResponse {
  sessionId: string;
  isUnlocked: boolean;
  unlockType?: 'single' | 'all';
  unlockedDirections: string[];
  lockedContent: {
    directionId: string;
    directionName: string;
    previewName: string;          // 第一个名字预览
    lockedCount: number;          // 锁定数量
    price: number;                // 解锁价格
  }[];
}
```

### 5.2 解锁后获取完整内容

```http
GET /api/sessions/{sessionId}/names/{directionId}
Authorization: Bearer {token}
```

**错误响应（未解锁）：**
```json
{
  "code": 4009,
  "message": "该内容需要解锁后查看",
  "data": {
    "preview": {
      "name": "沐泽",
      "score": 91,
      "meaning": "如沐春风，泽被四方"
    },
    "unlockOptions": [
      { "type": "single", "price": 990, "desc": "解锁当前系列" },
      { "type": "all", "price": 1990, "desc": "解锁全部系列", "save": 980 }
    ]
  }
}
```

---

## 6. 收藏接口

### 6.1 添加收藏

```http
POST /api/favorites
Content-Type: application/json
Authorization: Bearer {token}

{
  "sessionId": "session_uuid",
  "name": "沐泽",
  "nameDetail": { /* AI 生成的完整详情 */ }
}
```

**注意：** 只能收藏已解锁的 AI 生成名字

### 6.2 获取收藏列表

```http
GET /api/favorites
Authorization: Bearer {token}
```

**响应：**
```typescript
interface ListFavoritesResponse {
  favorites: {
    id: string;
    sessionId: string;
    babySurname: string;
    name: string;
    nameDetail: NameDetail;        // AI 生成的详情
    createdAt: string;
  }[];
  groupedBySession: {
    sessionId: string;
    babySurname: string;
    count: number;
    favorites: Favorite[];
  }[];
}
```

---

## 7. 错误码

### 7.1 通用错误码

| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |
| 1000 | 系统错误 |
| 1001 | 参数错误 |
| 1002 | 未授权 |

### 7.2 AI 相关错误码

| 错误码 | 说明 | 处理建议 |
|-------|------|---------|
| 3001 | AI 生成超时 | 显示"AI思考中"，自动重试 |
| 3002 | AI 生成失败 | 提示重试或切换备选模型 |
| 3003 | AI 内容审核不通过 | 重新生成 |
| 3004 | 八字计算错误 | 检查出生时间格式 |

### 7.3 业务错误码

| 错误码 | 说明 |
|-------|------|
| 4001 | 商品类型错误 |
| 4002 | 该内容已解锁 |
| 4009 | 内容未解锁 |
| 5001 | 订单不存在 |
| 5002 | 支付失败 |

---

## 8. 前端集成示例

### 8.1 AI 生成八字完整流程

```typescript
// 触发 AI 生成八字
async function generateBazi(sessionId: string) {
  // 1. 显示生成中
  setIsGenerating(true);
  
  try {
    // 2. 调用 API
    const { data } = await api.post(`/sessions/${sessionId}/generate-bazi`);
    
    // 3. 更新状态
    setBaziData(data.baziData);
    addMessage(data.aiMessage);
    
  } catch (error) {
    if (error.code === 3001) {
      // AI 超时，显示重试
      showRetryButton();
    }
  } finally {
    setIsGenerating(false);
  }
}
```

### 8.2 AI 生成名字完整流程

```typescript
// 触发 AI 生成名字
async function generateNames(sessionId: string, directionId: string) {
  setIsGenerating(true);
  
  try {
    const { data } = await api.post(`/sessions/${sessionId}/generate-names`, {
      directionId
    });
    
    // 保存 AI 生成的名字
    setGeneratedNames(prev => ({
      ...prev,
      [directionId]: data.names
    }));
    
    addMessage(data.aiMessage);
    
  } finally {
    setIsGenerating(false);
  }
}
```

### 8.3 解锁后获取完整内容

```typescript
// 解锁后获取名字详情
async function getNameDetail(sessionId: string, directionId: string, name: string) {
  try {
    const { data } = await api.get(`/sessions/${sessionId}/names/${directionId}`);
    return data.names.find(n => n.name === name);
  } catch (error) {
    if (error.code === 4009) {
      // 未解锁，显示支付弹窗
      showPaymentModal(error.data.unlockOptions);
    }
  }
}
```
