import express from "express";
import { initPayment, validatePayment, ipnHandler } from "../controllers/paymentController.js";

const router = express.Router();

// Initialize a transaction (frontend calls this to get GatewayPageURL)
router.post("/init", initPayment);

// Validate after redirect or server-side validation
router.post("/validate", validatePayment);

// Success redirect: SSLCommerz may redirect with GET or POST. Accept both and delegate to handler.
const successHandlerWrapper = (req, res) => {
  return import("../controllers/paymentController.js").then((mod) => mod.successHandler(req, res));
};
router.get("/success", successHandlerWrapper);
router.post("/success", successHandlerWrapper);

// IPN endpoint (SSLCommerz server-to-server notification)
router.post("/ipn", ipnHandler);

export default router;
