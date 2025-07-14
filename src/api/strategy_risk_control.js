import request from '@/utils/request'

// Get strategy risk control parameters
export function getRiskControlList(query = {}) {
  return request({
    url: '/strategy/risk-control',
    method: 'get',
    params: query,
  })
}

// Update strategy risk control parameters
export function updateRiskControlParams(data) {
  return request({
    url: '/strategy/risk-control',
    method: 'put',
    data,
  })
}

// Batch update strategy risk control parameters
export function batchUpdateRiskControlParams(data) {
  return request({
    url: '/strategy/risk-control/batch',
    method: 'put',
    data,
  })
}

// Get strategy risk control operation logs
export function getRiskControlLogs(query = {}) {
  return request({
    url: '/strategy/risk-control/logs',
    method: 'get',
    params: query,
  })
}

// Get enabled strategies and coins for filters
export function getEnabledStrategiesAndCoins() {
  return request({
    url: '/strategy/risk-control/enabled-options',
    method: 'get',
  })
}