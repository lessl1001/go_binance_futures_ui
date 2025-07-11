/** AI Parameter Optimization Router Module */

import Layout from '@/layout'

const aiOptimizationRouter = [
  {
    path: '/ai-optimization',
    component: Layout,
    redirect: '/ai-optimization/strategy-editor',
    name: 'AiOptimization',
    meta: {
      title: 'aiOptimization',
      icon: 'el-icon-cpu'
    },
    children: [
      {
        path: 'strategy-editor',
        name: 'StrategyEditor',
        component: () => import('@/views/ai-optimization/StrategyEditor'),
        meta: {
          title: 'strategyEditor',
          icon: 'el-icon-edit',
          noCache: true
        }
      },
      {
        path: 'parameter-space',
        name: 'ParameterSpace',
        component: () => import('@/views/ai-optimization/ParameterSpace'),
        meta: {
          title: 'parameterSpace',
          icon: 'el-icon-setting',
          noCache: true
        }
      },
      {
        path: 'task-management',
        name: 'TaskManagement',
        component: () => import('@/views/ai-optimization/TaskManagement'),
        meta: {
          title: 'taskManagement',
          icon: 'el-icon-monitor',
          noCache: true
        }
      },
      {
        path: 'optimization-monitor',
        name: 'OptimizationMonitor',
        component: () => import('@/views/ai-optimization/OptimizationMonitor'),
        meta: {
          title: 'optimizationMonitor',
          icon: 'el-icon-data-analysis',
          noCache: true
        }
      },
      {
        path: 'live-deployment',
        name: 'LiveDeployment',
        component: () => import('@/views/ai-optimization/LiveDeployment'),
        meta: {
          title: 'liveDeployment',
          icon: 'el-icon-upload',
          noCache: true
        }
      },
      {
        path: 'task-history',
        name: 'TaskHistory',
        component: () => import('@/views/ai-optimization/TaskHistory'),
        meta: {
          title: 'taskHistory',
          icon: 'el-icon-folder-opened',
          noCache: true
        }
      }
    ]
  }
]

export default aiOptimizationRouter