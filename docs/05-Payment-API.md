# AI智能起名顾问 - 支付接口文档

> 版本: v2.1  
> 更新日期: 2026-02-03  
> 状态: H5 Web 支付

## 1. 概述

本文档定义 AI智能起名顾问 H5 应用的支付相关接口，支持微信支付（H5/JSAPI）和支付宝（H5）。

---

## 2. 支付流程

### 2.1 H5 支付标准流程

```
用户点击解锁
    ↓
前端调用创建订单 API
    ↓
后端创建订单 → 返回订单信息
    ↓
前端请求支付参数
    ↓
后端调用微信支付统一下单
    ↓
返回支付参数（appId/timeStamp/nonceStr/package/paySign）
    ↓
前端调起微信支付（WeixinJSBridge / JSAPI）
    ↓
用户完成支付
    ↓
微信支付回调后端
    ↓
后端更新订单状态 + 解锁内容
    ↓
前端轮询或 WebSocket 接收支付结果
    ↓
显示解锁成功，展示 AI 生成内容
```

---

## 3. 接口列表

### 3.1 创建订单

```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：**
```typescript
interface CreateOrderRequest {
  sessionId: string;              // 起名会话ID
  productType: 'single' | 'all' | 'report';  // 商品类型
  directionId?: string;           // 单系列解锁时指定（poetic/mountain/modern）
  couponCode?: string;            // 优惠券码（可选）
}
```

**响应数据：**
```typescript
interface CreateOrderResponse {
  order: {
    id: string;
    orderNo: string;              // 订单号 N202402031200001
    productType: string;
    productName: string;          // 如"诗词雅韵系列解锁"
    amount: number;               // 金额（分）
    payableAmount: number;        // 应付金额（分）
    expireTime: string;           // 过期时间 ISO 格式
  };
}
```

---

### 3.2 获取微信支付参数（H5/JSAPI）

```http
POST /api/payments/wechat/prepay
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：**
```typescript
interface WechatPrepayRequest {
  orderNo: string;                // 订单号
  tradeType: 'JSAPI' | 'H5';      // 交易类型
  openid?: string;                // JSAPI 支付必填
}
```

**响应数据（JSAPI）：**
```typescript
interface WechatJSAPIParams {
  appId: string;                  // 应用ID
  timeStamp: string;              // 时间戳
  nonceStr: string;               // 随机字符串
  package: string;                // prepay_id=xxx
  signType: 'RSA';                // 签名类型
  paySign: string;                // 签名
}
```

**响应数据（H5）：**
```typescript
interface WechatH5Params {
  mwebUrl: string;                // 调支付地址
}
```

**前端调用示例（JSAPI）：**
```javascript
WeixinJSBridge.invoke(
  'getBrandWCPayRequest',
  {
    appId: params.appId,
    timeStamp: params.timeStamp,
    nonceStr: params.nonceStr,
    package: params.package,
    signType: params.signType,
    paySign: params.paySign
  },
  function(res) {
    if (res.err_msg === 'get_brand_wcpay_request:ok') {
      // 支付成功
      checkPaymentStatus(orderNo);
    } else {
      // 支付失败或取消
      console.error('支付失败:', res);
    }
  }
);
```

---

### 3.3 获取支付宝支付参数（H5）

```http
POST /api/payments/alipay/prepay
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：**
```typescript
interface AlipayPrepayRequest {
  orderNo: string;                // 订单号
  returnUrl: string;              // 支付完成跳转URL
}
```

**响应数据：**
```typescript
interface AlipayH5Params {
  orderStr: string;               // 支付宝订单字符串
}
```

**前端调用：**
```javascript
// 直接跳转支付宝
window.location.href = `https://openapi.alipay.com/gateway.do?${orderStr}`;
```

---

### 3.4 微信支付回调

微信支付结果通知（后端接口）。

```http
POST /api/webhooks/wechat/pay
Content-Type: text/xml
```

**请求体（XML）：**
```xml
<xml>
  <appid><![CDATA[wx123456]]></appid>
  <mch_id><![CDATA[1234567890]]></mch_id>
  <out_trade_no><![CDATA[N202402031200001]]></out_trade_no>
  <transaction_id><![CDATA[4200001234567890]]></transaction_id>
  <total_fee>990</total_fee>
  <result_code><![CDATA[SUCCESS]]></result_code>
  <time_end><![CDATA[20240203120000]]></time_end>
  <sign><![CDATA[...]]></sign>
</xml>
```

**响应（XML）：**
```xml
<xml>
  <return_code><![CDATA[SUCCESS]]></return_code>
  <return_msg><![CDATA[OK]]></return_msg>
</xml>
```

**后端处理流程：**
1. 验证签名
2. 查询订单状态
3. 更新订单为已支付
4. 解锁用户内容
5. 发送 WebSocket 通知或标记状态

---

### 3.5 支付宝回调

```http
POST /api/webhooks/alipay/pay
Content-Type: application/x-www-form-urlencoded
```

**请求参数：**
```
total_amount: 9.90
out_trade_no: N202402031200001
trade_no: 2024020322001156789012345678
trade_status: TRADE_SUCCESS
sign: ...
```

**响应：**
```
success
```

---

### 3.6 查询支付结果

前端轮询查询支付状态。

```http
GET /api/orders/{orderNo}/status
Authorization: Bearer {token}
```

**响应数据：**
```typescript
interface OrderStatusResponse {
  orderNo: string;
  status: 'pending' | 'paid' | 'closed' | 'refunded';
  payTime?: string;               // 支付时间
  payChannel?: 'wechat' | 'alipay';
  unlockInfo?: {
    isUnlocked: boolean;
    unlockType: 'single' | 'all';
    directionId?: string;
  };
}
```

**前端轮询示例：**
```typescript
async function checkPaymentStatus(orderNo: string) {
  const maxRetries = 30;  // 最多轮询30次
  
  for (let i = 0; i < maxRetries; i++) {
    const { data } = await api.get(`/orders/${orderNo}/status`);
    
    if (data.status === 'paid') {
      // 支付成功，解锁内容
      showUnlockSuccess();
      return data.unlockInfo;
    }
    
    if (data.status === 'closed') {
      showOrderClosed();
      return null;
    }
    
    // 等待2秒再查询
    await sleep(2000);
  }
  
  showTimeoutError();
}
```

---

### 3.7 申请退款

```http
POST /api/orders/{orderNo}/refund
Content-Type: application/json
Authorization: Bearer {token}
```

**请求参数：**
```typescript
interface RefundRequest {
  reason: string;                 // 退款原因
  amount?: number;                // 退款金额（分），默认全额
}
```

**响应数据：**
```typescript
interface RefundResponse {
  refundNo: string;               // 退款单号
  status: 'pending' | 'success' | 'failed';
  refundAmount: number;
  estimateTime?: string;          // 预计到账时间
}
```

**退款规则：**
- 支付后 24 小时内可申请退款
- 已查看 AI 生成详情的内容不支持退款
- 退款金额原路返回

---

## 4. 支付安全

### 4.1 签名验证

微信支付回调签名验证：

```typescript
import crypto from 'crypto';

function verifyWechatSign(params: Record<string, any>, apiKey: string): boolean {
  const sign = params.sign;
  delete params.sign;
  
  // 按 key 排序
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .map(k => `${k}=${params[k]}`)
    .join('&');
  
  // 拼接 key
  const stringSignTemp = signStr + '&key=' + apiKey;
  
  // MD5 加密
  const computedSign = crypto
    .createHash('md5')
    .update(stringSignTemp)
    .digest('hex')
    .toUpperCase();
  
  return computedSign === sign;
}
```

### 4.2 幂等性处理

```typescript
async function handleWechatNotify(notifyData: any) {
  const orderNo = notifyData.out_trade_no;
  
  // 分布式锁（Redis）
  const lock = await redis.lock(`pay_notify:${orderNo}`, 30);
  
  try {
    // 检查是否已处理
    const order = await db.getOrder(orderNo);
    if (order.status === 'paid') {
      return { success: true };  // 已处理，直接返回
    }
    
    // 更新订单
    await db.updateOrder(orderNo, {
      status: 'paid',
      payTime: new Date(),
      transactionId: notifyData.transaction_id
    });
    
    // 解锁内容
    await unlockContent(order);
    
    // 发送通知
    await notifyUser(order.userId, {
      type: 'payment_success',
      orderNo,
      unlockInfo: order.unlockInfo
    });
    
  } finally {
    await lock.release();
  }
}
```

---

## 5. 前端支付组件

### 5.1 React 支付 Hook

```typescript
// hooks/usePayment.ts
import { useState } from 'react';
import { api } from '@/services/api';

export function usePayment() {
  const [isPaying, setIsPaying] = useState(false);
  
  async function initiatePayment(params: {
    sessionId: string;
    productType: 'single' | 'all';
    directionId?: string;
  }) {
    setIsPaying(true);
    
    try {
      // 1. 创建订单
      const { data: orderData } = await api.post('/orders', params);
      const { order } = orderData;
      
      // 2. 获取支付参数
      const { data: payData } = await api.post('/payments/wechat/prepay', {
        orderNo: order.orderNo,
        tradeType: 'JSAPI',
        openid: user.openid
      });
      
      // 3. 调起支付
      return new Promise((resolve, reject) => {
        WeixinJSBridge.invoke(
          'getBrandWCPayRequest',
          payData,
          (res) => {
            if (res.err_msg === 'get_brand_wcpay_request:ok') {
              resolve(checkPaymentStatus(order.orderNo));
            } else {
              reject(new Error('支付失败'));
            }
          }
        );
      });
    } finally {
      setIsPaying(false);
    }
  }
  
  return { initiatePayment, isPaying };
}
```

---

## 6. 测试环境

### 6.1 微信支付测试
- 使用微信沙箱环境
- 测试金额：1分（0.01元）
- 测试账号：微信测试号

### 6.2 支付宝测试
- 使用支付宝沙箱环境
- 测试金额：0.01元
- 测试账号：沙箱账号

### 6.3 测试用例

| 场景 | 预期结果 |
|-----|---------|
| 正常支付 | 支付成功，解锁 AI 生成内容 |
| 支付取消 | 订单保持待支付状态 |
| 支付超时 | 订单自动关闭 |
| 重复回调 | 幂等处理，只解锁一次 |
| 退款申请 | 退款成功，内容锁定 |
