import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../views/AdminLayout.vue'
import ManagerLayout from '../components/layout/ManagerLayout.vue'

// Import langsung views Manager (agar tidak silent fail jika path salah)
import ManagerDashboardView from '../views/Manager/ManagerDashboardView.vue'
import ManagerVehiclesView from '../views/Manager/ManagerVehiclesView.vue'
import ManagerSchedulesView from '../views/Manager/ManagerSchedulesView.vue'
import ManagerRecordsView from '../views/Manager/ManagerRecordsView.vue'

const routes = [
  { 
    path: '/', 
    redirect: '/login'
  },
  { 
    path: '/login', 
    name: 'login', 
    component: LoginView,
    meta: { title: 'Masuk | RawatArmada' }
  },
  
  // Portal Admin
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { 
        path: 'dashboard', 
        name: 'dashboard', 
        component: () => import('../views/admin/DashboardView.vue'),
        meta: { title: 'Dashboard Admin | RawatArmada' }
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

  // Portal Manager
  {
    path: '/manager',
    component: ManagerLayout,
    meta: { requiresAuth: true, role: 'manager' },
    children: [
      {
        path: 'dashboard',
        name: 'manager-dashboard',
        component: ManagerDashboardView,
        meta: { title: 'Executive Dashboard | RawatArmada' }
      },
      {
        path: 'vehicles',
        name: 'manager-vehicles',
        component: ManagerVehiclesView,
        meta: { title: 'Monitoring Kesiapan Armada | RawatArmada' }
      },
      {
        path: 'schedules',
        name: 'manager-schedules',
        component: ManagerSchedulesView,
        meta: { title: 'Jadwal & Approval Servis | RawatArmada' }
      },
      {
        path: 'maintenance-records',
        name: 'manager-records',
        component: ManagerRecordsView,
        meta: { title: 'Rekap Pengeluaran & Riwayat Servis | RawatArmada' }
      }
    ]
  },

  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard yang Ringkas & Stabil
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (e) {
    user = {}
  }
  const userRole = (user.role || '').toLowerCase()

  const isAuthRequired = to.matched.some(r => r.meta.requiresAuth)

  // 1. Belum login mencoba akses route tertutup
  if (isAuthRequired && !token) {
    return next('/login')
  }

  // 2. Sudah login mencoba buka /login
  if (to.path === '/login' && token) {
    if (userRole === 'manager') return next('/manager/dashboard')
    return next('/admin/dashboard')
  }

  // 3. Batasi akses role: Manager dilarang buka /admin, Admin dilarang buka /manager
  if (to.path.startsWith('/admin') && userRole === 'manager') {
    return next('/manager/dashboard')
  }
  if (to.path.startsWith('/manager') && userRole === 'admin') {
    return next('/admin/dashboard')
  }

  next()
})

router.afterEach((to) => {
  const defaultTitle = 'RawatArmada - Sistem Manajemen Perawatan Armada'
  document.title = to.meta.title || defaultTitle
})

export default router