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
            Create Task
          </el-button>
          <el-button
            type="success"
            icon="el-icon-refresh"
            :loading="loading"
            @click="fetchTasks"
          >
            Refresh
          </el-button>
        </div>
      </div>

      <!-- Task Status Filter -->
      <div class="filter-section">
        <el-radio-group v-model="statusFilter" @change="fetchTasks">
          <el-radio-button label="">All</el-radio-button>
          <el-radio-button label="pending">Pending</el-radio-button>
          <el-radio-button label="running">Running</el-radio-button>
          <el-radio-button label="paused">Paused</el-radio-button>
          <el-radio-button label="completed">Completed</el-radio-button>
          <el-radio-button label="failed">Failed</el-radio-button>
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
            label="Task Name"
            width="200"
          />
          <el-table-column
            prop="status"
            label="Status"
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
            label="Progress"
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
            label="Strategy"
            width="150"
          />
          <el-table-column
            prop="parameter_space_name"
            label="Parameter Space"
            width="150"
          />
          <el-table-column
            prop="elapsed_time"
            label="Elapsed Time"
            width="120"
          />
          <el-table-column
            prop="created_at"
            label="Created At"
            width="180"
          />
          <el-table-column
            label="Actions"
            width="300"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.status === 'pending'"
                type="success"
                size="mini"
                @click="startTask(scope.row)"
              >
                Start
              </el-button>
              <el-button
                v-if="scope.row.status === 'running'"
                type="warning"
                size="mini"
                @click="pauseTask(scope.row)"
              >
                Pause
              </el-button>
              <el-button
                v-if="scope.row.status === 'paused'"
                type="success"
                size="mini"
                @click="resumeTask(scope.row)"
              >
                Resume
              </el-button>
              <el-button
                v-if="['running', 'paused'].includes(scope.row.status)"
                type="danger"
                size="mini"
                @click="stopTask(scope.row)"
              >
                Stop
              </el-button>
              <el-button
                type="primary"
                size="mini"
                @click="viewTask(scope.row)"
              >
                View
              </el-button>
              <el-button
                type="danger"
                size="mini"
                :disabled="scope.row.status === 'running'"
                @click="deleteTask(scope.row)"
              >
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Create Task Dialog -->
      <el-dialog
        title="Create Task"
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
              <el-form-item label="Task Name" prop="name">
                <el-input v-model="newTask.name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Symbol" prop="symbol">
                <el-select v-model="newTask.symbol" style="width: 100%">
                  <el-option label="BTCUSDT" value="BTCUSDT" />
                  <el-option label="ETHUSDT" value="ETHUSDT" />
                  <el-option label="BNBUSDT" value="BNBUSDT" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Timeframe" prop="timeframe">
                <el-select v-model="newTask.timeframe" style="width: 100%">
                  <el-option label="1 Hour" value="1h" />
                  <el-option label="4 Hours" value="4h" />
                  <el-option label="1 Day" value="1d" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Initial Capital" prop="initial_capital">
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

          <el-form-item label="Description" prop="description">
            <el-input
              v-model="newTask.description"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="createTaskDialog = false">
            Cancel
          </el-button>
          <el-button type="primary" :loading="saving" @click="saveTask">
            Create Task
          </el-button>
        </div>
      </el-dialog>

      <!-- Task Details Dialog -->
      <el-dialog
        title="Task Details"
        :visible.sync="viewTaskDialog"
        width="80%"
      >
        <div v-if="selectedTask" class="task-details">
          <el-descriptions title="Task Information" :column="2" border>
            <el-descriptions-item label="Task Name">
              {{ selectedTask.name }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-tag :type="getStatusType(selectedTask.status)">
                {{ getStatusLabel(selectedTask.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Progress">
              <el-progress :percentage="selectedTask.progress || 0" />
            </el-descriptions-item>
            <el-descriptions-item label="Elapsed Time">
              {{ selectedTask.elapsed_time || '00:00:00' }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="task-actions" style="margin-top: 20px;">
            <el-button
              v-if="selectedTask.status === 'running'"
              type="primary"
              @click="goToOptimizationMonitor(selectedTask.id)"
            >
              Optimization Monitor
            </el-button>
            <el-button
              v-if="selectedTask.status === 'completed'"
              type="success"
              @click="goToLiveDeployment(selectedTask.id)"
            >
              Live Deployment
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
  getOptimizationTask
} from '@/api/ai-optimization'

export default {
  name: 'TaskManagement',
  data() {
    return {
      loading: false,
      saving: false,
      tasks: [],
      statusFilter: '',
      createTaskDialog: false,
      viewTaskDialog: false,
      selectedTask: null,
      newTask: {
        name: '',
        symbol: 'BTCUSDT',
        timeframe: '1h',
        initial_capital: 10000,
        description: ''
      },
      taskRules: {
        name: [
          { required: true, message: 'Task name is required', trigger: 'blur' }
        ],
        symbol: [
          { required: true, message: 'Symbol is required', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchTasks()
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
        this.tasks = Array.isArray(response.data?.tasks)
          ? response.data.tasks
          : Array.isArray(response.data)
            ? response.data
            : []
      } catch (error) {
        this.tasks = []
        this.$message.error('Failed to fetch tasks')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    createNewTask() {
      this.newTask = {
        name: '',
        symbol: 'BTCUSDT',
        timeframe: '1h',
        initial_capital: 10000,
        description: ''
      }
      this.createTaskDialog = true
    },

    async saveTask() {
      this.$refs.taskForm.validate(async(valid) => {
        if (valid) {
          this.saving = true
          try {
            await createOptimizationTask(this.newTask)
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
      this.$confirm('Are you sure you want to stop this task?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
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
      this.$confirm('Are you sure you want to delete this task?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
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
        this.selectedTask = response.data
        this.viewTaskDialog = true
      } catch (error) {
        this.$message.error('Failed to fetch task details')
        console.error(error)
      }
    },

    getStatusType(status) {
      const typeMap = {
        'pending': 'info',
        'running': 'success',
        'paused': 'warning',
        'completed': 'success',
        'failed': 'danger',
        'cancelled': 'info'
      }
      return typeMap[status] || 'info'
    },

    getStatusLabel(status) {
      const labelMap = {
        'pending': 'Pending',
        'running': 'Running',
        'paused': 'Paused',
        'completed': 'Completed',
        'failed': 'Failed',
        'cancelled': 'Cancelled'
      }
      return labelMap[status] || status
    },

    goToOptimizationMonitor(taskId) {
      this.$router.push(`/ai-optimization/optimization-monitor?taskId=${taskId}`)
    },

    goToLiveDeployment(taskId) {
      this.$router.push(`/ai-optimization/live-deployment?taskId=${taskId}`)
    },

    handleClose(done) {
      this.$confirm('Are you sure you want to close? Unsaved changes will be lost.')
        .then(() => {
          done()
        })
        .catch(() => {})
    }
  }
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
</style>