// Backend-compatible strategy templates based on STRATEGY.CN.md
export const backendStrategyTemplates = [
  {
    name: 'EMA Golden Cross (做多)',
    description: 'EMA短线上穿长线时做多 - 适用于趋势跟踪',
    category: 'Long',
    expression: 'ema_4h_3.Data[0] > ema_4h_7.Data[0] && ema_4h_3.Data[1] < ema_4h_7.Data[1]',
    parameters: [
      { name: 'ema_4h_3', type: 'ema', kline: '4h', period: 3, enabled: true },
      { name: 'ema_4h_7', type: 'ema', kline: '4h', period: 7, enabled: true },
    ],
  },
  {
    name: 'EMA Death Cross (做空)',
    description: 'EMA短线下穿长线时做空 - 适用于趋势跟踪',
    category: 'Short',
    expression: 'ema_4h_3.Data[0] < ema_4h_7.Data[0] && ema_4h_3.Data[1] > ema_4h_7.Data[1]',
    parameters: [
      { name: 'ema_4h_3', type: 'ema', kline: '4h', period: 3, enabled: true },
      { name: 'ema_4h_7', type: 'ema', kline: '4h', period: 7, enabled: true },
    ],
  },
  {
    name: 'RSI Oversold (做多)',
    description: 'RSI超卖区域买入 - 适用于均值回归',
    category: 'Long',
    expression: 'rsi_1h_14.Data[0] < 30 && rsi_1h_14.Data[1] >= 30',
    parameters: [
      { name: 'rsi_1h_14', type: 'rsi', kline: '1h', period: 14, enabled: true },
    ],
  },
  {
    name: 'RSI Overbought (做空)',
    description: 'RSI超买区域卖出 - 适用于均值回归',
    category: 'Short',
    expression: 'rsi_1h_14.Data[0] > 70 && rsi_1h_14.Data[1] <= 70',
    parameters: [
      { name: 'rsi_1h_14', type: 'rsi', kline: '1h', period: 14, enabled: true },
    ],
  },
  {
    name: 'Bollinger Bands Lower (做多)',
    description: '价格触碰布林带下轨时做多',
    category: 'Long',
    expression: 'kline_1h.Close[0] <= boll_1h_20.Low[0] && kline_1h.Close[1] > boll_1h_20.Low[1]',
    parameters: [
      { name: 'boll_1h_20', type: 'boll', kline: '1h', period: 20, bandwidth: 2, enabled: true },
    ],
  },
  {
    name: 'Bollinger Bands Upper (做空)',
    description: '价格触碰布林带上轨时做空',
    category: 'Short',
    expression: 'kline_1h.Close[0] >= boll_1h_20.High[0] && kline_1h.Close[1] < boll_1h_20.High[1]',
    parameters: [
      { name: 'boll_1h_20', type: 'boll', kline: '1h', period: 20, bandwidth: 2, enabled: true },
    ],
  },
  {
    name: 'MACD Golden Cross (做多)',
    description: 'MACD金叉时做多',
    category: 'Long',
    expression: 'macd_4h_12_26_9.MACD[0] > macd_4h_12_26_9.Signal[0] && macd_4h_12_26_9.MACD[1] <= macd_4h_12_26_9.Signal[1]',
    parameters: [
      { name: 'macd_4h_12_26_9', type: 'macd', kline: '4h', fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, enabled: true },
    ],
  },
  {
    name: 'MACD Death Cross (做空)',
    description: 'MACD死叉时做空',
    category: 'Short',
    expression: 'macd_4h_12_26_9.MACD[0] < macd_4h_12_26_9.Signal[0] && macd_4h_12_26_9.MACD[1] >= macd_4h_12_26_9.Signal[1]',
    parameters: [
      { name: 'macd_4h_12_26_9', type: 'macd', kline: '4h', fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, enabled: true },
    ],
  },
  {
    name: 'Multi-Timeframe Trend (做多)',
    description: '多时间周期趋势一致时做多',
    category: 'Long',
    expression: 'ema_1h_5.Data[0] > ema_1h_20.Data[0] && ema_4h_5.Data[0] > ema_4h_20.Data[0] && BasicTrend > 0',
    parameters: [
      { name: 'ema_1h_5', type: 'ema', kline: '1h', period: 5, enabled: true },
      { name: 'ema_1h_20', type: 'ema', kline: '1h', period: 20, enabled: true },
      { name: 'ema_4h_5', type: 'ema', kline: '4h', period: 5, enabled: true },
      { name: 'ema_4h_20', type: 'ema', kline: '4h', period: 20, enabled: true },
    ],
  },
  {
    name: 'Mean Reversion with Volume (做多)',
    description: '结合成交量的均值回归策略',
    category: 'Long',
    expression: 'rsi_1h_14.Data[0] < 30 && kline_1h.Amount[0] > kline_1h.Amount[1] * 1.5',
    parameters: [
      { name: 'rsi_1h_14', type: 'rsi', kline: '1h', period: 14, enabled: true },
    ],
  },
  {
    name: 'Profit Taking (平多)',
    description: '多头止盈策略 - 当收益达到目标时平仓',
    category: 'Close Long',
    expression: 'Position.Side == "LONG" && ORI > 5.0',
    parameters: [],
  },
  {
    name: 'Stop Loss (平多)',
    description: '多头止损策略 - 当亏损达到阈值时平仓',
    category: 'Close Long',
    expression: 'Position.Side == "LONG" && ORI < -3.0',
    parameters: [],
  },
  {
    name: 'Short Profit Taking (平空)',
    description: '空头止盈策略 - 当收益达到目标时平仓',
    category: 'Close Short',
    expression: 'Position.Side == "SHORT" && ORI > 5.0',
    parameters: [],
  },
  {
    name: 'Short Stop Loss (平空)',
    description: '空头止损策略 - 当亏损达到阈值时平仓',
    category: 'Close Short',
    expression: 'Position.Side == "SHORT" && ORI < -3.0',
    parameters: [],
  },
  {
    name: 'Complex Strategy Example',
    description: '复杂策略示例 - 多条件组合',
    category: 'Long',
    expression: `ema_4h_3.Data[0] > ema_4h_7.Data[0] && 
rsi_1h_14.Data[0] > 40 && rsi_1h_14.Data[0] < 60 && 
kline_1h.Close[0] > boll_1h_20.Mid[0] && 
BasicTrend > 0 && 
BTCUSDT.PercentChange > 0`,
    parameters: [
      { name: 'ema_4h_3', type: 'ema', kline: '4h', period: 3, enabled: true },
      { name: 'ema_4h_7', type: 'ema', kline: '4h', period: 7, enabled: true },
      { name: 'rsi_1h_14', type: 'rsi', kline: '1h', period: 14, enabled: true },
      { name: 'boll_1h_20', type: 'boll', kline: '1h', period: 20, bandwidth: 2, enabled: true },
    ],
  },
]

// Backend variable definitions for autocompletion
export const backendVariables = [
  // Built-in variables
  { name: 'NowPrice', type: 'float64', description: '某个币的当前价格' },
  { name: 'SystemStartTime', type: 'int', description: '系统开启的毫秒时间戳' },
  { name: 'NowTime', type: 'int', description: '当前时间的毫秒时间戳' },
  { name: 'BasicTrend', type: 'float64', description: '基本趋势涨跌幅 (btc * 0.6 + eth * 0.3 + sol * 0.05 + bnb * 0.05)' },
  { name: 'ORI', type: 'float64', description: '收益率%' },

  // Crypto data
  { name: 'BTCUSDT.PercentChange', type: 'float64', description: 'BTC涨跌幅' },
  { name: 'BTCUSDT.Close', type: 'float64', description: 'BTC当前价格' },
  { name: 'BTCUSDT.Open', type: 'float64', description: 'BTC开盘价' },
  { name: 'BTCUSDT.Low', type: 'float64', description: 'BTC最低价' },
  { name: 'BTCUSDT.High', type: 'float64', description: 'BTC最高价' },

  { name: 'ETHUSDT.PercentChange', type: 'float64', description: 'ETH涨跌幅' },
  { name: 'ETHUSDT.Close', type: 'float64', description: 'ETH当前价格' },
  { name: 'ETHUSDT.Open', type: 'float64', description: 'ETH开盘价' },
  { name: 'ETHUSDT.Low', type: 'float64', description: 'ETH最低价' },
  { name: 'ETHUSDT.High', type: 'float64', description: 'ETH最高价' },

  { name: 'SOLUSDT.PercentChange', type: 'float64', description: 'SOL涨跌幅' },
  { name: 'SOLUSDT.Close', type: 'float64', description: 'SOL当前价格' },
  { name: 'SOLUSDT.Open', type: 'float64', description: 'SOL开盘价' },
  { name: 'SOLUSDT.Low', type: 'float64', description: 'SOL最低价' },
  { name: 'SOLUSDT.High', type: 'float64', description: 'SOL最高价' },

  { name: 'BNBUSDT.PercentChange', type: 'float64', description: 'BNB涨跌幅' },
  { name: 'BNBUSDT.Close', type: 'float64', description: 'BNB当前价格' },
  { name: 'BNBUSDT.Open', type: 'float64', description: 'BNB开盘价' },
  { name: 'BNBUSDT.Low', type: 'float64', description: 'BNB最低价' },
  { name: 'BNBUSDT.High', type: 'float64', description: 'BNB最高价' },

  // Current symbol data
  { name: 'NowSymbolPercentChange', type: 'float64', description: '所选币种涨跌幅' },
  { name: 'NowSymbolClose', type: 'float64', description: '所选币种当前价格' },
  { name: 'NowSymbolOpen', type: 'float64', description: '所选币种开盘价' },
  { name: 'NowSymbolLow', type: 'float64', description: '所选币种最低价' },
  { name: 'NowSymbolHigh', type: 'float64', description: '所选币种最高价' },

  // Position data
  { name: 'Position.Symbol', type: 'string', description: '交易对' },
  { name: 'Position.EntryPrice', type: 'float64', description: '持仓价格' },
  { name: 'Position.MarkPrice', type: 'float64', description: '当前的标记价格' },
  { name: 'Position.Amount', type: 'float64', description: '当前的持仓数量，做空是负数' },
  { name: 'Position.UnrealizedProfit', type: 'float64', description: '当前收益 usdt, 亏损是负数' },
  { name: 'Position.Leverage', type: 'int', description: '杠杆' },
  { name: 'Position.Side', type: 'string', description: '合约方向 (LONG/SHORT)' },
  { name: 'Position.Mock', type: 'bool', description: '是否是 mock 的数据' },
  { name: 'Position.CreateTime', type: 'int', description: '毫秒时间戳' },
  { name: 'Position.SourceType', type: 'string', description: '数据来源 (local/api)' },
]

// Backend functions for autocompletion
export const backendFunctions = [
  { name: 'all', signature: 'all(...)', description: '检查所有条件是否都为真' },
  { name: 'float', signature: 'float(...)', description: '转换为浮点数' },
  { name: 'IsAsc', signature: 'IsAsc(arr []float64)', description: '检查数组是否是升序' },
  { name: 'IsDesc', signature: 'IsDesc(arr []float64)', description: '检查数组是否是降序' },
  { name: 'Kdj', signature: 'Kdj(ma1 []float64, ma2 []float64, num int)', description: '检查是否只产生过一次金叉' },
]

// K-line intervals supported by backend
export const klineIntervals = [
  '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M',
]

// Technical indicator types
export const indicatorTypes = [
  { name: 'ma', label: '移动平均线', fields: ['period'] },
  { name: 'ema', label: '指数移动平均线', fields: ['period'] },
  { name: 'rsi', label: '相对强弱指数', fields: ['period'] },
  { name: 'kc', label: '肯纳特通道', fields: ['period', 'multiplier'] },
  { name: 'boll', label: '布林带', fields: ['period', 'bandwidth'] },
  { name: 'atr', label: '平均真实波动范围', fields: ['period'] },
  { name: 'macd', label: 'MACD', fields: ['fastPeriod', 'slowPeriod', 'signalPeriod'] },
]
