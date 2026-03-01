import express from "express";
import upload from "../middleware/upload.middleware.js";
import { verifyContent } from "../controllers/verification.controller.js";
import multer from "multer";

const router = express.Router();

/**
 * POST /api/verify
 * Accepts multipart/form-data with:
 *   - text  (string, optional)
 *   - image (file,   optional — jpeg | jpg | png | webp, max 5 MB)
 * At least one of text or image is required.
 */
router.post(
    "/verify",
    (req, res, next) => {
        // Apply multer and convert its errors into clean JSON responses
        upload.single("image")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                let message = err.message;
                if (err.code === "LIMIT_FILE_SIZE") {
                    message = "Image must not exceed 5 MB.";
                }
                return res.status(400).json({ success: false, error: message });
            }
            if (err) {
                return res.status(400).json({ success: false, error: err.message });
            }
            next();
        });
    },
    verifyContent
);

export default router;
