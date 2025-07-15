const Mock = require('mockjs')

// Mock data for strategy freeze configurations
let strategyFreezeConfigs = [
  {
    id: 1,
    symbol: 'BTCUSDT',
    strategy_name: 'MA_CROSS',
    trade_type: 'real',
    freeze_on_loss_count: 3,
    freeze_hours: 2,
    loss_count: 1,
    freeze_until: null,
    is_active: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    symbol: 'ETHUSDT',
    strategy_name: 'RSI_DIVERGENCE',
    trade_type: 'real',
    freeze_on_loss_count: 5,
    freeze_hours: 4,
    loss_count: 3,
    freeze_until: null,
    is_active: true,
    created_at: '2024-01-01T11:00:00Z',
    updated_at: '2024-01-01T11:00:00Z'
  },
  {
    id: 3,
    symbol: 'ADAUSDT',
    strategy_name: 'BOLLINGER_BANDS',
    trade_type: 'test',
    freeze_on_loss_count: 2,
    freeze_hours: 1,
    loss_count: 2,
    freeze_until: Math.floor(Date.now() / 1000) + 3600, // frozen for 1 hour
    is_active: true,
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T12:00:00Z'
  },
  {
    id: 4,
    symbol: 'BNBUSDT',
    strategy_name: 'MACD_SIGNAL',
    trade_type: 'real',
    freeze_on_loss_count: 4,
    freeze_hours: 3,
    loss_count: 0,
    freeze_until: null,
    is_active: true,
    created_at: '2024-01-01T13:00:00Z',
    updated_at: '2024-01-01T13:00:00Z'
  }
]

// Mock data for operation logs
let operationLogs = [
  {
    id: 1,
    symbol: 'BTCUSDT',
    strategy_name: 'MA_CROSS',
    trade_type: 'real',
    operation: 'update_config',
    operator: 'admin',
    details: 'Updated freeze_on_loss_count from 2 to 3',
    created_at: '2024-01-01T14:00:00Z'
  },
  {
    id: 2,
    symbol: 'ADAUSDT',
    strategy_name: 'BOLLINGER_BANDS',
    trade_type: 'test',
    operation: 'auto_freeze',
    operator: 'system',
    details: 'Strategy frozen due to 2 consecutive losses',
    created_at: '2024-01-01T15:00:00Z'
  }
]

let nextId = 5

module.exports = [
  // Get operation logs (more specific first)
  {
    url: '/strategy-freeze/logs',
    type: 'get',
    response: (req) => {
      const { symbol, strategy_name, trade_type, page = 1, pageSize = 20 } = req.query
      
      let filteredLogs = operationLogs.filter(log => {
        if (symbol && log.symbol !== symbol) return false
        if (strategy_name && log.strategy_name !== strategy_name) return false
        if (trade_type && log.trade_type !== trade_type) return false
        return true
      })

      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const list = filteredLogs.slice(start, end)

      return {
        code: 200,
        data: {
          list: list,
          total: filteredLogs.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },

  // Get available symbols and strategies
  {
    url: '/strategy-freeze/options',
    type: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          symbols: [
            { label: 'BTCUSDT', value: 'BTCUSDT' },
            { label: 'ETHUSDT', value: 'ETHUSDT' },
            { label: 'ADAUSDT', value: 'ADAUSDT' },
            { label: 'BNBUSDT', value: 'BNBUSDT' },
            { label: 'SOLUSDT', value: 'SOLUSDT' },
            { label: 'DOGEUSDT', value: 'DOGEUSDT' }
          ],
          strategies: [
            { label: 'MA_CROSS', value: 'MA_CROSS' },
            { label: 'RSI_DIVERGENCE', value: 'RSI_DIVERGENCE' },
            { label: 'BOLLINGER_BANDS', value: 'BOLLINGER_BANDS' },
            { label: 'MACD_SIGNAL', value: 'MACD_SIGNAL' },
            { label: 'GRID_TRADING', value: 'GRID_TRADING' },
            { label: 'DCA_STRATEGY', value: 'DCA_STRATEGY' }
          ],
          tradeTypes: [
            { label: '实盘', value: 'real' },
            { label: '测试', value: 'test' }
          ]
        }
      }
    }
  },

  // Manual unfreeze strategy
  {
    url: '/strategy-freeze/unfreeze',
    type: 'post',
    response: (req) => {
      const { symbol, strategy_name, trade_type } = req.body
      
      const config = strategyFreezeConfigs.find(config => 
        config.symbol === symbol && 
        config.strategy_name === strategy_name && 
        config.trade_type === trade_type
      )

      if (config) {
        config.freeze_until = null
        config.updated_at = new Date().toISOString()

        // Add log
        operationLogs.unshift({
          id: operationLogs.length + 1,
          symbol,
          strategy_name,
          trade_type,
          operation: 'manual_unfreeze',
          operator: 'admin',
          details: 'Manually unfroze strategy',
          created_at: new Date().toISOString()
        })

        return {
          code: 200,
          data: config
        }
      } else {
        return {
          code: 404,
          message: 'Configuration not found'
        }
      }
    }
  },

  // Reset loss count
  {
    url: '/strategy-freeze/reset-loss',
    type: 'post',
    response: (req) => {
      const { symbol, strategy_name, trade_type } = req.body
      
      const config = strategyFreezeConfigs.find(config => 
        config.symbol === symbol && 
        config.strategy_name === strategy_name && 
        config.trade_type === trade_type
      )

      if (config) {
        const oldLossCount = config.loss_count
        config.loss_count = 0
        config.updated_at = new Date().toISOString()

        // Add log
        operationLogs.unshift({
          id: operationLogs.length + 1,
          symbol,
          strategy_name,
          trade_type,
          operation: 'reset_loss_count',
          operator: 'admin',
          details: `Reset loss count from ${oldLossCount} to 0`,
          created_at: new Date().toISOString()
        })

        return {
          code: 200,
          data: config
        }
      } else {
        return {
          code: 404,
          message: 'Configuration not found'
        }
      }
    }
  },

  // Simulate strategy trade result (for testing freeze logic)
  {
    url: '/strategy-freeze/simulate-trade',
    type: 'post',
    response: (req) => {
      const { symbol, strategy_name, trade_type, is_profit } = req.body
      
      const config = strategyFreezeConfigs.find(config => 
        config.symbol === symbol && 
        config.strategy_name === strategy_name && 
        config.trade_type === trade_type
      )

      if (config) {
        if (is_profit) {
          // Reset loss count on profit
          config.loss_count = 0
          operationLogs.unshift({
            id: operationLogs.length + 1,
            symbol,
            strategy_name,
            trade_type,
            operation: 'trade_profit',
            operator: 'system',
            details: 'Profit trade, reset loss count to 0',
            created_at: new Date().toISOString()
          })
        } else {
          // Increase loss count on loss
          config.loss_count += 1
          
          // Check if should freeze
          if (config.loss_count >= config.freeze_on_loss_count) {
            config.freeze_until = Math.floor(Date.now() / 1000) + (config.freeze_hours * 3600)
            operationLogs.unshift({
              id: operationLogs.length + 1,
              symbol,
              strategy_name,
              trade_type,
              operation: 'auto_freeze',
              operator: 'system',
              details: `Strategy auto-frozen due to ${config.loss_count} consecutive losses`,
              created_at: new Date().toISOString()
            })
          } else {
            operationLogs.unshift({
              id: operationLogs.length + 1,
              symbol,
              strategy_name,
              trade_type,
              operation: 'trade_loss',
              operator: 'system',
              details: `Loss trade, loss count increased to ${config.loss_count}`,
              created_at: new Date().toISOString()
            })
          }
        }

        config.updated_at = new Date().toISOString()

        return {
          code: 200,
          data: config
        }
      } else {
        return {
          code: 404,
          message: 'Configuration not found'
        }
      }
    }
  },

  // Get single strategy freeze config
  {
    url: '/strategy-freeze/config',
    type: 'get',
    response: (req) => {
      const { symbol, strategy_name, trade_type } = req.query
      
      const config = strategyFreezeConfigs.find(config => 
        config.symbol === symbol && 
        config.strategy_name === strategy_name && 
        config.trade_type === trade_type
      )

      if (config) {
        return {
          code: 200,
          data: config
        }
      } else {
        return {
          code: 404,
          message: 'Configuration not found'
        }
      }
    }
  },

  // Update strategy freeze config by ID
  {
    url: '/strategy-freeze/\\d+',
    type: 'put',
    response: (req) => {
      const id = parseInt(req.url.split('/').pop())
      const { freeze_on_loss_count, freeze_hours, loss_count } = req.body
      
      const config = strategyFreezeConfigs.find(config => config.id === id)
      
      if (config) {
        const oldValues = {
          freeze_on_loss_count: config.freeze_on_loss_count,
          freeze_hours: config.freeze_hours,
          loss_count: config.loss_count
        }

        config.freeze_on_loss_count = freeze_on_loss_count
        config.freeze_hours = freeze_hours
        if (loss_count !== undefined) {
          config.loss_count = loss_count
        }
        config.updated_at = new Date().toISOString()

        // Add log
        operationLogs.unshift({
          id: operationLogs.length + 1,
          symbol: config.symbol,
          strategy_name: config.strategy_name,
          trade_type: config.trade_type,
          operation: 'update_config',
          operator: 'admin',
          details: `Updated config: freeze_on_loss_count=${oldValues.freeze_on_loss_count}→${freeze_on_loss_count}, freeze_hours=${oldValues.freeze_hours}→${freeze_hours}`,
          created_at: new Date().toISOString()
        })

        return {
          code: 200,
          data: config
        }
      } else {
        return {
          code: 404,
          message: 'Configuration not found'
        }
      }
    }
  },

  // Delete strategy freeze config
  {
    url: '/strategy-freeze/\\d+',
    type: 'delete',
    response: (req) => {
      const id = parseInt(req.url.split('/').pop())
      const configIndex = strategyFreezeConfigs.findIndex(config => config.id === id)
      
      if (configIndex !== -1) {
        const deletedConfig = strategyFreezeConfigs[configIndex]
        strategyFreezeConfigs.splice(configIndex, 1)

        // Add log
        operationLogs.unshift({
          id: operationLogs.length + 1,
          symbol: deletedConfig.symbol,
          strategy_name: deletedConfig.strategy_name,
          trade_type: deletedConfig.trade_type,
          operation: 'delete_config',
          operator: 'admin',
          details: 'Deleted freeze configuration',
          created_at: new Date().toISOString()
        })

        return {
          code: 200,
          data: 'Configuration deleted successfully'
        }
      } else {
        return {
          code: 404,
          message: 'Configuration not found'
        }
      }
    }
  },

  // Get strategy freeze list (less specific - should be last)
  {
    url: '/strategy-freeze',
    type: 'get',
    response: (req) => {
      const { symbol, strategy_name, trade_type, page = 1, pageSize = 20 } = req.query
      
      let filteredConfigs = strategyFreezeConfigs.filter(config => {
        if (symbol && config.symbol !== symbol) return false
        if (strategy_name && config.strategy_name !== strategy_name) return false
        if (trade_type && config.trade_type !== trade_type) return false
        return true
      })

      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const list = filteredConfigs.slice(start, end)

      return {
        code: 200,
        data: {
          list: list,
          total: filteredConfigs.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },

  // Create new strategy freeze config
  {
    url: '/strategy-freeze',
    type: 'post',
    response: (req) => {
      const { symbol, strategy_name, trade_type, freeze_on_loss_count, freeze_hours } = req.body
      
      // Check if config already exists
      const existingConfig = strategyFreezeConfigs.find(config => 
        config.symbol === symbol && 
        config.strategy_name === strategy_name && 
        config.trade_type === trade_type
      )

      if (existingConfig) {
        // Update existing config
        existingConfig.freeze_on_loss_count = freeze_on_loss_count
        existingConfig.freeze_hours = freeze_hours
        existingConfig.updated_at = new Date().toISOString()
        
        // Add log
        operationLogs.unshift({
          id: operationLogs.length + 1,
          symbol,
          strategy_name,
          trade_type,
          operation: 'update_config',
          operator: 'admin',
          details: `Updated freeze_on_loss_count to ${freeze_on_loss_count}, freeze_hours to ${freeze_hours}`,
          created_at: new Date().toISOString()
        })

        return {
          code: 200,
          data: existingConfig
        }
      } else {
        // Create new config
        const newConfig = {
          id: nextId++,
          symbol,
          strategy_name,
          trade_type,
          freeze_on_loss_count,
          freeze_hours,
          loss_count: 0,
          freeze_until: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        strategyFreezeConfigs.push(newConfig)

        // Add log
        operationLogs.unshift({
          id: operationLogs.length + 1,
          symbol,
          strategy_name,
          trade_type,
          operation: 'create_config',
          operator: 'admin',
          details: `Created new freeze config: freeze_on_loss_count=${freeze_on_loss_count}, freeze_hours=${freeze_hours}`,
          created_at: new Date().toISOString()
        })

        return {
          code: 200,
          data: newConfig
        }
      }
    }
  }
]