import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../views/AdminLayout.vue'

const routes = [
  { path: '/', redirect: '/admin/dashboard' },
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'dashboard', 
        name: 'dashboard', 
        component: () => import('../views/admin/DashboardView.vue') 
      },
      { 
        path: 'vehicles', 
        name: 'vehicles', 
        component: () => import('../views/admin/VehiclesView.vue') 
      },
      { 
        path: 'schedules', 
        name: 'schedules', 
        component: () => import('../views/admin/SchedulesView.vue') 
      },
      { 
        path: 'maintenance-records', 
        name: 'maintenance-records', 
        component: () => import('../views/admin/MaintenanceRecordsView.vue') 
      },
      { 
        path: 'users', 
        name: 'users', 
        component: () => import('../views/admin/UsersView.vue') 
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/admin/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard Modern (Tanpa fungsi callback next())
router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    return { name: 'login' } // Redirect ke login jika belum ada token
  }

  if (to.name === 'login' && token) {
    return { name: 'dashboard' } // Redirect ke dashboard jika sudah login
  }
})

export default router