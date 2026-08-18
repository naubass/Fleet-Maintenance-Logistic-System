<script setup>
import MechanicSidebar from './MechanicSidebar.vue'
import MechanicNavbar from './MechanicNavbar.vue'
</script>

<template>
  <div class="mechanic-layout">
    <MechanicSidebar />
    <div class="main-wrapper">
      <MechanicNavbar />
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.mechanic-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.page-content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 768px) {
  .page-content { padding: 1rem; }
}
</style>