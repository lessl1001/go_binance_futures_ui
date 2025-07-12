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
              {{ $t('table.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Tasks Table -->
      <div class="tasks-section">
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
          />
          <el-table-column
            prop="symbol"
            label="Symbol"
            width="100"
          />
          <el-table-column
            prop="status"
            :label="$t('aiOptimization.taskStatus')"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
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
          </el-descriptions>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="detailsDialog = false">
            {{ $t('table.close') }}
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getHistoricalTasks, getTaskReport, exportTaskResults, exportTaskReport } from '@/api/ai-optimization'

export default {
  name: 'TaskHistory',
  data() {
    return {
      loading: false,
      exporting: false,
      historicalTasks: [],
      selectedTask: null,
      detailsDialog: false,
      filters: {
        status: '',
        dateRange: null,
        symbol: '',
      },
      pagination: {
        current: 1,
        size: 20,
        total: 0,
      },
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
          size: this.pagination.size,
          ...this.filters,
        }
        const response = await getHistoricalTasks(params)
        this.historicalTasks = Array.isArray(response.data?.tasks)
          ? response.data.tasks
          : Array.isArray(response.data)
            ? response.data
            : []
        this.pagination.total = response.data?.total || this.historicalTasks.length
      } catch (error) {
        this.historicalTasks = []
        this.$message.error('Failed to fetch historical tasks')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async exportAllResults() {
      this.exporting = true
      try {
        const response = await exportTaskResults('all')
        this.downloadFile(response.data, 'all_task_results.json')
        this.$message.success('Results exported successfully')
      } catch (error) {
        this.$message.error('Failed to export results')
        console.error(error)
      } finally {
        this.exporting = false
      }
    },
    async exportTaskResults(task) {
      try {
        const response = await exportTaskResults(task.id)
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
    async viewTaskReport(task) {
      try {
        const response = await getTaskReport(task.id)
        // Handle viewing report - could open in new tab or show in dialog
        this.$message.info('Report feature coming soon')
      } catch (error) {
        this.$message.error('Failed to view report')
        console.error(error)
      }
    },
    viewTaskDetails(task) {
      this.selectedTask = task
      this.detailsDialog = true
    },
    applyFilters() {
      this.pagination.current = 1
      this.fetchHistoricalTasks()
    },
    resetFilters() {
      this.filters = {
        status: '',
        dateRange: null,
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
    getStatusType(status) {
      const statusMap = {
        completed: 'success',
        failed: 'danger',
        cancelled: 'warning',
        running: 'primary',
        pending: 'info',
      }
      return statusMap[status] || 'info'
    },
    getStatusLabel(status) {
      const statusMap = {
        completed: 'Completed',
        failed: 'Failed',
        cancelled: 'Cancelled',
        running: 'Running',
        pending: 'Pending',
      }
      return statusMap[status] || status
    },
    formatNumber(value) {
      if (value === null || value === undefined) return '-'
      return typeof value === 'number' ? value.toFixed(2) : value
    },
    downloadFile(data, filename) {
      const blob = new Blob([data], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    },
    // Navigation methods for consistent strategy workflow
    goToOptimizationMonitor(taskId) {
      this.$router.push(`/ai-optimization/optimization-monitor?taskId=${taskId}`)
    },
    goToTaskManagement() {
      this.$router.push('/ai-optimization/task-management')
    },
  },
}
</script>

<style lang="scss" scoped>
.task-history-container {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #303133;
    }
  }
  
  .filter-section {
    margin-bottom: 20px;
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 4px;
    
    .el-form-item {
      margin-bottom: 0;
    }
  }
  
  .tasks-section {
    margin-bottom: 20px;
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>