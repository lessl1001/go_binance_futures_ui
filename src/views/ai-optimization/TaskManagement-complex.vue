<template>
  <div class="app-container">
    <div class="task-management-container">
      <!-- Header -->
      <div class="task-header">
        <h3>{{ $t('aiOptimization.taskManagement') }}</h3>
        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="createNewTask"
          >
            {{ $t('aiOptimization.createTask') }}
          </el-button>
          <el-button
            type="success"
            icon="el-icon-refresh"
            :loading="loading"
            @click="fetchTasks"
          >
            {{ $t('table.refresh') }}
          </el-button>
        </div>
      </div>

      <!-- Task Status Filter -->
      <div class="filter-section">
        <el-radio-group v-model="statusFilter" @change="fetchTasks">
          <el-radio-button label="">All</el-radio-button>
          <el-radio-button label="pending">{{ $t('aiOptimization.statusPending') }}</el-radio-button>
          <el-radio-button label="running">{{ $t('aiOptimization.statusRunning') }}</el-radio-button>
          <el-radio-button label="paused">{{ $t('aiOptimization.statusPaused') }}</el-radio-button>
          <el-radio-button label="completed">{{ $t('aiOptimization.statusCompleted') }}</el-radio-button>
          <el-radio-button label="failed">{{ $t('aiOptimization.statusFailed') }}</el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tasks List -->
      <div class="tasks-section">
        <el-table
          v-loading="loading"
          :data="tasks"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            :label="$t('aiOptimization.taskName')"
            width="200"
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
            prop="progress"
            :label="$t('aiOptimization.taskProgress')"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-progress
                :percentage="scope.row.progress || 0"
                :status="scope.row.status === 'failed' ? 'exception' : ''"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="strategy_name"
            :label="$t('aiOptimization.strategyName')"
            width="150"
          />
          <el-table-column
            prop="parameter_space_name"
            :label="$t('aiOptimization.parameterSpace')"
            width="150"
          />
          <el-table-column
            prop="elapsed_time"
            :label="$t('aiOptimization.elapsedTime')"
            width="120"
          />
          <el-table-column
            prop="created_at"
            :label="$t('table.date')"
            width="180"
          />
          <el-table-column
            :label="$t('table.actions')"
            width="300"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.status === 'pending'"
                type="success"
                size="mini"
                @click="startTask(scope.row)"
              >
                {{ $t('aiOptimization.startTask') }}
              </el-button>
              <el-button
                v-if="scope.row.status === 'running'"
                type="warning"
                size="mini"
                @click="pauseTask(scope.row)"
              >
                {{ $t('aiOptimization.pauseTask') }}
              </el-button>
              <el-button
                v-if="scope.row.status === 'paused'"
                type="success"
                size="mini"
                @click="resumeTask(scope.row)"
              >
                {{ $t('aiOptimization.resumeTask') }}
              </el-button>
              <el-button
                v-if="['running', 'paused'].includes(scope.row.status)"
                type="danger"
                size="mini"
                @click="stopTask(scope.row)"
              >
                {{ $t('aiOptimization.stopTask') }}
              </el-button>
              <el-button
                type="primary"
                size="mini"
                @click="viewTask(scope.row)"
              >
                {{ $t('table.view') }}
              </el-button>
              <el-button
                type="danger"
                size="mini"
                :disabled="scope.row.status === 'running'"
                @click="deleteTask(scope.row)"
              >
                {{ $t('table.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Create Task Dialog -->
      <el-dialog
        :title="$t('aiOptimization.createTask')"
        :visible.sync="createTaskDialog"
        width="70%"
        :before-close="handleClose"
      >
        <el-form
          ref="taskForm"
          :model="newTask"
          :rules="taskRules"
          label-width="150px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('aiOptimization.taskName')" prop="name">
                <el-input v-model="newTask.name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('aiOptimization.symbol')" prop="symbol">
                <el-select v-model="newTask.symbol" style="width: 100%">
                  <el-option
                    v-for="symbol in supportedSymbols"
                    :key="symbol.value"
                    :label="symbol.label"
                    :value="symbol.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('aiOptimization.timeframe')" prop="timeframe">
                <el-select v-model="newTask.timeframe" style="width: 100%">
                  <el-option
                    v-for="timeframe in supportedTimeframes"
                    :key="timeframe.value"
                    :label="timeframe.label"
                    :value="timeframe.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="初始资金" prop="initial_capital">
                <el-input-number
                  v-model="newTask.initial_capital"
                  :min="1000"
                  :max="1000000"
                  :step="1000"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item :label="$t('aiOptimization.taskDescription')" prop="description">
            <el-input
              v-model="newTask.description"
              type="textarea"
              :rows="2"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('aiOptimization.strategyTemplate')" prop="strategy_id">
                <el-select v-model="newTask.strategy_id" style="width: 100%" @change="onStrategyChange">
                  <el-option
                    v-for="strategy in strategies"
                    :key="strategy.id"
                    :label="strategy.name"
                    :value="strategy.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('aiOptimization.parameterSpace')" prop="parameter_space_id">
                <el-select v-model="newTask.parameter_space_id" style="width: 100%" @change="onParameterSpaceChange">
                  <el-option
                    v-for="space in parameterSpaces"
                    :key="space.id"
                    :label="space.name"
                    :value="space.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Strategy Preview -->
          <div v-if="selectedStrategy" class="strategy-preview">
            <h4>策略预览</h4>
            <div class="strategy-content">
              <p><strong>策略名称:</strong> {{ selectedStrategy.name }}</p>
              <p><strong>策略描述:</strong> {{ selectedStrategy.description }}</p>
              <p><strong>策略表达式:</strong></p>
              <pre>{{ selectedStrategy.expression }}</pre>
            </div>
          </div>

          <!-- Parameter Space Preview -->
          <div v-if="selectedParameterSpace" class="parameter-space-preview">
            <h4>参数空间预览</h4>
            <div class="parameter-content">
              <p><strong>参数空间名称:</strong> {{ selectedParameterSpace.name }}</p>
              <p><strong>启用参数数量:</strong> {{ getEnabledParametersCount(selectedParameterSpace) }}</p>
              <p><strong>优化目标:</strong> {{ optimizationTargets[selectedParameterSpace.optimization_target]?.label }}</p>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('aiOptimization.historicalRange')" prop="historical_range">
                <el-date-picker
                  v-model="newTask.historical_range"
                  type="daterange"
                  range-separator="到"
                  :start-placeholder="$t('aiOptimization.startDate')"
                  :end-placeholder="$t('aiOptimization.endDate')"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="初始资金" prop="initial_capital">
                <el-input-number
                  v-model="newTask.initial_capital"
                  :min="1000"
                  :max="1000000"
                  :step="1000"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('aiOptimization.optimizationTarget')" prop="optimization_target">
                <el-select v-model="newTask.optimization_target" style="width: 100%">
                  <el-option
                    v-for="(target, key) in optimizationTargets"
                    :key="key"
                    :label="target.label"
                    :value="key"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大迭代次数" prop="max_iterations">
                <el-input-number
                  v-model="newTask.max_iterations"
                  :min="100"
                  :max="10000"
                  :step="100"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="createTaskDialog = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="saving" @click="saveTask">
            {{ $t('aiOptimization.createTask') }}
          </el-button>
        </div>
      </el-dialog>

      <!-- Task Details Dialog -->
      <el-dialog
        :title="$t('table.view')"
        :visible.sync="viewTaskDialog"
        width="80%"
      >
        <div v-if="selectedTask" class="task-details">
          <el-descriptions title="Task Information" :column="2" border>
            <el-descriptions-item :label="$t('aiOptimization.taskName')">
              {{ selectedTask.name }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.taskStatus')">
              <el-tag :type="getStatusType(selectedTask.status)">
                {{ getStatusLabel(selectedTask.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.taskProgress')">
              <el-progress :percentage="selectedTask.progress || 0" />
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.elapsedTime')">
              {{ selectedTask.elapsed_time || '00:00:00' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.strategyName')">
              {{ selectedTask.strategy_name }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.parameterSpace')">
              {{ selectedTask.parameter_space_name }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.symbol')">
              {{ selectedTask.symbol }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.timeframe')">
              {{ selectedTask.timeframe }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.historicalRange')">
              {{ selectedTask.start_date }} - {{ selectedTask.end_date }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('aiOptimization.optimizationTarget')">
              {{ selectedTask.optimization_target }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="task-actions" style="margin-top: 20px;">
            <el-button
              v-if="selectedTask.status === 'running'"
              type="primary"
              @click="goToOptimizationMonitor(selectedTask.id)"
            >
              {{ $t('aiOptimization.optimizationMonitor') }}
            </el-button>
            <el-button
              v-if="selectedTask.status === 'completed'"
              type="success"
              @click="goToLiveDeployment(selectedTask.id)"
            >
              {{ $t('aiOptimization.liveDeployment') }}
            </el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  getOptimizationTasks,
  createOptimizationTask,
  deleteOptimizationTask,
  startOptimizationTask,
  stopOptimizationTask,
  pauseOptimizationTask,
  resumeOptimizationTask,
  getOptimizationTask,
} from '@/api/ai-optimization'
import { getStrategyTemplates } from '@/api/ai-optimization'
import { getParameterSpaces } from '@/api/ai-optimization'
import {
  taskStatusTypes,
  optimizationTargets,
  defaultTaskConfig,
  convertTaskToBackendFormat,
  convertTaskFromBackendFormat,
  validateTaskConfig,
  formatTaskDetails,
  generateTaskSummary,
  supportedSymbols,
  supportedTimeframes,
} from '@/utils/backend-task-management'

export default {
  name: 'TaskManagement',
  data() {
    return {
      loading: false,
      saving: false,
      tasks: [],
      strategies: [],
      parameterSpaces: [],
      statusFilter: '',
      createTaskDialog: false,
      viewTaskDialog: false,
      selectedTask: null,
      selectedStrategy: null,
      selectedParameterSpace: null,
      newTask: { ...defaultTaskConfig },
      taskRules: {
        name: [
          { required: true, message: 'Task name is required', trigger: 'blur' },
        ],
        symbol: [
          { required: true, message: 'Symbol is required', trigger: 'change' },
        ],
        strategy_id: [
          { required: true, message: 'Strategy is required', trigger: 'change' },
        ],
        parameter_space_id: [
          { required: true, message: 'Parameter space is required', trigger: 'change' },
        ],
        historical_range: [
          { required: true, message: 'Historical range is required', trigger: 'change' },
        ],
      },
      taskStatusTypes,
      optimizationTargets,
      supportedSymbols,
      supportedTimeframes,
    }
  },
  created() {
    this.fetchTasks()
    this.fetchStrategies()
    this.fetchParameterSpaces()
  },
  methods: {
    async fetchTasks() {
      this.loading = true
      try {
        const params = {}
        if (this.statusFilter) {
          params.status = this.statusFilter
        }
        const response = await getOptimizationTasks(params)
        // Convert backend format to frontend format
        this.tasks = Array.isArray(response.data?.tasks)
          ? response.data.tasks.map(task => convertTaskFromBackendFormat(task))
          : Array.isArray(response.data)
            ? response.data.map(task => convertTaskFromBackendFormat(task))
            : []
      } catch (error) {
        this.tasks = []
        this.$message.error('Failed to fetch tasks')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async fetchStrategies() {
      try {
        const response = await getStrategyTemplates()
        this.strategies = Array.isArray(response.data?.strategy_templates)
          ? response.data.strategy_templates
          : Array.isArray(response.data)
            ? response.data
            : []
      } catch (error) {
        this.strategies = []
        console.error('Failed to fetch strategies:', error)
      }
    },

    async fetchParameterSpaces() {
      try {
        const response = await getParameterSpaces()
        this.parameterSpaces = Array.isArray(response.data?.parameter_spaces)
          ? response.data.parameter_spaces
          : Array.isArray(response.data)
            ? response.data
            : []
      } catch (error) {
        this.parameterSpaces = []
        console.error('Failed to fetch parameter spaces:', error)
      }
    },

    createNewTask() {
      this.newTask = { ...defaultTaskConfig }
      this.selectedStrategy = null
      this.selectedParameterSpace = null
      this.createTaskDialog = true
    },

    onStrategyChange(strategyId) {
      this.selectedStrategy = this.strategies.find(s => s.id === strategyId)
    },

    onParameterSpaceChange(parameterSpaceId) {
      this.selectedParameterSpace = this.parameterSpaces.find(p => p.id === parameterSpaceId)
    },

    getEnabledParametersCount(parameterSpace) {
      if (!parameterSpace) return 0
      let count = 0
      Object.keys(parameterSpace).forEach(key => {
        if (key.endsWith('_parameters')) {
          const parameters = parameterSpace[key] || []
          count += parameters.filter(param => param.enabled).length
        }
      })
      return count
    },

    async saveTask() {
      this.$refs.taskForm.validate(async(valid) => {
        if (valid) {
          // Additional validation using backend utilities
          const taskData = {
            ...this.newTask,
            start_date: this.newTask.historical_range[0],
            end_date: this.newTask.historical_range[1],
          }

          const errors = validateTaskConfig(taskData)
          if (errors.length > 0) {
            this.$message.error(errors.join('\n'))
            return
          }

          this.saving = true
          try {
            const backendTask = convertTaskToBackendFormat(taskData)
            await createOptimizationTask(backendTask)
            this.$message.success('Task created successfully')
            this.createTaskDialog = false
            this.fetchTasks()
          } catch (error) {
            this.$message.error('Failed to create task')
            console.error(error)
          } finally {
            this.saving = false
          }
        }
      })
    },

    async startTask(task) {
      try {
        await startOptimizationTask(task.id)
        this.$message.success('Task started successfully')
        this.fetchTasks()
      } catch (error) {
        this.$message.error('Failed to start task')
        console.error(error)
      }
    },

    async stopTask(task) {
      this.$confirm('确定要停止这个任务吗？', 'Warning', {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning',
      }).then(async() => {
        try {
          await stopOptimizationTask(task.id)
          this.$message.success('Task stopped successfully')
          this.fetchTasks()
        } catch (error) {
          this.$message.error('Failed to stop task')
          console.error(error)
        }
      })
    },

    async pauseTask(task) {
      try {
        await pauseOptimizationTask(task.id)
        this.$message.success('Task paused successfully')
        this.fetchTasks()
      } catch (error) {
        this.$message.error('Failed to pause task')
        console.error(error)
      }
    },

    async resumeTask(task) {
      try {
        await resumeOptimizationTask(task.id)
        this.$message.success('Task resumed successfully')
        this.fetchTasks()
      } catch (error) {
        this.$message.error('Failed to resume task')
        console.error(error)
      }
    },

    async deleteTask(task) {
      this.$confirm('确定要删除这个任务吗？', 'Warning', {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning',
      }).then(async() => {
        try {
          await deleteOptimizationTask(task.id)
          this.$message.success('Task deleted successfully')
          this.fetchTasks()
        } catch (error) {
          this.$message.error('Failed to delete task')
          console.error(error)
        }
      })
    },

    async viewTask(task) {
      try {
        const response = await getOptimizationTask(task.id)
        this.selectedTask = formatTaskDetails(convertTaskFromBackendFormat(response.data))
        this.viewTaskDialog = true
      } catch (error) {
        this.$message.error('Failed to fetch task details')
        console.error(error)
      }
    },

    getStatusType(status) {
      return taskStatusTypes[status]?.type || 'info'
    },

    getStatusLabel(status) {
      return taskStatusTypes[status]?.label || status
    },

    goToOptimizationMonitor(taskId) {
      this.$router.push(`/ai-optimization/optimization-monitor?taskId=${taskId}`)
    },

    goToLiveDeployment(taskId) {
      this.$router.push(`/ai-optimization/live-deployment?taskId=${taskId}`)
    },

    handleClose(done) {
      this.$confirm('确定要关闭吗？未保存的修改将丢失。')
        .then(() => {
          done()
        })
        .catch(() => {})
    },
  },
}
</script>

<style scoped>
.task-management-container {
  padding: 20px;
}

.task-header {
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
}

.tasks-section {
  margin-bottom: 20px;
}

.task-details {
  padding: 20px;
}

.task-actions {
  text-align: center;
}

.dialog-footer {
  text-align: right;
}

.strategy-preview,
.parameter-space-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.strategy-preview h4,
.parameter-space-preview h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.strategy-content,
.parameter-content {
  font-size: 14px;
  line-height: 1.5;
}

.strategy-content pre {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
}

.strategy-content p,
.parameter-content p {
  margin: 5px 0;
}

.strategy-content strong,
.parameter-content strong {
  color: #409eff;
}
</style>
