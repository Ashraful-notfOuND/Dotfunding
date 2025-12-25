import express from "express";
import { supabase } from "../config/supabaseClient.js";
import TransactionPDFService from "../services/TransactionPDFService.js";

const router = express.Router();

/**
 * GET /api/transactions/user/:userId
 * Get all transactions for a specific user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("transaction_logs")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user transactions:", error);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }

    return res.status(200).json({ transactions: data, count: data.length });
  } catch (err) {
    console.error("Error in user transactions endpoint:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/transactions/project/:projectId
 * Get all transactions for a specific project
 */
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("transaction_logs")
      .select("*")
      .eq("project_id", projectId)
      .order("transaction_date", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching project transactions:", error);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }

    return res.status(200).json({ transactions: data, count: data.length });
  } catch (err) {
    console.error("Error in project transactions endpoint:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/transactions/:tranId
 * Get a specific transaction by transaction ID
 * Generates PDF on-demand if missing (for backfilled transactions)
 */
router.get("/:tranId", async (req, res) => {
  try {
    const { tranId } = req.params;

    const { data, error } = await supabase
      .from("transaction_logs")
      .select("*")
      .eq("tran_id", tranId)
      .single();

    if (error) {
      console.error("Error fetching transaction:", error);
      
      if (error.code === '42P01') {
        // Table doesn't exist
        return res.status(503).json({ 
          error: "Transaction logging not set up",
          message: "Please run the database migration: database/create_transaction_logs.sql",
          hint: "Run the SQL file in Supabase Dashboard → SQL Editor"
        });
      }
      
      if (error.code === 'PGRST116') {
        // No rows found
        return res.status(404).json({ 
          error: "Transaction not found",
          message: "This transaction has not been logged yet. It may still be processing.",
          tran_id: tranId
        });
      }
      
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Check if PDF exists, generate on-demand if missing (for backfilled transactions)
    if (data && !data.receipt_pdf_url) {
      console.log(`📄 Generating PDF on-demand for transaction ${tranId}`);
      
      try {
        // Fetch additional data needed for PDF
        const { data: projectData } = await supabase
          .from("main_projects")
          .select("project_name")
          .eq("id", data.project_id)
          .single();

        const { data: rewardData } = data.reward_id ? await supabase
          .from("reward_table")
          .select("reward_name")
          .eq("id", data.reward_id)
          .single() : { data: null };

        // Fetch user data for address
        const { data: userData } = data.user_id ? await supabase
          .from("users")
          .select("address")
          .eq("id", data.user_id)
          .single() : { data: null };

        // Generate PDF (TransactionPDFService is already a singleton instance)
        const pdfPath = await TransactionPDFService.generateReceipt({
          tran_id: data.tran_id,
          val_id: data.val_id,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          transaction_date: data.transaction_date,
          project_title: projectData?.project_name || 'Unknown Project',
          reward_title: rewardData?.reward_name || 'No Reward',
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_address: userData?.address || 'N/A',
        });

        const receipt_pdf_url = TransactionPDFService.getReceiptUrl(pdfPath);

        // Update transaction log with PDF URL
        await supabase
          .from("transaction_logs")
          .update({ receipt_pdf_url })
          .eq("tran_id", tranId);

        data.receipt_pdf_url = receipt_pdf_url;
        console.log(`✅ PDF generated and saved for transaction ${tranId}`);
      } catch (pdfError) {
        console.error(`⚠️ Failed to generate PDF for transaction ${tranId}:`, pdfError);
        // Continue without PDF - don't fail the request
      }
    }

    return res.status(200).json({ transaction: data });
  } catch (err) {
    console.error("Error in transaction lookup endpoint:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/transactions/stats/summary
 * Get transaction statistics summary
 */
router.get("/stats/summary", async (req, res) => {
  try {
    const { projectId, userId, startDate, endDate } = req.query;

    let query = supabase.from("transaction_logs").select("*");

    if (projectId) query = query.eq("project_id", projectId);
    if (userId) query = query.eq("user_id", userId);
    if (startDate) query = query.gte("transaction_date", startDate);
    if (endDate) query = query.lte("transaction_date", endDate);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching transaction stats:", error);
      return res.status(500).json({ error: "Failed to fetch statistics" });
    }

    // Calculate statistics
    const stats = {
      total_transactions: data.length,
      successful_transactions: data.filter(t => t.status === 'success').length,
      failed_transactions: data.filter(t => t.status === 'failed').length,
      pending_transactions: data.filter(t => t.status === 'pending').length,
      total_amount: data
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
      average_amount: 0,
      currency: 'BDT',
    };

    if (stats.successful_transactions > 0) {
      stats.average_amount = stats.total_amount / stats.successful_transactions;
    }

    return res.status(200).json({ stats });
  } catch (err) {
    console.error("Error in transaction stats endpoint:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
