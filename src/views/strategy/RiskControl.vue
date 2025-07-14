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
                    v-for="coin in coinOptions"
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
                  <el-option label="现货" value="spot" />
                  <el-option label="合约" value="futures" />
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
        type="primary"
        size="mini"
        :loading="listLoading"
        @click="fetchData"
      >
        {{ $t('table.refresh') }}
      </el-button>
      <el-button
        type="success"
        size="mini"
        :loading="savingAll"
        @click="saveAll"
      >
        全部保存
      </el-button>
    </div>

    <!-- Parameters Table -->
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
        prop="coin"
        align="center"
        width="100"
      />
      <el-table-column
        label="策略"
        prop="strategy"
        align="center"
        width="150"
      />
      <el-table-column
        label="交易类型"
        prop="tradeType"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          {{ scope.row.tradeType === 'spot' ? '现货' : '合约' }}
        </template>
      </el-table-column>
      <el-table-column
        label="连续亏损次数"
        align="center"
        width="140"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.consecutiveLossCount"
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
            v-model="scope.row.freezeDuration"
            :min="0"
            :max="168"
            size="mini"
            controls-position="right"
            @change="handleParamChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="当前冻结状态"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.freezeStatus === 'normal' ? 'success' : 'danger'"
            size="mini"
          >
            {{ formatFreezeStatus(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
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
        </template>
      </el-table-column>
    </el-table>

    <!-- Error Messages -->
    <div v-if="errorMessages.length > 0" class="error-messages">
      <el-alert
        v-for="(error, index) in errorMessages"
        :key="index"
        :title="error"
        type="error"
        style="margin-top: 10px"
        closable
        @close="removeError(index)"
      />
    </div>

    <!-- Historical Logs Section -->
    <el-collapse v-model="logActiveNames" class="log-section" style="margin-top: 20px">
      <el-collapse-item title="历史操作日志" name="logs">
        <!-- Log Filter -->
        <el-form :model="logFilter" style="margin-bottom: 15px">
          <el-row :gutter="20">
            <el-col :span="4">
              <el-date-picker
                v-model="logFilter.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="mini"
                @change="handleLogFilter"
              />
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="logFilter.coin"
                placeholder="币种"
                clearable
                size="mini"
                @change="handleLogFilter"
              >
                <el-option
                  v-for="coin in coinOptions"
                  :key="coin.value"
                  :label="coin.label"
                  :value="coin.value"
                />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="logFilter.strategy"
                placeholder="策略"
                clearable
                size="mini"
                @change="handleLogFilter"
              >
                <el-option
                  v-for="strategy in strategyOptions"
                  :key="strategy.value"
                  :label="strategy.label"
                  :value="strategy.value"
                />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="logFilter.operationType"
                placeholder="操作类型"
                clearable
                size="mini"
                @change="handleLogFilter"
              >
                <el-option label="参数更新" value="param_update" />
                <el-option label="手动解冻" value="manual_unfreeze" />
                <el-option label="自动冻结" value="auto_freeze" />
              </el-select>
            </el-col>
          </el-row>
        </el-form>

        <!-- Log Table -->
        <el-table
          v-loading="logLoading"
          :data="logList"
          element-loading-text="Loading"
          border
          fit
          size="mini"
          highlight-current-row
        >
          <el-table-column
            label="时间"
            prop="createdAt"
            align="center"
            width="180"
          />
          <el-table-column
            label="币种"
            prop="coin"
            align="center"
            width="100"
          />
          <el-table-column
            label="策略"
            prop="strategy"
            align="center"
            width="150"
          />
          <el-table-column
            label="交易类型"
            prop="tradeType"
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              {{ scope.row.tradeType === 'spot' ? '现货' : '合约' }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作类型"
            prop="operationType"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              {{ formatOperationType(scope.row.operationType) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作人"
            prop="operator"
            align="center"
            width="120"
          />
          <el-table-column
            label="详情"
            prop="details"
            align="center"
            show-overflow-tooltip
          />
        </el-table>

        <!-- Log Pagination -->
        <pagination
          v-show="logTotal > 0"
          :total="logTotal"
          :page.sync="logQuery.page"
          :limit.sync="logQuery.limit"
          style="margin-top: 15px"
          @pagination="fetchLogs"
        />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import {
  getRiskControlList,
  updateRiskControlParams,
  batchUpdateRiskControlParams,
  getRiskControlLogs,
  getEnabledStrategiesAndCoins,
} from '@/api/strategy_risk_control'
import Pagination from '@/components/Pagination'

export default {
  name: 'StrategyRiskControl',
  components: {
    Pagination,
  },
  data() {
    return {
      activeNames: ['filter'],
      logActiveNames: [],
      listLoading: false,
      logLoading: false,
      savingAll: false,
      list: [],
      logList: [],
      logTotal: 0,
      errorMessages: [],
      coinOptions: [],
      strategyOptions: [],
      filterForm: {
        coin: '',
        strategy: '',
        tradeType: '',
        freezeStatus: '',
      },
      logFilter: {
        dateRange: null,
        coin: '',
        strategy: '',
        operationType: '',
      },
      logQuery: {
        page: 1,
        limit: 20,
      },
    }
  },
  created() {
    this.fetchOptionsData()
    this.fetchData()
  },
  methods: {
    async fetchOptionsData() {
      try {
        const response = await getEnabledStrategiesAndCoins()
        this.coinOptions = response.data.coins || []
        this.strategyOptions = response.data.strategies || []
      } catch (error) {
        console.error('Failed to fetch options:', error)
        // Set default options if API fails
        this.coinOptions = [
          { label: 'BTCUSDT', value: 'BTCUSDT' },
          { label: 'ETHUSDT', value: 'ETHUSDT' },
          { label: 'ADAUSDT', value: 'ADAUSDT' },
          { label: 'BNBUSDT', value: 'BNBUSDT' },
        ]
        this.strategyOptions = [
          { label: 'MA_CROSS', value: 'MA_CROSS' },
          { label: 'RSI_DIVERGENCE', value: 'RSI_DIVERGENCE' },
          { label: 'BOLLINGER_BANDS', value: 'BOLLINGER_BANDS' },
          { label: 'MACD_SIGNAL', value: 'MACD_SIGNAL' },
        ]
      }
    },
    async fetchData() {
      this.listLoading = true
      try {
        const response = await getRiskControlList(this.filterForm)
        this.list = response.data.map(item => ({
          ...item,
          changed: false,
          saving: false,
        }))
      } catch (error) {
        console.error('Failed to fetch risk control data:', error)
        // Show user-friendly error message
        this.$message.error('获取数据失败，请检查网络连接或联系管理员')
        // Set default/mock data for demonstration
        this.list = [
          {
            id: 1,
            coin: 'BTCUSDT',
            strategy: 'MA_CROSS',
            tradeType: 'futures',
            consecutiveLossCount: 3,
            freezeDuration: 2,
            freezeStatus: 'normal',
            remainingHours: 0,
            changed: false,
            saving: false,
          },
          {
            id: 2,
            coin: 'ETHUSDT',
            strategy: 'RSI_DIVERGENCE',
            tradeType: 'futures',
            consecutiveLossCount: 5,
            freezeDuration: 4,
            freezeStatus: 'frozen',
            remainingHours: 2,
            changed: false,
            saving: false,
          },
          {
            id: 3,
            coin: 'ADAUSDT',
            strategy: 'BOLLINGER_BANDS',
            tradeType: 'spot',
            consecutiveLossCount: 2,
            freezeDuration: 1,
            freezeStatus: 'normal',
            remainingHours: 0,
            changed: false,
            saving: false,
          },
        ]
      } finally {
        this.listLoading = false
      }
    },
    async fetchLogs() {
      this.logLoading = true
      try {
        const params = {
          ...this.logQuery,
          ...this.logFilter,
        }
        if (this.logFilter.dateRange) {
          params.startTime = this.logFilter.dateRange[0]
          params.endTime = this.logFilter.dateRange[1]
        }
        const response = await getRiskControlLogs(params)
        this.logList = response.data.list || []
        this.logTotal = response.data.total || 0
      } catch (error) {
        console.error('Failed to fetch logs:', error)
        // Show user-friendly error message
        this.$message.error('获取日志失败，请检查网络连接或联系管理员')
        // Set default/mock data for demonstration
        this.logList = [
          {
            id: 1,
            createdAt: '2023-12-01 10:30:00',
            coin: 'BTCUSDT',
            strategy: 'MA_CROSS',
            tradeType: 'futures',
            operationType: 'param_update',
            operator: 'admin',
            details: '连续亏损次数从2改为3，冻结时长从1小时改为2小时',
          },
          {
            id: 2,
            createdAt: '2023-12-01 09:15:00',
            coin: 'ETHUSDT',
            strategy: 'RSI_DIVERGENCE',
            tradeType: 'futures',
            operationType: 'auto_freeze',
            operator: 'system',
            details: '触发连续亏损5次，自动冻结4小时',
          },
        ]
        this.logTotal = 2
      } finally {
        this.logLoading = false
      }
    },
    handleFilter() {
      this.fetchData()
    },
    handleLogFilter() {
      this.logQuery.page = 1
      this.fetchLogs()
    },
    handleParamChange(row) {
      row.changed = true
    },
    async saveRow(row) {
      row.saving = true
      try {
        await updateRiskControlParams({
          id: row.id,
          consecutiveLossCount: row.consecutiveLossCount,
          freezeDuration: row.freezeDuration,
        })
        row.changed = false
        this.$message.success('保存成功')
        this.fetchData() // Refresh to get updated freeze status
      } catch (error) {
        console.error('Failed to save row:', error)
        // Show user-friendly error message
        this.$message.error('保存失败，请检查网络连接或联系管理员')
        this.errorMessages.push(`保存失败: ${row.coin} - ${row.strategy}`)
      } finally {
        row.saving = false
      }
    },
    async saveAll() {
      const changedRows = this.list.filter(row => row.changed)
      if (changedRows.length === 0) {
        this.$message.info('没有需要保存的更改')
        return
      }

      this.savingAll = true
      try {
        const data = changedRows.map(row => ({
          id: row.id,
          consecutiveLossCount: row.consecutiveLossCount,
          freezeDuration: row.freezeDuration,
        }))
        await batchUpdateRiskControlParams(data)
        changedRows.forEach(row => {
          row.changed = false
        })
        this.$message.success('全部保存成功')
        this.fetchData() // Refresh to get updated freeze status
      } catch (error) {
        console.error('Failed to save all:', error)
        // Show user-friendly error message
        this.$message.error('批量保存失败，请检查网络连接或联系管理员')
        this.errorMessages.push('批量保存失败')
      } finally {
        this.savingAll = false
      }
    },
    formatFreezeStatus(row) {
      if (row.freezeStatus === 'normal') {
        return '正常'
      } else if (row.freezeStatus === 'frozen') {
        const remainingHours = row.remainingHours || 0
        return remainingHours > 0 ? `已冻结(剩余${remainingHours}小时)` : '已冻结'
      }
      return '未知'
    },
    formatOperationType(type) {
      const typeMap = {
        param_update: '参数更新',
        manual_unfreeze: '手动解冻',
        auto_freeze: '自动冻结',
      }
      return typeMap[type] || type
    },
    removeError(index) {
      this.errorMessages.splice(index, 1)
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

.error-messages {
  margin-top: 10px;
}

.log-section {
  margin-top: 20px;
}
</style>