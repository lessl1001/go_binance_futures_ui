import { shallowMount, createLocalVue } from '@vue/test-utils'
import StrategyEditor from '@/views/ai-optimization/StrategyEditor.vue'
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
    expect(wrapper.find('.templates-section').exists()).toBe(true)
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