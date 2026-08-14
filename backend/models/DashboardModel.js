import { supabase } from "../config/supabaseClient.js";

export const DashboardModel = {
  async getStats() {
    // 1. Total Armada & Status Kondisi
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, status, category");

    const totalVehicles = vehicles?.length || 0;
    const readyVehicles = vehicles?.filter(v => v.status?.toLowerCase() === "ready").length || 0;
    const maintenanceVehicles = vehicles?.filter(v => 
      v.status?.toLowerCase() === "in_maintenance" || 
      v.status?.toLowerCase() === "service" ||
      v.status?.toLowerCase() === "maintenance"
    ).length || 0;

    // 2. Suku Cadang Kritis
    const { data: lowStockParts } = await supabase
      .from("spareparts")
      .select("id, name, stock, min_stock");
    
    const criticalPartsCount = lowStockParts?.filter(p => Number(p.stock) <= Number(p.min_stock)).length || 0;

    // 3. Jadwal Servis Mendatang (Tabel: preventive_schedules)
    const { data: schedules } = await supabase
      .from("preventive_schedules")
      .select("id, status");

    const pendingSchedules = schedules?.filter(s => {
      const st = (s.status || "").toLowerCase();
      return st !== "selesai" && st !== "completed" && st !== "done";
    }).length || (schedules?.length || 0);

    // 4. Riwayat Perawatan Terbaru (Ambil persis seperti MaintenanceRecordModel)
    const { data: records, error } = await supabase
      .from("maintenance_records")
      .select(`
        id,
        created_at,
        started_at,
        total_cost,
        status,
        vehicles!inner ( model_name, plate_number )
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Dashboard Supabase Record Error:", error.message);
    }

    return {
      summary: {
        totalVehicles,
        readyVehicles,
        maintenanceVehicles,
        criticalPartsCount,
        pendingSchedules,
      },
      fleetDistribution: {
        ready: readyVehicles,
        inMaintenance: maintenanceVehicles,
        other: Math.max(0, totalVehicles - (readyVehicles + maintenanceVehicles))
      },
      recentRecords: records || []
    };
  }
};