import request from '@/utils/request'

// 1. 获取冻结配置列表
export function getStrategyFreezeList(query = {}) {
  return request({
    url: '/straategy-freeze',
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

// 5. 手动解除冻结
export function unfreezeStrategy(data) {
  return request({
    url: '/strategy-freeze/unfreeze',
    method: 'post',
    data,
  })
}

// 6. 重置亏损次数
export function resetStrategyLoss(data) {
  return request({
    url: '/strategy-freeze/reset-loss',
    method: 'post',
    data,
  })
}