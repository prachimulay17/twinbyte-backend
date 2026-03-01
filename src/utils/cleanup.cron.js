import cron from "node-cron";
import Verification from "../models/verification.model.js";

// How many hours back to retain records (configurable via env)
const RETENTION_HOURS = Number(process.env.CLEANUP_RETENTION_HOURS ?? 24);

/**
 * Delete Verification records older than RETENTION_HOURS hours.
 * Runs automatically every hour.
 */
export function startCleanupCron() {
    cron.schedule("0 * * * *", async () => {
        const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);
        try {
            const { deletedCount } = await Verification.deleteMany({
                createdAt: { $lt: cutoff },
            });
            if (deletedCount > 0) {
                console.log(
                    `[Cron] Deleted ${deletedCount} verification record(s) older than ${RETENTION_HOURS}h.`
                );
            }
        } catch (err) {
            console.error("[Cron] Cleanup failed:", err.message);
        }
    });

    console.log(
        `[Cron] DB cleanup scheduled — retaining records for ${RETENTION_HOURS}h.`
    );
}
