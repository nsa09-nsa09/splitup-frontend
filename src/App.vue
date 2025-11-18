<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import Toast from 'primevue/toast'

const route = useRoute()

// Check if current route is admin
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div class="app-container" :class="{ 'admin-mode': isAdminRoute }">
    <Toast />

    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.app-content {
  flex: 1;
  width: 100%;
}
</style>
