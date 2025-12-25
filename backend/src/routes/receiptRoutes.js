import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "../config/supabaseClient.js";
import TransactionPDFService from "../services/TransactionPDFService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/receipts/:filename
 * Download a specific receipt PDF by filename
 */
router.get("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: validate filename to prevent directory traversal
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Check if file exists
    if (!TransactionPDFService.receiptExists(filename)) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    // Get the file path
    const filepath = TransactionPDFService.getReceiptPath(filename);

    // Send the file
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error sending receipt file:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to download receipt" });
        }
      }
    });
  } catch (error) {
    console.error("Error in receipt download:", error);
    res.status(500).json({ error: "Failed to retrieve receipt" });
  }
});

export default router;
