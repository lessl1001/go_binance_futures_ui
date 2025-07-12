import request from '@/utils/request'

// Strategy & Parameter Space APIs
// Updated to use new unified API endpoints
export function getStrategyTemplates(query = {}) {
  return request({
    url: '/api/deploy_strategy',
    method: 'get',
    params: query,
  })
}

export function saveStrategyTemplate(data) {
  // Ensure unified data structure
  const unifiedData = {
    name: data.name,
    description: data.description,
    expression: data.expression,
    category: data.category || 'Long', // Default category if not provided
    type: data.type || 'strategy', // Mark as strategy type
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  return request({
    url: '/api/deploy_strategy',
    method: 'post',
    data: unifiedData,
  })
}

export function updateStrategyTemplate(id, data) {
  // Ensure unified data structure
  const unifiedData = {
    ...data,
    category: data.category || 'Long',
    type: data.type || 'strategy',
    updated_at: new Date().toISOString(),
  }
  
  return request({
    url: `/api/deploy_strategy/${id}`,
    method: 'put',
    data: unifiedData,
  })
}

export function deleteStrategyTemplate(id) {
  return request({
    url: `/api/deploy_strategy/${id}`, // Updated from /ai-optimization/strategy-templates/${id}
    method: 'delete',
  })
}

export function validateStrategyExpression(data) {
  // Enhanced validation with better error handling
  const validationData = {
    expression: data.expression,
    category: data.category || 'Long',
    context: data.context || 'strategy_editor'
  }
  
  return request({
    url: '/api/deploy_strategy/validate',
    method: 'post',
    data: validationData,
    timeout: 10000, // 10 second timeout for validation
  }).catch(error => {
    // Enhanced error handling
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Strategy validation failed'
    
    throw {
      ...error,
      message: errorMessage,
      validationError: true
    }
  })
}

// Parameter Space APIs - now mapped to backtest endpoints
export function getParameterSpaces(query = {}) {
  return request({
    url: '/api/backtest', // Updated from /ai-optimization/parameter-spaces
    method: 'get',
    params: query,
  })
}

export function saveParameterSpace(data) {
  return request({
    url: '/api/backtest', // Updated from /ai-optimization/parameter-spaces
    method: 'post',
    data,
  })
}

export function updateParameterSpace(id, data) {
  return request({
    url: `/api/backtest/${id}`, // Updated from /ai-optimization/parameter-spaces/${id}
    method: 'put',
    data,
  })
}

export function deleteParameterSpace(id) {
  return request({
    url: `/api/backtest/${id}`, // Updated from /ai-optimization/parameter-spaces/${id}
    method: 'delete',
  })
}

// Optimization Task APIs - now mapped to backtest endpoints
export function getOptimizationTasks(query = {}) {
  return request({
    url: '/api/backtest', // Updated from /ai-optimization/tasks
    method: 'get',
    params: query,
  })
}

export function createOptimizationTask(data) {
  return request({
    url: '/api/backtest', // Updated from /ai-optimization/tasks
    method: 'post',
    data,
  })
}

export function getOptimizationTask(id) {
  return request({
    url: `/api/backtest/${id}`, // Updated from /ai-optimization/tasks/${id}
    method: 'get',
  })
}

export function updateOptimizationTask(id, data) {
  return request({
    url: `/api/backtest/${id}`, // Updated from /ai-optimization/tasks/${id}
    method: 'put',
    data,
  })
}

export function deleteOptimizationTask(id) {
  return request({
    url: `/api/backtest/${id}`, // Updated from /ai-optimization/tasks/${id}
    method: 'delete',
  })
}

export function startOptimizationTask(id) {
  return request({
    url: `/api/backtest/${id}/start`, // Updated from /ai-optimization/tasks/${id}/start
    method: 'post',
  })
}

export function stopOptimizationTask(id) {
  return request({
    url: `/api/backtest/${id}/stop`, // Updated from /ai-optimization/tasks/${id}/stop
    method: 'post',
  })
}

export function pauseOptimizationTask(id) {
  return request({
    url: `/api/backtest/${id}/pause`, // Updated from /ai-optimization/tasks/${id}/pause
    method: 'post',
  })
}

export function resumeOptimizationTask(id) {
  return request({
    url: `/api/backtest/${id}/resume`, // Updated from /ai-optimization/tasks/${id}/resume
    method: 'post',
  })
}

// Task Monitoring APIs - updated to new endpoints
export function getTaskProgress(id) {
  return request({
    url: `/api/backtest/${id}/progress`, // Updated from /ai-optimization/tasks/${id}/progress
    method: 'get',
  })
}

export function getTaskMetrics(id, query = {}) {
  return request({
    url: `/api/backtest/${id}/metrics`, // Updated from /ai-optimization/tasks/${id}/metrics
    method: 'get',
    params: query,
  })
}

export function getTaskResults(id, query = {}) {
  return request({
    url: `/api/backtest/${id}/results`, // Updated from /ai-optimization/tasks/${id}/results
    method: 'get',
    params: query,
  })
}

export function getTaskHeatmap(id, query = {}) {
  return request({
    url: `/api/backtest/${id}/heatmap`, // Updated from /ai-optimization/tasks/${id}/heatmap
    method: 'get',
    params: query,
  })
}

export function exportTaskResults(id, format = 'json') {
  return request({
    url: `/api/backtest/${id}/export`, // Updated from /ai-optimization/tasks/${id}/export
    method: 'get',
    params: { format },
    responseType: 'blob',
  })
}

// Live Deployment APIs - updated to new endpoints
export function getOptimalParameters(taskId) {
  return request({
    url: `/api/backtest/${taskId}/optimal-parameters`, // Updated from /ai-optimization/tasks/${taskId}/optimal-parameters
    method: 'get',
  })
}

export function deployToLive(data) {
  return request({
    url: '/api/deploy_strategy', // Updated from /ai-optimization/deploy-to-live
    method: 'post',
    data,
  })
}

export function getLiveDeploymentStatus(deploymentId) {
  return request({
    url: `/api/deploy_strategy/${deploymentId}/status`, // Updated from /ai-optimization/live-deployments/${deploymentId}/status
    method: 'get',
  })
}

export function getLivePerformance(deploymentId, query = {}) {
  return request({
    url: `/api/deploy_strategy/${deploymentId}/performance`, // Updated from /ai-optimization/live-deployments/${deploymentId}/performance
    method: 'get',
    params: query,
  })
}

export function stopLiveDeployment(deploymentId) {
  return request({
    url: `/api/deploy_strategy/${deploymentId}/stop`, // Updated from /ai-optimization/live-deployments/${deploymentId}/stop
    method: 'post',
  })
}

// Historical Data APIs - updated to new endpoints
export function getHistoricalTasks(query = {}) {
  return request({
    url: '/api/backtest', // Updated from /ai-optimization/historical-tasks (now uses same endpoint as getOptimizationTasks)
    method: 'get',
    params: query,
  })
}

export function getTaskReport(taskId) {
  return request({
    url: `/api/backtest/${taskId}/report`, // Updated from /ai-optimization/tasks/${taskId}/report
    method: 'get',
  })
}

export function exportTaskReport(taskId, format = 'pdf') {
  return request({
    url: `/api/backtest/${taskId}/report/export`, // Updated from /ai-optimization/tasks/${taskId}/report/export
    method: 'get',
    params: { format },
    responseType: 'blob',
  })
}

// Operation Logs API - added to support new backend functionality
export function getOperationLogs(query = {}) {
  return request({
    url: '/api/operation_logs', // New endpoint for operation logs
    method: 'get',
    params: query,
  })
}
