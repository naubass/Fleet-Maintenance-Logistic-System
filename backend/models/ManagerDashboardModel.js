import { supabase } from "../config/supabaseClient.js";

export const ManagerDashboardModel = {
  async getManagerStats() {
    // 1. Ambil data kendaraan
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, model_name, plate_number, status, current_mileage");

    const totalFleet = vehicles?.length || 0;
    const readyFleet = vehicles?.filter(v => v.status?.toLowerCase() === "ready").length || 0;
    const fleetAvailabilityRate = totalFleet > 0 ? Math.round((readyFleet / totalFleet) * 100) : 0;

    // 2. Ambil semua rekaman perawatan
    const { data: records } = await supabase
      .from("maintenance_records")
      .select("id, vehicle_id, labor_cost, total_cost, status, created_at, started_at, vehicles(model_name, plate_number)")
      .order("created_at", { ascending: true });

    let totalMaintenanceExpense = 0;
    let totalLaborExpense = 0;
    let totalPartsExpense = 0;

    const monthlyCostMap = {};
    const vehicleCostMap = {};

    (records || []).forEach(rec => {
      const total = Number(rec.total_cost) || 0;
      const labor = Number(rec.labor_cost) || 0;
      const parts = Math.max(0, total - labor);

      totalMaintenanceExpense += total;
      totalLaborExpense += labor;
      totalPartsExpense += parts;

      // Agregasi Bulanan (Format: 'YYYY-MM')
      const dateStr = rec.started_at || rec.created_at;
      if (dateStr) {
        const monthKey = dateStr.substring(0, 7); // e.g. "2026-08"
        monthlyCostMap[monthKey] = (monthlyCostMap[monthKey] || 0) + total;
      }

      // Agregasi Biaya per Kendaraan
      const vPlate = rec.vehicles?.plate_number || "Tanpa Plat";
      const vName = rec.vehicles?.model_name || "Unknown";
      const vLabel = `${vName} (${vPlate})`;

      vehicleCostMap[vLabel] = (vehicleCostMap[vLabel] || 0) + total;
    });

    // Format tren bulanan untuk chart (urutkan berdasarkan bulan)
    const monthlyTrend = Object.keys(monthlyCostMap)
      .sort()
      .map(month => {
        const [year, m] = month.split("-");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        return {
          month: `${monthNames[parseInt(m, 10) - 1]} ${year}`,
          total_cost: monthlyCostMap[month]
        };
      });

    // Format Top 5 Armada Paling Banyak Makan Biaya
    const topCostVehicles = Object.entries(vehicleCostMap)
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    // 3. Ambil jadwal servis tertunda / butuh persetujuan
    const { data: schedules } = await supabase
      .from("preventive_schedules")
      .select("id, status");

    const pendingApprovals = schedules?.filter(s => (s.status || "").toLowerCase() === "pending").length || 0;

    return {
      summary: {
        totalFleet,
        readyFleet,
        fleetAvailabilityRate,
        totalMaintenanceExpense,
        totalLaborExpense,
        totalPartsExpense,
        pendingApprovals
      },
      monthlyTrend,
      costBreakdown: [
        { name: "Biaya Jasa / Mekanik", value: totalLaborExpense },
        { name: "Biaya Suku Cadang", value: totalPartsExpense }
      ],
      topCostVehicles
    };
  }
};