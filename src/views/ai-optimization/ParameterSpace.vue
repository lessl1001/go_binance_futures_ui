<template>
  <div class="app-container">
    <div class="parameter-space-container">
      <!-- Header -->
      <div class="editor-header">
        <h3>{{ $t('aiOptimization.parameterSpace') }}</h3>
        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="createNewParameterSpace"
          >
            {{ $t('table.add') }}
          </el-button>
          <el-button
            type="success"
            icon="el-icon-refresh"
            :loading="loading"
            @click="fetchParameterSpaces"
          >
            {{ $t('table.refresh') }}
          </el-button>
        </div>
      </div>

      <!-- Parameter Spaces List -->
      <div class="parameter-spaces-section">
        <el-table
          v-loading="loading"
          :data="parameterSpaces"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            :label="$t('aiOptimization.parameterSpace')"
            width="200"
          />
          <el-table-column
            prop="description"
            :label="$t('aiOptimization.strategyDescription')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="enabled_count"
            label="启用参数数量"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag type="info">{{ getEnabledParametersCount(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="optimization_target"
            :label="$t('aiOptimization.optimizationTarget')"
            width="150"
          />
          <el-table-column
            prop="created_at"
            :label="$t('table.date')"
            width="180"
          />
          <el-table-column
            :label="$t('table.actions')"
            width="250"
          >
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="editParameterSpace(scope.row)"
              >
                {{ $t('table.edit') }}
              </el-button>
              <el-button
                type="success"
                size="mini"
                @click="viewParameters(scope.row)"
              >
                {{ $t('table.view') }}
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="deleteParameterSpace(scope.row)"
              >
                {{ $t('table.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Parameter Space Editor Dialog -->
      <el-dialog
        :title="isEdit ? $t('table.edit') : $t('table.add')"
        :visible.sync="editorDialog"
        width="95%"
        :before-close="handleClose"
        class="parameter-editor-dialog"
      >
        <el-form
          ref="parameterSpaceForm"
          :model="currentParameterSpace"
          :rules="rules"
          label-width="150px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('table.name')" prop="name">
                <el-input v-model="currentParameterSpace.name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('aiOptimization.optimizationTarget')" prop="optimization_target">
                <el-select v-model="currentParameterSpace.optimization_target" style="width: 100%">
                  <el-option label="Profit" value="profit" />
                  <el-option label="Sharpe Ratio" value="sharpe_ratio" />
                  <el-option label="Max Drawdown" value="max_drawdown" />
                  <el-option label="Win Rate" value="win_rate" />
                  <el-option label="Profit Factor" value="profit_factor" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item :label="$t('aiOptimization.strategyDescription')" prop="description">
            <el-input
              v-model="currentParameterSpace.description"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
        </el-form>

        <!-- Technical Indicators Configuration -->
        <div class="indicators-section">
          <h4>技术指标参数配置</h4>
          <p class="help-text">配置技术指标参数，只有启用的参数才能在策略中使用。参数名称必须在所有指标中保持唯一。</p>

          <el-tabs v-model="activeIndicator" @tab-click="handleIndicatorChange">
            <el-tab-pane
              v-for="(indicator, key) in technicalIndicators"
              :key="key"
              :label="indicator.label"
              :name="key"
            >
              <div class="indicator-config">
                <div class="section-header">
                  <h5>{{ indicator.label }} 参数配置</h5>
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-plus"
                    @click="addIndicatorParameter(key)"
                  >
                    添加 {{ indicator.label }}
                  </el-button>
                </div>

                <el-table
                  :data="getIndicatorParameters(key)"
                  size="small"
                  border
                  style="width: 100%"
                >
                  <el-table-column
                    v-for="field in indicator.fields"
                    :key="field.name"
                    :prop="field.name"
                    :label="field.label"
                    :width="getColumnWidth(field)"
                  >
                    <template slot-scope="scope">
                      <el-input
                        v-if="field.type === 'text'"
                        v-model="scope.row[field.name]"
                        :placeholder="field.placeholder"
                        size="mini"
                        @blur="validateParameterName(scope.row, field.name)"
                      />
                      <el-select
                        v-else-if="field.type === 'select'"
                        v-model="scope.row[field.name]"
                        size="mini"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="option in field.options"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>
                      <el-input-number
                        v-else-if="field.type === 'number'"
                        v-model="scope.row[field.name]"
                        :min="field.min"
                        :max="field.max"
                        :step="field.step || 1"
                        size="mini"
                        style="width: 100%"
                      />
                      <el-switch
                        v-else-if="field.type === 'switch'"
                        v-model="scope.row[field.name]"
                        size="mini"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80">
                    <template slot-scope="scope">
                      <el-button
                        type="danger"
                        size="mini"
                        icon="el-icon-delete"
                        @click="removeIndicatorParameter(key, scope.$index)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- Validation Messages -->
        <div v-if="validationErrors.length > 0" class="validation-errors">
          <h4>参数验证错误</h4>
          <el-alert
            v-for="(error, index) in validationErrors"
            :key="index"
            :title="error"
            type="error"
            :closable="false"
            style="margin-bottom: 5px"
          />
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editorDialog = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="info" @click="validateParameters">
            验证参数
          </el-button>
          <el-button type="primary" :loading="saving" @click="saveParameterSpace">
            {{ $t('table.save') }}
          </el-button>
        </div>
      </el-dialog>

      <!-- View Parameters Dialog -->
      <el-dialog
        title="参数详情"
        :visible.sync="viewDialog"
        width="80%"
      >
        <div class="parameter-details">
          <div v-for="(indicators, indicatorType) in viewingParametersByType" :key="indicatorType" class="indicator-group">
            <h4>{{ technicalIndicators[indicatorType]?.label || indicatorType }}</h4>
            <el-table
              :data="indicators"
              size="small"
              border
              style="width: 100%"
            >
              <el-table-column prop="name" label="名称" width="150" />
              <el-table-column prop="kline_type" label="K线类型" width="100" />
              <el-table-column prop="period" label="周期" width="80" />
              <el-table-column prop="multiplier" label="多元" width="80" />
              <el-table-column prop="bandwidth" label="带宽" width="80" />
              <el-table-column prop="fast_period" label="快线周期" width="80" />
              <el-table-column prop="slow_period" label="慢线周期" width="80" />
              <el-table-column prop="signal_period" label="信号线周期" width="80" />
              <el-table-column prop="enabled" label="启用" width="80">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.enabled ? 'success' : 'info'">
                    {{ scope.row.enabled ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getParameterSpaces, saveParameterSpace, updateParameterSpace, deleteParameterSpace } from '@/api/ai-optimization'
import {
  technicalIndicators,
  klineIntervals,
  defaultParameterSpace,
  createNewParameter,
  validateParameterSpace,
  convertToBackendFormat,
  convertFromBackendFormat,
} from '@/utils/backend-parameter-space'

export default {
  name: 'ParameterSpace',
  data() {
    return {
      loading: false,
      saving: false,
      parameterSpaces: [],
      currentParameterSpace: { ...defaultParameterSpace },
      editorDialog: false,
      viewDialog: false,
      isEdit: false,
      activeIndicator: 'ma',
      validationErrors: [],
      viewingParametersByType: {},
      technicalIndicators,
      klineIntervals,
      rules: {
        name: [
          { required: true, message: 'Parameter space name is required', trigger: 'blur' },
        ],
        optimization_target: [
          { required: true, message: 'Optimization target is required', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.fetchParameterSpaces()
  },
  methods: {
    async fetchParameterSpaces() {
      this.loading = true
      try {
        const response = await getParameterSpaces()
        this.parameterSpaces = Array.isArray(response.data?.parameter_spaces)
          ? response.data.parameter_spaces.map(ps => convertFromBackendFormat(ps))
          : Array.isArray(response.data)
            ? response.data.map(ps => convertFromBackendFormat(ps))
            : []
      } catch (error) {
        this.parameterSpaces = []
        this.$message.error('Failed to fetch parameter spaces')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    createNewParameterSpace() {
      this.currentParameterSpace = { ...defaultParameterSpace }
      this.isEdit = false
      this.validationErrors = []
      this.editorDialog = true
    },

    editParameterSpace(parameterSpace) {
      this.currentParameterSpace = JSON.parse(JSON.stringify(parameterSpace))
      this.isEdit = true
      this.validationErrors = []
      this.editorDialog = true
    },

    async saveParameterSpace() {
      this.$refs.parameterSpaceForm.validate(async(valid) => {
        if (valid) {
          // Validate parameters first
          const errors = validateParameterSpace(this.currentParameterSpace)
          if (errors.length > 0) {
            this.validationErrors = errors
            this.$message.error('请先修复参数验证错误')
            return
          }

          this.saving = true
          try {
            const backendData = convertToBackendFormat(this.currentParameterSpace)

            if (this.isEdit) {
              await updateParameterSpace(this.currentParameterSpace.id, backendData)
            } else {
              await saveParameterSpace(backendData)
            }

            this.$message.success('参数空间保存成功')
            this.editorDialog = false
            this.fetchParameterSpaces()
          } catch (error) {
            this.$message.error('保存参数空间失败')
            console.error(error)
          } finally {
            this.saving = false
          }
        }
      })
    },

    async deleteParameterSpace(parameterSpace) {
      this.$confirm('确定要删除这个参数空间吗？', 'Warning', {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning',
      }).then(async() => {
        try {
          await deleteParameterSpace(parameterSpace.id)
          this.$message.success('参数空间删除成功')
          this.fetchParameterSpaces()
        } catch (error) {
          this.$message.error('删除参数空间失败')
          console.error(error)
        }
      })
    },

    viewParameters(parameterSpace) {
      this.viewingParametersByType = {}

      // Group parameters by indicator type
      Object.keys(this.technicalIndicators).forEach(indicatorType => {
        const parameters = parameterSpace[`${indicatorType}_parameters`] || []
        if (parameters.length > 0) {
          this.viewingParametersByType[indicatorType] = parameters
        }
      })

      this.viewDialog = true
    },

    handleIndicatorChange(tab) {
      this.activeIndicator = tab.name
    },

    addIndicatorParameter(indicatorType) {
      const newParameter = createNewParameter(indicatorType)
      if (newParameter) {
        if (!this.currentParameterSpace[`${indicatorType}_parameters`]) {
          this.currentParameterSpace[`${indicatorType}_parameters`] = []
        }
        this.currentParameterSpace[`${indicatorType}_parameters`].push(newParameter)
      }
    },

    removeIndicatorParameter(indicatorType, index) {
      this.currentParameterSpace[`${indicatorType}_parameters`].splice(index, 1)
    },

    validateParameters() {
      const errors = validateParameterSpace(this.currentParameterSpace)
      this.validationErrors = errors

      if (errors.length === 0) {
        this.$message.success('参数验证通过')
      } else {
        this.$message.error('参数验证失败，请检查错误信息')
      }
    },

    validateParameterName(parameter, fieldName) {
      if (fieldName === 'name' && parameter.name) {
        // Check for duplicate names
        const allNames = []
        Object.keys(this.technicalIndicators).forEach(indicatorType => {
          const parameters = this.currentParameterSpace[`${indicatorType}_parameters`] || []
          parameters.forEach(param => {
            if (param.name && param !== parameter) {
              allNames.push(param.name)
            }
          })
        })

        if (allNames.includes(parameter.name)) {
          this.$message.warning(`参数名称 "${parameter.name}" 已存在，请使用唯一的名称`)
        }
      }
    },

    getIndicatorParameters(indicatorType) {
      return this.currentParameterSpace[`${indicatorType}_parameters`] || []
    },

    getColumnWidth(field) {
      switch (field.type) {
        case 'text':
          return field.name === 'name' ? '150px' : '120px'
        case 'select':
          return '120px'
        case 'number':
          return '100px'
        case 'switch':
          return '80px'
        default:
          return '120px'
      }
    },

    getEnabledParametersCount(parameterSpace) {
      let count = 0
      Object.keys(this.technicalIndicators).forEach(indicatorType => {
        const parameters = parameterSpace[`${indicatorType}_parameters`] || []
        count += parameters.filter(param => param.enabled).length
      })
      return count
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
.parameter-space-container {
  padding: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.parameter-spaces-section {
  margin-bottom: 20px;
}

.parameter-editor-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}

.indicators-section {
  margin-top: 20px;
}

.indicators-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.help-text {
  color: #909399;
  font-size: 13px;
  margin-bottom: 15px;
}

.indicator-config {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h5 {
  margin: 0;
  color: #606266;
}

.validation-errors {
  margin-top: 20px;
  padding: 15px;
  background-color: #fef0f0;
  border-radius: 4px;
}

.validation-errors h4 {
  margin-bottom: 10px;
  color: #f56c6c;
}

.parameter-details {
  max-height: 60vh;
  overflow-y: auto;
}

.indicator-group {
  margin-bottom: 20px;
}

.indicator-group h4 {
  margin-bottom: 10px;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 5px;
}

.dialog-footer {
  text-align: right;
}
</style>
