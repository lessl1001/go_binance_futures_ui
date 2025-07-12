<template>
  <div class="app-container">
    <div class="live-deployment-container">
      <!-- Header -->
      <div class="deployment-header">
        <h3>{{ $t('aiOptimization.liveDeployment') }}</h3>
        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            :loading="loading"
            @click="refreshData"
          >
            {{ $t('table.refresh') }}
          </el-button>
        </div>
      </div>

      <!-- Optimal Parameters Section -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>{{ $t('aiOptimization.optimalParameters') }}</span>
            </div>
            <el-table
              :data="optimalParameters"
              size="small"
              stripe
            >
              <el-table-column
                prop="name"
                :label="$t('aiOptimization.parameterName')"
                width="150"
              />
              <el-table-column
                prop="value"
                :label="$t('aiOptimization.defaultValue')"
                width="120"
              />
              <el-table-column
                prop="type"
                :label="$t('aiOptimization.parameterType')"
                width="100"
              />
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>{{ $t('aiOptimization.backtestResults') }}</span>
            </div>
            <div class="backtest-metrics">
              <div class="metric-item">
                <span class="metric-label">Total Profit:</span>
                <span class="metric-value profit">{{ formatCurrency(backtestResults.total_profit) }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Sharpe Ratio:</span>
                <span class="metric-value">{{ formatNumber(backtestResults.sharpe_ratio) }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Max Drawdown:</span>
                <span class="metric-value drawdown">{{ formatPercent(backtestResults.max_drawdown) }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Win Rate:</span>
                <span class="metric-value">{{ formatPercent(backtestResults.win_rate) }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Profit Factor:</span>
                <span class="metric-value">{{ formatNumber(backtestResults.profit_factor) }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Total Trades:</span>
                <span class="metric-value">{{ backtestResults.total_trades }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Deployment Actions -->
      <div class="deployment-actions" style="margin-top: 20px;">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>{{ $t('aiOptimization.deployToLive') }}</span>
          </div>
          <el-form
            ref="deploymentForm"
            :model="deploymentConfig"
            :rules="deploymentRules"
            label-width="150px"
            style="max-width: 600px;"
          >
            <el-form-item :label="$t('aiOptimization.deploymentName')" prop="name">
              <el-input v-model="deploymentConfig.name" />
            </el-form-item>
            <el-form-item :label="$t('aiOptimization.symbol')" prop="symbol">
              <el-input v-model="deploymentConfig.symbol" :disabled="true" />
            </el-form-item>
            <el-form-item :label="'Initial Capital'" prop="initial_capital">
              <el-input-number
                v-model="deploymentConfig.initial_capital"
                :min="100"
                :max="1000000"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item :label="'Risk Per Trade (%)'" prop="risk_per_trade">
              <el-input-number
                v-model="deploymentConfig.risk_per_trade"
                :min="0.1"
                :max="10"
                :step="0.1"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item :label="'Max Positions'" prop="max_positions">
              <el-input-number
                v-model="deploymentConfig.max_positions"
                :min="1"
                :max="10"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="deploying"
                :disabled="!canDeploy"
                @click="deployToLive"
              >
                {{ $t('aiOptimization.deployToLive') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- Live Deployments List -->
      <div class="live-deployments" style="margin-top: 20px;">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>{{ $t('aiOptimization.liveDeployment') }} Status</span>
          </div>
          <el-table
            v-loading="loading"
            :data="liveDeployments"
            border
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              :label="$t('aiOptimization.deploymentName')"
              width="200"
            />
            <el-table-column
              prop="status"
              :label="$t('aiOptimization.deploymentStatus')"
              width="120"
              align="center"
            >
              <template slot-scope="scope">
                <el-tag :type="getDeploymentStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="symbol"
              :label="$t('aiOptimization.symbol')"
              width="120"
            />
            <el-table-column
              prop="initial_capital"
              :label="'Initial Capital'"
              width="120"
            >
              <template slot-scope="scope">
                {{ formatCurrency(scope.row.initial_capital) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="current_capital"
              :label="'Current Capital'"
              width="120"
            >
              <template slot-scope="scope">
                {{ formatCurrency(scope.row.current_capital) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="total_pnl"
              :label="'Total P&L'"
              width="120"
            >
              <template slot-scope="scope">
                <span :class="scope.row.total_pnl >= 0 ? 'profit' : 'loss'">
                  {{ formatCurrency(scope.row.total_pnl) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="total_trades"
              :label="'Total Trades'"
              width="100"
              align="center"
            />
            <el-table-column
              prop="created_at"
              :label="$t('table.date')"
              width="180"
            />
            <el-table-column
              :label="$t('table.actions')"
              width="200"
            >
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="viewPerformance(scope.row)"
                >
                  {{ $t('aiOptimization.livePerformance') }}
                </el-button>
                <el-button
                  v-if="scope.row.status === 'running'"
                  type="danger"
                  size="mini"
                  @click="stopDeployment(scope.row)"
                >
                  {{ $t('aiOptimization.stopDeployment') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- Performance Chart Dialog -->
      <el-dialog
        :title="$t('aiOptimization.livePerformance')"
        :visible.sync="performanceDialog"
        width="90%"
      >
        <div v-if="selectedDeployment">
          <!-- Performance Metrics -->
          <el-row :gutter="20" style="margin-bottom: 20px;">
            <el-col :span="4">
              <div class="performance-metric">
                <div class="metric-label">Current Capital</div>
                <div class="metric-value">{{ formatCurrency(performanceData.current_capital) }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="performance-metric">
                <div class="metric-label">Total P&L</div>
                <div class="metric-value" :class="performanceData.total_pnl >= 0 ? 'profit' : 'loss'">
                  {{ formatCurrency(performanceData.total_pnl) }}
                </div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="performance-metric">
                <div class="metric-label">Win Rate</div>
                <div class="metric-value">{{ formatPercent(performanceData.win_rate) }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="performance-metric">
                <div class="metric-label">Total Trades</div>
                <div class="metric-value">{{ performanceData.total_trades }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="performance-metric">
                <div class="metric-label">Max Drawdown</div>
                <div class="metric-value drawdown">{{ formatPercent(performanceData.max_drawdown) }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="performance-metric">
                <div class="metric-label">Sharpe Ratio</div>
                <div class="metric-value">{{ formatNumber(performanceData.sharpe_ratio) }}</div>
              </div>
            </el-col>
          </el-row>

          <!-- Performance Chart -->
          <div class="chart-container">
            <apexchart
              ref="performanceChart"
              type="line"
              height="400"
              :options="performanceChartOptions"
              :series="performanceSeries"
            />
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  getOptimalParameters,
  deployToLive,
  getLivePerformance,
  stopLiveDeployment,
} from '@/api/ai-optimization'
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'LiveDeployment',
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      loading: false,
      deploying: false,
      taskId: null,
      optimalParameters: [],
      backtestResults: {
        total_profit: 0,
        sharpe_ratio: 0,
        max_drawdown: 0,
        win_rate: 0,
        profit_factor: 0,
        total_trades: 0,
      },
      deploymentConfig: {
        name: '',
        symbol: '',
        initial_capital: 1000,
        risk_per_trade: 2,
        max_positions: 3,
      },
      liveDeployments: [],
      performanceDialog: false,
      selectedDeployment: null,
      performanceData: {},
      deploymentRules: {
        name: [
          { required: true, message: 'Deployment name is required', trigger: 'blur' },
        ],
        initial_capital: [
          { required: true, message: 'Initial capital is required', trigger: 'blur' },
        ],
        risk_per_trade: [
          { required: true, message: 'Risk per trade is required', trigger: 'blur' },
        ],
      },
      performanceChartOptions: {
        chart: {
          id: 'performance',
          toolbar: {
            show: true,
          },
        },
        xaxis: {
          type: 'datetime',
          title: {
            text: 'Date',
          },
        },
        yaxis: {
          title: {
            text: 'Capital',
          },
        },
        title: {
          text: 'Live Performance',
          align: 'center',
        },
        stroke: {
          curve: 'smooth',
        },
      },
      performanceSeries: [{
        name: 'Capital',
        data: [],
      }],
    }
  },
  computed: {
    canDeploy() {
      return this.optimalParameters.length > 0 &&
             this.deploymentConfig.name &&
             this.deploymentConfig.symbol
    },
  },
  created() {
    this.taskId = this.$route.query.taskId
    if (this.taskId) {
      this.fetchOptimalParameters()
      this.fetchLiveDeployments()
    }
  },
  methods: {
    async fetchOptimalParameters() {
      this.loading = true
      try {
        const response = await getOptimalParameters(this.taskId)
        const data = response.data

        this.optimalParameters = Object.entries(data.parameters || {}).map(([key, value]) => ({
          name: key,
          value: value.value,
          type: value.type || 'float',
        }))

        this.backtestResults = data.backtest_results || {}
        this.deploymentConfig.symbol = data.symbol || ''
        this.deploymentConfig.name = `${data.strategy_name || 'Strategy'} - ${new Date().toISOString().split('T')[0]}`
      } catch (error) {
        this.$message.error('Failed to fetch optimal parameters')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async fetchLiveDeployments() {
      this.loading = true
      try {
        // 强制保证 liveDeployments 为数组，不管接口返回啥结构
        const response = await this.$axios.get('/api/deploy_strategy')
        // 你可以用 console.log(response.data) 查看真实结构
        // 假如后端返回 { deployments: [...] }
        this.liveDeployments = Array.isArray(response.data?.deployments)
          ? response.data.deployments
          : Array.isArray(response.data)
            ? response.data
            : []
      } catch (error) {
        this.liveDeployments = []
        this.$message.error('Failed to fetch live deployments')
        console.error('Failed to fetch live deployments:', error)
      } finally {
        this.loading = false
      }
    },

    async deployToLive() {
      this.$refs.deploymentForm.validate(async(valid) => {
        if (valid) {
          this.$confirm(this.$t('aiOptimization.confirmDeployment'), 'Warning', {
            confirmButtonText: this.$t('table.confirm'),
            cancelButtonText: this.$t('table.cancel'),
            type: 'warning',
          }).then(async() => {
            this.deploying = true
            try {
              const deploymentData = {
                ...this.deploymentConfig,
                task_id: this.taskId,
                parameters: this.optimalParameters.reduce((acc, param) => {
                  acc[param.name] = param.value
                  return acc
                }, {}),
              }

              const response = await deployToLive(deploymentData)
              this.$message.success(this.$t('aiOptimization.deploymentSuccess'))

              // Add to live deployments list
              this.liveDeployments.unshift({
                id: response.data.id,
                name: deploymentData.name,
                status: 'running',
                symbol: deploymentData.symbol,
                initial_capital: deploymentData.initial_capital,
                current_capital: deploymentData.initial_capital,
                total_pnl: 0,
                total_trades: 0,
                created_at: new Date().toISOString(),
              })
            } catch (error) {
              this.$message.error(this.$t('aiOptimization.deploymentError'))
              console.error(error)
            } finally {
              this.deploying = false
            }
          })
        }
      })
    },

    async viewPerformance(deployment) {
      this.selectedDeployment = deployment
      this.performanceDialog = true

      try {
        const response = await getLivePerformance(deployment.id)
        this.performanceData = response.data

        // Update performance chart
        this.performanceSeries = [{
          name: 'Capital',
          data: response.data.capital_history || [],
        }]
      } catch (error) {
        this.$message.error('Failed to fetch performance data')
        console.error(error)
      }
    },

    async stopDeployment(deployment) {
      this.$confirm(this.$t('aiOptimization.confirmStopTask'), 'Warning', {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning',
      }).then(async() => {
        try {
          await stopLiveDeployment(deployment.id)
          this.$message.success('Deployment stopped successfully')

          // Update deployment status
          const index = this.liveDeployments.findIndex(d => d.id === deployment.id)
          if (index !== -1) {
            this.liveDeployments[index].status = 'stopped'
          }
        } catch (error) {
          this.$message.error('Failed to stop deployment')
          console.error(error)
        }
      })
    },

    refreshData() {
      this.fetchOptimalParameters()
      this.fetchLiveDeployments()
    },

    getDeploymentStatusType(status) {
      const typeMap = {
        'running': 'success',
        'stopped': 'info',
        'error': 'danger',
      }
      return typeMap[status] || 'info'
    },

    formatCurrency(value) {
      if (typeof value !== 'number') return '$0.00'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value)
    },

    formatPercent(value) {
      if (typeof value !== 'number') return '0.00%'
      return (value * 100).toFixed(2) + '%'
    },

    formatNumber(value) {
      if (typeof value !== 'number') return '0.00'
      return value.toFixed(2)
    },
  },
}
</script>

<style scoped>
.live-deployment-container {
  padding: 20px;
}

.deployment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.backtest-metrics {
  padding: 20px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.metric-label {
  font-weight: bold;
  color: #606266;
}

.metric-value {
  font-size: 16px;
  font-weight: bold;
}

.profit {
  color: #67c23a;
}

.loss {
  color: #f56c6c;
}

.drawdown {
  color: #e6a23c;
}

.deployment-actions {
  margin-top: 20px;
}

.performance-metric {
  text-align: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.performance-metric .metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.performance-metric .metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.chart-container {
  padding: 20px;
}

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
</style>
