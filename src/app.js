import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import analyzeRoute from "./routes/analyzeRoute.js";
import verificationRoute from "./routes/verification.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: process.env.CORSORIGIN,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static directories
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api", analyzeRoute);
app.use("/api", verificationRoute);

export default app;