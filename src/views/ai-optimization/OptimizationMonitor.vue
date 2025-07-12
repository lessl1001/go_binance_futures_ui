<template>
  <div class="app-container">
    <div class="optimization-monitor-container">
      <!-- Header -->
      <div class="monitor-header">
        <h3>{{ $t('aiOptimization.optimizationMonitor') }}</h3>
        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            :loading="loading"
            @click="refreshData"
          >
            {{ $t('table.refresh') }}
          </el-button>
          <el-switch
            v-model="autoRefresh"
            :active-text="'Auto Refresh'"
            :inactive-text="'Manual'"
            @change="toggleAutoRefresh"
          />
        </div>
      </div>

      <!-- Task Info Card -->
      <el-card class="task-info-card" shadow="hover">
        <div slot="header" class="clearfix">
          <span>{{ taskInfo.name }}</span>
          <el-tag
            :type="getStatusType(taskInfo.status)"
            style="float: right"
          >
            {{ getStatusLabel(taskInfo.status) }}
          </el-tag>
        </div>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="info-item">
              <div class="info-label">{{ $t('aiOptimization.taskProgress') }}</div>
              <el-progress :percentage="taskInfo.progress || 0" />
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <div class="info-label">{{ $t('aiOptimization.elapsedTime') }}</div>
              <div class="info-value">{{ taskInfo.elapsed_time || '00:00:00' }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <div class="info-label">{{ $t('aiOptimization.iterationCount') }}</div>
              <div class="info-value">{{ taskInfo.iteration_count || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <div class="info-label">{{ $t('aiOptimization.objectiveValue') }}</div>
              <div class="info-value">{{ formatNumber(taskInfo.best_objective_value) }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- Strategy Information Section -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>策略信息</span>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="strategy-info">
                  <h4>策略表达式</h4>
                  <pre class="strategy-expression">{{ formatStrategyExpression(taskInfo.strategy_expression) }}</pre>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="parameter-info">
                  <h4>启用参数 ({{ taskInfo.enabled_parameters ? taskInfo.enabled_parameters.length : 0 }})</h4>
                  <el-table
                    :data="formatParameterDetails(taskInfo.enabled_parameters)"
                    size="small"
                    stripe
                    max-height="200"
                  >
                    <el-table-column prop="name" label="参数名" width="120" />
                    <el-table-column prop="type" label="类型" width="80" />
                    <el-table-column prop="current_value" label="当前值" width="80" />
                    <el-table-column prop="best_value" label="最优值" width="80" />
                    <el-table-column prop="variation" label="变化率" width="80" />
                  </el-table>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <!-- Parameters Section -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>{{ $t('aiOptimization.currentParameters') }}</span>
            </div>
            <el-table
              :data="currentParameters"
              size="small"
              stripe
              :show-header="false"
            >
              <el-table-column prop="name" width="120" />
              <el-table-column prop="value" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>{{ $t('aiOptimization.bestParameters') }}</span>
            </div>
            <el-table
              :data="bestParameters"
              size="small"
              stripe
              :show-header="false"
            >
              <el-table-column prop="name" width="120" />
              <el-table-column prop="value" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- Charts Section -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>{{ $t('aiOptimization.convergenceChart') }}</span>
            </div>
            <div class="chart-container">
              <apexchart
                ref="convergenceChart"
                type="line"
                height="300"
                :options="convergenceChartOptions"
                :series="convergenceSeries"
              />
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>{{ $t('aiOptimization.metricsChart') }}</span>
            </div>
            <div class="chart-container">
              <apexchart
                ref="metricsChart"
                type="line"
                height="300"
                :options="metricsChartOptions"
                :series="metricsSeries"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Heatmap Section -->
      <el-row style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="hover">
            <div slot="header" class="clearfix">
              <span>{{ $t('aiOptimization.parametersHeatmap') }}</span>
              <div style="float: right;">
                <el-select
                  v-model="selectedParameter1"
                  placeholder="Parameter 1"
                  size="small"
                  style="width: 120px; margin-right: 10px;"
                >
                  <el-option
                    v-for="param in availableParameters"
                    :key="param"
                    :label="param"
                    :value="param"
                  />
                </el-select>
                <el-select
                  v-model="selectedParameter2"
                  placeholder="Parameter 2"
                  size="small"
                  style="width: 120px;"
                >
                  <el-option
                    v-for="param in availableParameters"
                    :key="param"
                    :label="param"
                    :value="param"
                  />
                </el-select>
              </div>
            </div>
            <div class="chart-container">
              <apexchart
                ref="heatmapChart"
                type="heatmap"
                height="400"
                :options="heatmapOptions"
                :series="heatmapSeries"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Task Control -->
      <div class="task-control" style="margin-top: 20px; text-align: center;">
        <el-button
          v-if="taskInfo.status === 'running'"
          type="warning"
          @click="pauseTask"
        >
          {{ $t('aiOptimization.pauseTask') }}
        </el-button>
        <el-button
          v-if="taskInfo.status === 'paused'"
          type="success"
          @click="resumeTask"
        >
          {{ $t('aiOptimization.resumeTask') }}
        </el-button>
        <el-button
          v-if="['running', 'paused'].includes(taskInfo.status)"
          type="danger"
          @click="stopTask"
        >
          {{ $t('aiOptimization.stopTask') }}
        </el-button>
        <el-button
          v-if="taskInfo.status === 'completed'"
          type="primary"
          @click="goToDeployment"
        >
          {{ $t('aiOptimization.liveDeployment') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getOptimizationTask,
  getTaskProgress,
  getTaskMetrics,
  getTaskHeatmap,
  pauseOptimizationTask,
  resumeOptimizationTask,
  stopOptimizationTask,
} from '@/api/ai-optimization'
import VueApexCharts from 'vue-apexcharts'
import {
  formatMonitoringData,
  chartConfigs,
  generateParameterHeatmap,
  formatStrategyExpression,
  formatParameterDetails,
  formatLogEntry,
  getRefreshInterval,
  evaluatePerformance,
} from '@/utils/backend-optimization-monitor'
import { convertTaskFromBackendFormat } from '@/utils/backend-task-management'

export default {
  name: 'OptimizationMonitor',
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      loading: false,
      autoRefresh: true,
      refreshInterval: null,
      taskId: null,
      taskInfo: {
        name: '',
        status: '',
        progress: 0,
        elapsed_time: '',
        iteration_count: 0,
        best_objective_value: 0,
        strategy_expression: '',
        enabled_parameters: [],
        optimization_target: 'profit',
      },
      currentParameters: [],
      bestParameters: [],
      selectedParameter1: '',
      selectedParameter2: '',
      monitoringData: null,
      performanceEvaluation: null,
      formatStrategyExpression,
      formatParameterDetails,
      availableParameters: [],

      // Chart options
      convergenceChartOptions: {
        chart: {
          id: 'convergence',
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          title: {
            text: 'Iteration',
          },
        },
        yaxis: {
          title: {
            text: 'Objective Value',
          },
        },
        title: {
          text: 'Convergence Progress',
          align: 'center',
        },
        stroke: {
          curve: 'smooth',
        },
      },
      convergenceSeries: [{
        name: 'Best Value',
        data: [],
      }],

      metricsChartOptions: {
        chart: {
          id: 'metrics',
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          title: {
            text: 'Iteration',
          },
        },
        yaxis: {
          title: {
            text: 'Metric Value',
          },
        },
        title: {
          text: 'Performance Metrics',
          align: 'center',
        },
        stroke: {
          curve: 'smooth',
        },
      },
      metricsSeries: [],

      heatmapOptions: {
        chart: {
          id: 'heatmap',
          toolbar: {
            show: false,
          },
        },
        title: {
          text: 'Parameter Space Heatmap',
          align: 'center',
        },
        plotOptions: {
          heatmap: {
            shadeIntensity: 0.5,
            colorScale: {
              ranges: [{
                from: -1,
                to: 0,
                color: '#FF4560',
              }, {
                from: 0,
                to: 1,
                color: '#00E396',
              }],
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
      heatmapSeries: [],
    }
  },
  watch: {
    selectedParameter1() {
      this.fetchTaskHeatmap()
    },
    selectedParameter2() {
      this.fetchTaskHeatmap()
    },
  },
  created() {
    this.taskId = this.$route.query.taskId
    if (this.taskId) {
      this.fetchTaskInfo()
      this.refreshData()
      this.startAutoRefresh()
    }
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    async fetchTaskInfo() {
      try {
        const response = await getOptimizationTask(this.taskId)
        const taskData = convertTaskFromBackendFormat(response.data)
        this.taskInfo = {
          ...taskData,
          strategy_expression: taskData.strategy_expression || '',
          enabled_parameters: taskData.enabled_parameters || [],
        }
      } catch (error) {
        this.$message.error('Failed to fetch task info')
        console.error(error)
      }
    },

    async refreshData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchTaskProgress(),
          this.fetchTaskMetrics(),
          this.fetchTaskHeatmap(),
        ])

        // Update monitoring data format
        this.monitoringData = formatMonitoringData({
          task_info: this.taskInfo,
          optimization_progress: {
            current_iteration: this.taskInfo.current_iteration,
            best_objective_value: this.taskInfo.best_objective_value,
          },
          current_parameters: this.currentParameters,
          best_parameters: this.bestParameters,
        })

        // Evaluate performance
        if (this.taskInfo.performance_metrics) {
          this.performanceEvaluation = evaluatePerformance(this.taskInfo.performance_metrics)
        }
      } catch (error) {
        console.error('Error refreshing data:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTaskProgress() {
      try {
        const response = await getTaskProgress(this.taskId)
        const data = response.data

        // Update task info with backend format
        this.taskInfo.progress = data.progress
        this.taskInfo.current_iteration = data.current_iteration
        this.taskInfo.best_objective_value = data.best_objective_value
        this.taskInfo.elapsed_time = data.elapsed_time

        // Update parameters in backend format
        this.currentParameters = Object.entries(data.current_parameters || {}).map(([name, value]) => ({
          name,
          value: typeof value === 'number' ? value.toFixed(4) : value,
        }))

        this.bestParameters = Object.entries(data.best_parameters || {}).map(([name, value]) => ({
          name,
          value: typeof value === 'number' ? value.toFixed(4) : value,
        }))
      } catch (error) {
        console.error('Error fetching task progress:', error)
      }
    },

    async fetchTaskMetrics() {
      try {
        const response = await getTaskMetrics(this.taskId)
        const data = response.data

        // Update convergence chart
        this.convergenceSeries = [{
          name: 'Best Value',
          data: data.convergence_history || [],
        }]

        // Update metrics chart
        this.metricsSeries = []
        if (data.metrics_history) {
          Object.entries(data.metrics_history).forEach(([metric, values]) => {
            this.metricsSeries.push({
              name: metric,
              data: values,
            })
          })
        }
      } catch (error) {
        console.error('Failed to fetch task metrics:', error)
      }
    },

    async fetchTaskHeatmap() {
      if (!this.selectedParameter1 || !this.selectedParameter2) {
        return
      }

      try {
        const response = await getTaskHeatmap(this.taskId, {
          param1: this.selectedParameter1,
          param2: this.selectedParameter2,
        })
        const data = response.data

        // 保证 heatmapSeries 永远为数组，兼容后端变化
        this.heatmapSeries = Array.isArray(data.heatmap_data) ? data.heatmap_data : []
      } catch (error) {
        this.heatmapSeries = []
        console.error('Failed to fetch task heatmap:', error)
      }
    },

    async pauseTask() {
      try {
        await pauseOptimizationTask(this.taskId)
        this.$message.success('Task paused successfully')
        this.fetchTaskInfo()
      } catch (error) {
        this.$message.error('Failed to pause task')
        console.error(error)
      }
    },

    async resumeTask() {
      try {
        await resumeOptimizationTask(this.taskId)
        this.$message.success('Task resumed successfully')
        this.fetchTaskInfo()
      } catch (error) {
        this.$message.error('Failed to resume task')
        console.error(error)
      }
    },

    async stopTask() {
      this.$confirm(this.$t('aiOptimization.confirmStopTask'), 'Warning', {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning',
      }).then(async() => {
        try {
          await stopOptimizationTask(this.taskId)
          this.$message.success(this.$t('aiOptimization.taskStopped'))
          this.fetchTaskInfo()
        } catch (error) {
          this.$message.error(this.$t('aiOptimization.taskStopError'))
          console.error(error)
        }
      })
    },

    goToDeployment() {
      this.$router.push(`/ai-optimization/live-deployment?taskId=${this.taskId}`)
    },

    toggleAutoRefresh() {
      if (this.autoRefresh) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    },

    startAutoRefresh() {
      // Use backend-compatible refresh interval based on task status
      const interval = getRefreshInterval(this.taskInfo.status)
      this.refreshInterval = setInterval(() => {
        if (this.taskInfo.status === 'running' || this.taskInfo.status === 'paused') {
          this.refreshData()
        }
      }, interval)
    },

    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },

    getStatusType(status) {
      const typeMap = {
        'pending': 'info',
        'running': 'success',
        'paused': 'warning',
        'completed': 'success',
        'failed': 'danger',
        'cancelled': 'info',
      }
      return typeMap[status] || 'info'
    },

    getStatusLabel(status) {
      const labelMap = {
        'pending': this.$t('aiOptimization.statusPending'),
        'running': this.$t('aiOptimization.statusRunning'),
        'paused': this.$t('aiOptimization.statusPaused'),
        'completed': this.$t('aiOptimization.statusCompleted'),
        'failed': this.$t('aiOptimization.statusFailed'),
        'cancelled': this.$t('aiOptimization.statusCancelled'),
      }
      return labelMap[status] || status
    },

    formatNumber(value) {
      if (typeof value === 'number') {
        return value.toFixed(4)
      }
      return value
    },
  },
}
</script>

<style scoped>
.optimization-monitor-container {
  padding: 20px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.task-info-card {
  margin-bottom: 20px;
}

.info-item {
  text-align: center;
  padding: 10px;
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.info-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.chart-container {
  padding: 10px;
}

.task-control {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.strategy-info,
.parameter-info {
  margin-bottom: 20px;
}

.strategy-info h4,
.parameter-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.strategy-expression {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
</style>
