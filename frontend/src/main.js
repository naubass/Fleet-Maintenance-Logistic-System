import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Panggil initAuth setelah Pinia terpasang
import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore()
authStore.initAuth()

app.use(router)
app.mount('#app')