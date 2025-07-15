<template>
  <div class="app-container">
    <!-- Filter Section -->
    <el-collapse v-model="activeNames" class="filter-section">
      <el-collapse-item title="筛选条件" name="filter">
        <el-form :model="filterForm" label-width="80px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="币种">
                <el-select
                  v-model="filterForm.coin"
                  placeholder="请选择币种"
                  clearable
                  @change="handleFilter"
                >
                  <el-option
                    v-for="coin in symbolOptions"
                    :key="coin.value"
                    :label="coin.label"
                    :value="coin.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="策略">
                <el-select
                  v-model="filterForm.strategy"
                  placeholder="请选择策略"
                  clearable
                  @change="handleFilter"
                >
                  <el-option
                    v-for="strategy in strategyOptions"
                    :key="strategy.value"
                    :label="strategy.label"
                    :value="strategy.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="交易类型">
                <el-select
                  v-model="filterForm.tradeType"
                  placeholder="请选择交易类型"
                  clearable
                  @change="handleFilter"
                >
                  <el-option
                    v-for="type in tradeTypeOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="冻结状态">
                <el-select
                  v-model="filterForm.freezeStatus"
                  placeholder="请选择冻结状态"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="正常" value="normal" />
                  <el-option label="已冻结" value="frozen" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <el-button
        type="success"
        size="mini"
        @click="handleAdd"
      >
        新增配置
      </el-button>
      <el-button
        type="info"
        size="mini"
        @click="showLogsDialog = true"
      >
        操作日志
      </el-button>
      <el-button
        type="warning"
        size="mini"
        @click="handleTestTrade"
      >
        模拟交易
      </el-button>
    </div>

    <!-- Main Data Table -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      size="mini"
      highlight-current-row
      style="margin-top: 10px"
    >
      <el-table-column
        label="币种"
        prop="symbol"
        align="center"
        width="100"
      />
      <el-table-column
        label="策略"
        prop="strategy_name"
        align="center"
        width="150"
      />
      <el-table-column
        label="交易类型"
        prop="trade_type"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.trade_type === 'real' ? 'danger' : 'info'" size="mini">
            {{ scope.row.trade_type === 'real' ? '实盘' : '测试' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="连续亏损阈值"
        align="center"
        width="140"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.freeze_on_loss_count"
            :min="0"
            :max="100"
            size="mini"
            controls-position="right"
            @change="handleParamChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="冻结时长(小时)"
        align="center"
        width="140"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.freeze_hours"
            :min="0"
            :max="168"
            size="mini"
            controls-position="right"
            @change="handleParamChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="当前亏损次数"
        align="center"
        width="120"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.loss_count >= scope.row.freeze_on_loss_count ? 'danger' : 'success'" size="mini">
            {{ scope.row.loss_count }} / {{ scope.row.freeze_on_loss_count }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="当前冻结状态"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <el-tag
            :type="!isFrozen(scope.row) ? 'success' : 'danger'"
            size="mini"
          >
            {{ formatFreezeStatus(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="350"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            :loading="scope.row.saving"
            :disabled="!scope.row.changed"
            @click="saveRow(scope.row)"
          >
            保存
          </el-button>
          <el-button
            type="warning"
            size="mini"
            :disabled="!isFrozen(scope.row)"
            @click="handleUnfreeze(scope.row)"
          >
            解冻
          </el-button>
          <el-button
            type="info"
            size="mini"
            @click="handleResetLoss(scope.row)"
          >
            重置亏损
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="fetchData"
    />

    <!-- Add/Edit Dialog -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="币种" prop="symbol">
          <el-select v-model="form.symbol" placeholder="请选择币种" :disabled="isEdit">
            <el-option
              v-for="symbol in symbolOptions"
              :key="symbol.value"
              :label="symbol.label"
              :value="symbol.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="策略" prop="strategy_name">
          <el-select v-model="form.strategy_name" placeholder="请选择策略" :disabled="isEdit">
            <el-option
              v-for="strategy in strategyOptions"
              :key="strategy.value"
              :label="strategy.label"
              :value="strategy.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="交易类型" prop="trade_type">
          <el-select v-model="form.trade_type" placeholder="请选择交易类型" :disabled="isEdit">
            <el-option
              v-for="type in tradeTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="连续亏损阈值" prop="freeze_on_loss_count">
          <el-input-number
            v-model="form.freeze_on_loss_count"
            :min="1"
            :max="100"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="冻结时长(小时)" prop="freeze_hours">
          <el-input-number
            v-model="form.freeze_hours"
            :min="0.1"
            :max="168"
            :step="0.1"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          {{ isEdit ? '更新' : '保存并继续' }}
        </el-button>
        <el-button v-if="!isEdit" type="success" :loading="submitLoading" @click="submitAndClose">
          保存并关闭
        </el-button>
      </div>
    </el-dialog>

    <!-- Logs Dialog -->
    <el-dialog
      title="操作日志"
      :visible.sync="showLogsDialog"
      width="80%"
    >
      <el-table
        v-loading="logsLoading"
        :data="logs"
        border
        fit
        size="mini"
        height="400"
      >
        <el-table-column
          label="时间"
          prop="created_at"
          width="160"
          align="center"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column
          label="币种"
          prop="symbol"
          width="100"
          align="center"
        />
        <el-table-column
          label="策略"
          prop="strategy_name"
          width="150"
          align="center"
        />
        <el-table-column
          label="交易类型"
          prop="trade_type"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.trade_type === 'real' ? '实盘' : '测试' }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作类型"
          prop="operation"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="getOperationTagType(scope.row.operation)" size="mini">
              {{ formatOperation(scope.row.operation) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作员"
          prop="operator"
          width="100"
          align="center"
        />
        <el-table-column
          label="详情"
          prop="details"
          align="left"
        />
      </el-table>
    </el-dialog>

    <!-- Test Trade Dialog -->
    <el-dialog
      title="模拟交易测试"
      :visible.sync="showTestDialog"
      width="500px"
    >
      <el-form
        ref="testForm"
        :model="testForm"
        :rules="testRules"
        label-width="120px"
      >
        <el-form-item label="币种" prop="symbol">
          <el-select v-model="testForm.symbol" placeholder="请选择币种">
            <el-option
              v-for="symbol in symbolOptions"
              :key="symbol.value"
              :label="symbol.label"
              :value="symbol.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="策略" prop="strategy_name">
          <el-select v-model="testForm.strategy_name" placeholder="请选择策略">
            <el-option
              v-for="strategy in strategyOptions"
              :key="strategy.value"
              :label="strategy.label"
              :value="strategy.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="交易类型" prop="trade_type">
          <el-select v-model="testForm.trade_type" placeholder="请选择交易类型">
            <el-option
              v-for="type in tradeTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
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
    }
  },
  created() {
    this.loadOptions()
    this.fetchData()
  },
  beforeDestroy() {
    // Remove any cleanup since we removed auto-refresh
  },
  methods: {
    async loadOptions() {
      try {
        console.log('Loading options...')
        const response = await getStrategyFreezeOptions()
        const data = response.data || {}
        
        console.log('Options API response:', data)
        
        // 确保选项数据格式正确
        this.symbolOptions = Array.isArray(data.symbols) ? data.symbols : []
        this.strategyOptions = Array.isArray(data.strategies) ? data.strategies : []
        this.tradeTypeOptions = Array.isArray(data.tradeTypes) ? data.tradeTypes : []
        
        // 如果选项为空，提供默认选项
        if (this.symbolOptions.length === 0) {
          this.symbolOptions = [
            { label: 'BTCUSDT', value: 'BTCUSDT' },
            { label: 'ETHUSDT', value: 'ETHUSDT' },
            { label: 'ADAUSDT', value: 'ADAUSDT' },
            { label: 'BNBUSDT', value: 'BNBUSDT' },
            { label: 'SOLUSDT', value: 'SOLUSDT' },
            { label: 'DOGEUSDT', value: 'DOGEUSDT' }
          ]
        }
        
        if (this.strategyOptions.length === 0) {
          this.strategyOptions = [
            { label: 'MA_CROSS', value: 'MA_CROSS' },
            { label: 'RSI_DIVERGENCE', value: 'RSI_DIVERGENCE' },
            { label: 'BOLLINGER_BANDS', value: 'BOLLINGER_BANDS' },
            { label: 'MACD_SIGNAL', value: 'MACD_SIGNAL' },
            { label: 'GRID_TRADING', value: 'GRID_TRADING' },
            { label: 'DCA_STRATEGY', value: 'DCA_STRATEGY' }
          ]
        }
        
        if (this.tradeTypeOptions.length === 0) {
          this.tradeTypeOptions = [
            { label: '实盘', value: 'real' },
            { label: '测试', value: 'test' }
          ]
        }
        
        console.log('Options loaded successfully:', {
          symbols: this.symbolOptions.length,
          strategies: this.strategyOptions.length,
          tradeTypes: this.tradeTypeOptions.length
        })
        
      } catch (error) {
        console.error('Failed to load options:', error)
        this.$message.warning('加载选项失败，使用默认选项')
        
        // 提供默认选项作为备用
        this.symbolOptions = [
          { label: 'BTCUSDT', value: 'BTCUSDT' },
          { label: 'ETHUSDT', value: 'ETHUSDT' },
          { label: 'ADAUSDT', value: 'ADAUSDT' },
          { label: 'BNBUSDT', value: 'BNBUSDT' },
          { label: 'SOLUSDT', value: 'SOLUSDT' },
          { label: 'DOGEUSDT', value: 'DOGEUSDT' }
        ]
        
        this.strategyOptions = [
          { label: 'MA_CROSS', value: 'MA_CROSS' },
          { label: 'RSI_DIVERGENCE', value: 'RSI_DIVERGENCE' },
          { label: 'BOLLINGER_BANDS', value: 'BOLLINGER_BANDS' },
          { label: 'MACD_SIGNAL', value: 'MACD_SIGNAL' },
          { label: 'GRID_TRADING', value: 'GRID_TRADING' },
          { label: 'DCA_STRATEGY', value: 'DCA_STRATEGY' }
        ]
        
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
        
        // 添加筛选参数到后端查询
        if (this.filterForm.coin) {
          params.symbol = this.filterForm.coin
          console.log('Adding coin filter:', this.filterForm.coin)
        }
        if (this.filterForm.strategy) {
          params.strategy_name = this.filterForm.strategy
          console.log('Adding strategy filter:', this.filterForm.strategy)
        }
        if (this.filterForm.tradeType) {
          params.trade_type = this.filterForm.tradeType
          console.log('Adding trade type filter:', this.filterForm.tradeType)
        }
        
        console.log('Fetching data with params:', params)

        const response = await getStrategyFreezeList(params)
        console.log('API response:', response)
        
        let list = (response.data.list || []).map(item => ({
          ...item,
          changed: false,
          saving: false,
        }))
        
        // 处理冻结状态筛选（在前端处理，因为需要计算时间）
        if (this.filterForm.freezeStatus) {
          const originalLength = list.length
          list = list.filter(row => {
            if (this.filterForm.freezeStatus === 'frozen') {
              return this.isFrozen(row)
            } else if (this.filterForm.freezeStatus === 'normal') {
              return !this.isFrozen(row)
            }
            return true
          })
          console.log(`Freeze status filter applied: ${originalLength} -> ${list.length} items`)
        }
        
        this.list = list
        this.total = response.data.total || 0
        
        console.log('Data fetched successfully, total:', this.total, 'list length:', this.list.length)
        
        // 调试：检查每个记录的关键字段
        console.log('=== DATA FETCH DEBUG ===')
        this.list.forEach((item, index) => {
          console.log(`Record ${index + 1}:`, {
            id: item.id,
            symbol: item.symbol,
            strategy_name: item.strategy_name,
            trade_type: item.trade_type,
            freeze_on_loss_count: item.freeze_on_loss_count,
            freeze_hours: item.freeze_hours
          })
        })
        
      } catch (error) {
        console.error('Fetch data error:', error)
        this.list = []
        this.total = 0
        this.$message.error('获取风控数据失败')
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      console.log('Filter triggered with:', this.filterForm)
      this.listQuery.page = 1
      this.fetchData()
    },
    handleParamChange(row) {
      row.changed = true
    },
    isFrozen(row) {
      // 判断冻结状态
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
    async saveRow(row) {
      row.saving = true
      try {
        console.log('=== SAVE ROW DEBUG ===')
        console.log('Saving row data:', row)
        console.log('Row ID:', row.id)
        
        // 只更新数值字段，不更新币种和策略字段
        const updateData = {
          freeze_on_loss_count: row.freeze_on_loss_count,
          freeze_hours: row.freeze_hours,
          loss_count: row.loss_count || 0,
        }
        
        console.log('Update data (only numeric fields):', updateData)
        
        await updateStrategyFreeze(row.id, updateData)
        row.changed = false
        this.$message.success('保存成功')
        
        // 只刷新当前行的数据，避免影响其他行
        await this.fetchData()
        
      } catch (error) {
        console.error('=== SAVE ROW ERROR ===')
        console.error('Error details:', error)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)
        
        this.$message.error('保存失败，请重试')
      } finally {
        row.saving = false
      }
    },
    async handleUnfreeze(row) {
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
        
        console.log('=== DELETE OPERATION DEBUG ===')
        console.log('Deleting row:', row)
        console.log('Row ID:', row.id)
        console.log('Row data:', JSON.stringify(row, null, 2))
        
        if (!row.id) {
          console.error('Delete failed: Missing row ID')
          this.$message.error('删除失败：缺少记录ID')
          return
        }
        
        // 检查ID是否为有效数字
        if (isNaN(row.id) || row.id <= 0) {
          console.error('Delete failed: Invalid row ID:', row.id)
          this.$message.error('删除失败：无效的记录ID')
          return
        }
        
        console.log('Calling delete API with ID:', row.id)
        await deleteStrategyFreeze(row.id)
        
        console.log('Delete API call successful')
        this.$message.success('删除成功')
        
        // 重新获取数据
        this.fetchData()
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('=== DELETE ERROR ===')
          console.error('Error details:', error)
          console.error('Error message:', error.message)
          console.error('Error response:', error.response)
          console.error('Error status:', error.response?.status)
          console.error('Error data:', error.response?.data)
          
          if (error.response) {
            const status = error.response.status
            const errorMessage = error.response.data?.message || error.response.data?.error || '未知错误'
            
            if (status === 404) {
              this.$message.error(`删除失败：记录不存在或已被删除 (${errorMessage})`)
            } else if (status === 403) {
              this.$message.error(`删除失败：权限不足 (${errorMessage})`)
            } else if (status === 500) {
              this.$message.error(`删除失败：服务器内部错误 (${errorMessage})`)
            } else {
              this.$message.error(`删除失败：HTTP ${status} 错误 (${errorMessage})`)
            }
          } else {
            this.$message.error('删除失败：网络错误或服务器无响应')
          }
        }
      }
    },
    async handleAdd() {
      this.dialogTitle = '新增风控配置'
      this.isEdit = false
      this.resetForm()
      this.dialogVisible = true
    },
    resetForm() {
      console.log('=== RESET FORM DEBUG ===')
      console.log('Form before reset:', this.form)
      
      this.form = {
        symbol: '',
        strategy_name: '',
        trade_type: '',
        freeze_on_loss_count: 1,
        freeze_hours: 1,
      }
      
      console.log('Form after reset:', this.form)
      
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    handleDialogClose() {
      console.log('=== DIALOG CLOSE DEBUG ===')
      console.log('Dialog closed, form before reset:', this.form)
      this.resetForm()
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        this.submitLoading = true
        
        console.log('=== FORM SUBMISSION DEBUG ===')
        console.log('Form before processing:', JSON.stringify(this.form, null, 2))
        console.log('Is edit mode:', this.isEdit)
        
        let response
        
        if (this.isEdit) {
          // 编辑模式：使用PUT请求只更新数值字段
          const updateData = {
            freeze_on_loss_count: this.form.freeze_on_loss_count,
            freeze_hours: this.form.freeze_hours
          }
          console.log('Edit mode - updating only numeric fields:', updateData)
          response = await updateStrategyFreeze(this.form.id, updateData)
        } else {
          // 新增模式：使用POST请求提交全部字段
          const createData = {
            symbol: this.form.symbol,
            strategy_name: this.form.strategy_name,
            trade_type: this.form.trade_type,
            freeze_on_loss_count: this.form.freeze_on_loss_count,
            freeze_hours: this.form.freeze_hours
          }
          console.log('Create mode - submitting all fields:', createData)
          
          // 验证创建模式的关键字段
          if (!createData.symbol || !createData.strategy_name || !createData.trade_type) {
            console.error('Validation failed - missing required fields:', {
              symbol: createData.symbol,
              strategy_name: createData.strategy_name,
              trade_type: createData.trade_type
            })
            this.$message.error('请完整填写币种、策略和交易类型')
            return
          }
          
          response = await createOrUpdateStrategyFreeze(createData)
        }
        
        console.log('API response:', response)
        this.$message.success('配置保存成功')
        
        // 如果是编辑模式，关闭对话框
        if (this.isEdit) {
          this.dialogVisible = false
        } else {
          // 新增模式：保存当前选择，便于继续添加
          const preservedSelections = {
            symbol: this.form.symbol,
            strategy_name: this.form.strategy_name,
            trade_type: this.form.trade_type
          }
          
          // 重置数值字段
          this.form.freeze_on_loss_count = 1
          this.form.freeze_hours = 1
          
          // 确保选择字段被保留
          this.$nextTick(() => {
            this.form.symbol = preservedSelections.symbol
            this.form.strategy_name = preservedSelections.strategy_name
            this.form.trade_type = preservedSelections.trade_type
          })
          
          this.$message.success('配置已保存，可以继续添加更多配置')
        }
        
        // 重新获取数据以更新列表
        await this.fetchData()
        
      } catch (error) {
        console.error('=== FORM SUBMISSION ERROR ===')
        console.error('Error details:', error)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)
        
        if (error !== false) {
          this.$message.error('保存失败，请重试')
        }
      } finally {
        this.submitLoading = false
      }
    },
    async submitAndClose() {
      try {
        await this.$refs.form.validate()
        this.submitLoading = true
        
        console.log('=== FORM SUBMISSION AND CLOSE DEBUG ===')
        console.log('Form before processing:', JSON.stringify(this.form, null, 2))
        console.log('Is edit mode:', this.isEdit)
        
        let response
        
        if (this.isEdit) {
          // 编辑模式：使用PUT请求只更新数值字段
          const updateData = {
            freeze_on_loss_count: this.form.freeze_on_loss_count,
            freeze_hours: this.form.freeze_hours
          }
          console.log('Edit mode - updating only numeric fields:', updateData)
          response = await updateStrategyFreeze(this.form.id, updateData)
        } else {
          // 新增模式：使用POST请求提交全部字段
          const createData = {
            symbol: this.form.symbol,
            strategy_name: this.form.strategy_name,
            trade_type: this.form.trade_type,
            freeze_on_loss_count: this.form.freeze_on_loss_count,
            freeze_hours: this.form.freeze_hours
          }
          console.log('Create mode - submitting all fields:', createData)
          
          // 验证创建模式的关键字段
          if (!createData.symbol || !createData.strategy_name || !createData.trade_type) {
            console.error('Validation failed - missing required fields:', {
              symbol: createData.symbol,
              strategy_name: createData.strategy_name,
              trade_type: createData.trade_type
            })
            this.$message.error('请完整填写币种、策略和交易类型')
            return
          }
          
          response = await createOrUpdateStrategyFreeze(createData)
        }
        
        console.log('API response:', response)
        this.$message.success('配置保存成功')
        this.dialogVisible = false
        
        // 重新获取数据以更新列表
        await this.fetchData()
        
      } catch (error) {
        console.error('=== FORM SUBMISSION AND CLOSE ERROR ===')
        console.error('Error details:', error)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)
        
        if (error !== false) {
          this.$message.error('保存失败，请重试')
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
.filter-section {
  margin-bottom: 20px;
}

.action-buttons {
  margin-bottom: 10px;
}

.action-buttons .el-button {
  margin-right: 10px;
}

.el-table .el-button {
  margin-right: 5px;
  margin-bottom: 5px;
}

.el-table .el-button:last-child {
  margin-right: 0;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

/* 状态高亮 */
.el-tag.el-tag--danger {
  background-color: #fef0f0;
  border-color: #fbc4c4;
  color: #f56c6c;
}

.el-tag.el-tag--success {
  background-color: #f0f9ff;
  border-color: #c4e6ff;
  color: #67c23a;
}

.el-tag.el-tag--warning {
  background-color: #fdf6ec;
  border-color: #f5d19e;
  color: #e6a23c;
}

.el-tag.el-tag--info {
  background-color: #f4f4f5;
  border-color: #d3d4d6;
  color: #909399;
}

/* 表格行高亮 */
.el-table__row.frozen-row {
  background-color: #fef0f0;
}

.el-table__row.normal-row {
  background-color: #f0f9ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-table {
    font-size: 12px;
  }
  
  .el-button--mini {
    font-size: 10px;
    padding: 5px 8px;
  }
}
</style>
