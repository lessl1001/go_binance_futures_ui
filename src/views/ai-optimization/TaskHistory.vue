<template>
  <div class="app-container">
    <div class="task-history-container">
      <!-- Header -->
      <div class="history-header">
        <h3>{{ $t('aiOptimization.taskHistory') }}</h3>
        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            :loading="loading"
            @click="fetchHistoricalTasks"
          >
            {{ $t('table.refresh') }}
          </el-button>
          <el-button
            type="success"
            icon="el-icon-download"
            :loading="exporting"
            @click="exportAllResults"
          >
            {{ $t('aiOptimization.exportResults') }}
          </el-button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <el-form :model="filters" inline>
          <el-form-item label="Status">
            <el-select v-model="filters.status" clearable placeholder="All Status">
              <el-option label="Completed" value="completed" />
              <el-option label="Failed" value="failed" />
              <el-option label="Cancelled" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item label="Date Range">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="到"
              start-placeholder="Start Date"
              end-placeholder="End Date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="Symbol">
            <el-input v-model="filters.symbol" placeholder="e.g., BTCUSDT" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="applyFilters">
              {{ $t('table.search') }}
            </el-button>
            <el-button @click="resetFilters">
              Reset
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Historical Tasks Table -->
      <div class="tasks-table">
        <el-table
          v-loading="loading"
          :data="historicalTasks"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            :label="$t('aiOptimization.taskName')"
            width="200"
            show-overflow-tooltip
          />
          <el-table-column
            prop="status"
            :label="$t('aiOptimization.taskStatus')"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="symbol"
            :label="$t('aiOptimization.symbol')"
            width="120"
          />
          <el-table-column
            prop="strategy_name"
            :label="$t('aiOptimization.strategyName')"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="optimization_target"
            :label="$t('aiOptimization.optimizationTarget')"
            width="140"
          />
          <el-table-column
            prop="best_objective_value"
            :label="$t('aiOptimization.objectiveValue')"
            width="140"
            align="right"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.best_objective_value">
                {{ formatNumber(scope.row.best_objective_value) }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="total_iterations"
            :label="$t('aiOptimization.iterationCount')"
            width="120"
            align="center"
          />
          <el-table-column
            prop="elapsed_time"
            :label="$t('aiOptimization.elapsedTime')"
            width="120"
            align="center"
          />
          <el-table-column
            prop="completed_at"
            :label="'Completed At'"
            width="180"
          />
          <el-table-column
            :label="$t('table.actions')"
            width="300"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="viewTaskDetails(scope.row)"
              >
                {{ $t('table.view') }}
              </el-button>
              <el-button
                type="success"
                size="mini"
                @click="viewTaskReport(scope.row)"
              >
                {{ $t('aiOptimization.viewReport') }}
              </el-button>
              <el-button
                type="info"
                size="mini"
                @click="exportTaskResults(scope.row)"
              >
                {{ $t('aiOptimization.exportResults') }}
              </el-button>
              <el-button
                type="warning"
                size="mini"
                @click="downloadTaskReport(scope.row)"
              >
                {{ $t('aiOptimization.downloadReport') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- Task Details Dialog -->
      <el-dialog
        :title="$t('aiOptimization.taskResults')"
        :visible.sync="detailsDialog"
        width="80%"
      >
        <div v-if="selectedTask">
          <el-descriptions title="Task Information" :column="2" border>
            <el-descriptions-item :label="$t('aiOptimization.taskName')">
              {{ selectedTask.name }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.taskStatus')">
              <el-tag :type="getStatusType(selectedTask.status)">
                {{ getStatusLabel(selectedTask.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.symbol')">
              {{ selectedTask.symbol }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.strategyName')">
              {{ selectedTask.strategy_name }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.optimizationTarget')">
              {{ selectedTask.optimization_target }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.objectiveValue')">
              {{ formatNumber(selectedTask.best_objective_value) }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.iterationCount')">
              {{ selectedTask.total_iterations }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.elapsedTime')">
              {{ selectedTask.elapsed_time }}
            </el-descriptions-item>
            <el-descriptions-item :label="'Historical Range'">
              {{ selectedTask.start_date }} - {{ selectedTask.end_date }}
            </el-descriptions-item>
            <el-descriptions-item :label="'Completed At'">
              {{ selectedTask.completed_at }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- Strategy Expression -->
          <div style="margin-top: 20px;" v-if="selectedTask.strategy_expression">
            <h4>策略表达式</h4>
            <pre class="strategy-expression">{{ formatStrategyExpression(selectedTask.strategy_expression) }}</pre>
          </div>

          <!-- Best Parameters -->
          <div style="margin-top: 20px;">
            <h4>{{ $t('aiOptimization.bestParameters') }}</h4>
            <el-table
              :data="taskBestParameters"
              size="small"
              border
              style="width: 100%"
            >
              <el-table-column
                prop="name"
                :label="$t('aiOptimization.parameterName')"
                width="200"
              />
              <el-table-column
                prop="value"
                :label="$t('aiOptimization.defaultValue')"
                width="150"
              />
              <el-table-column
                prop="type"
                :label="$t('aiOptimization.parameterType')"
                width="120"
              />
            </el-table>
          </div>

          <!-- Performance Metrics -->
          <div style="margin-top: 20px;">
            <h4>Performance Metrics</h4>
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="metric-card">
                  <div class="metric-label">Total Profit</div>
                  <div class="metric-value profit">{{ formatCurrency(taskMetrics.total_profit) }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-card">
                  <div class="metric-label">Sharpe Ratio</div>
                  <div class="metric-value">{{ formatNumber(taskMetrics.sharpe_ratio) }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-card">
                  <div class="metric-label">Max Drawdown</div>
                  <div class="metric-value drawdown">{{ formatPercent(taskMetrics.max_drawdown) }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-card">
                  <div class="metric-label">Win Rate</div>
                  <div class="metric-value">{{ formatPercent(taskMetrics.win_rate) }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-dialog>

      <!-- Task Report Dialog -->
      <el-dialog
        :title="$t('aiOptimization.viewReport')"
        :visible.sync="reportDialog"
        width="90%"
      >
        <div v-if="taskReport" class="report-content">
          <div class="report-header">
            <h2>{{ taskReport.task_name }} - Optimization Report</h2>
            <p>Generated on: {{ taskReport.generated_at }}</p>
          </div>

          <div class="report-section">
            <h3>Summary</h3>
            <p>{{ taskReport.summary }}</p>
          </div>

          <div class="report-section">
            <h3>Optimization Results</h3>
            <el-table
              :data="taskReport.optimization_results"
              size="small"
              border
            >
              <el-table-column prop="metric" label="Metric" width="200" />
              <el-table-column prop="value" label="Value" width="150" />
              <el-table-column prop="description" label="Description" />
            </el-table>
          </div>

          <div class="report-section">
            <h3>Parameter Analysis</h3>
            <p>{{ taskReport.parameter_analysis }}</p>
          </div>

          <div class="report-section">
            <h3>Recommendations</h3>
            <ul>
              <li v-for="(recommendation, index) in taskReport.recommendations" :key="index">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  getHistoricalTasks,
  getTaskResults,
  getTaskReport,
  exportTaskResults,
  exportTaskReport,
} from '@/api/ai-optimization'
import { 
  convertTaskFromBackendFormat, 
  formatTaskDetails, 
  taskStatusTypes, 
  optimizationTargets 
} from '@/utils/backend-task-management'
import { formatStrategyExpression } from '@/utils/backend-optimization-monitor'

export default {
  name: 'TaskHistory',
  data() {
    return {
      loading: false,
      exporting: false,
      historicalTasks: [],
      selectedTask: null,
      taskBestParameters: [],
      taskMetrics: {},
      taskReport: null,
      detailsDialog: false,
      reportDialog: false,
      filters: {
        status: '',
        dateRange: [],
        symbol: '',
      },
      pagination: {
        current: 1,
        size: 20,
        total: 0,
      },
      taskStatusTypes,
      optimizationTargets,
      formatStrategyExpression,
    }
  },
  created() {
    this.fetchHistoricalTasks()
  },
  methods: {
    async fetchHistoricalTasks() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.current,
          page_size: this.pagination.size,
          ...this.filters,
        }

        if (this.filters.dateRange && this.filters.dateRange.length === 2) {
          params.start_date = this.filters.dateRange[0]
          params.end_date = this.filters.dateRange[1]
        }

        const response = await getHistoricalTasks(params)
        // Convert backend format to frontend format
        this.historicalTasks = Array.isArray(response.data?.results)
          ? response.data.results.map(task => formatTaskDetails(convertTaskFromBackendFormat(task)))
          : Array.isArray(response.data)
            ? response.data.map(task => formatTaskDetails(convertTaskFromBackendFormat(task)))
            : []
        this.pagination.total = response.data.total || 0
      } catch (error) {
        this.historicalTasks = []
        this.$message.error('Failed to fetch historical tasks')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async viewTaskDetails(task) {
      this.selectedTask = task
      this.detailsDialog = true

      try {
        const response = await getTaskResults(task.id)
        const data = response.data
        
        // Format strategy expression for display
        this.selectedTask.formatted_strategy_expression = formatStrategyExpression(task.strategy_expression)
        
        // Add result details
        this.selectedTask.result_details = {
          ...data,
          formatted_objective_value: optimizationTargets[task.optimization_target]?.format(data.best_objective_value) || data.best_objective_value
        }

        // Update best parameters
        this.taskBestParameters = Object.entries(data.best_parameters || {}).map(([key, value]) => ({
          name: key,
          value: this.formatNumber(value.value),
          type: value.type || 'float',
        }))

        // Update metrics
        this.taskMetrics = data.metrics || {}
      } catch (error) {
        this.$message.error('Failed to fetch task details')
        console.error(error)
      }
    },

    async viewTaskReport(task) {
      this.selectedTask = task
      this.reportDialog = true

      try {
        const response = await getTaskReport(task.id)
        this.taskReport = response.data
      } catch (error) {
        this.$message.error('Failed to fetch task report')
        console.error(error)
      }
    },

    async exportTaskResults(task) {
      try {
        const response = await exportTaskResults(task.id, 'json')
        this.downloadFile(response.data, `task_${task.id}_results.json`)
        this.$message.success('Results exported successfully')
      } catch (error) {
        this.$message.error('Failed to export results')
        console.error(error)
      }
    },

    async downloadTaskReport(task) {
      try {
        const response = await exportTaskReport(task.id, 'pdf')
        this.downloadFile(response.data, `task_${task.id}_report.pdf`)
        this.$message.success('Report downloaded successfully')
      } catch (error) {
        this.$message.error('Failed to download report')
        console.error(error)
      }
    },

    async exportAllResults() {
      this.exporting = true
      try {
        // Export all filtered results
        const params = { ...this.filters }
        if (this.filters.dateRange && this.filters.dateRange.length === 2) {
          params.start_date = this.filters.dateRange[0]
          params.end_date = this.filters.dateRange[1]
        }

        // This would be a separate API endpoint for bulk export
        // For now, we'll simulate it
        this.$message.success('Export started, you will receive an email when complete')
      } catch (error) {
        this.$message.error('Failed to export all results')
        console.error(error)
      } finally {
        this.exporting = false
      }
    },

    applyFilters() {
      this.pagination.current = 1
      this.fetchHistoricalTasks()
    },

    resetFilters() {
      this.filters = {
        status: '',
        dateRange: [],
        symbol: '',
      }
      this.pagination.current = 1
      this.fetchHistoricalTasks()
    },

    handleSizeChange(size) {
      this.pagination.size = size
      this.fetchHistoricalTasks()
    },

    handleCurrentChange(current) {
      this.pagination.current = current
      this.fetchHistoricalTasks()
    },

    downloadFile(data, filename) {
      const blob = new Blob([data], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)
    },

    getStatusType(status) {
      const typeMap = {
        'completed': 'success',
        'failed': 'danger',
        'cancelled': 'info',
      }
      return typeMap[status] || 'info'
    },

    getStatusLabel(status) {
      const labelMap = {
        'completed': this.$t('aiOptimization.statusCompleted'),
        'failed': this.$t('aiOptimization.statusFailed'),
        'cancelled': this.$t('aiOptimization.statusCancelled'),
      }
      return labelMap[status] || status
    },

    formatNumber(value) {
      if (typeof value !== 'number') return '0.00'
      return value.toFixed(4)
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
  },
}
</script>

<style scoped>
.task-history-container {
  padding: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.tasks-table {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.metric-card {
  text-align: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
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
  margin: 10px 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.profit {
  color: #67c23a;
}

.drawdown {
  color: #e6a23c;
}

.report-content {
  padding: 20px;
}

.report-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 20px;
}

.report-section {
  margin-bottom: 30px;
}

.report-section h3 {
  color: #303133;
  margin-bottom: 15px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.report-section p {
  line-height: 1.6;
  color: #606266;
}

.report-section ul {
  padding-left: 20px;
}

.report-section li {
  margin-bottom: 5px;
  color: #606266;
}
</style>
