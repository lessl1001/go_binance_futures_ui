<template>
  <div class="app-container">
    <!-- 筛选条件 -->
    <el-collapse v-model="activeNames" class="filter-section">
      <el-collapse-item title="筛选条件" name="filter">
        <el-form :model="filterForm" label-width="80px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="币种">
                <el-select v-model="filterForm.symbol" clearable placeholder="请选择币种" @change="handleFilter">
                  <el-option v-for="coin in symbolOptions" :key="coin.value" :label="coin.label" :value="coin.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="策略">
                <el-select v-model="filterForm.strategy_name" clearable placeholder="请选择策略" @change="handleFilter">
                  <el-option v-for="strategy in strategyOptions" :key="strategy.value" :label="strategy.label" :value="strategy.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="交易类型">
                <el-select v-model="filterForm.trade_type" clearable placeholder="请选择交易类型" @change="handleFilter">
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
    <el-table v-loading="listLoading" :data="filteredList" element-loading-text="Loading" border fit size="mini" highlight-current-row style="margin-top: 10px">
      <el-table-column label="币种" prop="symbol" align="center" width="200" />
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
          <el-button type="text" @click="handleEdit(scope.row)">
            {{ scope.row.freeze_on_loss_count }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="冻结时长(小时)" align="center" width="140">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">
            {{ scope.row.freeze_hours }}
          </el-button>
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

    <!-- 新增弹窗 强制选择三元组 -->
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
      <div class="dialog-footer" slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">{{ isEdit ? '更新' : '保存' }}</el-button>
      </div>
    </el-dialog>

    <!-- 编辑弹窗，仅阈值/时间可编辑，三元组锁定且展示 -->
    <el-dialog title="编辑风控配置" :visible.sync="editDialogVisible" width="500px" @close="resetEditForm">
      <div style="margin-bottom: 20px;">
        <el-alert
          title="请确认本次操作的三元组"
          type="info"
          :closable="false"
        >
          <div style="margin-top: 10px;">
            当前配置：币种 <b>{{ editForm.symbol }}</b>，策略 <b>{{ editForm.strategy_name }}</b>，交易类型 <b>{{ formatTradeType(editForm.trade_type) }}</b>
          </div>
        </el-alert>
      </div>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item label="币种">
          <el-input v-model="editForm.symbol" disabled />
        </el-form-item>
        <el-form-item label="策略">
          <el-input v-model="editForm.strategy_name" disabled />
        </el-form-item>
        <el-form-item label="交易类型">
          <el-input v-model="formatTradeType(editForm.trade_type)" disabled />
        </el-form-item>
        <el-form-item label="连续亏损阈值" prop="freeze_on_loss_count">
          <el-input-number v-model="editForm.freeze_on_loss_count" :min="1" :max="100" controls-position="right" />
        </el-form-item>
        <el-form-item label="冻结时长(小时)" prop="freeze_hours">
          <el-input-number v-model="editForm.freeze_hours" :min="0.1" :max="168" :step="0.1" controls-position="right" />
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitEditLoading" @click="submitEditForm">确认修改</el-button>
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
          <template slot-scope="scope">{{ formatTradeType(scope.row.trade_type) }}</template>
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
        symbol: '',
        strategy_name: '',
        trade_type: '',
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
      // 编辑弹窗
      editDialogVisible: false,
      editForm: {
        id: null,
        symbol: '',
        strategy_name: '',
        trade_type: '',
        freeze_on_loss_count: 1,
        freeze_hours: 1,
      },
      editRules: {
        freeze_on_loss_count: [{ required: true, message: '请输入连续亏损阈值', trigger: 'blur' }],
        freeze_hours: [{ required: true, message: '请输入冻结时长', trigger: 'blur' }],
      },
      submitEditLoading: false,
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
  computed: {
    // 强绑定三元组分页筛选
    filteredList() {
      return this.list.filter(row => {
        let match = true;
        if (this.filterForm.symbol) match = match && row.symbol === this.filterForm.symbol;
        if (this.filterForm.strategy_name) match = match && row.strategy_name === this.filterForm.strategy_name;
        if (this.filterForm.trade_type) match = match && row.trade_type === this.filterForm.trade_type;
        if (this.filterForm.freezeStatus) {
          if (this.filterForm.freezeStatus === 'frozen') {
            match = match && this.isFrozen(row);
          } else if (this.filterForm.freezeStatus === 'normal') {
            match = match && !this.isFrozen(row);
          }
        }
        return match;
      });
    },
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
    // 强制不补默认值，新增必须显式选择三元组
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
    },
    async fetchData() {
      this.listLoading = true
      try {
        const params = {
          page: this.listQuery.page,
          pageSize: this.listQuery.limit,
        }
        if (this.filterForm.symbol) params.symbol = this.filterForm.symbol
        if (this.filterForm.strategy_name) params.strategy_name = this.filterForm.strategy_name
        if (this.filterForm.trade_type) params.trade_type = this.filterForm.trade_type
        const response = await getStrategyFreezeList(params)
        this.list = response.data.list || []
        this.total = response.data.total || 0
      } catch (error) {
        this.list = []
        this.total = 0
        this.$message.error('获取风控数据失败')
      } finally {
        this.listLoading = false
      }
    },
    // 新增配置弹窗
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
    // 编辑弹窗
    handleEdit(row) {
      this.editForm = {
        id: row.id,
        symbol: row.symbol,
        strategy_name: row.strategy_name,
        trade_type: row.trade_type,
        freeze_on_loss_count: row.freeze_on_loss_count,
        freeze_hours: row.freeze_hours,
      }
      this.editDialogVisible = true
    },
    resetEditForm() {
      this.editForm = {
        id: null,
        symbol: '',
        strategy_name: '',
        trade_type: '',
        freeze_on_loss_count: 1,
        freeze_hours: 1,
      }
      if (this.$refs.editFormRef) {
        this.$refs.editFormRef.resetFields()
      }
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        if (!this.form.symbol || !this.form.strategy_name || !this.form.trade_type) {
          this.$message.error('币种、策略和交易类型必须选择')
          return
        }
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
    async submitEditForm() {
      try {
        await this.$refs.editFormRef.validate()
        this.submitEditLoading = true
        await updateStrategyFreeze(this.editForm.id, {
          freeze_on_loss_count: this.editForm.freeze_on_loss_count,
          freeze_hours: this.editForm.freeze_hours,
        })
        this.$message.success('修改成功')
        this.editDialogVisible = false
        this.fetchData()
      } catch (error) {
        this.$message.error('保存失败，请重试')
      } finally {
        this.submitEditLoading = false
      }
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
    formatTradeType(tradeType) {
      return tradeType === 'real' ? '实盘' : tradeType === 'test' ? '测试' : tradeType
    },
    async handleUnfreeze(row) {
      try {
        await this.$confirm(
          `确定要解冻该策略吗？\n币种：${row.symbol}\n策略：${row.strategy_name}\n交易类型：${this.formatTradeType(row.trade_type)}`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
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
      if (!row.symbol || !row.strategy_name || !row.trade_type) {
        this.$message.error('参数不全，无法重置')
        return
      }
      try {
        await this.$confirm(
          `确定要重置该策略的亏损次数吗？\n币种：${row.symbol}\n策略：${row.strategy_name}\n交易类型：${this.formatTradeType(row.trade_type)}`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
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
        await this.$confirm(
          `确定要删除该配置吗？删除后无法恢复！\n币种：${row.symbol}\n策略：${row.strategy_name}\n交易类型：${this.formatTradeType(row.trade_type)}`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        await deleteStrategyFreeze(row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败，请重试')
        }
      }
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
                symbol: row.symbol,
                strategy_name: row.strategy_name,
                trade_type: row.trade_type
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
