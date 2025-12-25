// src/app.js
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import updatesRoutes from "./routes/updatesRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/updates", updatesRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/transactions", transactionRoutes);
// Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

export default app;

