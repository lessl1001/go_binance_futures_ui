<template>
  <div class="app-container">
    <!-- 筛选条件 -->
    <el-collapse v-model="activeNames" class="filter-section">
      <el-collapse-item title="筛选条件" name="filter">
        <el-form :model="filterForm" label-width="80px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="币种">
                <el-select v-model="filterForm.coin" clearable placeholder="请选择币种" @change="handleFilter">
                  <el-option v-for="coin in symbolOptions" :key="coin.value" :label="coin.label" :value="coin.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="策略">
                <el-select v-model="filterForm.strategy" clearable placeholder="请选择策略" @change="handleFilter">
                  <el-option v-for="strategy in strategyOptions" :key="strategy.value" :label="strategy.label" :value="strategy.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="交易类型">
                <el-select v-model="filterForm.tradeType" clearable placeholder="请选择交易类型" @change="handleFilter">
                  <el-option v-for="type in tradeTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="冻结状态">
                <el-select v-model="filterForm.freezeStatus" clearable placeholder="请选择冻结状态" @change="handleFilter">
                  <el-option label="正常" value="normal" />
                  <el-option label="已冻结" value="frozen" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="success" size="mini" @click="handleAdd">新增配置</el-button>
      <el-button type="info" size="mini" @click="showLogsDialog = true">操作日志</el-button>
      <el-button type="warning" size="mini" @click="handleTestTrade">模拟交易</el-button>
      <el-button type="primary" size="mini" :loading="statusCheckLoading" @click="manualCheckFreezeStatus">检查冻结状态</el-button>
    </div>

    <!-- 主表格 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit size="mini" highlight-current-row style="margin-top: 10px">
      <el-table-column label="币种" prop="symbol" align="center" width="250" />
      <el-table-column label="策略" prop="strategy_name" align="center" width="150" />
      <el-table-column label="交易类型" prop="trade_type" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.trade_type === 'real' ? 'danger' : 'info'" size="mini">
            {{ scope.row.trade_type === 'real' ? '实盘' : '测试' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="连续亏损阈值" align="center" width="140">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.freeze_on_loss_count" :min="0" :max="100" size="mini" controls-position="right" @blur="handleInlineEdit(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="冻结时长(小时)" align="center" width="140">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.freeze_hours" :min="0" :max="168" size="mini" controls-position="right" @blur="handleInlineEdit(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="当前亏损次数" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.loss_count >= scope.row.freeze_on_loss_count ? 'danger' : 'success'" size="mini">
            {{ scope.row.loss_count }} / {{ scope.row.freeze_on_loss_count }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="当前冻结状态" align="center" width="150">
        <template slot-scope="scope">
          <el-tag :type="!isFrozen(scope.row) ? 'success' : 'danger'" size="mini">{{ formatFreezeStatus(scope.row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="350">
        <template slot-scope="scope">
          <el-button type="warning" size="mini" :disabled="!isFrozen(scope.row)" @click="handleUnfreeze(scope.row)">解冻</el-button>
          <el-button type="info" size="mini" @click="handleResetLoss(scope.row)">重置亏损</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="币种" prop="symbol">
          <el-select v-model="form.symbol" placeholder="请选择币种" :disabled="isEdit">
            <el-option v-for="symbol in symbolOptions" :key="symbol.value" :label="symbol.label" :value="symbol.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="策略" prop="strategy_name">
          <el-select v-model="form.strategy_name" placeholder="请选择策略" :disabled="isEdit">
            <el-option v-for="strategy in strategyOptions" :key="strategy.value" :label="strategy.label" :value="strategy.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易类型" prop="trade_type">
          <el-select v-model="form.trade_type" placeholder="请选择交易类型" :disabled="isEdit">
            <el-option v-for="type in tradeTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="连续亏损阈值" prop="freeze_on_loss_count">
          <el-input-number v-model="form.freeze_on_loss_count" :min="1" :max="100" controls-position="right" />
        </el-form-item>
        <el-form-item label="冻结时长(小时)" prop="freeze_hours">
          <el-input-number v-model="form.freeze_hours" :min="0.1" :max="168" :step="0.1" controls-position="right" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">{{ isEdit ? '更新' : '保存' }}</el-button>
      </div>
    </el-dialog>

    <!-- 日志弹窗 -->
    <el-dialog title="操作日志" :visible.sync="showLogsDialog" width="80%">
      <el-table v-loading="logsLoading" :data="logs" border fit size="mini" height="400">
        <el-table-column label="时间" prop="created_at" width="160" align="center">
          <template slot-scope="scope">{{ formatDate(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="币种" prop="symbol" width="100" align="center" />
        <el-table-column label="策略" prop="strategy_name" width="150" align="center" />
        <el-table-column label="交易类型" prop="trade_type" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.trade_type === 'real' ? '实盘' : '测试' }}</template>
        </el-table-column>
        <el-table-column label="操作类型" prop="operation" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getOperationTagType(scope.row.operation)" size="mini">{{ formatOperation(scope.row.operation) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作员" prop="operator" width="100" align="center" />
        <el-table-column label="详情" prop="details" align="left" />
      </el-table>
    </el-dialog>

    <!-- 模拟交易弹窗 -->
    <el-dialog title="模拟交易测试" :visible.sync="showTestDialog" width="500px">
      <el-form ref="testForm" :model="testForm" :rules="testRules" label-width="120px">
        <el-form-item label="币种" prop="symbol">
          <el-select v-model="testForm.symbol" placeholder="请选择币种">
            <el-option v-for="symbol in symbolOptions" :key="symbol.value" :label="symbol.label" :value="symbol.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="策略" prop="strategy_name">
          <el-select v-model="testForm.strategy_name" placeholder="请选择策略">
            <el-option v-for="strategy in strategyOptions" :key="strategy.value" :label="strategy.label" :value="strategy.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易类型" prop="trade_type">
          <el-select v-model="testForm.trade_type" placeholder="请选择交易类型">
            <el-option v-for="type in tradeTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易结果" prop="is_profit">
          <el-radio-group v-model="testForm.is_profit">
            <el-radio :label="true">盈利</el-radio>
            <el-radio :label="false">亏损</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showTestDialog = false">取消</el-button>
        <el-button type="primary" :loading="testLoading" @click="submitTestTrade">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getStrategyFreezeList,
  createOrUpdateStrategyFreeze,
  updateStrategyFreeze,
  deleteStrategyFreeze,
  unfreezeStrategy,
  resetStrategyLoss,
  getStrategyFreezeLogs,
  getStrategyFreezeOptions,
  simulateTradeResult,
} from '@/api/strategyFreeze'
import Pagination from '@/components/Pagination'

export default {
  name: 'StrategyRiskControl',
  components: {
    Pagination,
  },
  data() {
    return {
      activeNames: ['filter'],
      listLoading: false,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
      },
      symbolOptions: [],
      strategyOptions: [],
      tradeTypeOptions: [],
      filterForm: {
        coin: '',
        strategy: '',
        tradeType: '',
        freezeStatus: '',
      },
      dialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      submitLoading: false,
      form: {
        symbol: '',
        strategy_name: '',
        trade_type: '',
        freeze_on_loss_count: 1,
        freeze_hours: 1,
      },
      rules: {
        symbol: [{ required: true, message: '请选择币种', trigger: 'change' }],
        strategy_name: [{ required: true, message: '请选择策略', trigger: 'change' }],
        trade_type: [{ required: true, message: '请选择交易类型', trigger: 'change' }],
        freeze_on_loss_count: [{ required: true, message: '请输入连续亏损阈值', trigger: 'blur' }],
        freeze_hours: [{ required: true, message: '请输入冻结时长', trigger: 'blur' }],
      },
      showLogsDialog: false,
      logs: [],
      logsLoading: false,
      showTestDialog: false,
      testForm: {
        symbol: '',
        strategy_name: '',
        trade_type: '',
        is_profit: true,
      },
      testRules: {
        symbol: [{ required: true, message: '请选择币种', trigger: 'change' }],
        strategy_name: [{ required: true, message: '请选择策略', trigger: 'change' }],
        trade_type: [{ required: true, message: '请选择交易类型', trigger: 'change' }],
        is_profit: [{ required: true, message: '请选择交易结果', trigger: 'change' }],
      },
      testLoading: false,
      freezeStatusTimer: null,
      statusCheckLoading: false,
    }
  },
  created() {
    this.loadOptions()
    this.fetchData()
    this.startFreezeStatusTimer()
  },
  beforeDestroy() {
    this.clearFreezeStatusTimer()
  },
  methods: {
    // 补全参数，加兜底逻辑
    completeRowParams(row) {
      row.symbol = row.symbol && row.symbol.trim() ? row.symbol : (this.symbolOptions[0]?.value || 'BTCUSDT')
      row.strategy_name = row.strategy_name && row.strategy_name.trim() ? row.strategy_name : (this.strategyOptions[0]?.value || 'test_strategy')
      row.trade_type = row.trade_type && row.trade_type.trim() ? row.trade_type : (this.tradeTypeOptions[0]?.value || 'test')
    },
    // 选项加载，加兜底逻辑
    async loadOptions() {
      try {
        const response = await getStrategyFreezeOptions()
        this.symbolOptions = response.data.symbols || []
        this.strategyOptions = response.data.strategies || []
        this.tradeTypeOptions = response.data.tradeTypes || []
      } catch (error) {
        this.symbolOptions = []
        this.strategyOptions = []
        this.tradeTypeOptions = []
      }
      if (!Array.isArray(this.symbolOptions) || this.symbolOptions.length === 0) {
        this.symbolOptions = [
          { label: 'BTCUSDT', value: 'BTCUSDT' },
          { label: 'ETHUSDT', value: 'ETHUSDT' }
        ]
      }
      if (!Array.isArray(this.strategyOptions) || this.strategyOptions.length === 0) {
        this.strategyOptions = [
          { label: 'test_strategy', value: 'test_strategy' }
        ]
      }
      if (!Array.isArray(this.tradeTypeOptions) || this.tradeTypeOptions.length === 0) {
        this.tradeTypeOptions = [
          { label: '实盘', value: 'real' },
          { label: '测试', value: 'test' }
        ]
      }
    },
    async fetchData() {
      this.listLoading = true
      try {
        const params = {
          page: this.listQuery.page,
          pageSize: this.listQuery.limit,
        }
        if (this.filterForm.coin) params.symbol = this.filterForm.coin
        if (this.filterForm.strategy) params.strategy_name = this.filterForm.strategy
        if (this.filterForm.tradeType) params.trade_type = this.filterForm.tradeType
        const response = await getStrategyFreezeList(params)
        this.list = (response.data.list || []).map(item => ({ ...item }))
        this.total = response.data.total || 0
        if (this.filterForm.freezeStatus) {
          this.list = this.list.filter(row => {
            if (this.filterForm.freezeStatus === 'frozen') {
              return this.isFrozen(row)
            } else if (this.filterForm.freezeStatus === 'normal') {
              return !this.isFrozen(row)
            }
            return true
          })
        }
      } catch (error) {
        this.list = []
        this.total = 0
        this.$message.error('获取风控数据失败')
      } finally {
        this.listLoading = false
      }
    },
    async handleInlineEdit(row) {
      try {
        await updateStrategyFreeze(row.id, {
          freeze_on_loss_count: row.freeze_on_loss_count,
          freeze_hours: row.freeze_hours,
          loss_count: row.loss_count || 0,
        })
        this.$message.success('保存成功')
        this.fetchData()
      } catch (error) {
        this.$message.error('保存失败，请重试')
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    isFrozen(row) {
      const now = Math.floor(Date.now() / 1000)
      return row.freeze_until && row.freeze_until > now
    },
    formatFreezeStatus(row) {
      if (!this.isFrozen(row)) {
        return '正常'
      } else {
        const now = Math.floor(Date.now() / 1000)
        const remainSec = row.freeze_until - now
        const remainHour = Math.ceil(remainSec / 3600)
        return `已冻结(${remainHour}小时)`
      }
    },
    async handleUnfreeze(row) {
      this.completeRowParams(row)
      try {
        await this.$confirm('确定要解冻该策略吗？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        await unfreezeStrategy({
          symbol: row.symbol,
          strategy_name: row.strategy_name,
          trade_type: row.trade_type,
        })
        this.$message.success('解冻成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('解冻失败，请重试')
        }
      }
    },
    async handleResetLoss(row) {
      this.completeRowParams(row)
      try {
        await this.$confirm('确定要重置该策略的亏损次数吗？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        await resetStrategyLoss({
          symbol: row.symbol,
          strategy_name: row.strategy_name,
          trade_type: row.trade_type,
        })
        this.$message.success('重置亏损成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('重置亏损失败，请重试')
        }
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该配置吗？删除后无法恢复！', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        await deleteStrategyFreeze(row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败，请重试')
        }
      }
    },
    handleAdd() {
      this.dialogTitle = '新增风控配置'
      this.isEdit = false
      this.dialogVisible = true
      this.resetForm()
      this.loadOptions()
    },
    resetForm() {
      this.form = {
        symbol: '',
        strategy_name: '',
        trade_type: '',
        freeze_on_loss_count: 1,
        freeze_hours: 1,
      }
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        this.submitLoading = true
        await createOrUpdateStrategyFreeze(this.form)
        this.$message.success('操作成功')
        this.dialogVisible = false
        await Promise.all([
          this.fetchData(),
          this.loadOptions()
        ])
      } catch (error) {
        if (error !== false) {
          this.$message.error('操作失败，请重试')
        }
      } finally {
        this.submitLoading = false
      }
    },
    async loadLogs() {
      this.logsLoading = true
      try {
        const response = await getStrategyFreezeLogs()
        this.logs = response.data.list || []
      } catch (error) {
        this.$message.error('获取日志失败')
      } finally {
        this.logsLoading = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    },
    getOperationTagType(operation) {
      const typeMap = {
        'create_config': 'success',
        'update_config': 'primary',
        'delete_config': 'danger',
        'auto_freeze': 'danger',
        'manual_unfreeze': 'warning',
        'reset_loss_count': 'info',
        'trade_profit': 'success',
        'trade_loss': 'warning',
      }
      return typeMap[operation] || 'info'
    },
    formatOperation(operation) {
      const operationMap = {
        'create_config': '新增配置',
        'update_config': '更新配置',
        'delete_config': '删除配置',
        'auto_freeze': '自动冻结',
        'manual_unfreeze': '手动解冻',
        'reset_loss_count': '重置亏损',
        'trade_profit': '交易盈利',
        'trade_loss': '交易亏损',
      }
      return operationMap[operation] || operation
    },
    handleTestTrade() {
      this.showTestDialog = true
      this.testForm = {
        symbol: '',
        strategy_name: '',
        trade_type: '',
        is_profit: true,
      }
    },
    async submitTestTrade() {
      try {
        await this.$refs.testForm.validate()
        this.testLoading = true
        await simulateTradeResult(this.testForm)
        this.$message.success('模拟交易成功')
        this.showTestDialog = false
        this.fetchData()
      } catch (error) {
        if (error !== false) {
          this.$message.error('模拟交易失败，请重试')
        }
      } finally {
        this.testLoading = false
      }
    },
    startFreezeStatusTimer() {
      this.clearFreezeStatusTimer()
      this.freezeStatusTimer = setInterval(() => {
        this.checkAndUpdateFreezeStatus()
      }, 180000)
    },
    clearFreezeStatusTimer() {
      if (this.freezeStatusTimer) {
        clearInterval(this.freezeStatusTimer)
        this.freezeStatusTimer = null
      }
    },
    async checkAndUpdateFreezeStatus() {
      const now = Math.floor(Date.now() / 1000)
      let hasStatusChanged = false
      const resetPromises = []
      this.list.forEach(row => {
        if (row.freeze_until && row.freeze_until <= now) {
          const reachedLossThreshold = row.loss_count >= row.freeze_on_loss_count
          if (reachedLossThreshold) {
            hasStatusChanged = true
            if (row.symbol && row.strategy_name && row.trade_type) {
              const resetData = {
                symbol: row.symbol.trim(),
                strategy_name: row.strategy_name.trim(),
                trade_type: row.trade_type.trim()
              }
              resetPromises.push(
                resetStrategyLoss(resetData).then(() => {
                  row.loss_count = 0
                }).catch(() => {})
              )
            }
          } else {
            hasStatusChanged = true
          }
        }
      })
      if (resetPromises.length > 0) {
        try {
          await Promise.all(resetPromises)
        } catch {}
      }
      if (hasStatusChanged) {
        await this.fetchData()
      }
    },
    async manualCheckFreezeStatus() {
      this.statusCheckLoading = true
      try {
        await this.checkAndUpdateFreezeStatus()
        this.$message.success('冻结状态检查完成')
      } catch (error) {
        this.$message.error('冻结状态检查失败，请重试')
      } finally {
        this.statusCheckLoading = false
      }
    }
  },
  watch: {
    showLogsDialog(val) {
      if (val) {
        this.loadLogs()
      }
    },
  },
}
</script>

<style scoped>
.filter-section { margin-bottom: 20px; }
.action-buttons { margin-bottom: 10px; }
.action-buttons .el-button { margin-right: 10px; }
.el-table .el-button { margin-right: 5px; margin-bottom: 5px; }
.el-table .el-button:last-child { margin-right: 0; }
.dialog-footer { text-align: right; }
.dialog-footer .el-button { margin-left: 10px; }
.el-input-number { width: 100%; }
.el-input-number .el-input__inner { transition: all 0.3s ease; border: 1px solid #dcdfe6; }
.el-input-number:hover .el-input__inner { border-color: #409eff; }
.el-input-number.is-focused .el-input__inner { border-color: #409eff; }
.el-table .el-input-number { margin: 0; }
.el-table .el-input-number .el-input__inner { text-align: center; font-size: 12px; padding: 0 5px; }
.el-input-number.is-focused { box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1); }
.el-tag.el-tag--danger { background-color: #fef0f0; border-color: #fbc4c4; color: #f56c6c; }
.el-tag.el-tag--success { background-color: #f0f9ff; border-color: #c4e6ff; color: #67c23a; }
.el-tag.el-tag--warning { background-color: #fdf6ec; border-color: #f5d19e; color: #e6a23c; }
.el-tag.el-tag--info { background-color: #f4f4f5; border-color: #d3d4d6; color: #909399; }
.el-table__row.frozen-row { background-color: #fef0f0; }
.el-table__row.normal-row { background-color: #f0f9ff; }
@media (max-width: 768px) {
  .el-table { font-size: 12px; }
  .el-button--mini { font-size: 10px; padding: 5px 8px; }
}
</style>
