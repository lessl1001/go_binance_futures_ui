<template>
  <div class="app-container">
    <div class="strategy-editor-container">
      <!-- Header -->
      <div class="editor-header">
        <h3>{{ $t('aiOptimization.strategyEditor') }}</h3>
        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="createNewStrategy"
          >
            {{ $t('aiOptimization.customStrategy') }}
          </el-button>
          <el-button
            type="success"
            icon="el-icon-folder-opened"
            @click="loadTemplateDialog = true"
          >
            {{ $t('aiOptimization.loadTemplate') }}
          </el-button>
        </div>
      </div>

      <!-- Strategy Templates List -->
      <div class="templates-section">
        <h4>{{ $t('aiOptimization.strategyTemplate') }}</h4>
        <el-table
          v-loading="loading"
          :data="strategyTemplates"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            :label="$t('aiOptimization.strategyName')"
            width="200"
          />
          <el-table-column
            prop="description"
            :label="$t('aiOptimization.strategyDescription')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="created_at"
            :label="$t('table.date')"
            width="180"
          />
          <el-table-column
            :label="$t('table.actions')"
            width="280"
          >
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="editStrategy(scope.row)"
              >
                {{ $t('table.edit') }}
              </el-button>
              <el-button
                type="success"
                size="mini"
                @click="validateStrategy(scope.row)"
              >
                {{ $t('aiOptimization.validateExpression') }}
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="deleteStrategy(scope.row)"
              >
                {{ $t('table.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Strategy Editor Dialog -->
      <el-dialog
        :title="isEdit ? $t('table.edit') : $t('table.add')"
        :visible.sync="editorDialog"
        width="80%"
        :before-close="handleClose"
      >
        <el-form
          ref="strategyForm"
          :model="currentStrategy"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item :label="$t('aiOptimization.strategyName')" prop="name">
            <el-input v-model="currentStrategy.name" />
          </el-form-item>
          <el-form-item :label="$t('aiOptimization.strategyDescription')" prop="description">
            <el-input
              v-model="currentStrategy.description"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
          <el-form-item :label="$t('aiOptimization.strategyExpression')" prop="expression">
            <div class="code-editor">
              <codemirror
                v-model="currentStrategy.expression"
                :options="editorOptions"
                @input="onCodeChange"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="validateExpression">
              {{ $t('aiOptimization.validateExpression') }}
            </el-button>
            <el-button type="success" :loading="saving" @click="saveStrategy">
              {{ $t('aiOptimization.saveStrategy') }}
            </el-button>
            <el-button @click="editorDialog = false">
              {{ $t('table.cancel') }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Validation Results -->
        <div v-if="validationResult" class="validation-result">
          <h4>{{ $t('aiOptimization.validationError') }}</h4>
          <el-alert
            :title="validationResult.valid ? 'Valid' : 'Invalid'"
            :type="validationResult.valid ? 'success' : 'error'"
            :description="validationResult.message"
            :closable="false"
          />
        </div>
      </el-dialog>

      <!-- Load Template Dialog -->
      <el-dialog
        :title="$t('aiOptimization.loadTemplate')"
        :visible.sync="loadTemplateDialog"
        width="60%"
      >
        <el-table
          :data="predefinedTemplates"
          highlight-current-row
          @row-click="selectTemplate"
        >
          <el-table-column
            prop="name"
            :label="$t('aiOptimization.strategyName')"
            width="200"
          />
          <el-table-column
            prop="description"
            :label="$t('aiOptimization.strategyDescription')"
            show-overflow-tooltip
          />
          <el-table-column
            prop="category"
            :label="$t('table.type')"
            width="120"
          />
        </el-table>
        <div slot="footer" class="dialog-footer">
          <el-button @click="loadTemplateDialog = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" @click="loadSelectedTemplate">
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getStrategyTemplates, saveStrategyTemplate, updateStrategyTemplate, deleteStrategyTemplate, validateStrategyExpression } from '@/api/ai-optimization'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/javascript/javascript.js'

export default {
  name: 'StrategyEditor',
  components: {
    codemirror,
  },
  data() {
    return {
      loading: false,
      saving: false,
      strategyTemplates: [],
      currentStrategy: {
        name: '',
        description: '',
        expression: '',
      },
      editorDialog: false,
      loadTemplateDialog: false,
      isEdit: false,
      validationResult: null,
      selectedTemplate: null,
      editorOptions: {
        tabSize: 2,
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        line: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
      },
      rules: {
        name: [
          { required: true, message: 'Strategy name is required', trigger: 'blur' },
        ],
        expression: [
          { required: true, message: 'Strategy expression is required', trigger: 'blur' },
        ],
      },
      predefinedTemplates: [
        {
          name: 'Moving Average Crossover',
          description: 'Buy when fast MA crosses above slow MA, sell when crosses below',
          category: 'Trend Following',
          expression: `// Moving Average Crossover Strategy
function strategy(data, params) {
  const { fast_period, slow_period } = params;
  const close = data.close;
  
  // Calculate moving averages
  const fastMA = sma(close, fast_period);
  const slowMA = sma(close, slow_period);
  
  // Generate signals
  const signals = [];
  for (let i = 1; i < close.length; i++) {
    if (fastMA[i] > slowMA[i] && fastMA[i-1] <= slowMA[i-1]) {
      signals.push({index: i, action: 'buy'});
    } else if (fastMA[i] < slowMA[i] && fastMA[i-1] >= slowMA[i-1]) {
      signals.push({index: i, action: 'sell'});
    }
  }
  
  return signals;
}`,
        },
        {
          name: 'RSI Oversold/Overbought',
          description: 'Buy when RSI is oversold, sell when overbought',
          category: 'Mean Reversion',
          expression: `// RSI Strategy
function strategy(data, params) {
  const { rsi_period, oversold_threshold, overbought_threshold } = params;
  const close = data.close;
  
  // Calculate RSI
  const rsi = calculateRSI(close, rsi_period);
  
  // Generate signals
  const signals = [];
  for (let i = 1; i < close.length; i++) {
    if (rsi[i] < oversold_threshold && rsi[i-1] >= oversold_threshold) {
      signals.push({index: i, action: 'buy'});
    } else if (rsi[i] > overbought_threshold && rsi[i-1] <= overbought_threshold) {
      signals.push({index: i, action: 'sell'});
    }
  }
  
  return signals;
}`,
        },
        {
          name: 'Bollinger Bands',
          description: 'Buy when price touches lower band, sell when touches upper band',
          category: 'Mean Reversion',
          expression: `// Bollinger Bands Strategy
function strategy(data, params) {
  const { bb_period, bb_std_dev } = params;
  const close = data.close;
  
  // Calculate Bollinger Bands
  const { upper, middle, lower } = bollingerBands(close, bb_period, bb_std_dev);
  
  // Generate signals
  const signals = [];
  for (let i = 1; i < close.length; i++) {
    if (close[i] <= lower[i] && close[i-1] > lower[i-1]) {
      signals.push({index: i, action: 'buy'});
    } else if (close[i] >= upper[i] && close[i-1] < upper[i-1]) {
      signals.push({index: i, action: 'sell'});
    }
  }
  
  return signals;
}`,
        },
      ],
    }
  },
  created() {
    this.fetchStrategyTemplates()
  },
  methods: {
    async fetchStrategyTemplates() {
      this.loading = true
      try {
        const response = await getStrategyTemplates()
        this.strategyTemplates = response.data || []
      } catch (error) {
        this.$message.error('Failed to fetch strategy templates')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    createNewStrategy() {
      this.currentStrategy = {
        name: '',
        description: '',
        expression: '',
      }
      this.isEdit = false
      this.validationResult = null
      this.editorDialog = true
    },

    editStrategy(strategy) {
      this.currentStrategy = { ...strategy }
      this.isEdit = true
      this.validationResult = null
      this.editorDialog = true
    },

    async saveStrategy() {
      this.$refs.strategyForm.validate(async(valid) => {
        if (valid) {
          this.saving = true
          try {
            if (this.isEdit) {
              await updateStrategyTemplate(this.currentStrategy.id, this.currentStrategy)
            } else {
              await saveStrategyTemplate(this.currentStrategy)
            }
            this.$message.success(this.$t('aiOptimization.taskCreated'))
            this.editorDialog = false
            this.fetchStrategyTemplates()
          } catch (error) {
            this.$message.error(this.$t('aiOptimization.taskCreateError'))
            console.error(error)
          } finally {
            this.saving = false
          }
        }
      })
    },

    async deleteStrategy(strategy) {
      this.$confirm(this.$t('aiOptimization.confirmDeleteTask'), 'Warning', {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning',
      }).then(async() => {
        try {
          await deleteStrategyTemplate(strategy.id)
          this.$message.success('Strategy deleted successfully')
          this.fetchStrategyTemplates()
        } catch (error) {
          this.$message.error('Failed to delete strategy')
          console.error(error)
        }
      })
    },

    async validateExpression() {
      if (!this.currentStrategy.expression) {
        this.$message.warning('Please enter strategy expression')
        return
      }

      try {
        const response = await validateStrategyExpression({
          expression: this.currentStrategy.expression,
        })
        this.validationResult = response.data
      } catch (error) {
        this.validationResult = {
          valid: false,
          message: error.response?.data?.message || 'Validation failed',
        }
        console.error(error)
      }
    },

    async validateStrategy(strategy) {
      try {
        const response = await validateStrategyExpression({
          expression: strategy.expression,
        })
        this.$message.success(response.data.valid ? 'Strategy is valid' : 'Strategy is invalid')
      } catch (error) {
        this.$message.error('Validation failed')
        console.error(error)
      }
    },

    selectTemplate(template) {
      this.selectedTemplate = template
    },

    loadSelectedTemplate() {
      if (this.selectedTemplate) {
        this.currentStrategy = {
          name: this.selectedTemplate.name,
          description: this.selectedTemplate.description,
          expression: this.selectedTemplate.expression,
        }
        this.isEdit = false
        this.validationResult = null
        this.loadTemplateDialog = false
        this.editorDialog = true
      }
    },

    onCodeChange(code) {
      this.validationResult = null
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
.strategy-editor-container {
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

.templates-section {
  margin-bottom: 20px;
}

.templates-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.code-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.code-editor .CodeMirror {
  height: 400px;
}

.validation-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.validation-result h4 {
  margin-bottom: 10px;
  color: #303133;
}

.dialog-footer {
  text-align: right;
}
</style>
