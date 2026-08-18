<script setup>
import { ref } from 'vue'
import ManagerSidebar from './ManagerSidebar.vue'
import ManagerNavbar from './ManagerNavbar.vue'

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="manager-layout">
    <ManagerSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="main-wrapper">
      <ManagerNavbar @toggle-sidebar="toggleSidebar" />
      
      <main class="manager-content">
        <!-- Key route agar transisi antar menu manager selalu me-render ulang data baru -->
        <router-view :key="$route.fullPath" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.manager-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f4faf6;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow-x: hidden;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.manager-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .manager-content {
    padding: 1.25rem;
  }
}
</style>