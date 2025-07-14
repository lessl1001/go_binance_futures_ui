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
                  <el-option label="实盘" value="real" />
                  <el-option label="测试" value="test" />
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
        刷新
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
          {{ scope.row.trade_type === 'real' ? '实盘' : '测试' }}
        </template>
      </el-table-column>
      <el-table-column
        label="连续亏损次数"
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
        width="180"
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
            style="margin-left: 6px;"
          >
            解冻
          </el-button>
          <el-button
            type="info"
            size="mini"
            @click="handleResetLoss(scope.row)"
            style="margin-left: 6px;"
          >
            重置亏损
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
  </div>
</template>

<script>
import {
  getStrategyFreezeList,
  updateStrategyFreeze,
  unfreezeStrategy,
  resetStrategyLoss,
} from '@/api/strategyFreeze'

export default {
  name: 'StrategyRiskControl',
  data() {
    return {
      activeNames: ['filter'],
      listLoading: false,
      list: [],
      errorMessages: [],
      coinOptions: [
        { label: 'BTCUSDT', value: 'BTCUSDT' },
        { label: 'ETHUSDT', value: 'ETHUSDT' },
        { label: 'ADAUSDT', value: 'ADAUSDT' },
        { label: 'BNBUSDT', value: 'BNBUSDT' },
      ],
      strategyOptions: [
        { label: 'MA_CROSS', value: 'MA_CROSS' },
        { label: 'RSI_DIVERGENCE', value: 'RSI_DIVERGENCE' },
        { label: 'BOLLINGER_BANDS', value: 'BOLLINGER_BANDS' },
        { label: 'MACD_SIGNAL', value: 'MACD_SIGNAL' },
      ],
      filterForm: {
        coin: '',
        strategy: '',
        tradeType: '',
        freezeStatus: '',
      },
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      try {
        const params = {
          page: 1,
          pageSize: 20,
        }
        if (this.filterForm.coin) params.symbol = this.filterForm.coin
        if (this.filterForm.strategy) params.strategy_name = this.filterForm.strategy
        if (this.filterForm.tradeType) params.trade_type = this.filterForm.tradeType

        const response = await getStrategyFreezeList(params)
        // response.data.list是后端返回的主列表
        this.list = (response.data.list || []).map(item => ({
          ...item,
          changed: false,
          saving: false,
        }))
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
        this.list = []
        this.$message.error('获取风控数据失败')
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
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
        await updateStrategyFreeze(row.id, {
          freeze_on_loss_count: row.freeze_on_loss_count,
          freeze_hours: row.freeze_hours,
          loss_count: row.loss_count || 0,
        })
        row.changed = false
        this.$message.success('保存成功')
        this.fetchData()
      } catch (error) {
        this.$message.error('保存失败，请重试')
        this.errorMessages.push(`保存失败: ${row.symbol} - ${row.strategy_name}`)
      } finally {
        row.saving = false
      }
    },
    async handleUnfreeze(row) {
      try {
        await unfreezeStrategy({
          symbol: row.symbol,
          strategy_name: row.strategy_name,
          trade_type: row.trade_type,
        })
        this.$message.success('解冻成功')
        this.fetchData()
      } catch (error) {
        this.$message.error('解冻失败，请重试')
      }
    },
    async handleResetLoss(row) {
      try {
        await resetStrategyLoss({
          symbol: row.symbol,
          strategy_name: row.strategy_name,
          trade_type: row.trade_type,
        })
        this.$message.success('重置亏损成功')
        this.fetchData()
      } catch (error) {
        this.$message.error('重置亏损失败，请重试')
      }
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
</style>
