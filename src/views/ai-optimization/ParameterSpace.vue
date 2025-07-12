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
            label="Parameter Space Name"
            width="200"
          />
          <el-table-column
            prop="description"
            label="Description"
            show-overflow-tooltip
          />
          <el-table-column
            prop="optimization_target"
            label="Optimization Target"
            width="150"
          />
          <el-table-column
            prop="created_at"
            label="Created At"
            width="180"
          />
          <el-table-column
            label="Actions"
            width="250"
          >
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="editParameterSpace(scope.row)"
              >
                Edit
              </el-button>
              <el-button
                type="success"
                size="mini"
                @click="viewParameters(scope.row)"
              >
                View
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="deleteParameterSpace(scope.row)"
              >
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Parameter Space Editor Dialog -->
      <el-dialog
        :title="isEdit ? 'Edit' : 'Add'"
        :visible.sync="editorDialog"
        width="70%"
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
              <el-form-item label="Name" prop="name">
                <el-input v-model="currentParameterSpace.name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Optimization Target" prop="optimization_target">
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
          <el-form-item label="Description" prop="description">
            <el-input
              v-model="currentParameterSpace.description"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="editorDialog = false">
            Cancel
          </el-button>
          <el-button type="primary" :loading="saving" @click="saveParameterSpace">
            Save
          </el-button>
        </div>
      </el-dialog>

      <!-- View Parameters Dialog -->
      <el-dialog
        title="Parameter Details"
        :visible.sync="viewDialog"
        width="80%"
      >
        <div class="parameter-details">
          <p>Parameter details will be displayed here.</p>
        </div>
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
      },
      editorDialog: false,
      viewDialog: false,
      isEdit: false,
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
      }
      this.isEdit = false
      this.editorDialog = true
    },

    editParameterSpace(parameterSpace) {
      this.currentParameterSpace = JSON.parse(JSON.stringify(parameterSpace))
      this.isEdit = true
      this.editorDialog = true
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
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
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

    viewParameters(parameterSpace) {
      this.viewDialog = true
    },

    handleClose(done) {
      this.$confirm('Are you sure you want to close? Unsaved changes will be lost.')
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

.parameter-details {
  max-height: 60vh;
  overflow-y: auto;
}

.dialog-footer {
  text-align: right;
}
</style>
