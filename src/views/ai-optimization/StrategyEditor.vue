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
            <div class="editor-container">
              <div class="editor-toolbar">
                <el-button size="mini" @click="showHelpDialog = true">
                  {{ $t('aiOptimization.helpDoc') }}
                </el-button>
                <el-button size="mini" @click="insertVariable">
                  {{ $t('aiOptimization.insertVariable') }}
                </el-button>
                <el-button size="mini" @click="insertFunction">
                  {{ $t('aiOptimization.insertFunction') }}
                </el-button>
              </div>
              <div class="code-editor">
                <codemirror
                  v-model="currentStrategy.expression"
                  :options="editorOptions"
                  @input="onCodeChange"
                  @keydown="onKeyDown"
                />
              </div>
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
        width="70%"
      >
        <div class="template-categories">
          <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
            <el-tab-pane label="做多策略" name="Long">
              <el-table
                :data="filteredTemplates"
                highlight-current-row
                @row-click="selectTemplate"
                style="width: 100%"
              >
                <el-table-column prop="name" label="策略名称" width="200" />
                <el-table-column prop="description" label="策略描述" show-overflow-tooltip />
                <el-table-column prop="expression" label="策略表达式" width="250" show-overflow-tooltip />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="做空策略" name="Short">
              <el-table
                :data="filteredTemplates"
                highlight-current-row
                @row-click="selectTemplate"
                style="width: 100%"
              >
                <el-table-column prop="name" label="策略名称" width="200" />
                <el-table-column prop="description" label="策略描述" show-overflow-tooltip />
                <el-table-column prop="expression" label="策略表达式" width="250" show-overflow-tooltip />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="平多策略" name="Close Long">
              <el-table
                :data="filteredTemplates"
                highlight-current-row
                @row-click="selectTemplate"
                style="width: 100%"
              >
                <el-table-column prop="name" label="策略名称" width="200" />
                <el-table-column prop="description" label="策略描述" show-overflow-tooltip />
                <el-table-column prop="expression" label="策略表达式" width="250" show-overflow-tooltip />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="平空策略" name="Close Short">
              <el-table
                :data="filteredTemplates"
                highlight-current-row
                @row-click="selectTemplate"
                style="width: 100%"
              >
                <el-table-column prop="name" label="策略名称" width="200" />
                <el-table-column prop="description" label="策略描述" show-overflow-tooltip />
                <el-table-column prop="expression" label="策略表达式" width="250" show-overflow-tooltip />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="loadTemplateDialog = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" @click="loadSelectedTemplate">
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>

      <!-- Help Documentation Dialog -->
      <el-dialog
        title="策略编写帮助文档"
        :visible.sync="showHelpDialog"
        width="80%"
        class="help-dialog"
      >
        <div class="help-content">
          <el-tabs v-model="activeHelpTab">
            <el-tab-pane label="内置变量" name="variables">
              <div class="help-section">
                <h4>系统内置变量</h4>
                <el-table :data="systemVariables" size="small">
                  <el-table-column prop="name" label="变量名" width="200" />
                  <el-table-column prop="type" label="类型" width="100" />
                  <el-table-column prop="description" label="描述" show-overflow-tooltip />
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="内置函数" name="functions">
              <div class="help-section">
                <h4>系统内置函数</h4>
                <el-table :data="systemFunctions" size="small">
                  <el-table-column prop="name" label="函数名" width="120" />
                  <el-table-column prop="signature" label="签名" width="300" />
                  <el-table-column prop="description" label="描述" show-overflow-tooltip />
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="技术指标" name="indicators">
              <div class="help-section">
                <h4>技术指标使用说明</h4>
                <div class="indicator-help">
                  <h5>EMA指标示例</h5>
                  <pre><code>// 假设参数空间中定义了ema_4h_3和ema_4h_7
ema_4h_3.Data[0] // 当前时刻的EMA值
ema_4h_3.Data[1] // 前一时刻的EMA值
ema_4h_3.KlineInterval // K线周期 "4h"
ema_4h_3.Period // 周期参数 3</code></pre>
                  
                  <h5>MACD指标示例</h5>
                  <pre><code>// 假设参数空间中定义了macd_4h_12_26_9
macd_4h_12_26_9.MACD[0] // 当前时刻的MACD值
macd_4h_12_26_9.Signal[0] // 当前时刻的信号线值
macd_4h_12_26_9.Histogram[0] // 当前时刻的柱状图值</code></pre>
                  
                  <h5>K线数据示例</h5>
                  <pre><code>// 当定义了任意4h周期指标时，会自动生成kline_4h
kline_4h.Close[0] // 当前收盘价
kline_4h.High[0] // 当前最高价
kline_4h.Low[0] // 当前最低价
kline_4h.Amount[0] // 当前成交额</code></pre>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="策略示例" name="examples">
              <div class="help-section">
                <h4>策略表达式示例</h4>
                <div class="example-code">
                  <h5>简单EMA金叉策略</h5>
                  <pre><code>ema_4h_3.Data[0] > ema_4h_7.Data[0] && ema_4h_3.Data[1] < ema_4h_7.Data[1]</code></pre>
                  
                  <h5>RSI超卖策略</h5>
                  <pre><code>rsi_1h_14.Data[0] < 30 && rsi_1h_14.Data[1] >= 30</code></pre>
                  
                  <h5>多条件组合策略</h5>
                  <pre><code>ema_4h_3.Data[0] > ema_4h_7.Data[0] && 
rsi_1h_14.Data[0] > 40 && rsi_1h_14.Data[0] < 60 && 
BasicTrend > 0 && 
BTCUSDT.PercentChange > 0</code></pre>
                  
                  <h5>止盈止损策略</h5>
                  <pre><code>// 止盈
Position.Side == "LONG" && ORI > 5.0

// 止损
Position.Side == "LONG" && ORI < -3.0</code></pre>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
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
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/anyword-hint.js'
import { backendStrategyTemplates, backendVariables, backendFunctions } from '@/utils/backend-strategy-templates'

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
      showHelpDialog: false,
      activeCategory: 'Long',
      activeHelpTab: 'variables',
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
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          'Tab': 'autocomplete',
        },
        hintOptions: {
          completeSingle: false,
          hint: this.getHints,
        },
      },
      rules: {
        name: [
          { required: true, message: 'Strategy name is required', trigger: 'blur' },
        ],
        expression: [
          { required: true, message: 'Strategy expression is required', trigger: 'blur' },
        ],
      },
      systemVariables: backendVariables,
      systemFunctions: backendFunctions,
    }
  },
  computed: {
    filteredTemplates() {
      return backendStrategyTemplates.filter(template => template.category === this.activeCategory)
    },
    predefinedTemplates() {
      return backendStrategyTemplates
    },
  },
  created() {
    this.fetchStrategyTemplates()
  },
  methods: {
    async fetchStrategyTemplates() {
      this.loading = true
      try {
        const response = await getStrategyTemplates()
        // 兼容后端返回字段为数组或对象
        this.strategyTemplates = Array.isArray(response.data?.strategy_templates)
          ? response.data.strategy_templates
          : Array.isArray(response.data)
            ? response.data
            : []
      } catch (error) {
        this.strategyTemplates = []
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

    handleCategoryChange(tab) {
      this.activeCategory = tab.name
    },

    getHints(cm, option) {
      const cursor = cm.getCursor()
      const line = cm.getLine(cursor.line)
      const start = cursor.ch
      const end = cursor.ch
      
      // Get current word being typed
      const wordStart = line.substring(0, start).match(/\w*$/)
      const wordEnd = line.substring(end).match(/^\w*/)
      const word = (wordStart ? wordStart[0] : '') + (wordEnd ? wordEnd[0] : '')
      
      // Filter suggestions based on current word
      const suggestions = []
      
      // Add variables
      this.systemVariables.forEach(variable => {
        if (variable.name.toLowerCase().includes(word.toLowerCase())) {
          suggestions.push({
            text: variable.name,
            displayText: `${variable.name} (${variable.type})`,
            hint: variable.description,
          })
        }
      })
      
      // Add functions
      this.systemFunctions.forEach(func => {
        if (func.name.toLowerCase().includes(word.toLowerCase())) {
          suggestions.push({
            text: func.signature,
            displayText: func.signature,
            hint: func.description,
          })
        }
      })
      
      // Add common patterns
      const patterns = [
        'Data[0]', 'Data[1]', 'MACD[0]', 'Signal[0]', 'Histogram[0]',
        'High[0]', 'Low[0]', 'Mid[0]', 'Close[0]', 'Open[0]', 'Amount[0]',
        'PercentChange', 'Position.Side', 'Position.Amount', 'ORI',
        'BasicTrend', 'NowPrice', 'NowTime'
      ]
      
      patterns.forEach(pattern => {
        if (pattern.toLowerCase().includes(word.toLowerCase())) {
          suggestions.push({
            text: pattern,
            displayText: pattern,
          })
        }
      })
      
      return {
        list: suggestions,
        from: { line: cursor.line, ch: start - (wordStart ? wordStart[0].length : 0) },
        to: { line: cursor.line, ch: end + (wordEnd ? wordEnd[0].length : 0) },
      }
    },

    onKeyDown(cm, event) {
      // Trigger autocompletion on Ctrl+Space or Tab
      if ((event.ctrlKey && event.key === ' ') || event.key === 'Tab') {
        cm.showHint()
        event.preventDefault()
      }
    },

    insertVariable() {
      this.$prompt('请输入变量名称', '插入变量', {
        inputType: 'text',
        inputPlaceholder: '例如: ema_4h_3.Data[0]',
      }).then(({ value }) => {
        if (value) {
          this.currentStrategy.expression += value
        }
      })
    },

    insertFunction() {
      this.$prompt('请输入函数调用', '插入函数', {
        inputType: 'text',
        inputPlaceholder: '例如: IsAsc(ema_4h_3.Data)',
      }).then(({ value }) => {
        if (value) {
          this.currentStrategy.expression += value
        }
      })
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

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  gap: 8px;
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

.help-dialog .el-dialog__body {
  padding: 10px 20px;
}

.help-content {
  max-height: 600px;
  overflow-y: auto;
}

.help-section {
  margin-bottom: 20px;
}

.help-section h4 {
  margin-bottom: 10px;
  color: #303133;
  font-weight: bold;
}

.help-section h5 {
  margin: 15px 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.indicator-help pre,
.example-code pre {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
  margin: 8px 0;
  font-size: 12px;
  line-height: 1.5;
}

.indicator-help code,
.example-code code {
  color: #e83e8c;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.template-categories {
  margin-bottom: 20px;
}

.template-categories .el-table {
  margin-top: 10px;
}
</style>
