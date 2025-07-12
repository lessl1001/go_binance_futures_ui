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
            width="200"
            fixed="right"
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
        width="60%"
        @close="resetForm"
      >
        <el-form
          ref="strategyForm"
          :model="currentStrategy"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item :label="$t('aiOptimization.strategyName')" prop="name">
            <el-input
              v-model="currentStrategy.name"
              :placeholder="$t('aiOptimization.strategyName')"
            />
          </el-form-item>
          <el-form-item :label="$t('aiOptimization.strategyDescription')" prop="description">
            <el-input
              v-model="currentStrategy.description"
              type="textarea"
              :rows="2"
              :placeholder="$t('aiOptimization.strategyDescription')"
            />
          </el-form-item>
          <el-form-item :label="$t('aiOptimization.strategyExpression')" prop="expression">
            <el-input
              v-model="currentStrategy.expression"
              type="textarea"
              :rows="4"
              :placeholder="$t('aiOptimization.strategyExpression')"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editorDialog = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button
            type="primary"
            :loading="saving"
            @click="saveStrategy"
          >
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>

      <!-- Load Template Dialog -->
      <el-dialog
        :title="$t('aiOptimization.loadTemplate')"
        :visible.sync="loadTemplateDialog"
        width="50%"
      >
        <div class="template-categories">
          <el-tabs v-model="activeCategory">
            <el-tab-pane label="Long" name="Long">
              <el-table
                :data="filteredTemplates"
                @row-click="selectTemplate"
              >
                <el-table-column prop="name" label="Template Name" />
                <el-table-column prop="description" label="Description" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="Short" name="Short">
              <el-table
                :data="filteredTemplates"
                @row-click="selectTemplate"
              >
                <el-table-column prop="name" label="Template Name" />
                <el-table-column prop="description" label="Description" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="Close Long" name="CloseLong">
              <el-table
                :data="filteredTemplates"
                @row-click="selectTemplate"
              >
                <el-table-column prop="name" label="Template Name" />
                <el-table-column prop="description" label="Description" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="Close Short" name="CloseShort">
              <el-table
                :data="filteredTemplates"
                @row-click="selectTemplate"
              >
                <el-table-column prop="name" label="Template Name" />
                <el-table-column prop="description" label="Description" />
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
    </div>
  </div>
</template>

<script>
import { getStrategyTemplates, saveStrategyTemplate, updateStrategyTemplate, deleteStrategyTemplate } from '@/api/ai-optimization'

export default {
  name: 'StrategyEditor',
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
      activeCategory: 'Long',
      isEdit: false,
      selectedTemplate: null,
      rules: {
        name: [
          { required: true, message: 'Strategy name is required', trigger: 'blur' },
        ],
        expression: [
          { required: true, message: 'Strategy expression is required', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    filteredTemplates() {
      // Simplified template approach - basic templates for core functionality
      const simpleTemplates = [
        {
          name: 'EMA Cross Long',
          category: 'Long',
          description: 'EMA golden cross strategy for long positions',
          expression: 'ema_4h_3.Data[0] > ema_4h_7.Data[0] && ema_4h_3.Data[1] < ema_4h_7.Data[1]',
        },
        {
          name: 'RSI Oversold',
          category: 'Long',
          description: 'RSI oversold strategy for long positions',
          expression: 'rsi_1h_14.Data[0] < 30 && rsi_1h_14.Data[1] >= 30',
        },
        {
          name: 'EMA Cross Short',
          category: 'Short',
          description: 'EMA death cross strategy for short positions',
          expression: 'ema_4h_3.Data[0] < ema_4h_7.Data[0] && ema_4h_3.Data[1] > ema_4h_7.Data[1]',
        },
        {
          name: 'RSI Overbought',
          category: 'Short',
          description: 'RSI overbought strategy for short positions',
          expression: 'rsi_1h_14.Data[0] > 70 && rsi_1h_14.Data[1] <= 70',
        },
        {
          name: 'Close Long Position',
          category: 'CloseLong',
          description: 'Close long position strategy',
          expression: 'Position.Side == "LONG" && ORI > 5.0',
        },
        {
          name: 'Close Short Position',
          category: 'CloseShort',
          description: 'Close short position strategy',
          expression: 'Position.Side == "SHORT" && ORI < -5.0',
        },
      ]
      return simpleTemplates.filter(template => template.category === this.activeCategory)
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
    async saveStrategy() {
      this.$refs.strategyForm.validate(async (valid) => {
        if (valid) {
          this.saving = true
          try {
            if (this.isEdit) {
              await updateStrategyTemplate(this.currentStrategy.id, this.currentStrategy)
              this.$message.success('Strategy updated successfully')
            } else {
              await saveStrategyTemplate(this.currentStrategy)
              this.$message.success('Strategy saved successfully')
            }
            this.editorDialog = false
            this.fetchStrategyTemplates()
          } catch (error) {
            this.$message.error('Failed to save strategy')
            console.error(error)
          } finally {
            this.saving = false
          }
        }
      })
    },
    async deleteStrategy(strategy) {
      this.$confirm('Are you sure you want to delete this strategy?', 'Warning', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }).then(async () => {
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
    createNewStrategy() {
      this.isEdit = false
      this.currentStrategy = {
        name: '',
        description: '',
        expression: '',
      }
      this.editorDialog = true
    },
    editStrategy(strategy) {
      this.isEdit = true
      this.currentStrategy = { ...strategy }
      this.editorDialog = true
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
        this.loadTemplateDialog = false
        this.editorDialog = true
      }
    },
    resetForm() {
      this.currentStrategy = {
        name: '',
        description: '',
        expression: '',
      }
      this.selectedTemplate = null
      this.isEdit = false
    },
    // Navigation methods for consistent strategy workflow
    goToParameterSpace() {
      this.$router.push('/ai-optimization/parameter-space')
    },
    goToTaskManagement() {
      this.$router.push('/ai-optimization/task-management')
    },
  },
}
</script>

<style lang="scss" scoped>
.strategy-editor-container {
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #303133;
    }
  }
  
  .templates-section {
    margin-bottom: 20px;
    
    h4 {
      margin-bottom: 15px;
      color: #606266;
      font-weight: 500;
    }
  }
  
  .template-categories {
    .el-tabs {
      margin-top: 20px;
    }
  }
}
</style>