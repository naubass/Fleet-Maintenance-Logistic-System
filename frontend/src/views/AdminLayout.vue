<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Layout/Sidebar.vue'
import Navbar from '../components/Layout/Navbar.vue'

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="admin-layout">
    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="main-wrapper">
      <Navbar @toggle-sidebar="toggleSidebar" />
      
      <main class="admin-content">
        <!-- HANYA ROUTER-VIEW DI SINI, JANGAN MASUKKAN KOMPONEN LAIN -->
        <router-view :key="$route.fullPath" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
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

.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-content { padding: 1.25rem; }
}
</style>