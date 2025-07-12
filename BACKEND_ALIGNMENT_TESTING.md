# AI Optimization Backend Alignment - Testing Guide

## Overview

This document provides testing procedures to verify that the frontend AI optimization features are fully compatible with the backend STRATEGY.CN.md specification.

## Backend Strategy Templates Testing

### Test 1: EMA Golden Cross Strategy
```javascript
// Strategy Expression (Backend Format)
ema_4h_3.Data[0] > ema_4h_7.Data[0] && ema_4h_3.Data[1] < ema_4h_7.Data[1]

// Required Parameters
{
  "ema_4h_3": { "type": "ema", "kline_type": "4h", "period": 3, "enabled": true },
  "ema_4h_7": { "type": "ema", "kline_type": "4h", "period": 7, "enabled": true }
}
```

### Test 2: RSI Oversold Strategy
```javascript
// Strategy Expression (Backend Format)
rsi_1h_14.Data[0] < 30 && rsi_1h_14.Data[1] >= 30

// Required Parameters
{
  "rsi_1h_14": { "type": "rsi", "kline_type": "1h", "period": 14, "enabled": true }
}
```

### Test 3: Complex Multi-Condition Strategy
```javascript
// Strategy Expression (Backend Format)
ema_4h_3.Data[0] > ema_4h_7.Data[0] && 
rsi_1h_14.Data[0] > 40 && rsi_1h_14.Data[0] < 60 && 
kline_1h.Close[0] > boll_1h_20.Mid[0] && 
BasicTrend > 0 && 
BTCUSDT.PercentChange > 0

// Required Parameters
{
  "ema_4h_3": { "type": "ema", "kline_type": "4h", "period": 3, "enabled": true },
  "ema_4h_7": { "type": "ema", "kline_type": "4h", "period": 7, "enabled": true },
  "rsi_1h_14": { "type": "rsi", "kline_type": "1h", "period": 14, "enabled": true },
  "boll_1h_20": { "type": "boll", "kline_type": "1h", "period": 20, "bandwidth": 2, "enabled": true }
}
```

## Parameter Space Testing

### Test 1: EMA Parameters Configuration
```json
{
  "name": "EMA Test Parameters",
  "description": "Testing EMA parameter configuration",
  "optimization_target": "profit",
  "ema_parameters": [
    {
      "name": "ema_4h_3",
      "kline_type": "4h",
      "period": 3,
      "enabled": true
    },
    {
      "name": "ema_4h_7", 
      "kline_type": "4h",
      "period": 7,
      "enabled": true
    }
  ]
}
```

### Test 2: Multi-Indicator Parameters
```json
{
  "name": "Multi-Indicator Parameters",
  "description": "Testing multiple indicator types",
  "optimization_target": "sharpe_ratio",
  "ema_parameters": [
    { "name": "ema_4h_5", "kline_type": "4h", "period": 5, "enabled": true }
  ],
  "rsi_parameters": [
    { "name": "rsi_1h_14", "kline_type": "1h", "period": 14, "enabled": true }
  ],
  "boll_parameters": [
    { "name": "boll_1h_20", "kline_type": "1h", "period": 20, "bandwidth": 2, "enabled": true }
  ]
}
```

## Task Management Testing

### Test 1: Create Task with Backend-Compatible Format
```json
{
  "name": "EMA Golden Cross Test",
  "description": "Testing EMA golden cross strategy",
  "strategy_id": "ema-golden-cross-strategy-id",
  "parameter_space_id": "ema-parameters-id",
  "symbol": "BTCUSDT",
  "timeframe": "4h",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "initial_capital": 10000,
  "optimization_config": {
    "target": "profit",
    "max_iterations": 1000,
    "population_size": 50,
    "mutation_rate": 0.1,
    "crossover_rate": 0.8,
    "convergence_threshold": 0.001,
    "max_generations": 100
  }
}
```

## Frontend Testing Procedures

### 1. Strategy Editor Testing
1. **Test Template Loading**:
   - Open Strategy Editor
   - Click "Load Template"
   - Verify all 15 backend-compatible templates are available
   - Select "EMA Golden Cross (做多)" template
   - Verify expression: `ema_4h_3.Data[0] > ema_4h_7.Data[0] && ema_4h_3.Data[1] < ema_4h_7.Data[1]`

2. **Test Autocompletion**:
   - Create new strategy
   - Type "ema_" in editor
   - Press Tab or Ctrl+Space
   - Verify backend variables appear in suggestions
   - Test completion for: BasicTrend, Position.Side, kline_1h.Close[0]

3. **Test Help Documentation**:
   - Click "Help Documentation"
   - Verify sections: Variables, Functions, Indicators, Examples
   - Check content matches STRATEGY.CN.md specification

4. **Test Strategy Validation**:
   - Enter valid backend expression: `ema_4h_3.Data[0] > ema_4h_7.Data[0]`
   - Click "Validate Expression"
   - Verify validation passes (should call backend validation endpoint)

### 2. Parameter Space Testing
1. **Test Indicator Configuration**:
   - Open Parameter Space page
   - Create new parameter space
   - Navigate through indicator tabs: MA, EMA, RSI, KC, BOLL, ATR, MACD
   - Add EMA parameter: name="ema_4h_3", kline_type="4h", period=3, enabled=true
   - Verify unique name validation

2. **Test Parameter Validation**:
   - Create parameters with duplicate names
   - Click "Validate Parameters"
   - Verify error message appears
   - Fix duplicate names and revalidate

3. **Test Backend Format Export**:
   - Configure multiple indicators
   - Save parameter space
   - Verify backend format is used in API call

### 3. Task Management Testing
1. **Test Task Creation**:
   - Open Task Management
   - Click "Create Task"
   - Fill in task details with backend-compatible values
   - Select strategy and parameter space
   - Verify preview sections show correct information
   - Create task and verify backend format is submitted

2. **Test Strategy Preview**:
   - Select a strategy in task creation dialog
   - Verify strategy expression is displayed with proper formatting
   - Verify backend variable format is preserved

3. **Test Parameter Space Preview**:
   - Select parameter space in task creation
   - Verify enabled parameter count is correct
   - Verify optimization target display

### 4. Optimization Monitor Testing
1. **Test Real-time Monitoring**:
   - Open a running task's monitoring page
   - Verify strategy expression is displayed with backend format
   - Check parameter table shows current and best values
   - Verify auto-refresh intervals adapt to task status

2. **Test Performance Metrics**:
   - Verify performance evaluation displays correct level
   - Check metric formatting matches backend specification
   - Test chart configurations for convergence and metrics

### 5. Task History Testing
1. **Test Historical Task Display**:
   - Open Task History page
   - Verify completed tasks show backend-compatible format
   - Click task details
   - Verify strategy expression is properly formatted
   - Check parameter values match backend format

## Backend Variable Testing

### Test All Variable Categories:
```javascript
// Built-in Variables
NowPrice         // Current price
SystemStartTime  // System start timestamp
NowTime         // Current timestamp
BasicTrend      // Basic trend value
ORI             // Return rate %

// Crypto Data
BTCUSDT.PercentChange, BTCUSDT.Close, BTCUSDT.Open, BTCUSDT.High, BTCUSDT.Low
ETHUSDT.PercentChange, ETHUSDT.Close, ETHUSDT.Open, ETHUSDT.High, ETHUSDT.Low
SOLUSDT.PercentChange, SOLUSDT.Close, SOLUSDT.Open, SOLUSDT.High, SOLUSDT.Low
BNBUSDT.PercentChange, BNBUSDT.Close, BNBUSDT.Open, BNBUSDT.High, BNBUSDT.Low

// Current Symbol Data
NowSymbolPercentChange, NowSymbolClose, NowSymbolOpen, NowSymbolHigh, NowSymbolLow

// Position Data
Position.Symbol, Position.EntryPrice, Position.MarkPrice, Position.Amount
Position.UnrealizedProfit, Position.Leverage, Position.Side, Position.Mock
Position.CreateTime, Position.SourceType

// K-line Data (auto-generated)
kline_4h.Close[0], kline_4h.High[0], kline_4h.Low[0], kline_4h.Open[0]
kline_4h.Amount[0], kline_4h.Qps[0]
```

## Backend Function Testing

### Test All Supported Functions:
```javascript
// Test each function in strategy expressions
all(condition1, condition2, condition3)
float(stringValue)
IsAsc(ema_4h_3.Data)
IsDesc(ema_4h_7.Data)
Kdj(ema_4h_3.Data, ema_4h_7.Data, 10)
```

## Integration Testing Checklist

- [ ] Strategy expressions return true/false as required
- [ ] All variable references use backend format
- [ ] Parameter definitions match backend field names
- [ ] Only enabled parameters can be referenced
- [ ] Task configuration uses backend-compatible format
- [ ] Real-time monitoring displays backend data correctly
- [ ] Export functions use backend format
- [ ] All API calls send backend-compatible data
- [ ] All displays parse backend format correctly
- [ ] Help content matches STRATEGY.CN.md specification

## Expected Backend API Calls

### Strategy Validation:
```http
POST /api/deploy_strategy/validate
Content-Type: application/json

{
  "expression": "ema_4h_3.Data[0] > ema_4h_7.Data[0] && ema_4h_3.Data[1] < ema_4h_7.Data[1]"
}
```

### Task Creation:
```http
POST /api/backtest
Content-Type: application/json

{
  "name": "EMA Golden Cross Test",
  "strategy_id": "strategy-id",
  "parameter_space_id": "params-id", 
  "symbol": "BTCUSDT",
  "timeframe": "4h",
  "optimization_config": {
    "target": "profit",
    "max_iterations": 1000
  }
}
```

### Parameter Space Creation:
```http
POST /api/backtest
Content-Type: application/json

{
  "name": "EMA Parameters",
  "technical_indicators": {
    "ema": [
      {
        "name": "ema_4h_3",
        "kline_type": "4h", 
        "period": 3,
        "enabled": true
      }
    ]
  }
}
```

## Success Criteria

✅ All frontend components use backend-compatible data format
✅ Strategy expressions match STRATEGY.CN.md specification
✅ Parameter configurations align with backend requirements
✅ API calls send data in expected backend format
✅ All displays correctly parse backend responses
✅ Real-time monitoring works with backend data structure
✅ Export functions produce backend-compatible output
✅ Help documentation matches backend specification
✅ Autocompletion includes all backend variables and functions
✅ Validation uses backend validation logic