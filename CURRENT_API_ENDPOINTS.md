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

## AI优化API
- `GET /ai-optimization/strategy-templates` - 获取AI优化策略模板
- `POST /ai-optimization/strategy-templates` - 创建AI优化策略模板
- `PUT /ai-optimization/strategy-templates/{id}` - 更新AI优化策略模板
- `DELETE /ai-optimization/strategy-templates/{id}` - 删除AI优化策略模板
- `POST /ai-optimization/strategy-templates/validate` - 验证AI优化策略模板
- `GET /ai-optimization/parameter-spaces` - 获取参数空间
- `POST /ai-optimization/parameter-spaces` - 创建参数空间
- `PUT /ai-optimization/parameter-spaces/{id}` - 更新参数空间
- `DELETE /ai-optimization/parameter-spaces/{id}` - 删除参数空间
- `GET /ai-optimization/tasks` - 获取AI优化任务
- `POST /ai-optimization/tasks` - 创建AI优化任务
- `PUT /ai-optimization/tasks/{id}` - 更新AI优化任务
- `DELETE /ai-optimization/tasks/{id}` - 删除AI优化任务
- `POST /ai-optimization/tasks/{id}/start` - 启动AI优化任务
- `POST /ai-optimization/tasks/{id}/stop` - 停止AI优化任务
- `POST /ai-optimization/tasks/{id}/pause` - 暂停AI优化任务
- `POST /ai-optimization/tasks/{id}/resume` - 恢复AI优化任务
- `GET /ai-optimization/tasks/{id}/progress` - 获取AI优化任务进度
- `GET /ai-optimization/tasks/{id}/metrics` - 获取AI优化任务指标
- `GET /ai-optimization/tasks/{id}/results` - 获取AI优化任务结果
- `GET /ai-optimization/tasks/{id}/heatmap` - 获取AI优化任务热力图
- `GET /ai-optimization/tasks/{id}/export` - 导出AI优化任务
- `GET /ai-optimization/tasks/{taskId}/optimal-parameters` - 获取最优参数
- `POST /ai-optimization/deploy-to-live` - 部署到实时环境
- `GET /ai-optimization/live-deployments/{deploymentId}/status` - 获取实时部署状态
- `GET /ai-optimization/live-deployments/{deploymentId}/performance` - 获取实时部署性能
- `POST /ai-optimization/live-deployments/{deploymentId}/stop` - 停止实时部署
- `GET /ai-optimization/historical-tasks` - 获取历史任务
- `GET /ai-optimization/tasks/{taskId}/report` - 获取任务报告
- `GET /ai-optimization/tasks/{taskId}/report/export` - 导出任务报告

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
3. 需要验证后端是否支持所有这些API端点
4. 一些API可能需要根据后端实际实现进行调整