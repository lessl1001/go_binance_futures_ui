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
            prop="parameter_count"
            :label="'Parameters'"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag type="info">{{ scope.row.parameters ? scope.row.parameters.length : 0 }}</el-tag>
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
        width="90%"
        :before-close="handleClose"
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

        <!-- Parameters Section -->
        <div class="parameters-section">
          <div class="section-header">
            <h4>{{ $t('aiOptimization.parameterRange') }}</h4>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="addParameter"
            >
              {{ $t('aiOptimization.addParameter') }}
            </el-button>
          </div>

          <el-table
            :data="currentParameterSpace.parameters || []"
            border
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              :label="$t('aiOptimization.parameterName')"
              width="150"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.name"
                  size="mini"
                  placeholder="Parameter name"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              :label="$t('aiOptimization.parameterType')"
              width="120"
            >
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.type"
                  size="mini"
                  style="width: 100%"
                >
                  <el-option label="Integer" value="int" />
                  <el-option label="Float" value="float" />
                  <el-option label="Boolean" value="bool" />
                  <el-option label="Choice" value="choice" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="min_value"
              :label="$t('aiOptimization.minValue')"
              width="100"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.min_value"
                  size="mini"
                  type="number"
                  :disabled="scope.row.type === 'bool'"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="max_value"
              :label="$t('aiOptimization.maxValue')"
              width="100"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.max_value"
                  size="mini"
                  type="number"
                  :disabled="scope.row.type === 'bool'"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="step_size"
              :label="$t('aiOptimization.stepSize')"
              width="100"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.step_size"
                  size="mini"
                  type="number"
                  :disabled="scope.row.type === 'bool' || scope.row.type === 'choice'"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="default_value"
              :label="$t('aiOptimization.defaultValue')"
              width="120"
            >
              <template slot-scope="scope">
                <el-input
                  v-if="scope.row.type !== 'bool' && scope.row.type !== 'choice'"
                  v-model="scope.row.default_value"
                  size="mini"
                  type="number"
                />
                <el-select
                  v-else-if="scope.row.type === 'bool'"
                  v-model="scope.row.default_value"
                  size="mini"
                  style="width: 100%"
                >
                  <el-option label="True" :value="true" />
                  <el-option label="False" :value="false" />
                </el-select>
                <el-input
                  v-else
                  v-model="scope.row.default_value"
                  size="mini"
                  placeholder="choices,separated,by,comma"
                />
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('table.actions')"
              width="100"
            >
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParameter(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editorDialog = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="saving" @click="saveParameterSpace">
            {{ $t('table.save') }}
          </el-button>
        </div>
      </el-dialog>

      <!-- View Parameters Dialog -->
      <el-dialog
        :title="$t('aiOptimization.parameterRange')"
        :visible.sync="viewDialog"
        width="80%"
      >
        <el-table
          :data="viewingParameters"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            :label="$t('aiOptimization.parameterName')"
            width="150"
          />
          <el-table-column
            prop="type"
            :label="$t('aiOptimization.parameterType')"
            width="120"
          />
          <el-table-column
            prop="min_value"
            :label="$t('aiOptimization.minValue')"
            width="100"
          />
          <el-table-column
            prop="max_value"
            :label="$t('aiOptimization.maxValue')"
            width="100"
          />
          <el-table-column
            prop="step_size"
            :label="$t('aiOptimization.stepSize')"
            width="100"
          />
          <el-table-column
            prop="default_value"
            :label="$t('aiOptimization.defaultValue')"
            width="120"
          />
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getParameterSpaces, saveParameterSpace, updateParameterSpace, deleteParameterSpace } from '@/api/ai-optimization'

export default {
  name: 'ParameterSpace',
  data() {
    return {
      loading: false,
      saving: false,
      parameterSpaces: [],
      currentParameterSpace: {
        name: '',
        description: '',
        optimization_target: 'profit',
        parameters: [],
      },
      viewingParameters: [],
      editorDialog: false,
      viewDialog: false,
      isEdit: false,
      rules: {
        name: [
          { required: true, message: 'Parameter space name is required', trigger: 'blur' },
        ],
        optimization_target: [
          { required: true, message: 'Optimization target is required', trigger: 'change' },
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
        // 兼容后端返回的数组字段，保证表格数据为数组
        this.parameterSpaces = Array.isArray(response.data?.parameter_spaces)
          ? response.data.parameter_spaces
          : Array.isArray(response.data)
            ? response.data
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
      this.currentParameterSpace = {
        name: '',
        description: '',
        optimization_target: 'profit',
        parameters: [],
      }
      this.isEdit = false
      this.editorDialog = true
    },

    editParameterSpace(parameterSpace) {
      this.currentParameterSpace = JSON.parse(JSON.stringify(parameterSpace))
      this.isEdit = true
      this.editorDialog = true
    },

    viewParameters(parameterSpace) {
      this.viewingParameters = parameterSpace.parameters || []
      this.viewDialog = true
    },

    async saveParameterSpace() {
      this.$refs.parameterSpaceForm.validate(async(valid) => {
        if (valid) {
          this.saving = true
          try {
            if (this.isEdit) {
              await updateParameterSpace(this.currentParameterSpace.id, this.currentParameterSpace)
            } else {
              await saveParameterSpace(this.currentParameterSpace)
            }
            this.$message.success('Parameter space saved successfully')
            this.editorDialog = false
            this.fetchParameterSpaces()
          } catch (error) {
            this.$message.error('Failed to save parameter space')
            console.error(error)
          } finally {
            this.saving = false
          }
        }
      })
    },

    async deleteParameterSpace(parameterSpace) {
      this.$confirm('Are you sure you want to delete this parameter space?', 'Warning', {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning',
      }).then(async() => {
        try {
          await deleteParameterSpace(parameterSpace.id)
          this.$message.success('Parameter space deleted successfully')
          this.fetchParameterSpaces()
        } catch (error) {
          this.$message.error('Failed to delete parameter space')
          console.error(error)
        }
      })
    },

    addParameter() {
      if (!this.currentParameterSpace.parameters) {
        this.currentParameterSpace.parameters = []
      }
      this.currentParameterSpace.parameters.push({
        name: '',
        type: 'int',
        min_value: 0,
        max_value: 100,
        step_size: 1,
        default_value: 50,
      })
    },

    removeParameter(index) {
      this.currentParameterSpace.parameters.splice(index, 1)
    },

    handleClose(done) {
      this.$confirm('Are you sure you want to close?')
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

.parameters-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #303133;
}

.dialog-footer {
  text-align: right;
}
</style>
