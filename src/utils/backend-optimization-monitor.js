// Backend-compatible optimization monitor utilities
import { 
  taskStatusTypes, 
  optimizationTargets, 
  formatElapsedTime, 
  convertTaskFromBackendFormat 
} from './backend-task-management.js'

// Real-time monitoring data structure
export const monitoringDataStructure = {
  task_info: {
    id: '',
    name: '',
    description: '',
    status: '',
    progress: 0,
    current_iteration: 0,
    max_iterations: 0,
    elapsed_time: 0,
    start_time: '',
    strategy_name: '',
    strategy_expression: '',
    parameter_space_name: '',
    enabled_parameters: [],
    optimization_target: '',
    symbol: '',
    timeframe: '',
    initial_capital: 0
  },
  optimization_progress: {
    current_iteration: 0,
    max_iterations: 0,
    convergence_rate: 0,
    best_objective_value: 0,
    current_objective_value: 0,
    improvement_rate: 0,
    generations_without_improvement: 0,
    estimated_time_remaining: 0
  },
  current_parameters: {},
  best_parameters: {},
  parameter_history: [],
  objective_history: [],
  convergence_history: [],
  population_metrics: {
    population_size: 0,
    diversity_index: 0,
    average_fitness: 0,
    best_fitness: 0,
    worst_fitness: 0
  },
  performance_metrics: {
    total_trades: 0,
    winning_trades: 0,
    losing_trades: 0,
    win_rate: 0,
    profit_factor: 0,
    max_drawdown: 0,
    sharpe_ratio: 0,
    total_profit: 0,
    average_trade_duration: 0
  },
  real_time_logs: []
}

// Format monitoring data for display
export function formatMonitoringData(rawData) {
  const data = { ...monitoringDataStructure, ...rawData }
  
  return {
    ...data,
    task_info: {
      ...data.task_info,
      formatted_elapsed_time: formatElapsedTime(data.task_info.elapsed_time),
      formatted_progress: `${data.task_info.progress || 0}%`,
      formatted_status: taskStatusTypes[data.task_info.status]?.label || data.task_info.status,
      formatted_objective_value: data.task_info.optimization_target ? 
        optimizationTargets[data.task_info.optimization_target]?.format(data.optimization_progress.best_objective_value) : 
        data.optimization_progress.best_objective_value
    },
    optimization_progress: {
      ...data.optimization_progress,
      formatted_estimated_time: formatElapsedTime(data.optimization_progress.estimated_time_remaining),
      formatted_convergence_rate: `${(data.optimization_progress.convergence_rate * 100).toFixed(2)}%`,
      formatted_improvement_rate: `${(data.optimization_progress.improvement_rate * 100).toFixed(2)}%`
    },
    performance_metrics: {
      ...data.performance_metrics,
      formatted_win_rate: `${(data.performance_metrics.win_rate * 100).toFixed(2)}%`,
      formatted_profit_factor: data.performance_metrics.profit_factor.toFixed(2),
      formatted_max_drawdown: `${(data.performance_metrics.max_drawdown * 100).toFixed(2)}%`,
      formatted_sharpe_ratio: data.performance_metrics.sharpe_ratio.toFixed(4),
      formatted_total_profit: `${data.performance_metrics.total_profit.toFixed(2)} USDT`,
      formatted_avg_trade_duration: formatElapsedTime(data.performance_metrics.average_trade_duration)
    }
  }
}

// Chart configuration for monitoring
export const chartConfigs = {
  objectiveChart: {
    title: '目标值收敛图',
    xAxis: {
      type: 'category',
      name: '迭代次数'
    },
    yAxis: {
      type: 'value',
      name: '目标值'
    },
    series: [
      {
        name: '最优目标值',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          color: '#409eff',
          width: 2
        },
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '当前目标值',
        type: 'line',
        smooth: true,
        symbolSize: 4,
        lineStyle: {
          color: '#67c23a',
          width: 1
        },
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  },
  convergenceChart: {
    title: '收敛率图',
    xAxis: {
      type: 'category',
      name: '迭代次数'
    },
    yAxis: {
      type: 'value',
      name: '收敛率 (%)',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '收敛率',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          color: '#e6a23c',
          width: 2
        },
        itemStyle: {
          color: '#e6a23c'
        }
      }
    ]
  },
  populationChart: {
    title: '种群指标',
    xAxis: {
      type: 'category',
      name: '迭代次数'
    },
    yAxis: {
      type: 'value',
      name: '适应度值'
    },
    series: [
      {
        name: '最优适应度',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          color: '#f56c6c',
          width: 2
        },
        itemStyle: {
          color: '#f56c6c'
        }
      },
      {
        name: '平均适应度',
        type: 'line',
        smooth: true,
        symbolSize: 4,
        lineStyle: {
          color: '#909399',
          width: 1
        },
        itemStyle: {
          color: '#909399'
        }
      }
    ]
  }
}

// Generate parameter heatmap data
export function generateParameterHeatmap(parameterHistory, enabledParameters) {
  if (!parameterHistory || parameterHistory.length === 0) return null
  
  const heatmapData = []
  const parameterNames = enabledParameters.map(param => param.name)
  
  parameterHistory.forEach((iteration, iterationIndex) => {
    parameterNames.forEach((paramName, paramIndex) => {
      const value = iteration[paramName]
      if (value !== undefined) {
        heatmapData.push([iterationIndex, paramIndex, value])
      }
    })
  })
  
  return {
    title: '参数热力图',
    xAxis: {
      type: 'category',
      data: parameterHistory.map((_, index) => `第${index + 1}次`),
      name: '迭代次数'
    },
    yAxis: {
      type: 'category',
      data: parameterNames,
      name: '参数名称'
    },
    series: [
      {
        name: '参数值',
        type: 'heatmap',
        data: heatmapData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

// Format strategy expression for display
export function formatStrategyExpression(expression) {
  if (!expression) return ''
  
  // Add proper formatting for backend expressions
  return expression
    .replace(/&&/g, ' &&\n   ')
    .replace(/\|\|/g, ' ||\n   ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Format parameter details for display
export function formatParameterDetails(parameters) {
  if (!parameters || parameters.length === 0) return []
  
  return parameters.map(param => ({
    name: param.name,
    type: param.type || 'unknown',
    current_value: param.current_value,
    best_value: param.best_value,
    min_value: param.min_value,
    max_value: param.max_value,
    description: param.description || '',
    variation: param.best_value && param.current_value ? 
      ((param.best_value - param.current_value) / param.current_value * 100).toFixed(2) + '%' : 
      '0%'
  }))
}

// Real-time log levels
export const logLevels = {
  INFO: { color: '#909399', label: '信息' },
  SUCCESS: { color: '#67c23a', label: '成功' },
  WARNING: { color: '#e6a23c', label: '警告' },
  ERROR: { color: '#f56c6c', label: '错误' },
  DEBUG: { color: '#409eff', label: '调试' }
}

// Format log entry
export function formatLogEntry(log) {
  return {
    ...log,
    formatted_timestamp: new Date(log.timestamp).toLocaleString(),
    level_config: logLevels[log.level] || logLevels.INFO,
    formatted_message: log.message || ''
  }
}

// Auto-refresh intervals
export const refreshIntervals = {
  FAST: 1000,    // 1 second
  NORMAL: 5000,  // 5 seconds
  SLOW: 10000,   // 10 seconds
  VERY_SLOW: 30000 // 30 seconds
}

// Get appropriate refresh interval based on task status
export function getRefreshInterval(taskStatus) {
  switch (taskStatus) {
    case 'running':
      return refreshIntervals.FAST
    case 'paused':
      return refreshIntervals.SLOW
    case 'completed':
    case 'failed':
    case 'cancelled':
      return refreshIntervals.VERY_SLOW
    default:
      return refreshIntervals.NORMAL
  }
}

// Performance thresholds for alerts
export const performanceThresholds = {
  excellent: {
    win_rate: 0.7,
    profit_factor: 2.0,
    max_drawdown: 0.05,
    sharpe_ratio: 1.5
  },
  good: {
    win_rate: 0.6,
    profit_factor: 1.5,
    max_drawdown: 0.10,
    sharpe_ratio: 1.0
  },
  average: {
    win_rate: 0.5,
    profit_factor: 1.2,
    max_drawdown: 0.15,
    sharpe_ratio: 0.5
  },
  poor: {
    win_rate: 0.4,
    profit_factor: 1.0,
    max_drawdown: 0.20,
    sharpe_ratio: 0.0
  }
}

// Evaluate performance level
export function evaluatePerformance(metrics) {
  const { win_rate, profit_factor, max_drawdown, sharpe_ratio } = metrics
  
  const scores = {
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0
  }
  
  Object.keys(performanceThresholds).forEach(level => {
    const threshold = performanceThresholds[level]
    
    if (win_rate >= threshold.win_rate) scores[level]++
    if (profit_factor >= threshold.profit_factor) scores[level]++
    if (max_drawdown <= threshold.max_drawdown) scores[level]++
    if (sharpe_ratio >= threshold.sharpe_ratio) scores[level]++
  })
  
  // Find the level with highest score
  const maxScore = Math.max(...Object.values(scores))
  const bestLevel = Object.keys(scores).find(level => scores[level] === maxScore)
  
  return {
    level: bestLevel,
    score: maxScore,
    total: 4,
    percentage: (maxScore / 4 * 100).toFixed(1)
  }
}

export default {
  monitoringDataStructure,
  formatMonitoringData,
  chartConfigs,
  generateParameterHeatmap,
  formatStrategyExpression,
  formatParameterDetails,
  logLevels,
  formatLogEntry,
  refreshIntervals,
  getRefreshInterval,
  performanceThresholds,
  evaluatePerformance
}