import request from '@/utils/request'

// 1. 获取冻结配置列表
export function getStrategyFreezeList(query = {}) {
  return request({
    url: '/strategy-freeze',
    method: 'get',
    params: query,
  })
}

// 2. 创建或更新冻结配置
export function createOrUpdateStrategyFreeze(data) {
  return request({
    url: '/strategy-freeze',
    method: 'post',
    data,
  })
}

// 3. 获取单个冻结配置
export function getStrategyFreezeConfig(params) {
  return request({
    url: '/strategy-freeze/config',
    method: 'get',
    params,
  })
}

// 4. 更新冻结配置（根据ID）
export function updateStrategyFreeze(id, data) {
  return request({
    url: `/strategy-freeze/${id}`,
    method: 'put',
    data,
  })
}

// 5. 删除冻结配置
export function deleteStrategyFreeze(id) {
  return request({
    url: `/strategy-freeze/${id}`,
    method: 'delete',
  })
}

// 6. 手动解除冻结
export function unfreezeStrategy(data) {
  return request({
    url: '/strategy-freeze/unfreeze',
    method: 'post',
    data,
  })
}

// 7. 重置亏损次数
export function resetStrategyLoss(data) {
  return request({
    url: '/strategy-freeze/reset-loss',
    method: 'post',
    data,
  })
}

// 8. 获取操作日志
export function getStrategyFreezeLogs(query = {}) {
  return request({
    url: '/strategy-freeze/logs',
    method: 'get',
    params: query,
  })
}

// 9. 获取可用的币种和策略选项
export function getStrategyFreezeOptions() {
  return request({
    url: '/strategy-freeze/options',
    method: 'get',
  })
}

// 10. 模拟交易结果（用于测试冻结逻辑）
export function simulateTradeResult(data) {
  return request({
    url: '/strategy-freeze/simulate-trade',
    method: 'post',
    data,
  })
}
