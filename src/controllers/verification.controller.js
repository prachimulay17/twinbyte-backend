import fs from "fs";
import { analyzeContent } from "../services/ai.service.js";
import Verification from "../models/verification.model.js";

/**
 * POST /api/verify
 * Accepts text and/or an image, runs AI analysis, saves result to DB,
 * responds to client, then deletes the uploaded file.
 */
export const verifyContent = async (req, res) => {
    const uploadedFilePath = req.file?.path ?? null;

    try {
        const text = req.body.text?.trim() ?? "";

        // ── Validation ──────────────────────────────────────────────────────────
        if (!text && !req.file) {
            return res.status(400).json({
                success: false,
                error: "Request must include at least a text message or an image file.",
            });
        }

        // ── Determine content type ───────────────────────────────────────────────
        const contentType = req.file ? "image" : "text";

        // ── AI Analysis ─────────────────────────────────────────────────────────
        const { result, riskScore, confidence } = await analyzeContent({
            text: text || undefined,
            imagePath: uploadedFilePath,
        });

        // ── Save to DB ──────────────────────────────────────────────────────────
        const record = await Verification.create({
            type: contentType,
            inputText: text || null,
            imageUrl: req.file ? req.file.filename : null,
            aiResult: result,
            riskScore,
            confidence,
        });

        // ── Send Response ────────────────────────────────────────────────────────
        res.status(200).json({
            success: true,
            id: record._id,
            type: record.type,
            aiResult: record.aiResult,
            riskScore: record.riskScore,
            confidence: record.confidence,
            createdAt: record.createdAt,
        });

        // ── Cleanup: delete local file AFTER response is sent ───────────────────
        if (uploadedFilePath) {
            deleteFile(uploadedFilePath);
        }
    } catch (error) {
        console.error("Verification Controller Error:", error.message);

        // Cleanup on error as well
        if (uploadedFilePath) {
            deleteFile(uploadedFilePath);
        }

        // Handle Multer-specific errors
        if (error.name === "MulterError") {
            return res.status(400).json({
                success: false,
                error: `File upload error: ${error.message}`,
            });
        }

        // Handle AI service error
        if (error.message?.startsWith("AI analysis failed")) {
            return res.status(502).json({
                success: false,
                error: `AI analysis failed. Details: ${error.message} \n ${error.stack}`,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Asynchronously delete a file, logging any errors.
 * This is intentionally non-blocking (fire-and-forget).
 * @param {string} filePath
 */
function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Cleanup: failed to delete file "${filePath}":`, err.message);
        } else {
            console.log(`Cleanup: deleted uploaded file "${filePath}"`);
        }
    });
}
