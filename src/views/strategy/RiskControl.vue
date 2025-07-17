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
        width="250"
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
            @blur="handleInlineEdit(scope.row)"
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
            @blur="handleInlineEdit(scope.row)"
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
        width="250"
      >
        <template slot-scope="scope">
          <!--
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
          -->
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
      @close="resetForm"
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
          {{ isEdit ? '更新' : '保存' }}
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
    // Component cleanup
  },
  methods: {
    async loadOptions() {
      console.log('=== LOADING OPTIONS ===')
      
      // 先设置默认选项，确保组件始终可用
      this.symbolOptions = [
        { label: 'BTCUSDT', value: 'BTCUSDT' },
        { label: 'ETHUSDT', value: 'ETHUSDT' },
        { label: 'ADAUSDT', value: 'ADAUSDT' },
        { label: 'BNBUSDT', value: 'BNBUSDT' },
        { label: 'SOLUSDT', value: 'SOLUSDT' },
        { label: 'XRPUSDT', value: 'XRPUSDT' },
        { label: 'SUIUSDT', value: 'SUIUSDT' },
        { label: 'LINKUSDT', value: 'LINKUSDT' },
        { label: 'LTCUSDT', value: 'LTCUSDT' },
        { label: 'UNIUSDT', value: 'UNIUSDT' },
        { label: 'HYPEUSDT', value: 'HYPEUSDT' },
        { label: 'AVAXUSDT', value: 'AVAXUSDT' },
        { label: '1000PEPEUSDT', value: '1000PEPEUSDT' },
        { label: '1000SHIBUSDT', value: '1000SHIBUSDT' },
        { label: '1000BONKUSDT', value: '1000BONKUSDT' },
        { label: 'DOGEUSDT', value: 'DOGEUSDT' }
      ]
      
      this.strategyOptions = [
        { label: 'line1', value: 'line1' },
        { label: 'line2', value: 'line2' },
        { label: 'line3', value: 'line3' },
        { label: 'line4', value: 'line4' },
        { label: 'line5', value: 'line5' },
        { label: 'line6', value: 'line6' },
        { label: 'line7', value: 'line7' },
        { label: 'test_strategy', value: 'test_strategy' }
      ]
      
      this.tradeTypeOptions = [
        { label: '实盘', value: 'real' },
        { label: '测试', value: 'test' }
      ]
      
      // 强制 Vue 更新
      this.$forceUpdate()
      
      try {
        const response = await getStrategyFreezeOptions()
        console.log('Options API response:', response.data)
        
        // 验证并使用 API 数据（如果有效）
        if (response.data.symbols && Array.isArray(response.data.symbols) && response.data.symbols.length > 0) {
          // 验证每个选项都有有效的 value
          const validSymbols = response.data.symbols.filter(item => item && item.value && item.value.trim())
          if (validSymbols.length > 0) {
            this.symbolOptions = validSymbols
          }
        }
        
        if (response.data.strategies && Array.isArray(response.data.strategies) && response.data.strategies.length > 0) {
          const validStrategies = response.data.strategies.filter(item => item && item.value && item.value.trim())
          if (validStrategies.length > 0) {
            this.strategyOptions = validStrategies
          }
        }
        
        if (response.data.tradeTypes && Array.isArray(response.data.tradeTypes) && response.data.tradeTypes.length > 0) {
          const validTradeTypes = response.data.tradeTypes.filter(item => item && item.value && item.value.trim())
          if (validTradeTypes.length > 0) {
            this.tradeTypeOptions = validTradeTypes
          }
        }
        
        console.log('Options loaded successfully:', {
          symbols: this.symbolOptions.length,
          strategies: this.strategyOptions.length,
          tradeTypes: this.tradeTypeOptions.length
        })
        
      } catch (error) {
        console.error('Failed to load options from API, using defaults:', error)
      }
      
      // 再次强制更新，确保选项已加载
      this.$forceUpdate()
    },
    async fetchData() {
      console.log('=== FETCHING DATA ===')
      console.log('Filter params:', this.filterForm)
      
      this.listLoading = true
      try {
        const params = {
          page: this.listQuery.page,
          pageSize: this.listQuery.limit,
        }
        if (this.filterForm.coin) params.symbol = this.filterForm.coin
        if (this.filterForm.strategy) params.strategy_name = this.filterForm.strategy
        if (this.filterForm.tradeType) params.trade_type = this.filterForm.tradeType

        console.log('API params:', params)

        const response = await getStrategyFreezeList(params)
        console.log('API response:', response)
        
        // 验证响应数据结构
        if (!response.data || !response.data.list) {
          console.error('Invalid API response structure:', response)
          this.$message.error('获取数据失败：响应格式错误')
          return
        }
        
        this.list = (response.data.list || [])
        this.total = response.data.total || 0

        console.log('Data fetched successfully, total:', this.total, 'list length:', this.list.length)
        
        // 调试：检查每条记录的关键字段
        console.log('=== DATA FETCH DEBUG ===')
        this.list.forEach((item, index) => {
          console.log(`Record ${index + 1}:`, {
            id: item.id,
            idType: typeof item.id,
            symbol: item.symbol,
            strategy_name: item.strategy_name,
            trade_type: item.trade_type,
            isEmpty: !item.symbol || !item.strategy_name || !item.trade_type,
            hasValidId: item.id && item.id !== null && item.id !== undefined
          })
        })

        // 处理冻结状态筛选
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
        console.error('Fetch data error:', error)
        this.list = []
        this.total = 0
        this.$message.error('获取风控数据失败')
      } finally {
        this.listLoading = false
      }
    },
    async handleInlineEdit(row) {
      console.log('=== INLINE EDIT ===')
      console.log('Editing row:', row)
      console.log('Current loss_count before edit:', row.loss_count)
      
      try {
        // 创建完整的更新数据，包含所有必要字段
        // 重要：保留 loss_count 字段，防止当前亏损次数被清零
        const updateData = {
          symbol: row.symbol,
          strategy_name: row.strategy_name,
          trade_type: row.trade_type,
          freeze_on_loss_count: Number(row.freeze_on_loss_count),
          freeze_hours: Number(row.freeze_hours),
          loss_count: row.loss_count || 0  // 保留当前亏损次数
        }
        
        console.log('Sending update data:', updateData)
        console.log('Preserving loss_count value:', updateData.loss_count)
        
        // 使用 updateStrategyFreeze 进行更新，保留所有字段
        await updateStrategyFreeze(row.id, updateData)
        
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 2000
        })
        
        console.log('Inline edit successful - loss_count preserved')
        
        // 可选：刷新数据以确保数据一致性
        // await this.fetchData()
        
      } catch (error) {
        console.error('Inline edit error:', error)
        this.$message({
          message: '修改失败，请重试',
          type: 'error',
          duration: 3000
        })
      }
    },
    handleFilter() {
      console.log('=== FILTER OPERATION ===')
      console.log('Filter form:', this.filterForm)
      
      this.listQuery.page = 1
      this.fetchData()
    },
    isFrozen(row) {
      // 判断冻结状态
      const now = Math.floor(Date.now() / 1000)
      
      // 检查是否达到冻结次数阈值
      const reachedLossThreshold = row.loss_count >= row.freeze_on_loss_count
      
      // 检查是否在冻结时间内
      const inFreezeTime = row.freeze_until && row.freeze_until > now
      
      // 任一条件满足即为冻结状态
      return reachedLossThreshold || inFreezeTime
    },
    formatFreezeStatus(row) {
      const now = Math.floor(Date.now() / 1000)
      const reachedLossThreshold = row.loss_count >= row.freeze_on_loss_count
      const inFreezeTime = row.freeze_until && row.freeze_until > now
      
      if (reachedLossThreshold && inFreezeTime) {
        // 达到阈值且在冻结时间内
        const remainSec = row.freeze_until - now
        const remainHour = Math.ceil(remainSec / 3600)
        return `已冻结(${remainHour}小时)`
      } else if (reachedLossThreshold) {
        // 达到阈值但冻结时间已过或未设置
        return '已冻结(达到阈值)'
      } else if (inFreezeTime) {
        // 未达到阈值但在冻结时间内
        const remainSec = row.freeze_until - now
        const remainHour = Math.ceil(remainSec / 3600)
        return `已冻结(${remainHour}小时)`
      } else {
        // 未达到阈值且不在冻结时间内
        return '正常'
      }
    },
    async handleUnfreeze(row) {
      console.log('=== UNFREEZE OPERATION ===')
      console.log('Unfreezing row:', row)
      
      // 验证必要字段是否存在
      if (!row.symbol || !row.strategy_name || !row.trade_type) {
        console.error('Missing required fields for unfreeze:', {
          symbol: row.symbol,
          strategy_name: row.strategy_name,
          trade_type: row.trade_type
        })
        this.$message.error('解冻失败：记录缺少必要信息（币种、策略名称、交易类型），请先更新记录')
        return
      }
      
      try {
        await this.$confirm('确定要解冻该策略吗？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const unfreezeData = {
          symbol: row.symbol.trim(),
          strategy_name: row.strategy_name.trim(),
          trade_type: row.trade_type.trim()
        }
        
        console.log('Sending unfreeze data:', unfreezeData)
        
        await unfreezeStrategy(unfreezeData)
        this.$message.success('解冻成功')
        this.fetchData()
      } catch (error) {
        console.error('Unfreeze error:', error)
        if (error !== 'cancel') {
          // 更详细的错误处理
          if (error.response && error.response.data && error.response.data.message) {
            this.$message.error(`解冻失败：${error.response.data.message}`)
          } else {
            this.$message.error('解冻失败，请重试')
          }
        }
      }
    },
    async handleResetLoss(row) {
      console.log('=== RESET LOSS OPERATION ===')
      console.log('Resetting loss for row:', row)
      
      // 验证必要字段是否存在
      if (!row.symbol || !row.strategy_name || !row.trade_type) {
        console.error('Missing required fields for reset loss:', {
          symbol: row.symbol,
          strategy_name: row.strategy_name,
          trade_type: row.trade_type
        })
        this.$message.error('重置亏损失败：记录缺少必要信息（币种、策略名称、交易类型），请先更新记录')
        return
      }
      
      try {
        await this.$confirm('确定要重置该策略的亏损次数吗？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const resetData = {
          symbol: row.symbol.trim(),
          strategy_name: row.strategy_name.trim(),
          trade_type: row.trade_type.trim()
        }
        
        console.log('Sending reset loss data:', resetData)
        
        await resetStrategyLoss(resetData)
        this.$message.success('重置亏损成功')
        this.fetchData()
      } catch (error) {
        console.error('Reset loss error:', error)
        if (error !== 'cancel') {
          // 更详细的错误处理
          if (error.response && error.response.data && error.response.data.message) {
            this.$message.error(`重置亏损失败：${error.response.data.message}`)
          } else {
            this.$message.error('重置亏损失败，请重试')
          }
        }
      }
    },
    handleDelete(row) {
      console.log('=== DELETE OPERATION DEBUG ===')
      console.log('Deleting row:', row)
      console.log('Row ID:', row.id)
      console.log('Row ID type:', typeof row.id)
      
      // 验证 row.id 是否存在
      if (!row.id) {
        console.error('Row ID is missing or invalid:', row.id)
        this.$message.error('删除失败：记录ID无效')
        return
      }
      
      this.$confirm(`确定要删除该配置吗？删除后无法恢复！`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          try {
            console.log('Sending delete request for ID:', row.id)
            await deleteStrategyFreeze(row.id)
            console.log('Delete request successful')
            this.$message.success('删除成功')
            await this.fetchData()
          } catch (error) {
            console.error('Delete error details:', error)
            
            // 详细的错误处理
            if (error.response) {
              console.log('Error response:', error.response)
              const status = error.response.status
              const message = error.response.data?.message || error.message
              
              if (status === 404) {
                this.$message.error('删除失败：记录不存在或已被删除')
              } else if (status === 403) {
                this.$message.error('删除失败：无权限删除此记录')
              } else if (status === 500) {
                this.$message.error('删除失败：服务器错误')
              } else {
                this.$message.error(`删除失败：${message}`)
              }
            } else if (error.request) {
              console.log('Error request:', error.request)
              this.$message.error('删除失败：网络错误')
            } else {
              console.log('Error message:', error.message)
              this.$message.error(`删除失败：${error.message}`)
            }
          }
        })
        .catch(() => {
          console.log('Delete cancelled')
        })
    },
    handleAdd() {
      console.log('=== OPENING ADD DIALOG ===')
      
      this.dialogTitle = '新增风控配置'
      this.isEdit = false
      
      // 确保选项已加载
      if (this.symbolOptions.length === 0 || this.strategyOptions.length === 0) {
        this.loadOptions()
      }
      
      this.resetForm()
      this.dialogVisible = true
      
      // 等待组件渲染完成后再次确认表单状态
      this.$nextTick(() => {
        console.log('Form state after dialog open:', this.form)
        console.log('Available options:', {
          symbols: this.symbolOptions.length,
          strategies: this.strategyOptions.length,
          tradeTypes: this.tradeTypeOptions.length
        })
      })
    },
    resetForm() {
      console.log('=== RESETTING FORM ===')
      
      // 使用 Object.assign 保持 Vue 的响应式绑定
      Object.assign(this.form, {
        symbol: '',
        strategy_name: '',
        trade_type: '',
        freeze_on_loss_count: 1,
        freeze_hours: 1,
      })
      
      // 等待 Vue 更新后再重置字段
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetFields()
          this.$refs.form.clearValidate()
        }
      })
    },
    async submitForm() {
      console.log('=== FORM SUBMISSION START ===')
      console.log('Form data before validation:', this.form)
      
      try {
        // 验证表单
        await this.$refs.form.validate()
        
        // 额外验证必需字段
        if (!this.form.symbol || !this.form.strategy_name || !this.form.trade_type) {
          this.$message.error('请选择币种、策略和交易类型')
          return
        }
        
        console.log('Form validation passed')
        this.submitLoading = true
        
        // 创建表单数据
        const formData = {
          symbol: this.form.symbol.trim(),
          strategy_name: this.form.strategy_name.trim(),
          trade_type: this.form.trade_type.trim(),
          freeze_on_loss_count: Number(this.form.freeze_on_loss_count),
          freeze_hours: Number(this.form.freeze_hours)
        }
        
        console.log('Submitting data:', formData)
        
        // 提交数据
        const response = await createOrUpdateStrategyFreeze(formData)
        console.log('API response:', response)
        
        this.$message.success('操作成功')
        this.dialogVisible = false
        
        // 刷新数据列表
        await this.fetchData()
        
      } catch (error) {
        console.error('Form submission error:', error)
        if (error !== false) {
          this.$message.error('操作失败，请重试')
        }
      } finally {
        this.submitLoading = false
        console.log('=== FORM SUBMISSION END ===')
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

/* 内联编辑样式 */
.el-input-number {
  width: 100%;
}

.el-input-number .el-input__inner {
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
}

.el-input-number:hover .el-input__inner {
  border-color: #409eff;
}

.el-input-number.is-focused .el-input__inner {
  border-color: #409eff;
}

/* 表格内输入框样式 */
.el-table .el-input-number {
  margin: 0;
}

.el-table .el-input-number .el-input__inner {
  text-align: center;
  font-size: 12px;
  padding: 0 5px;
}

/* 添加轻微的阴影效果以突出编辑状态 */
.el-input-number.is-focused {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
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
