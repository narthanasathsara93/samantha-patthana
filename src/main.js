import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initPwaInstallPrompt } from './composables/usePwaInstall'

initPwaInstallPrompt()

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault()
  window.location.href = window.location.origin
})

const app = createApp(App)

app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})
