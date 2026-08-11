import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import scheduleRoutes from "./routes/ScheduleRoutes.js";
import MaintenanceRoutes from "./routes/MaintenanceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sparepartRoutes from "./routes/sparepartRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/maintenance-records", MaintenanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spareparts", sparepartRoutes);

// Check API Application
app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "Application is already to use"
    })
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

export default app;