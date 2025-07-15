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
        symbol: [
          { required: true, message: '请选择币种', trigger: 'change' },
          { validator: (rule, value, callback) => {
            if (!value || value.trim() === '') {
              callback(new Error('币种不能为空'))
            } else {
              callback()
            }
          }, trigger: 'change' }
        ],
        strategy_name: [
          { required: true, message: '请选择策略', trigger: 'change' },
          { validator: (rule, value, callback) => {
            if (!value || value.trim() === '') {
              callback(new Error('策略不能为空'))
            } else {
              callback()
            }
          }, trigger: 'change' }
        ],
        trade_type: [
          { required: true, message: '请选择交易类型', trigger: 'change' },
          { validator: (rule, value, callback) => {
            if (!value || value.trim() === '') {
              callback(new Error('交易类型不能为空'))
            } else {
              callback()
            }
          }, trigger: 'change' }
        ],
        freeze_on_loss_count: [
          { required: true, message: '请输入连续亏损阈值', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!value || value <= 0) {
              callback(new Error('连续亏损阈值必须大于0'))
            } else if (value > 100) {
              callback(new Error('连续亏损阈值不能超过100'))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
        freeze_hours: [
          { required: true, message: '请输入冻结时长', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!value || value <= 0) {
              callback(new Error('冻结时长必须大于0'))
            } else if (value > 168) {
              callback(new Error('冻结时长不能超过168小时'))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
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
    console.log('=== COMPONENT CREATED ===')
    console.log('Initializing Strategy Risk Control component')
    
    // 加载选项和数据
    this.loadOptions()
    this.fetchData()
    
    console.log('=== COMPONENT CREATED END ===')
  },
  beforeDestroy() {
    // Remove any cleanup since we removed auto-refresh
  },
  methods: {
    async loadOptions() {
      console.log('=== LOADING OPTIONS ===')
      
      // 首先设置默认选项，确保界面总是有可用选项
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
      
      console.log('Default options set:', {
        symbols: this.symbolOptions.length,
        strategies: this.strategyOptions.length,
        tradeTypes: this.tradeTypeOptions.length
      })
      
      // 尝试从API获取选项来替换默认选项
      try {
        console.log('Attempting to load options from API...')
        const response = await getStrategyFreezeOptions()
        const data = response.data || {}
        
        console.log('Options API response:', data)
        
        // 只有当API返回有效数据时才替换默认选项
        if (Array.isArray(data.symbols) && data.symbols.length > 0) {
          this.symbolOptions = data.symbols
          console.log('Updated symbol options from API:', data.symbols.length)
        } else {
          console.log('API returned empty symbols, keeping defaults')
        }
        
        if (Array.isArray(data.strategies) && data.strategies.length > 0) {
          this.strategyOptions = data.strategies
          console.log('Updated strategy options from API:', data.strategies.length)
        } else {
          console.log('API returned empty strategies, keeping defaults')
        }
        
        if (Array.isArray(data.tradeTypes) && data.tradeTypes.length > 0) {
          this.tradeTypeOptions = data.tradeTypes
          console.log('Updated trade type options from API:', data.tradeTypes.length)
        } else {
          console.log('API returned empty trade types, keeping defaults')
        }
        
      } catch (error) {
        console.error('Failed to load options from API:', error)
        console.log('Using default options due to API failure')
        // 默认选项已经设置，不需要额外处理
      }
      
      console.log('Final options loaded:', {
        symbols: this.symbolOptions.length,
        strategies: this.strategyOptions.length,
        tradeTypes: this.tradeTypeOptions.length
      })
    },
    async fetchData() {
      console.log('=== FETCH DATA START ===')
      
      this.listLoading = true
      
      try {
        // 构建查询参数
        const params = {
          page: this.listQuery.page,
          pageSize: this.listQuery.limit,
        }
        
        // 添加筛选参数
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
        
        console.log('API response received:', {
          status: response.status,
          data: response.data
        })
        
        if (!response.data) {
          console.error('No data in response')
          throw new Error('API响应数据为空')
        }
        
        // 处理响应数据
        let list = (response.data.list || []).map(item => ({
          ...item,
          changed: false,
          saving: false,
        }))
        
        console.log('Processed list:', list.length, 'items')
        
        // 处理冻结状态筛选（前端处理）
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
        
        console.log('Data fetched successfully:', {
          total: this.total,
          listLength: this.list.length
        })
        
        // 调试：检查每个记录的关键字段
        console.log('=== RECORDS INSPECTION ===')
        this.list.forEach((item, index) => {
          console.log(`Record ${index + 1}:`, {
            id: item.id,
            symbol: item.symbol || '(empty)',
            strategy_name: item.strategy_name || '(empty)',
            trade_type: item.trade_type || '(empty)',
            freeze_on_loss_count: item.freeze_on_loss_count,
            freeze_hours: item.freeze_hours,
            hasValidId: !!item.id && !isNaN(item.id) && item.id > 0
          })
        })
        
      } catch (error) {
        console.error('=== FETCH DATA ERROR ===')
        console.error('Error details:', error)
        console.error('Error message:', error.message)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)
        
        this.list = []
        this.total = 0
        
        const errorMessage = error.response?.data?.message || error.message || '获取数据失败'
        this.$message.error(`获取风控数据失败：${errorMessage}`)
        
      } finally {
        this.listLoading = false
        console.log('=== FETCH DATA END ===')
      }
    },
    handleFilter() {
      console.log('=== FILTER OPERATION START ===')
      console.log('Current filter form:', JSON.stringify(this.filterForm, null, 2))
      console.log('Filter values:', {
        coin: this.filterForm.coin,
        strategy: this.filterForm.strategy,
        tradeType: this.filterForm.tradeType,
        freezeStatus: this.filterForm.freezeStatus
      })
      
      // 重置到第一页
      this.listQuery.page = 1
      
      // 重新获取数据
      this.fetchData()
      
      console.log('=== FILTER OPERATION END ===')
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
      console.log('=== SAVE ROW START ===')
      console.log('Saving row:', JSON.stringify(row, null, 2))
      
      row.saving = true
      
      try {
        // 验证行数据
        if (!row.id) {
          console.error('Save failed: Missing row ID')
          this.$message.error('保存失败：缺少记录ID')
          return
        }
        
        // 验证数值字段
        if (!row.freeze_on_loss_count || row.freeze_on_loss_count <= 0) {
          console.error('Save failed: Invalid freeze_on_loss_count:', row.freeze_on_loss_count)
          this.$message.error('连续亏损阈值必须大于0')
          return
        }
        
        if (!row.freeze_hours || row.freeze_hours <= 0) {
          console.error('Save failed: Invalid freeze_hours:', row.freeze_hours)
          this.$message.error('冻结时长必须大于0')
          return
        }
        
        // 只更新数值字段，不更新币种和策略字段
        const updateData = {
          freeze_on_loss_count: Number(row.freeze_on_loss_count),
          freeze_hours: Number(row.freeze_hours),
          loss_count: row.loss_count || 0,
        }
        
        console.log('Update data (only numeric fields):', updateData)
        console.log('Target ID:', row.id)
        
        const response = await updateStrategyFreeze(row.id, updateData)
        
        console.log('Save response:', response)
        
        row.changed = false
        this.$message.success('保存成功')
        
        // 重新获取数据以确保数据同步
        await this.fetchData()
        
      } catch (error) {
        console.error('=== SAVE ROW ERROR ===')
        console.error('Error details:', error)
        console.error('Error message:', error.message)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)
        
        const errorMessage = error.response?.data?.message || error.message || '保存失败'
        this.$message.error(`保存失败：${errorMessage}`)
        
      } finally {
        row.saving = false
        console.log('=== SAVE ROW END ===')
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
      console.log('=== DELETE OPERATION START ===')
      console.log('Delete request for row:', JSON.stringify(row, null, 2))
      
      try {
        await this.$confirm('确定要删除该配置吗？删除后无法恢复！', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        
        // 验证行数据完整性
        if (!row) {
          console.error('Delete failed: Row is null or undefined')
          this.$message.error('删除失败：行数据不存在')
          return
        }
        
        if (!row.id) {
          console.error('Delete failed: Missing row ID')
          console.error('Row data:', row)
          this.$message.error('删除失败：缺少记录ID')
          return
        }
        
        // 检查ID是否为有效数字
        const id = Number(row.id)
        if (isNaN(id) || id <= 0) {
          console.error('Delete failed: Invalid row ID:', row.id)
          this.$message.error('删除失败：无效的记录ID')
          return
        }
        
        console.log('Delete validation passed, calling API with ID:', id)
        
        // 调用删除API
        const response = await deleteStrategyFreeze(id)
        
        console.log('Delete API response:', response)
        console.log('Delete operation successful')
        
        this.$message.success('删除成功')
        
        // 重新获取数据
        await this.fetchData()
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('=== DELETE ERROR ===')
          console.error('Error details:', error)
          console.error('Error message:', error.message)
          console.error('Error response:', error.response)
          console.error('Error status:', error.response?.status)
          console.error('Error data:', error.response?.data)
          
          let errorMessage = '删除失败：未知错误'
          
          if (error.response) {
            const status = error.response.status
            const responseData = error.response.data
            const apiMessage = responseData?.message || responseData?.error || '未知错误'
            
            switch (status) {
              case 404:
                errorMessage = `删除失败：记录不存在或已被删除 (${apiMessage})`
                break
              case 403:
                errorMessage = `删除失败：权限不足 (${apiMessage})`
                break
              case 500:
                errorMessage = `删除失败：服务器内部错误 (${apiMessage})`
                break
              case 400:
                errorMessage = `删除失败：请求参数错误 (${apiMessage})`
                break
              default:
                errorMessage = `删除失败：HTTP ${status} 错误 (${apiMessage})`
            }
          } else if (error.message) {
            errorMessage = `删除失败：${error.message}`
          } else {
            errorMessage = '删除失败：网络错误或服务器无响应'
          }
          
          this.$message.error(errorMessage)
        }
      }
      
      console.log('=== DELETE OPERATION END ===')
    },
    async handleAdd() {
      console.log('=== HANDLE ADD START ===')
      
      this.dialogTitle = '新增风控配置'
      this.isEdit = false
      
      // 重置表单
      this.resetForm()
      
      // 确保选项已加载
      if (this.symbolOptions.length === 0 || this.strategyOptions.length === 0) {
        console.log('Options not loaded, loading now...')
        await this.loadOptions()
      }
      
      console.log('Available options:', {
        symbols: this.symbolOptions.length,
        strategies: this.strategyOptions.length,
        tradeTypes: this.tradeTypeOptions.length
      })
      
      this.dialogVisible = true
      
      console.log('=== HANDLE ADD END ===')
    },
    resetForm() {
      console.log('=== RESET FORM START ===')
      console.log('Form before reset:', JSON.stringify(this.form, null, 2))
      
      // 强制重置表单数据
      this.form = {
        symbol: '',
        strategy_name: '',
        trade_type: '',
        freeze_on_loss_count: 1,
        freeze_hours: 1,
      }
      
      // 清除表单验证状态
      if (this.$refs.form) {
        this.$refs.form.resetFields()
        this.$refs.form.clearValidate()
      }
      
      console.log('Form after reset:', JSON.stringify(this.form, null, 2))
      console.log('=== RESET FORM END ===')
    },
    handleDialogClose() {
      console.log('=== DIALOG CLOSE START ===')
      console.log('Dialog closed, current form:', JSON.stringify(this.form, null, 2))
      
      // 重置表单状态
      this.resetForm()
      
      // 重置提交状态
      this.submitLoading = false
      
      console.log('=== DIALOG CLOSE END ===')
    },
    async submitForm() {
      console.log('=== FORM SUBMISSION START ===')
      
      try {
        // 表单验证
        await this.$refs.form.validate()
        console.log('Form validation passed')
        
        this.submitLoading = true
        
        // 详细打印表单数据
        console.log('Form data before processing:', {
          symbol: this.form.symbol,
          strategy_name: this.form.strategy_name,
          trade_type: this.form.trade_type,
          freeze_on_loss_count: this.form.freeze_on_loss_count,
          freeze_hours: this.form.freeze_hours,
          isEdit: this.isEdit
        })
        
        // 验证关键字段不为空
        if (!this.form.symbol || !this.form.strategy_name || !this.form.trade_type) {
          const missingFields = []
          if (!this.form.symbol) missingFields.push('币种')
          if (!this.form.strategy_name) missingFields.push('策略')
          if (!this.form.trade_type) missingFields.push('交易类型')
          
          console.error('=== VALIDATION FAILED ===')
          console.error('Missing fields:', missingFields)
          console.error('Form state:', this.form)
          
          this.$message.error(`请填写完整信息，缺少：${missingFields.join(', ')}`)
          return
        }
        
        // 验证数值字段
        if (!this.form.freeze_on_loss_count || this.form.freeze_on_loss_count <= 0) {
          console.error('Invalid freeze_on_loss_count:', this.form.freeze_on_loss_count)
          this.$message.error('连续亏损阈值必须大于0')
          return
        }
        
        if (!this.form.freeze_hours || this.form.freeze_hours <= 0) {
          console.error('Invalid freeze_hours:', this.form.freeze_hours)
          this.$message.error('冻结时长必须大于0')
          return
        }
        
        console.log('All validations passed')
        
        let response
        
        if (this.isEdit) {
          // 编辑模式：只更新数值字段
          const updateData = {
            freeze_on_loss_count: Number(this.form.freeze_on_loss_count),
            freeze_hours: Number(this.form.freeze_hours)
          }
          
          console.log('=== EDIT MODE ===')
          console.log('Update data:', updateData)
          console.log('Target ID:', this.form.id)
          
          if (!this.form.id) {
            console.error('Missing ID for edit operation')
            this.$message.error('编辑失败：缺少记录ID')
            return
          }
          
          response = await updateStrategyFreeze(this.form.id, updateData)
          console.log('Update response:', response)
          
        } else {
          // 新增模式：提交全部字段
          const createData = {
            symbol: this.form.symbol.trim(),
            strategy_name: this.form.strategy_name.trim(),
            trade_type: this.form.trade_type.trim(),
            freeze_on_loss_count: Number(this.form.freeze_on_loss_count),
            freeze_hours: Number(this.form.freeze_hours)
          }
          
          console.log('=== CREATE MODE ===')
          console.log('Create data:', createData)
          console.log('Data types:', {
            symbol: typeof createData.symbol,
            strategy_name: typeof createData.strategy_name,
            trade_type: typeof createData.trade_type,
            freeze_on_loss_count: typeof createData.freeze_on_loss_count,
            freeze_hours: typeof createData.freeze_hours
          })
          
          // 再次验证创建数据
          if (!createData.symbol || !createData.strategy_name || !createData.trade_type) {
            console.error('=== CREATE DATA VALIDATION FAILED ===')
            console.error('Create data after trim:', createData)
            this.$message.error('创建失败：关键字段为空')
            return
          }
          
          response = await createOrUpdateStrategyFreeze(createData)
          console.log('Create response:', response)
          
          // 保存当前选择以便继续添加
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
            
            console.log('Form selections preserved:', {
              symbol: this.form.symbol,
              strategy_name: this.form.strategy_name,
              trade_type: this.form.trade_type
            })
          })
          
          this.$message.success('配置已保存，可以继续添加更多配置')
        }
        
        console.log('=== FORM SUBMISSION SUCCESS ===')
        console.log('API Response:', response)
        
        if (this.isEdit) {
          this.$message.success('配置更新成功')
          this.dialogVisible = false
        } else {
          this.$message.success('配置创建成功')
        }
        
        // 重新获取数据
        await this.fetchData()
        
      } catch (error) {
        console.error('=== FORM SUBMISSION ERROR ===')
        console.error('Error details:', error)
        console.error('Error message:', error.message)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)
        
        if (error !== false) {
          const errorMessage = error.response?.data?.message || error.message || '保存失败'
          this.$message.error(`操作失败：${errorMessage}`)
        }
      } finally {
        this.submitLoading = false
        console.log('=== FORM SUBMISSION END ===')
      }
    },
    async submitAndClose() {
      console.log('=== FORM SUBMISSION AND CLOSE START ===')
      
      try {
        // 表单验证
        await this.$refs.form.validate()
        console.log('Form validation passed')
        
        this.submitLoading = true
        
        // 详细打印表单数据
        console.log('Form data before processing:', {
          symbol: this.form.symbol,
          strategy_name: this.form.strategy_name,
          trade_type: this.form.trade_type,
          freeze_on_loss_count: this.form.freeze_on_loss_count,
          freeze_hours: this.form.freeze_hours,
          isEdit: this.isEdit
        })
        
        // 验证关键字段不为空
        if (!this.form.symbol || !this.form.strategy_name || !this.form.trade_type) {
          const missingFields = []
          if (!this.form.symbol) missingFields.push('币种')
          if (!this.form.strategy_name) missingFields.push('策略')
          if (!this.form.trade_type) missingFields.push('交易类型')
          
          console.error('=== VALIDATION FAILED ===')
          console.error('Missing fields:', missingFields)
          console.error('Form state:', this.form)
          
          this.$message.error(`请填写完整信息，缺少：${missingFields.join(', ')}`)
          return
        }
        
        // 验证数值字段
        if (!this.form.freeze_on_loss_count || this.form.freeze_on_loss_count <= 0) {
          console.error('Invalid freeze_on_loss_count:', this.form.freeze_on_loss_count)
          this.$message.error('连续亏损阈值必须大于0')
          return
        }
        
        if (!this.form.freeze_hours || this.form.freeze_hours <= 0) {
          console.error('Invalid freeze_hours:', this.form.freeze_hours)
          this.$message.error('冻结时长必须大于0')
          return
        }
        
        console.log('All validations passed')
        
        let response
        
        if (this.isEdit) {
          // 编辑模式：只更新数值字段
          const updateData = {
            freeze_on_loss_count: Number(this.form.freeze_on_loss_count),
            freeze_hours: Number(this.form.freeze_hours)
          }
          
          console.log('=== EDIT MODE ===')
          console.log('Update data:', updateData)
          console.log('Target ID:', this.form.id)
          
          if (!this.form.id) {
            console.error('Missing ID for edit operation')
            this.$message.error('编辑失败：缺少记录ID')
            return
          }
          
          response = await updateStrategyFreeze(this.form.id, updateData)
          console.log('Update response:', response)
          
        } else {
          // 新增模式：提交全部字段
          const createData = {
            symbol: this.form.symbol.trim(),
            strategy_name: this.form.strategy_name.trim(),
            trade_type: this.form.trade_type.trim(),
            freeze_on_loss_count: Number(this.form.freeze_on_loss_count),
            freeze_hours: Number(this.form.freeze_hours)
          }
          
          console.log('=== CREATE MODE ===')
          console.log('Create data:', createData)
          console.log('Data types:', {
            symbol: typeof createData.symbol,
            strategy_name: typeof createData.strategy_name,
            trade_type: typeof createData.trade_type,
            freeze_on_loss_count: typeof createData.freeze_on_loss_count,
            freeze_hours: typeof createData.freeze_hours
          })
          
          // 再次验证创建数据
          if (!createData.symbol || !createData.strategy_name || !createData.trade_type) {
            console.error('=== CREATE DATA VALIDATION FAILED ===')
            console.error('Create data after trim:', createData)
            this.$message.error('创建失败：关键字段为空')
            return
          }
          
          response = await createOrUpdateStrategyFreeze(createData)
          console.log('Create response:', response)
        }
        
        console.log('=== FORM SUBMISSION AND CLOSE SUCCESS ===')
        console.log('API Response:', response)
        
        this.$message.success('配置保存成功')
        this.dialogVisible = false
        
        // 重新获取数据
        await this.fetchData()
        
      } catch (error) {
        console.error('=== FORM SUBMISSION AND CLOSE ERROR ===')
        console.error('Error details:', error)
        console.error('Error message:', error.message)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)
        
        if (error !== false) {
          const errorMessage = error.response?.data?.message || error.message || '保存失败'
          this.$message.error(`操作失败：${errorMessage}`)
        }
      } finally {
        this.submitLoading = false
        console.log('=== FORM SUBMISSION AND CLOSE END ===')
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
