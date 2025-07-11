import request from '@/utils/request'

// Strategy & Parameter Space APIs
export function getStrategyTemplates(query = {}) {
  return request({
    url: '/ai-optimization/strategy-templates',
    method: 'get',
    params: query,
  })
}

export function saveStrategyTemplate(data) {
  return request({
    url: '/ai-optimization/strategy-templates',
    method: 'post',
    data,
  })
}

export function updateStrategyTemplate(id, data) {
  return request({
    url: `/ai-optimization/strategy-templates/${id}`,
    method: 'put',
    data,
  })
}

export function deleteStrategyTemplate(id) {
  return request({
    url: `/ai-optimization/strategy-templates/${id}`,
    method: 'delete',
  })
}

export function validateStrategyExpression(data) {
  return request({
    url: '/ai-optimization/strategy-templates/validate',
    method: 'post',
    data,
  })
}

// Parameter Space APIs
export function getParameterSpaces(query = {}) {
  return request({
    url: '/ai-optimization/parameter-spaces',
    method: 'get',
    params: query,
  })
}

export function saveParameterSpace(data) {
  return request({
    url: '/ai-optimization/parameter-spaces',
    method: 'post',
    data,
  })
}

export function updateParameterSpace(id, data) {
  return request({
    url: `/ai-optimization/parameter-spaces/${id}`,
    method: 'put',
    data,
  })
}

export function deleteParameterSpace(id) {
  return request({
    url: `/ai-optimization/parameter-spaces/${id}`,
    method: 'delete',
  })
}

// Optimization Task APIs
export function getOptimizationTasks(query = {}) {
  return request({
    url: '/ai-optimization/tasks',
    method: 'get',
    params: query,
  })
}

export function createOptimizationTask(data) {
  return request({
    url: '/ai-optimization/tasks',
    method: 'post',
    data,
  })
}

export function getOptimizationTask(id) {
  return request({
    url: `/ai-optimization/tasks/${id}`,
    method: 'get',
  })
}

export function updateOptimizationTask(id, data) {
  return request({
    url: `/ai-optimization/tasks/${id}`,
    method: 'put',
    data,
  })
}

export function deleteOptimizationTask(id) {
  return request({
    url: `/ai-optimization/tasks/${id}`,
    method: 'delete',
  })
}

export function startOptimizationTask(id) {
  return request({
    url: `/ai-optimization/tasks/${id}/start`,
    method: 'post',
  })
}

export function stopOptimizationTask(id) {
  return request({
    url: `/ai-optimization/tasks/${id}/stop`,
    method: 'post',
  })
}

export function pauseOptimizationTask(id) {
  return request({
    url: `/ai-optimization/tasks/${id}/pause`,
    method: 'post',
  })
}

export function resumeOptimizationTask(id) {
  return request({
    url: `/ai-optimization/tasks/${id}/resume`,
    method: 'post',
  })
}

// Task Monitoring APIs
export function getTaskProgress(id) {
  return request({
    url: `/ai-optimization/tasks/${id}/progress`,
    method: 'get',
  })
}

export function getTaskMetrics(id, query = {}) {
  return request({
    url: `/ai-optimization/tasks/${id}/metrics`,
    method: 'get',
    params: query,
  })
}

export function getTaskResults(id, query = {}) {
  return request({
    url: `/ai-optimization/tasks/${id}/results`,
    method: 'get',
    params: query,
  })
}

export function getTaskHeatmap(id, query = {}) {
  return request({
    url: `/ai-optimization/tasks/${id}/heatmap`,
    method: 'get',
    params: query,
  })
}

export function exportTaskResults(id, format = 'json') {
  return request({
    url: `/ai-optimization/tasks/${id}/export`,
    method: 'get',
    params: { format },
    responseType: 'blob',
  })
}

// Live Deployment APIs
export function getOptimalParameters(taskId) {
  return request({
    url: `/ai-optimization/tasks/${taskId}/optimal-parameters`,
    method: 'get',
  })
}

export function deployToLive(data) {
  return request({
    url: '/ai-optimization/deploy-to-live',
    method: 'post',
    data,
  })
}

export function getLiveDeploymentStatus(deploymentId) {
  return request({
    url: `/ai-optimization/live-deployments/${deploymentId}/status`,
    method: 'get',
  })
}

export function getLivePerformance(deploymentId, query = {}) {
  return request({
    url: `/ai-optimization/live-deployments/${deploymentId}/performance`,
    method: 'get',
    params: query,
  })
}

export function stopLiveDeployment(deploymentId) {
  return request({
    url: `/ai-optimization/live-deployments/${deploymentId}/stop`,
    method: 'post',
  })
}

// Historical Data APIs
export function getHistoricalTasks(query = {}) {
  return request({
    url: '/ai-optimization/historical-tasks',
    method: 'get',
    params: query,
  })
}

export function getTaskReport(taskId) {
  return request({
    url: `/ai-optimization/tasks/${taskId}/report`,
    method: 'get',
  })
}

export function exportTaskReport(taskId, format = 'pdf') {
  return request({
    url: `/ai-optimization/tasks/${taskId}/report/export`,
    method: 'get',
    params: { format },
    responseType: 'blob',
  })
}
