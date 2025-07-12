// K-line intervals supported by backend
export const klineIntervals = [
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
  { value: '1M', label: '1月' }
]

// Backend-compatible parameter space definitions based on STRATEGY.CN.md
export const technicalIndicators = {
  ma: {
    name: 'ma',
    label: '移动平均线',
    fields: [
      { name: 'name', label: '名称', type: 'text', required: true, placeholder: '例如: ma1' },
      { name: 'kline_type', label: 'K线类型', type: 'select', required: true, options: klineIntervals },
      { name: 'period', label: '周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'enabled', label: '启用', type: 'switch', required: true, default: true }
    ]
  },
  ema: {
    name: 'ema',
    label: '指数移动平均线',
    fields: [
      { name: 'name', label: '名称', type: 'text', required: true, placeholder: '例如: ema_4h_3' },
      { name: 'kline_type', label: 'K线类型', type: 'select', required: true, options: klineIntervals },
      { name: 'period', label: '周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'enabled', label: '启用', type: 'switch', required: true, default: true }
    ]
  },
  rsi: {
    name: 'rsi',
    label: '相对强弱指数',
    fields: [
      { name: 'name', label: '名称', type: 'text', required: true, placeholder: '例如: rsi_1h_14' },
      { name: 'kline_type', label: 'K线类型', type: 'select', required: true, options: klineIntervals },
      { name: 'period', label: '周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'enabled', label: '启用', type: 'switch', required: true, default: true }
    ]
  },
  kc: {
    name: 'kc',
    label: '肯纳特通道',
    fields: [
      { name: 'name', label: '名称', type: 'text', required: true, placeholder: '例如: kc_1' },
      { name: 'kline_type', label: 'K线类型', type: 'select', required: true, options: klineIntervals },
      { name: 'period', label: '周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'multiplier', label: '多元', type: 'number', required: true, min: 0.1, max: 10, step: 0.1 },
      { name: 'enabled', label: '启用', type: 'switch', required: true, default: true }
    ]
  },
  boll: {
    name: 'boll',
    label: '布林带',
    fields: [
      { name: 'name', label: '名称', type: 'text', required: true, placeholder: '例如: boll_1' },
      { name: 'kline_type', label: 'K线类型', type: 'select', required: true, options: klineIntervals },
      { name: 'period', label: '周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'bandwidth', label: '带宽', type: 'number', required: true, min: 0.1, max: 10, step: 0.1 },
      { name: 'enabled', label: '启用', type: 'switch', required: true, default: true }
    ]
  },
  atr: {
    name: 'atr',
    label: '平均真实波动范围',
    fields: [
      { name: 'name', label: '名称', type: 'text', required: true, placeholder: '例如: atr1' },
      { name: 'kline_type', label: 'K线类型', type: 'select', required: true, options: klineIntervals },
      { name: 'period', label: '周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'enabled', label: '启用', type: 'switch', required: true, default: true }
    ]
  },
  macd: {
    name: 'macd',
    label: 'MACD',
    fields: [
      { name: 'name', label: '名称', type: 'text', required: true, placeholder: '例如: macd_1' },
      { name: 'kline_type', label: 'K线类型', type: 'select', required: true, options: klineIntervals },
      { name: 'fast_period', label: '快线周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'slow_period', label: '慢线周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'signal_period', label: '信号线周期', type: 'number', required: true, min: 1, max: 200 },
      { name: 'enabled', label: '启用', type: 'switch', required: true, default: true }
    ]
  }
}

// Default parameter space structure
export const defaultParameterSpace = {
  name: '',
  description: '',
  optimization_target: 'profit',
  ma_parameters: [],
  ema_parameters: [],
  rsi_parameters: [],
  kc_parameters: [],
  boll_parameters: [],
  atr_parameters: [],
  macd_parameters: []
}

// Create new parameter with default values
export function createNewParameter(indicatorType) {
  const indicator = technicalIndicators[indicatorType]
  if (!indicator) return null
  
  const parameter = { type: indicatorType }
  indicator.fields.forEach(field => {
    if (field.default !== undefined) {
      parameter[field.name] = field.default
    } else if (field.type === 'number') {
      parameter[field.name] = field.min || 0
    } else if (field.type === 'switch') {
      parameter[field.name] = false
    } else {
      parameter[field.name] = ''
    }
  })
  
  return parameter
}

// Validate parameter space for backend compatibility
export function validateParameterSpace(parameterSpace) {
  const errors = []
  
  // Validate name uniqueness across all indicators
  const names = new Set()
  
  Object.keys(technicalIndicators).forEach(indicatorType => {
    const parameters = parameterSpace[`${indicatorType}_parameters`] || []
    
    parameters.forEach((param, index) => {
      // Check name uniqueness
      if (param.name) {
        if (names.has(param.name)) {
          errors.push(`参数名称 "${param.name}" 重复，所有参数名称必须唯一`)
        } else {
          names.add(param.name)
        }
      }
      
      // Check required fields
      const indicator = technicalIndicators[indicatorType]
      indicator.fields.forEach(field => {
        if (field.required && !param[field.name]) {
          errors.push(`${indicator.label} 第${index + 1}行: ${field.label} 为必填项`)
        }
      })
      
      // Check number ranges
      indicator.fields.forEach(field => {
        if (field.type === 'number' && param[field.name] !== undefined) {
          const value = Number(param[field.name])
          if (field.min !== undefined && value < field.min) {
            errors.push(`${indicator.label} 第${index + 1}行: ${field.label} 不能小于 ${field.min}`)
          }
          if (field.max !== undefined && value > field.max) {
            errors.push(`${indicator.label} 第${index + 1}行: ${field.label} 不能大于 ${field.max}`)
          }
        }
      })
    })
  })
  
  return errors
}

// Convert parameter space to backend format
export function convertToBackendFormat(parameterSpace) {
  const result = {
    name: parameterSpace.name,
    description: parameterSpace.description,
    optimization_target: parameterSpace.optimization_target,
    technical_indicators: {}
  }
  
  Object.keys(technicalIndicators).forEach(indicatorType => {
    const parameters = parameterSpace[`${indicatorType}_parameters`] || []
    if (parameters.length > 0) {
      result.technical_indicators[indicatorType] = parameters.map(param => {
        const backendParam = { ...param }
        // Remove frontend-specific fields
        delete backendParam.type
        return backendParam
      })
    }
  })
  
  return result
}

// Convert from backend format to frontend format
export function convertFromBackendFormat(backendData) {
  const result = {
    name: backendData.name || '',
    description: backendData.description || '',
    optimization_target: backendData.optimization_target || 'profit',
  }
  
  // Initialize all indicator parameter arrays
  Object.keys(technicalIndicators).forEach(indicatorType => {
    result[`${indicatorType}_parameters`] = []
  })
  
  // Convert technical indicators
  if (backendData.technical_indicators) {
    Object.keys(backendData.technical_indicators).forEach(indicatorType => {
      const parameters = backendData.technical_indicators[indicatorType] || []
      result[`${indicatorType}_parameters`] = parameters.map(param => ({
        ...param,
        type: indicatorType
      }))
    })
  }
  
  return result
}

// Generate variable references for strategy editor
export function generateVariableReferences(parameterSpace) {
  const references = []
  
  Object.keys(technicalIndicators).forEach(indicatorType => {
    const parameters = parameterSpace[`${indicatorType}_parameters`] || []
    parameters.forEach(param => {
      if (param.enabled && param.name) {
        const indicator = technicalIndicators[indicatorType]
        
        // Generate variable structure based on indicator type
        if (indicatorType === 'ma' || indicatorType === 'ema' || indicatorType === 'rsi' || indicatorType === 'atr') {
          references.push({
            name: `${param.name}.Data[0]`,
            description: `${param.name} 当前值`,
            type: 'float64'
          })
          references.push({
            name: `${param.name}.Data[1]`,
            description: `${param.name} 前一值`,
            type: 'float64'
          })
          references.push({
            name: `${param.name}.KlineInterval`,
            description: `${param.name} K线周期`,
            type: 'string'
          })
          references.push({
            name: `${param.name}.Period`,
            description: `${param.name} 周期参数`,
            type: 'int'
          })
        } else if (indicatorType === 'kc' || indicatorType === 'boll') {
          references.push({
            name: `${param.name}.High[0]`,
            description: `${param.name} 上轨当前值`,
            type: 'float64'
          })
          references.push({
            name: `${param.name}.Mid[0]`,
            description: `${param.name} 中轨当前值`,
            type: 'float64'
          })
          references.push({
            name: `${param.name}.Low[0]`,
            description: `${param.name} 下轨当前值`,
            type: 'float64'
          })
        } else if (indicatorType === 'macd') {
          references.push({
            name: `${param.name}.MACD[0]`,
            description: `${param.name} MACD线当前值`,
            type: 'float64'
          })
          references.push({
            name: `${param.name}.Signal[0]`,
            description: `${param.name} 信号线当前值`,
            type: 'float64'
          })
          references.push({
            name: `${param.name}.Histogram[0]`,
            description: `${param.name} 柱状图当前值`,
            type: 'float64'
          })
        }
        
        // Generate k-line references
        if (param.kline_type) {
          const klineVar = `kline_${param.kline_type}`
          references.push({
            name: `${klineVar}.Close[0]`,
            description: `${param.kline_type} 收盘价`,
            type: 'float64'
          })
          references.push({
            name: `${klineVar}.High[0]`,
            description: `${param.kline_type} 最高价`,
            type: 'float64'
          })
          references.push({
            name: `${klineVar}.Low[0]`,
            description: `${param.kline_type} 最低价`,
            type: 'float64'
          })
          references.push({
            name: `${klineVar}.Open[0]`,
            description: `${param.kline_type} 开盘价`,
            type: 'float64'
          })
          references.push({
            name: `${klineVar}.Amount[0]`,
            description: `${param.kline_type} 成交额`,
            type: 'float64'
          })
        }
      }
    })
  })
  
  return references
}