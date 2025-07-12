# 当前前端API端点清单

## 核心交易API
- `GET /features` - 获取期货交易特征
- `PUT /features/{id}` - 更新期货交易特征
- `POST /features` - 创建期货交易特征
- `DELETE /features/{id}` - 删除期货交易特征
- `PUT /features/enable/{flag}` - 启用/禁用期货交易特征
- `PUT /features/batch` - 批量更新期货交易特征
- `POST /features/strategy-rule/test/{id}` - 测试策略规则

## 配置和服务API
- `GET /config` - 获取配置
- `PUT /config` - 更新配置
- `POST /start` - 启动服务
- `POST /stop` - 停止服务
- `GET /service/config` - 获取服务配置
- `PUT /service/config` - 更新服务配置
- `POST /test-pusher` - 测试推送器
- `GET /pm2-log?key=sorry510` - 获取PM2日志

## 期货账户API
- `GET /futures/account` - 获取期货账户信息
- `GET /futures/positions` - 获取期货持仓
- `GET /futures/open-orders` - 获取期货开放订单
- `GET /futures/local/positions` - 获取本地期货持仓
- `PUT /futures/local/positions/{id}` - 更新本地期货持仓
- `DELETE /futures/local/positions/{id}` - 删除本地期货持仓
- `GET /futures/local/open-orders` - 获取本地期货开放订单

## 现货交易API
- `GET /spots` - 获取现货交易
- `PUT /spots/{id}` - 更新现货交易
- `POST /spots` - 创建现货交易
- `DELETE /spots/{id}` - 删除现货交易
- `PUT /spots/enable/{flag}` - 启用/禁用现货交易
- `PUT /spots/batch` - 批量更新现货交易
- `POST /spots/strategy-rule/test/{id}` - 测试现货策略规则

## 订单管理API
- `GET /orders` - 获取订单
- `DELETE /orders` - 删除所有订单
- `DELETE /orders/{id}` - 删除特定订单

## 监听币种API
- `GET /listen/coin` - 获取监听币种
- `PUT /listen/coin/{id}` - 更新监听币种
- `POST /listen/coin` - 创建监听币种
- `DELETE /listen/coin/{id}` - 删除监听币种
- `PUT /listen/coin/enable/{flag}` - 启用/禁用监听币种
- `GET /listen/coin/kc-chart/{id}` - 获取KC图表数据
- `GET /listen/funding-rates` - 获取资金费率
- `GET /listen/funding-rate/history` - 获取资金费率历史
- `POST /listen/strategy-rule/test/{id}` - 测试监听策略规则

## 通知币种API
- `GET /notice/coin` - 获取通知币种
- `PUT /notice/coin/{id}` - 更新通知币种
- `POST /notice/coin` - 创建通知币种
- `DELETE /notice/coin/{id}` - 删除通知币种
- `PUT /notice/coin/enable/{flag}` - 启用/禁用通知币种

## 资金费率API
- `GET /fund-rate/eat` - 获取资金费率吞食
- `PUT /fund-rate/eat/{id}` - 更新资金费率吞食
- `POST /fund-rate/eat` - 创建资金费率吞食
- `DELETE /fund-rate/eat/{id}` - 删除资金费率吞食
- `PUT /fund-rate/eat/start/{id}` - 启动资金费率吞食
- `PUT /fund-rate/eat/end/{id}` - 结束资金费率吞食

## 策略模板API
- `GET /strategy-templates` - 获取策略模板
- `PUT /strategy-templates/{id}` - 更新策略模板
- `POST /strategy-templates` - 创建策略模板
- `DELETE /strategy-templates/{id}` - 删除策略模板
- `POST /strategy-templates/test/{symbol}` - 测试策略模板

## 测试策略结果API
- `GET /test-strategy-results` - 获取测试策略结果
- `POST /test-strategy-results` - 创建测试策略结果
- `DELETE /test-strategy-results/{id}` - 删除测试策略结果
- `POST /test-strategy-results/test/{symbol}` - 测试策略结果

## 抢单交易API
- `GET /rush` - 获取抢单交易
- `PUT /rush/{id}` - 更新抢单交易
- `POST /rush` - 创建抢单交易
- `DELETE /rush/{id}` - 删除抢单交易
- `PUT /rush/enable/{flag}` - 启用/禁用抢单交易

## AI优化API (已更新为新的API端点)
- `GET /api/deploy_strategy` - 获取策略部署列表 (原 /ai-optimization/strategy-templates)
- `POST /api/deploy_strategy` - 创建策略部署 (原 /ai-optimization/strategy-templates)
- `PUT /api/deploy_strategy/{id}` - 更新策略部署 (原 /ai-optimization/strategy-templates/{id})
- `DELETE /api/deploy_strategy/{id}` - 删除策略部署 (原 /ai-optimization/strategy-templates/{id})
- `POST /api/deploy_strategy/validate` - 验证策略表达式 (原 /ai-optimization/strategy-templates/validate)
- `GET /api/backtest` - 获取回测任务列表 (原 /ai-optimization/tasks, /ai-optimization/parameter-spaces, /ai-optimization/historical-tasks)
- `POST /api/backtest` - 创建回测任务 (原 /ai-optimization/tasks, /ai-optimization/parameter-spaces)
- `PUT /api/backtest/{id}` - 更新回测任务 (原 /ai-optimization/tasks/{id}, /ai-optimization/parameter-spaces/{id})
- `DELETE /api/backtest/{id}` - 删除回测任务 (原 /ai-optimization/tasks/{id}, /ai-optimization/parameter-spaces/{id})
- `POST /api/backtest/{id}/start` - 启动回测任务 (原 /ai-optimization/tasks/{id}/start)
- `POST /api/backtest/{id}/stop` - 停止回测任务 (原 /ai-optimization/tasks/{id}/stop)
- `POST /api/backtest/{id}/pause` - 暂停回测任务 (原 /ai-optimization/tasks/{id}/pause)
- `POST /api/backtest/{id}/resume` - 恢复回测任务 (原 /ai-optimization/tasks/{id}/resume)
- `GET /api/backtest/{id}/progress` - 获取回测任务进度 (原 /ai-optimization/tasks/{id}/progress)
- `GET /api/backtest/{id}/metrics` - 获取回测任务指标 (原 /ai-optimization/tasks/{id}/metrics)
- `GET /api/backtest/{id}/results` - 获取回测任务结果 (原 /ai-optimization/tasks/{id}/results)
- `GET /api/backtest/{id}/heatmap` - 获取回测任务热力图 (原 /ai-optimization/tasks/{id}/heatmap)
- `GET /api/backtest/{id}/export` - 导出回测任务 (原 /ai-optimization/tasks/{id}/export)
- `GET /api/backtest/{taskId}/optimal-parameters` - 获取最优参数 (原 /ai-optimization/tasks/{taskId}/optimal-parameters)
- `GET /api/deploy_strategy/{deploymentId}/status` - 获取部署状态 (原 /ai-optimization/live-deployments/{deploymentId}/status)
- `GET /api/deploy_strategy/{deploymentId}/performance` - 获取部署性能 (原 /ai-optimization/live-deployments/{deploymentId}/performance)
- `POST /api/deploy_strategy/{deploymentId}/stop` - 停止部署 (原 /ai-optimization/live-deployments/{deploymentId}/stop)
- `GET /api/backtest/{taskId}/report` - 获取任务报告 (原 /ai-optimization/tasks/{taskId}/report)
- `GET /api/backtest/{taskId}/report/export` - 导出任务报告 (原 /ai-optimization/tasks/{taskId}/report/export)
- `GET /api/operation_logs` - 获取操作日志 (新增端点)

## 用户认证API
- `POST /login` - 用户登录

## 文件上传API
- `POST /qiniu/upload/token` - 七牛上传token

## 管理系统API (Vue Element Admin)
- `GET /vue-element-admin/routes` - 获取路由
- `GET /vue-element-admin/roles` - 获取角色
- `POST /vue-element-admin/role` - 创建角色
- `PUT /vue-element-admin/role/{id}` - 更新角色
- `DELETE /vue-element-admin/role/{id}` - 删除角色
- `GET /vue-element-admin/search/user` - 搜索用户
- `GET /vue-element-admin/transaction/list` - 获取交易列表
- `GET /vue-element-admin/user/info` - 获取用户信息
- `POST /vue-element-admin/user/logout` - 用户登出
- `GET /vue-element-admin/article/list` - 获取文章列表
- `GET /vue-element-admin/article/detail` - 获取文章详情
- `POST /vue-element-admin/article/pv` - 文章PV
- `POST /vue-element-admin/article/create` - 创建文章
- `PUT /vue-element-admin/article/update` - 更新文章

## 注意事项
1. 当前生产环境配置为使用相对路径 (VUE_APP_BASE_API = '')
2. 开发环境配置为使用localhost:3333
3. **API认证已更新为 Authorization: Bearer token 格式**
4. AI优化相关API端点已全面更新为新的标准化路径
5. 需要验证后端是否支持所有这些API端点
6. 一些API可能需要根据后端实际实现进行调整