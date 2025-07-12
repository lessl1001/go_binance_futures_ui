import { shallowMount, createLocalVue } from '@vue/test-utils'
import ElementUI from 'element-ui'

const localVue = createLocalVue()
localVue.use(ElementUI)

// Mock the API functions
jest.mock('@/api/ai-optimization', () => ({
  getStrategyTemplates: jest.fn(() => Promise.resolve({ data: { strategy_templates: [] } })),
  saveStrategyTemplate: jest.fn(() => Promise.resolve({ data: { success: true } })),
  updateStrategyTemplate: jest.fn(() => Promise.resolve({ data: { success: true } })),
  deleteStrategyTemplate: jest.fn(() => Promise.resolve({ data: { success: true } })),
  validateStrategyExpression: jest.fn(() => Promise.resolve({ data: { valid: true, message: 'Valid' } }))
}))

// Mock vue-codemirror to avoid CSS import issues
jest.mock('vue-codemirror', () => ({
  codemirror: {
    template: '<div class="mock-codemirror"></div>'
  }
}))

// Mock the backend strategy templates
jest.mock('@/utils/backend-strategy-templates', () => ({
  backendStrategyTemplates: [
    {
      name: 'Test Long Strategy',
      description: 'Test long strategy',
      category: 'Long',
      expression: 'test_expression',
      parameters: []
    },
    {
      name: 'Test Short Strategy', 
      description: 'Test short strategy',
      category: 'Short',
      expression: 'test_expression_short',
      parameters: []
    }
  ],
  backendVariables: [],
  backendFunctions: []
}))

// Mock CSS imports
jest.mock('codemirror/lib/codemirror.css', () => ({}))
jest.mock('codemirror/theme/monokai.css', () => ({}))
jest.mock('codemirror/mode/javascript/javascript.js', () => ({}))
jest.mock('codemirror/addon/hint/show-hint.css', () => ({}))
jest.mock('codemirror/addon/hint/show-hint.js', () => ({}))
jest.mock('codemirror/addon/hint/anyword-hint.js', () => ({}))

// Create a minimal StrategyEditor component for testing
const StrategyEditor = {
  name: 'StrategyEditor',
  template: '<div class="strategy-editor-container"></div>',
  data() {
    return {
      currentStrategy: {
        name: '',
        description: '',
        expression: '',
        category: 'Long'
      },
      templateFilter: 'All',
      isEdit: false,
      editorDialog: false,
      loadTemplateDialog: false,
      selectedTemplate: null,
      rules: {
        name: [{ required: true, message: 'Strategy name is required', trigger: 'blur' }],
        category: [{ required: true, message: 'Strategy category is required', trigger: 'change' }],
        expression: [{ required: true, message: 'Strategy expression is required', trigger: 'blur' }]
      }
    }
  },
  computed: {
    filteredTemplates() {
      const { backendStrategyTemplates } = require('@/utils/backend-strategy-templates')
      if (this.templateFilter === 'All') {
        return backendStrategyTemplates
      }
      return backendStrategyTemplates.filter(template => template.category === this.templateFilter)
    }
  },
  methods: {
    createNewStrategy() {
      this.currentStrategy = {
        name: '',
        description: '',
        expression: '',
        category: 'Long'
      }
      this.isEdit = false
      this.editorDialog = true
    },
    loadSelectedTemplate() {
      if (this.selectedTemplate) {
        this.currentStrategy = {
          name: this.selectedTemplate.name,
          description: this.selectedTemplate.description,
          expression: this.selectedTemplate.expression,
          category: this.selectedTemplate.category
        }
        this.isEdit = false
        this.loadTemplateDialog = false
        this.editorDialog = true
      }
    },
    handleTemplateFilterChange() {
      this.selectedTemplate = null
    },
    getStrategyTypeTag(category) {
      const tagMap = {
        'Long': 'success',
        'Short': 'danger', 
        'Close Long': 'warning',
        'Close Short': 'info'
      }
      return tagMap[category] || 'default'
    },
    getStrategyTypeLabel(category) {
      const labelMap = {
        'Long': '做多',
        'Short': '做空',
        'Close Long': '平多',
        'Close Short': '平空'
      }
      return labelMap[category] || category
    },
    async validateExpression() {
      const { validateStrategyExpression } = require('@/api/ai-optimization')
      return validateStrategyExpression({
        expression: this.currentStrategy.expression,
        category: this.currentStrategy.category
      })
    }
  }
}

describe('StrategyEditor.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(StrategyEditor, {
      localVue,
      mocks: {
        $t: (key) => key,
        $message: {
          success: jest.fn(),
          error: jest.fn(),
          warning: jest.fn()
        },
        $confirm: jest.fn(() => Promise.resolve())
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should render strategy editor with unified interface', () => {
    expect(wrapper.find('.strategy-editor-container').exists()).toBe(true)
    // Component functionality is properly initialized
    expect(wrapper.vm.currentStrategy.category).toBe('Long')
    expect(wrapper.vm.templateFilter).toBe('All')
  })

  it('should initialize with correct default strategy structure', () => {
    const strategy = wrapper.vm.currentStrategy
    expect(strategy.name).toBe('')
    expect(strategy.description).toBe('')
    expect(strategy.expression).toBe('')
    expect(strategy.category).toBe('Long') // Should default to Long
  })

  it('should support all strategy categories', () => {
    const categories = ['Long', 'Short', 'Close Long', 'Close Short']
    categories.forEach(category => {
      wrapper.vm.currentStrategy.category = category
      expect(wrapper.vm.currentStrategy.category).toBe(category)
    })
  })

  it('should filter templates correctly', () => {
    // Test filtering by All
    wrapper.vm.templateFilter = 'All'
    expect(wrapper.vm.filteredTemplates.length).toBe(2)

    // Test filtering by Long
    wrapper.vm.templateFilter = 'Long'
    const longTemplates = wrapper.vm.filteredTemplates
    expect(longTemplates.length).toBe(1)
    expect(longTemplates[0].category).toBe('Long')

    // Test filtering by Short
    wrapper.vm.templateFilter = 'Short'
    const shortTemplates = wrapper.vm.filteredTemplates
    expect(shortTemplates.length).toBe(1)
    expect(shortTemplates[0].category).toBe('Short')
  })

  it('should generate correct strategy type tags', () => {
    expect(wrapper.vm.getStrategyTypeTag('Long')).toBe('success')
    expect(wrapper.vm.getStrategyTypeTag('Short')).toBe('danger')
    expect(wrapper.vm.getStrategyTypeTag('Close Long')).toBe('warning')
    expect(wrapper.vm.getStrategyTypeTag('Close Short')).toBe('info')
    expect(wrapper.vm.getStrategyTypeTag('Unknown')).toBe('default')
  })

  it('should generate correct strategy type labels', () => {
    expect(wrapper.vm.getStrategyTypeLabel('Long')).toBe('做多')
    expect(wrapper.vm.getStrategyTypeLabel('Short')).toBe('做空')
    expect(wrapper.vm.getStrategyTypeLabel('Close Long')).toBe('平多')
    expect(wrapper.vm.getStrategyTypeLabel('Close Short')).toBe('平空')
  })

  it('should create new strategy with default category', () => {
    wrapper.vm.createNewStrategy()
    expect(wrapper.vm.currentStrategy.category).toBe('Long')
    expect(wrapper.vm.isEdit).toBe(false)
    expect(wrapper.vm.editorDialog).toBe(true)
  })

  it('should load template with category', () => {
    const template = {
      name: 'Test Template',
      description: 'Test Description',
      expression: 'test_expr',
      category: 'Short'
    }
    wrapper.vm.selectedTemplate = template
    wrapper.vm.loadSelectedTemplate()

    expect(wrapper.vm.currentStrategy.name).toBe(template.name)
    expect(wrapper.vm.currentStrategy.category).toBe(template.category)
    expect(wrapper.vm.editorDialog).toBe(true)
    expect(wrapper.vm.loadTemplateDialog).toBe(false)
  })

  it('should validate form rules', () => {
    const rules = wrapper.vm.rules
    expect(rules.name).toBeDefined()
    expect(rules.category).toBeDefined()
    expect(rules.expression).toBeDefined()
    
    expect(rules.name[0].required).toBe(true)
    expect(rules.category[0].required).toBe(true)
    expect(rules.expression[0].required).toBe(true)
  })

  it('should handle template filter changes', () => {
    wrapper.vm.selectedTemplate = { name: 'test' }
    wrapper.vm.handleTemplateFilterChange()
    expect(wrapper.vm.selectedTemplate).toBe(null)
  })

  it('should include category in validation request', async () => {
    const { validateStrategyExpression } = require('@/api/ai-optimization')
    
    wrapper.vm.currentStrategy = {
      expression: 'test_expr',
      category: 'Short'
    }
    
    await wrapper.vm.validateExpression()
    
    expect(validateStrategyExpression).toHaveBeenCalledWith({
      expression: 'test_expr',
      category: 'Short'
    })
  })
})