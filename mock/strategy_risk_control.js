// Mock API for strategy risk control - for demonstration purposes
module.exports = [
  // Get risk control list
  {
    url: '/strategy/risk-control',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: [
          {
            id: 1,
            coin: 'BTCUSDT',
            strategy: 'MA_CROSS',
            tradeType: 'futures',
            consecutiveLossCount: 3,
            freezeDuration: 2,
            freezeStatus: 'normal',
            remainingHours: 0,
          },
          {
            id: 2,
            coin: 'ETHUSDT',
            strategy: 'RSI_DIVERGENCE',
            tradeType: 'futures',
            consecutiveLossCount: 5,
            freezeDuration: 4,
            freezeStatus: 'frozen',
            remainingHours: 2,
          },
          {
            id: 3,
            coin: 'ADAUSDT',
            strategy: 'BOLLINGER_BANDS',
            tradeType: 'spot',
            consecutiveLossCount: 2,
            freezeDuration: 1,
            freezeStatus: 'normal',
            remainingHours: 0,
          },
        ],
      }
    },
  },
  // Update risk control params
  {
    url: '/strategy/risk-control',
    type: 'put',
    response: () => {
      return {
        code: 200,
        data: 'success',
      }
    },
  },
  // Batch update risk control params
  {
    url: '/strategy/risk-control/batch',
    type: 'put',
    response: () => {
      return {
        code: 200,
        data: 'success',
      }
    },
  },
  // Get risk control logs
  {
    url: '/strategy/risk-control/logs',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          list: [
            {
              id: 1,
              createdAt: '2023-12-01 10:30:00',
              coin: 'BTCUSDT',
              strategy: 'MA_CROSS',
              tradeType: 'futures',
              operationType: 'param_update',
              operator: 'admin',
              details: '连续亏损次数从2改为3，冻结时长从1小时改为2小时',
            },
            {
              id: 2,
              createdAt: '2023-12-01 09:15:00',
              coin: 'ETHUSDT',
              strategy: 'RSI_DIVERGENCE',
              tradeType: 'futures',
              operationType: 'auto_freeze',
              operator: 'system',
              details: '触发连续亏损5次，自动冻结4小时',
            },
          ],
          total: 2,
        },
      }
    },
  },
  // Get enabled strategies and coins
  {
    url: '/strategy/risk-control/enabled-options',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          coins: [
            { label: 'BTCUSDT', value: 'BTCUSDT' },
            { label: 'ETHUSDT', value: 'ETHUSDT' },
            { label: 'ADAUSDT', value: 'ADAUSDT' },
            { label: 'BNBUSDT', value: 'BNBUSDT' },
          ],
          strategies: [
            { label: 'MA_CROSS', value: 'MA_CROSS' },
            { label: 'RSI_DIVERGENCE', value: 'RSI_DIVERGENCE' },
            { label: 'BOLLINGER_BANDS', value: 'BOLLINGER_BANDS' },
            { label: 'MACD_SIGNAL', value: 'MACD_SIGNAL' },
          ],
        },
      }
    },
  },
]