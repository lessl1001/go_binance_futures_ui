# 统一策略数据结构 (Unified Strategy Data Schema)

## 概述
本文档定义了统一策略编辑器所需的数据库结构和API数据格式。

## 数据库表结构建议

### 策略模板表 (strategy_templates)

```sql
CREATE TABLE strategy_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT '策略名称',
    description TEXT COMMENT '策略描述',
    expression TEXT NOT NULL COMMENT '策略表达式',
    category ENUM('Long', 'Short', 'Close Long', 'Close Short') NOT NULL DEFAULT 'Long' COMMENT '策略类型',
    type VARCHAR(50) DEFAULT 'strategy' COMMENT '数据类型标识',
    parameters JSON COMMENT '策略参数配置',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) COMMENT '创建者',
    tags JSON COMMENT '策略标签',
    
    INDEX idx_category (category),
    INDEX idx_name (name),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='统一策略模板表';
```

## API数据格式

### 请求格式

#### 创建/更新策略
```json
{
    "name": "EMA Golden Cross Strategy",
    "description": "EMA短线上穿长线时做多 - 适用于趋势跟踪",
    "expression": "ema_4h_3.Data[0] > ema_4h_7.Data[0] && ema_4h_3.Data[1] < ema_4h_7.Data[1]",
    "category": "Long",
    "type": "strategy",
    "parameters": [
        {
            "name": "ema_4h_3",
            "type": "ema",
            "kline": "4h",
            "period": 3,
            "enabled": true
        },
        {
            "name": "ema_4h_7",
            "type": "ema",
            "kline": "4h",
            "period": 7,
            "enabled": true
        }
    ],
    "tags": ["EMA", "趋势跟踪", "做多"]
}
```

#### 策略验证
```json
{
    "expression": "ema_4h_3.Data[0] > ema_4h_7.Data[0]",
    "category": "Long",
    "context": "strategy_editor"
}
```

### 响应格式

#### 策略列表响应
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "strategy_templates": [
            {
                "id": 1,
                "name": "EMA Golden Cross Strategy",
                "description": "EMA短线上穿长线时做多",
                "expression": "ema_4h_3.Data[0] > ema_4h_7.Data[0]",
                "category": "Long",
                "type": "strategy",
                "is_active": true,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "parameters": [...],
                "tags": ["EMA", "趋势跟踪"]
            }
        ],
        "total": 15,
        "page": 1,
        "page_size": 20
    }
}
```

#### 验证响应
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "valid": true,
        "message": "Strategy expression is valid",
        "details": {
            "syntax_check": "passed",
            "variable_check": "passed",
            "function_check": "passed"
        }
    }
}
```

#### 错误响应
```json
{
    "code": 400,
    "message": "validation failed",
    "data": {
        "valid": false,
        "message": "Undefined variable: invalid_var",
        "details": {
            "syntax_check": "passed",
            "variable_check": "failed",
            "function_check": "passed",
            "error_position": {
                "line": 1,
                "column": 15
            }
        }
    }
}
```

## 数据迁移说明

### 现有数据迁移
如果现有系统中有分离的策略数据，需要：

1. 为现有策略记录添加 `category` 字段
2. 根据原有的策略类型设置相应的 `category` 值
3. 添加 `type` 字段标识为 'strategy'
4. 统一 `parameters` 字段的JSON格式

### 迁移SQL示例
```sql
-- 假设原有表名为 strategy_templates_old
ALTER TABLE strategy_templates_old 
ADD COLUMN category ENUM('Long', 'Short', 'Close Long', 'Close Short') DEFAULT 'Long',
ADD COLUMN type VARCHAR(50) DEFAULT 'strategy',
ADD COLUMN parameters JSON;

-- 根据原有分类逻辑更新category字段
UPDATE strategy_templates_old 
SET category = CASE 
    WHEN old_type_field = 'long' THEN 'Long'
    WHEN old_type_field = 'short' THEN 'Short'
    WHEN old_type_field = 'close_long' THEN 'Close Long'
    WHEN old_type_field = 'close_short' THEN 'Close Short'
    ELSE 'Long'
END;
```

## 性能优化建议

1. **索引优化**: 在 `category`, `name`, `is_active` 字段上建立索引
2. **查询优化**: 支持按category过滤的查询
3. **缓存策略**: 对常用的策略模板进行缓存
4. **分页支持**: API支持分页查询以处理大量策略

## 兼容性说明

- 保持向后兼容：现有API调用继续有效
- 新增字段均为可选或有默认值
- 支持渐进式迁移策略

## 前端集成说明

前端统一策略编辑器已实现：
- 统一的策略类型选择器
- 集成的模板加载界面
- 统一的数据提交格式
- 增强的错误处理机制