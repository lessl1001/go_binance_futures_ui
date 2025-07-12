// Backend-compatible task management utilities
export const taskStatusTypes = {
  pending: { type: 'info', label: '待处理' },
  running: { type: 'warning', label: '运行中' },
  paused: { type: 'warning', label: '已暂停' },
  completed: { type: 'success', label: '已完成' },
  failed: { type: 'danger', label: '失败' },
  cancelled: { type: 'info', label: '已取消' },
}

export const optimizationTargets = {
  profit: { label: '利润', unit: 'USDT', format: (value) => `${value.toFixed(2)} USDT` },
  sharpe_ratio: { label: '夏普比率', unit: '', format: (value) => value.toFixed(4) },
  max_drawdown: { label: '最大回撤', unit: '%', format: (value) => `${(value * 100).toFixed(2)}%` },
  win_rate: { label: '胜率', unit: '%', format: (value) => `${(value * 100).toFixed(2)}%` },
  profit_factor: { label: '盈利因子', unit: '', format: (value) => value.toFixed(2) },
}

// Default task configuration
export const defaultTaskConfig = {
  name: '',
  description: '',
  strategy_id: '',
  parameter_space_id: '',
  symbol: 'BTCUSDT',
  timeframe: '1h',
  start_date: '',
  end_date: '',
  initial_capital: 10000,
  optimization_target: 'profit',
  max_iterations: 1000,
  population_size: 50,
  mutation_rate: 0.1,
  crossover_rate: 0.8,
  convergence_threshold: 0.001,
  max_generations: 100,
}

// Convert task to backend format
export function convertTaskToBackendFormat(task) {
  return {
    name: task.name,
    description: task.description,
    strategy_id: task.strategy_id,
    parameter_space_id: task.parameter_space_id,
    symbol: task.symbol,
    timeframe: task.timeframe,
    start_date: task.start_date,
    end_date: task.end_date,
    initial_capital: task.initial_capital,
    optimization_config: {
      target: task.optimization_target,
      max_iterations: task.max_iterations,
      population_size: task.population_size,
      mutation_rate: task.mutation_rate,
      crossover_rate: task.crossover_rate,
      convergence_threshold: task.convergence_threshold,
      max_generations: task.max_generations,
    },
  }
}

// Convert task from backend format
export function convertTaskFromBackendFormat(backendTask) {
  return {
    id: backendTask.id,
    name: backendTask.name,
    description: backendTask.description,
    strategy_id: backendTask.strategy_id,
    parameter_space_id: backendTask.parameter_space_id,
    symbol: backendTask.symbol,
    timeframe: backendTask.timeframe,
    start_date: backendTask.start_date,
    end_date: backendTask.end_date,
    initial_capital: backendTask.initial_capital,
    optimization_target: backendTask.optimization_config?.target || 'profit',
    max_iterations: backendTask.optimization_config?.max_iterations || 1000,
    population_size: backendTask.optimization_config?.population_size || 50,
    mutation_rate: backendTask.optimization_config?.mutation_rate || 0.1,
    crossover_rate: backendTask.optimization_config?.crossover_rate || 0.8,
    convergence_threshold: backendTask.optimization_config?.convergence_threshold || 0.001,
    max_generations: backendTask.optimization_config?.max_generations || 100,
    status: backendTask.status,
    progress: backendTask.progress,
    current_iteration: backendTask.current_iteration,
    best_objective_value: backendTask.best_objective_value,
    best_parameters: backendTask.best_parameters,
    start_time: backendTask.start_time,
    end_time: backendTask.end_time,
    elapsed_time: backendTask.elapsed_time,
    created_at: backendTask.created_at,
    updated_at: backendTask.updated_at,
    strategy_name: backendTask.strategy_name,
    parameter_space_name: backendTask.parameter_space_name,
    strategy_expression: backendTask.strategy_expression,
    enabled_parameters: backendTask.enabled_parameters,
  }
}

// Validate task configuration
export function validateTaskConfig(task) {
  const errors = []

  if (!task.name || task.name.trim() === '') {
    errors.push('任务名称不能为空')
  }

  if (!task.strategy_id) {
    errors.push('请选择策略')
  }

  if (!task.parameter_space_id) {
    errors.push('请选择参数空间')
  }

  if (!task.symbol || task.symbol.trim() === '') {
    errors.push('请选择交易对')
  }

  if (!task.timeframe) {
    errors.push('请选择时间周期')
  }

  if (!task.start_date) {
    errors.push('请选择开始日期')
  }

  if (!task.end_date) {
    errors.push('请选择结束日期')
  }

  if (task.start_date && task.end_date && new Date(task.start_date) >= new Date(task.end_date)) {
    errors.push('开始日期必须早于结束日期')
  }

  if (task.initial_capital <= 0) {
    errors.push('初始资金必须大于0')
  }

  if (task.max_iterations <= 0) {
    errors.push('最大迭代次数必须大于0')
  }

  if (task.population_size <= 0) {
    errors.push('种群大小必须大于0')
  }

  if (task.mutation_rate < 0 || task.mutation_rate > 1) {
    errors.push('变异率必须在0-1之间')
  }

  if (task.crossover_rate < 0 || task.crossover_rate > 1) {
    errors.push('交叉率必须在0-1之间')
  }

  return errors
}

// Format task details for display
export function formatTaskDetails(task) {
  const formatValue = (value, target) => {
    if (value === null || value === undefined) return '-'
    const config = optimizationTargets[target] || optimizationTargets.profit
    return config.format(value)
  }

  return {
    ...task,
    formatted_best_objective_value: formatValue(task.best_objective_value, task.optimization_target),
    formatted_elapsed_time: formatElapsedTime(task.elapsed_time),
    formatted_progress: `${task.progress || 0}%`,
    formatted_status: taskStatusTypes[task.status]?.label || task.status,
  }
}

// Format elapsed time
export function formatElapsedTime(seconds) {
  if (!seconds) return '-'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}小时${minutes}分${remainingSeconds}秒`
  } else if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`
  } else {
    return `${remainingSeconds}秒`
  }
}

// Get supported symbols
export const supportedSymbols = [
  { value: 'BTCUSDT', label: 'BTC/USDT' },
  { value: 'ETHUSDT', label: 'ETH/USDT' },
  { value: 'SOLUSDT', label: 'SOL/USDT' },
  { value: 'BNBUSDT', label: 'BNB/USDT' },
  { value: 'ADAUSDT', label: 'ADA/USDT' },
  { value: 'XRPUSDT', label: 'XRP/USDT' },
  { value: 'DOTUSDT', label: 'DOT/USDT' },
  { value: 'LINKUSDT', label: 'LINK/USDT' },
  { value: 'LTCUSDT', label: 'LTC/USDT' },
  { value: 'BCHUSDT', label: 'BCH/USDT' },
]

// Get supported timeframes
export const supportedTimeframes = [
  { value: '1m', label: '1分钟' },
  { value: '3m', label: '3分钟' },
  { value: '5m', label: '5分钟' },
  { value: '15m', label: '15分钟' },
  { value: '30m', label: '30分钟' },
  { value: '1h', label: '1小时' },
  { value: '2h', label: '2小时' },
  { value: '4h', label: '4小时' },
  { value: '6h', label: '6小时' },
  { value: '8h', label: '8小时' },
  { value: '12h', label: '12小时' },
  { value: '1d', label: '1天' },
  { value: '3d', label: '3天' },
  { value: '1w', label: '1周' },
]

// Generate task summary for display
export function generateTaskSummary(task) {
  const summary = {
    basic_info: {
      name: task.name,
      description: task.description,
      status: taskStatusTypes[task.status]?.label || task.status,
      progress: `${task.progress || 0}%`,
      created_at: task.created_at,
    },
    strategy_info: {
      strategy_name: task.strategy_name,
      strategy_expression: task.strategy_expression,
      parameter_space_name: task.parameter_space_name,
      enabled_parameters_count: task.enabled_parameters ? task.enabled_parameters.length : 0,
    },
    market_config: {
      symbol: task.symbol,
      timeframe: task.timeframe,
      start_date: task.start_date,
      end_date: task.end_date,
      initial_capital: `${task.initial_capital} USDT`,
    },
    optimization_config: {
      target: optimizationTargets[task.optimization_target]?.label || task.optimization_target,
      max_iterations: task.max_iterations,
      population_size: task.population_size,
      mutation_rate: `${(task.mutation_rate * 100).toFixed(1)}%`,
      crossover_rate: `${(task.crossover_rate * 100).toFixed(1)}%`,
    },
    results: {
      current_iteration: task.current_iteration,
      best_objective_value: task.best_objective_value
        ? optimizationTargets[task.optimization_target]?.format(task.best_objective_value) : '-',
      elapsed_time: formatElapsedTime(task.elapsed_time),
      start_time: task.start_time,
      end_time: task.end_time,
    },
  }

  return summary
}
