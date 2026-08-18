import ExcelJS from "exceljs";
import { supabase } from "../config/supabaseClient.js";
import { logActivity } from "../services/activityLoggerService.js";

// AMBIL DATA BUDGET THRESHOLD
export const getBudgetThreshold = async (req, res) => {
  try {
    const currentYear = Number(req.query.year) || new Date().getFullYear();
    const { data, error } = await supabase
      .from("budget_thresholds")
      .select("*")
      .eq("year", currentYear)
      .maybeSingle();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || { year: currentYear, annual_budget_limit: 0 }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// SIMPAN / UPDATE BUDGET THRESHOLD
export const setBudgetThreshold = async (req, res) => {
  try {
    const { year, annual_budget_limit } = req.body;
    const targetYear = Number(year) || new Date().getFullYear();

    const { data, error } = await supabase
      .from("budget_thresholds")
      .upsert(
        {
          year: targetYear,
          annual_budget_limit: Number(annual_budget_limit) || 0,
          updated_at: new Date().toISOString()
        },
        { onConflict: "year" }
      )
      .select()
      .single();

    if (error) throw error;

    // Catat Log Aktivitas: UPDATE BUDGET
    logActivity({
      userId: req.user?.id,
      action: "UPDATE",
      entity: "BUDGET",
      entityId: String(targetYear),
      description: `${req.user?.full_name || 'Manager'} mengatur ambang batas pagu anggaran tahun ${targetYear} menjadi Rp ${limitNominal.toLocaleString('id-ID')}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: "Ambang batas anggaran berhasil diperbarui",
      data
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// EKSPOR LAPORAN KEUANGAN & PERBAIKAN (CSV)
export const exportMaintenanceReport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("maintenance_records")
      .select(`
        id,
        problem_description,
        action_taken,
        labor_cost,
        total_cost,
        status,
        started_at,
        vehicles (plate_number, model_name),
        mechanic:profiles!assigned_mechanic_id (full_name)
      `)
      .order("started_at", { ascending: false });

    if (error) throw error;

    // Inisialisasi Workbook & Sheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "RawatArmada Fleet System";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Riwayat Servis & Biaya", {
      views: [{ showGridLines: true }]
    });

    // Definisi Header Kolom & Lebar
    worksheet.columns = [
      { header: "No", key: "no", width: 6 },
      { header: "Model Armada", key: "model", width: 26 },
      { header: "Nomor Plat", key: "plate", width: 16 },
      { header: "Uraian Masalah", key: "problem", width: 34 },
      { header: "Tindakan Perbaikan", key: "action", width: 34 },
      { header: "Mekanik PIC", key: "mechanic", width: 22 },
      { header: "Biaya Jasa (IDR)", key: "labor_cost", width: 20 },
      { header: "Total Biaya (IDR)", key: "total_cost", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Tanggal Servis", key: "date", width: 16 }
    ];

    // Styling Header (Warna Hijau Emerald Tema App)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0E3A2C" }
      };
      cell.font = {
        name: "Arial",
        color: { argb: "FFFFFFFF" },
        bold: true,
        size: 10
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Masukkan Data Baris
    (data || []).forEach((item, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        model: item.vehicles?.model_name || "-",
        plate: item.vehicles?.plate_number || "-",
        problem: item.problem_description || "-",
        action: item.action_taken || "-",
        mechanic: item.mechanic?.full_name || "Tidak Ditugaskan",
        labor_cost: Number(item.labor_cost) || 0,
        total_cost: Number(item.total_cost) || 0,
        status: (item.status || "completed").toUpperCase(),
        date: item.started_at ? new Date(item.started_at).toISOString().split("T")[0] : "-"
      });

      row.height = 22;
      row.alignment = { vertical: "middle" };

      // Format Angka Mata Uang pada Kolom Biaya
      row.getCell("labor_cost").numFmt = '#,##0';
      row.getCell("total_cost").numFmt = '#,##0';

      // Alignment Khusus
      row.getCell("no").alignment = { vertical: "middle", horizontal: "center" };
      row.getCell("plate").alignment = { vertical: "middle", horizontal: "center" };
      row.getCell("status").alignment = { vertical: "middle", horizontal: "center" };
      row.getCell("date").alignment = { vertical: "middle", horizontal: "center" };
    });

    // Catat Log Aktivitas: EXPORT REPORT
    logActivity({
      userId: req.user?.id,
      action: "LOGIN", // atau gunakan custom action label / UPDATE
      entity: "BUDGET",
      description: `${req.user?.full_name || 'Manager'} mengunduh Laporan Rekap Servis & Biaya Excel (.xlsx)`,
      req
    });

    // Kirim File Stream XLSX
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Laporan_Perawatan_Armada_${new Date().getFullYear()}.xlsx`
    );

    await workbook.xlsx.write(res);
    return res.status(200).end();
  } catch (err) {
    console.error("Export Excel Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};