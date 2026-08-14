import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../views/AdminLayout.vue'

const routes = [
  { path: '/', redirect: '/admin/dashboard' },
  { 
    path: '/login', 
    name: 'login', 
    component: LoginView,
    meta: { title: 'Masuk | RawatArmada' }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'dashboard', 
        name: 'dashboard', 
        component: () => import('../views/admin/DashboardView.vue'),
        meta: { title: 'Dashboard | RawatArmada' }
      },
      { 
        path: 'vehicles', 
        name: 'vehicles', 
        component: () => import('../views/admin/VehiclesView.vue'),
        meta: { title: 'Armada Kendaraan | RawatArmada' }
      },
      { 
        path: 'schedules', 
        name: 'schedules', 
        component: () => import('../views/admin/SchedulesView.vue'),
        meta: { title: 'Jadwal Servis Berkala | RawatArmada' }
      },
      { 
        path: 'maintenance-records', 
        name: 'maintenance-records', 
        component: () => import('../views/admin/MaintenanceRecordsView.vue'),
        meta: { title: 'Catatan Perbaikan | RawatArmada' }
      },
      { 
        path: 'users', 
        name: 'users', 
        component: () => import('../views/admin/UsersView.vue'),
        meta: { title: 'Kelola Pengguna | RawatArmada' }
      },
      {
        path: 'spareparts',
        name: 'spareparts',
        component: () => import('../views/admin/SparepartsView.vue'),
        meta: { title: 'Suku Cadang & Inventaris | RawatArmada' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/admin/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard Auth
router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    return { name: 'login' }
  }

  if (to.name === 'login' && token) {
    return { name: 'dashboard' }
  }
})

// Dynamic Title
router.afterEach((to) => {
  const defaultTitle = 'RawatArmada - Sistem Manajemen Perawatan Armada'
  document.title = to.meta.title || defaultTitle
})

export default router