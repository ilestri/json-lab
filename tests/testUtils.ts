import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '@/App.vue'
import FormatView from '@/views/FormatView.vue'
import ToolsView from '@/views/ToolsView.vue'
import SettingsView from '@/views/SettingsView.vue'

export const createTestRouter = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'format', component: FormatView },
      { path: '/tools', name: 'tools', component: ToolsView },
      { path: '/settings', name: 'settings', component: SettingsView },
    ],
  })
  return router
}

export const mountAppWithRouter = async (initialPath = '/') => {
  const router = createTestRouter()
  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  })
  await router.push(initialPath)
  await router.isReady()
  await flushPromises()
  return { wrapper, router }
}
