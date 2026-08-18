<script setup>
</script>

<template>
  <aside class="sidebar">
    <!-- Brand Header -->
    <div class="brand">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <div class="brand-info">
        <h2>RawatArmada</h2>
        <span class="portal-badge">WORKSHOP MEKANIK</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="nav-menu">
      <div class="nav-section-title">OPERASIONAL BENGKEL</div>
      
      <router-link to="/mechanic/dashboard" class="nav-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span>Tugas &amp; Servis Aktif</span>
      </router-link>

      <router-link to="/mechanic/records" class="nav-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span>Riwayat Pengerjaan</span>
      </router-link>
    </nav>

    <!-- Sidebar Footer Status -->
    <div class="sidebar-footer">
      <div class="station-card">
        <span class="dot-online"></span>
        <div>
          <strong>Stasiun Kerja Aktif</strong>
          <small>Siap Menerima Unit</small>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background: #0e3a2c; /* Hijau Emerald Gelap Khas RawatArmada */
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-logo {
  width: 38px;
  height: 38px;
  background: #22c55e;
  color: #0a2e22;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brand-logo svg {
  width: 20px;
  height: 20px;
}

.brand-info h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.portal-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #86efac;
  letter-spacing: 0.05em;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1.5rem;
  flex: 1;
}

.nav-section-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: #a7f3d0;
  letter-spacing: 0.05em;
  padding: 0 0.75rem 0.5rem;
  opacity: 0.8;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  color: #d1fae5;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.nav-item.active {
  background: #22c55e;
  color: #064e3b;
  font-weight: 700;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
}

.station-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.station-card strong {
  display: block;
  font-size: 0.75rem;
  color: #ffffff;
}

.station-card small {
  font-size: 0.68rem;
  color: #86efac;
}

.dot-online {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
}

@media (max-width: 768px) {
  .sidebar { display: none; }
}
</style>