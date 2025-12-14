import dotenv from "dotenv";
import { supabase } from "../config/supabaseClient.js";
import {
  PaymentProcessor,
  PaymentStrategyFactory,
} from "../services/PaymentStrategy.js";
import EmailService from "../services/EmailService.js";
import { NotificationFactory } from "../services/NotificationFactory.js";
import { NotificationBuilder } from "../services/NotificationDecorator.js";
import { observerManager } from "../services/ProjectObserver.js";

dotenv.config();

// Initialize default payment strategy (SSLCommerz)
const defaultStrategy = PaymentStrategyFactory.createStrategy("sslcommerz", {
  storeId: process.env.SSLCZ_STORE_ID,
  storePass: process.env.SSLCZ_STORE_PASS,
  isLive: false,
});

const paymentProcessor = new PaymentProcessor(defaultStrategy);

/**
 * Helper function to get gateway configuration
 */
const getGatewayConfig = (gatewayType) => {
  if (gatewayType === 'sslcommerz') {
    return {
      storeId: process.env.SSLCZ_STORE_ID,
      storePass: process.env.SSLCZ_STORE_PASS,
      isLive: false,
    };
  } else if (gatewayType === 'stripe') {
    return {
      apiKey: process.env.STRIPE_API_KEY,
    };
  }
  throw new Error(`Unknown gateway type: ${gatewayType}`);
};

/**
 * Helper function to check if funding goal was just reached and send notifications
 */
const checkAndNotifyFundingGoalReached = async (project_id, previousTotal, newTotal) => {
  try {
    // Get project details including funding goal
    const { data: project, error: projectError } = await supabase
      .from("main_projects")
      .select("id, user_id, title, funding_goal")
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      console.error("Error fetching project:", projectError);
      return;
    }

    const fundingGoal = Number(project.funding_goal || 0);
    
    // Check if the funding goal was just reached with this payment
    if (previousTotal < fundingGoal && newTotal >= fundingGoal) {
      console.log(`🎉 Project ${project_id} just reached its funding goal of $${fundingGoal}!`);
      
      // Get creator information
      const { data: creator } = await supabase
        .from("users")
        .select("id, full_name, email, notification_preferences")
        .eq("id", project.user_id)
        .single();

      if (creator) {
        // Get creator's notification preferences
        const creatorPrefs = creator.notification_preferences || {};
        const creatorChannels = creatorPrefs.channels || ["in-app"];

        // Send notification to creator
        const creatorMessage = `🎉 Congratulations! Your project "${project.title}" has reached its funding goal of $${fundingGoal}!`;
        const creatorMetadata = {
          projectId: project_id,
          projectTitle: project.title,
          fundingGoal: fundingGoal,
          totalBacked: newTotal,
          type: 'funding_goal_reached',
          subject: 'Funding Goal Reached! 🎉',
        };

        for (const channel of creatorChannels) {
          try {
            const notification = NotificationFactory.createNotification(
              channel,
              creator,
              creatorMessage,
              creatorMetadata
            );

            const enhancedNotification = new NotificationBuilder(notification)
              .withPersonalization(creator.full_name || 'Creator')
              .withPriority('high')
              .withFormatting({ emoji: '🎉' })
              .withTracking()
              .withRetry(3, 2000)
              .build();

            await enhancedNotification.send();
            console.log(`Funding goal notification sent to creator via ${channel}`);
          } catch (channelError) {
            console.error(`Failed to send notification to creator via ${channel}:`, channelError);
          }
        }
      }

      // Get all backers for this project
      const { data: backers, error: backersError } = await supabase
        .from("pledges")
        .select(`
          user_id,
          amount,
          users (
            id,
            full_name,
            email,
            notification_preferences
          )
        `)
        .eq("project_id", project_id)
        .eq("status", "paid");

      if (!backersError && backers && backers.length > 0) {
        // Send notifications to all backers
        const uniqueBackers = new Map();
        backers.forEach(pledge => {
          if (pledge.users && !uniqueBackers.has(pledge.user_id)) {
            uniqueBackers.set(pledge.user_id, pledge.users);
          }
        });

        for (const [userId, backer] of uniqueBackers) {
          try {
            const backerPrefs = backer.notification_preferences || {};
            const backerChannels = backerPrefs.channels || ["in-app"];

            const backerMessage = `🎉 Great news! The project "${project.title}" you backed has reached its funding goal of $${fundingGoal}!`;
            const backerMetadata = {
              projectId: project_id,
              projectTitle: project.title,
              fundingGoal: fundingGoal,
              totalBacked: newTotal,
              type: 'funding_goal_reached_backer',
              subject: 'Project Funded Successfully! 🎉',
            };

            for (const channel of backerChannels) {
              try {
                const notification = NotificationFactory.createNotification(
                  channel,
                  backer,
                  backerMessage,
                  backerMetadata
                );

                const enhancedNotification = new NotificationBuilder(notification)
                  .withPersonalization(backer.full_name || 'Backer')
                  .withPriority('normal')
                  .withFormatting({ emoji: '🎉' })
                  .withTracking()
                  .withRetry(2, 1500)
                  .build();

                await enhancedNotification.send();
              } catch (channelError) {
                console.error(`Failed to send notification to backer via ${channel}:`, channelError);
              }
            }
            console.log(`Funding goal notification sent to backer ${backer.full_name || userId}`);
          } catch (backerError) {
            console.error(`Error sending notification to backer ${userId}:`, backerError);
          }
        }
        console.log(`Sent funding goal notifications to ${uniqueBackers.size} backers`);
      }

      // Notify all project subscribers via Observer pattern
      try {
        await observerManager.notifyProjectEvent(project_id, 'funding_goal_reached', {
          projectTitle: project.title,
          fundingGoal: fundingGoal,
          totalBacked: newTotal,
        });
        console.log('Project subscribers notified about funding goal reached');
      } catch (observerError) {
        console.error('Failed to notify project subscribers:', observerError);
      }
    }
  } catch (err) {
    console.error("Error checking funding goal completion:", err);
  }
};

/**
 * Helper function to update project backed amount
 * Calculates total from all paid pledges for the project
 */
const updateProjectBackedAmount = async (project_id) => {
  try {
    if (!project_id) return;

    // Get previous total before the new pledge
    const { data: previousPledges } = await supabase
      .from("pledges")
      .select("amount")
      .eq("project_id", project_id)
      .eq("status", "paid");

    const previousTotal = previousPledges 
      ? previousPledges.slice(0, -1).reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0)
      : 0;

    // Get all paid pledges for this project (including the new one)
    const { data: pledges, error } = await supabase
      .from("pledges")
      .select("amount")
      .eq("project_id", project_id)
      .eq("status", "paid");

    if (error) {
      console.error("Error fetching pledges for project:", error);
      return;
    }

    // Calculate total backed amount
    const totalBacked = pledges.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0);
    
    console.log(`Project ${project_id}: Total backed amount = ${totalBacked} (from ${pledges.length} pledges)`);
    
    // Check if funding goal was just reached
    await checkAndNotifyFundingGoalReached(project_id, previousTotal, totalBacked);
    
    // Note: We don't store this in the projects table as it's computed dynamically
    // This function is for logging and potential future use
    return totalBacked;
  } catch (err) {
    console.error("Error updating project backed amount:", err);
  }
};

// Initialize transaction: POST /api/payments/init
export const initPayment = async (req, res) => {
  try {
    const body = req.body || {};

    // Allow switching payment gateway (future feature)
    const gateway = body.gateway || "sslcommerz";
    if (gateway !== "sslcommerz") {
      const strategy = PaymentStrategyFactory.createStrategy(gateway, getConfigForGateway(gateway));
      paymentProcessor.setStrategy(strategy);
    }

    // Expect total_amount, tran_id, success_url, fail_url, cancel_url, ipn_url, product_name
    const data = {
      total_amount: body.total_amount,
      currency: body.currency || "BDT",
      tran_id: body.tran_id,
      success_url: body.success_url,
      fail_url: body.fail_url,
      cancel_url: body.cancel_url,
      ipn_url: body.ipn_url,
  // SSLCommerz requires a shipping_method value. For pledges/digital goods use "NO".
      shipping_method: body.shipping_method || "NO",
      product_name: body.product_name || "Product",
      product_category: body.product_category || "General",
      product_profile: body.product_profile || "general",
      cus_name: body.cus_name || "",
      cus_email: body.cus_email || "",
      cus_add1: body.cus_add1 || "",
      cus_city: body.cus_city || "",
      cus_country: body.cus_country || "",
      cus_phone: body.cus_phone || "",
    };

    // Basic validation to surface clear errors to the frontend instead of ambiguous gateway replies
    const missing = [];
    if (!data.total_amount || Number(data.total_amount) <= 0) missing.push("total_amount");
    if (!data.tran_id) missing.push("tran_id");
    if (!data.success_url) missing.push("success_url");
    if (!data.ipn_url) missing.push("ipn_url");
    if (!data.cus_phone) missing.push("cus_phone");
    if (missing.length > 0) {
      console.warn("initPayment: missing required init fields:", missing);
      return res.status(400).json({ error: "Missing required fields for payment init", missing });
    }

    // Log the payload (without secrets) so we can inspect what we send to SSLCommerz during debugging
    try {
      console.info("initPayment: sending payload to SSLCommerz:", JSON.stringify(data));
    } catch (e) {
      console.info("initPayment: sending payload (could not stringify)");
    }

    // Persist a short-lived payment session so we can resolve tran_id -> project/reward on callback.
    // This prevents missing project_id in redirects when the gateway doesn't preserve custom query params.
    try {
      const sessionRow = {
        tran_id: data.tran_id,
        project_id: body.project_id || null,
        user_id: body.user_id || null,
        reward_id: body.reward_id || null,
        amount: Number(data.total_amount) || null,
        return_url: body.return_url || null,
        backer_message: body.donor_message || null,
        created_at: new Date().toISOString(),
      };
      console.log("initPayment: Creating payment_session:", JSON.stringify(sessionRow, null, 2));
      
      const { data: sessData, error: sessErr } = await supabase
        .from("payment_sessions")
        .insert([sessionRow])
        .select();
      
      if (sessErr) {
        // Log detailed error but don't fail payment init
        console.error("initPayment: failed to persist payment session - ERROR DETAILS:", {
          error: sessErr,
          message: sessErr.message,
          details: sessErr.details,
          hint: sessErr.hint,
          code: sessErr.code
        });
        console.error("initPayment: payment_sessions table may not exist. Run the SQL migration!");
      } else {
        console.log("initPayment: payment_session created successfully:", JSON.stringify(sessData, null, 2));
      }
    } catch (e) {
      console.error("initPayment: exception while persisting session:", e);
    }

    // Use Strategy Pattern to process payment
    const result = await paymentProcessor.process(data);
    
    if (!result.success) {
      console.error("initPayment: payment processing failed", result.error);
      return res.status(500).json({ 
        error: result.error || "Payment processing failed" 
      });
    }

    // return gateway URL to frontend
    const gatewayUrl = result.gatewayUrl;
    if (!gatewayUrl) {
      console.error("initPayment: no gateway URL in response", result);
      return res.status(502).json({ 
        error: "No gateway URL returned from payment gateway", 
        response: result.response 
      });
    }

    return res.status(200).json({ 
      ...result.response, 
      GatewayPageURL: gatewayUrl 
    });
  } catch (err) {
    console.error("initPayment error:", err);
    return res.status(500).json({ error: err.message || "Failed to init payment" });
  }
};

// Validate transaction: POST /api/payments/validate
// Accepts { val_id, tran_id, project_id, user_id, reward_id, amount }
export const validatePayment = async (req, res) => {
  try {
    const { val_id, tran_id: body_tran, project_id: body_project_id, user_id: body_user_id, reward_id: body_reward_id, amount: body_amount } = req.body || {};
    if (!val_id) return res.status(400).json({ error: "val_id is required" });

    // Use Strategy Pattern to validate payment
    const result = await paymentProcessor.validate({ val_id });
    
    if (!result.success) {
      return res.status(400).json({ 
        ok: false, 
        error: result.error,
        validation: result.validation 
      });
    }

    const validation = result.validation;

  const status = validation?.status || validation?.status_code || validation?.status_message || null;

    // Basic check: treat as success if validation object contains status 'VALID' or 'VALIDATED' or status === 'VALID'
    const ok = (typeof status === "string" && status.toLowerCase().includes("valid")) || validation?.risk_level === 0 || validation?.status === "VALID";

    // Insert pledge if validated
    if (ok) {
      // Resolve tran_id and related metadata. Prefer values from request body, then validation response,
      // then look up a persisted payment_session inserted at init time.
      const tran = body_tran || validation?.tran_id || null;
      let project_id = body_project_id || null;
      let user_id = body_user_id || null;
      let reward_id = body_reward_id || null;
      let amount = body_amount ? Number(body_amount) : (validation?.amount ? Number(validation.amount) : 0);

      if (!project_id && tran) {
        try {
          const { data: sess } = await supabase.from("payment_sessions").select("project_id,user_id,reward_id,amount").eq("tran_id", tran).single();
          if (sess) {
            project_id = project_id || sess.project_id;
            user_id = user_id || sess.user_id;
            reward_id = reward_id || sess.reward_id;
            amount = amount || Number(sess.amount || 0);
          }
        } catch (e) {
          // ignore lookup errors
        }
      }
      // If project_id is still missing, but we have a reward_id, try to resolve the project
      if (!project_id && reward_id) {
        try {
          const { data: rewardRow, error: rewardErr } = await supabase.from("reward_table").select("project_id").eq("id", reward_id).single();
          if (!rewardErr && rewardRow && rewardRow.project_id) {
            project_id = rewardRow.project_id;
          }
        } catch (e) {
          // ignore
        }
      }
      // If we still don't have a project_id, we cannot persist the pledge safely.
      if (!project_id) {
        console.error("validatePayment: missing project_id after lookup, cannot persist pledge", { tran, reward_id, session_lookup: !!tran });
        return res.status(400).json({ error: "Missing project_id; pledge not persisted", tran_id: tran });
      }

      // Idempotency: if a pledge with this tran_id already exists, return it instead of inserting duplicate
      if (tran) {
        try {
          const { data: existing } = await supabase.from("pledges").select("*").eq("tran_id", tran).single();
          if (existing) {
            return res.status(200).json({ ok: true, validation, pledge: existing });
          }
        } catch (e) {
          // ignore
        }
      }

      // create a pledge row
      const pledgeRow = {
        project_id: project_id,
        user_id: user_id || null,
        reward_id: reward_id || null,
        tran_id: tran || null,
        amount: amount || 0,
        status: "paid",
      };

      const { data: pledgeData, error: pledgeError } = await supabase.from("pledges").insert([pledgeRow]).select();
      if (pledgeError) {
        console.error("pledge insert error:", pledgeError);
      }

      // If reward_id provided, increment backers and decrement available safely
      if (reward_id) {
        try {
          const { data: reward } = await supabase.from("reward_table").select("backers, available").eq("id", reward_id).single();
          if (reward) {
            const newBackers = (Number(reward.backers) || 0) + 1;
            const newAvailable = Number(reward.available) > 0 ? Number(reward.available) - 1 : 0;
            await supabase.from("reward_table").update({ backers: newBackers, available: newAvailable }).eq("id", reward_id);
          }
        } catch (e) {
          console.error("failed updating reward counts", e);
        }
      }

      // Update project backed amount (computed from pledges)
      await updateProjectBackedAmount(project_id);

      // Send notification to project owner using DESIGN PATTERNS
      if (project_id && user_id && amount) {
        try {
          // Get session data for backer_message
          const { data: sess } = await supabase.from("payment_sessions").select("backer_message").eq("tran_id", tran).single();
          const backerMessage = sess?.backer_message || null;
          
          const { data: project } = await supabase.from("main_projects").select("user_id, title").eq("id", project_id).single();
          if (project && project.user_id) {
            // Get backer info
            const { data: backer } = await supabase.from("users").select("full_name, email").eq("id", user_id).single();
            // Get creator info and preferences
            const { data: creator } = await supabase.from("users").select("email, full_name, notification_preferences").eq("id", project.user_id).single();
            
            // Parse notification preferences
            const prefs = creator?.notification_preferences || {};
            const channels = prefs.channels || ["in-app"];
            const wantsPledgeNotif = prefs.recommendations?.enabled !== false; // Default true
            
            // DESIGN PATTERN INTEGRATION: Factory + Decorator + Observer
            if (wantsPledgeNotif) {
              const message = `You received a new pledge of $${amount} from ${backer?.full_name || 'a supporter'}!`;
              const metadata = {
                projectId: project_id,
                projectTitle: project.title,
                donorId: user_id,
                donorName: backer?.full_name || 'Anonymous',
                donorEmail: backer?.email,
                amount: amount,
                donorMessage: backerMessage,
                transactionId: tran,
                type: 'pledge',
                subject: 'New Pledge Received!',
              };

              // Send notification through all preferred channels
              for (const channel of channels) {
                try {
                  // FACTORY PATTERN: Create notification for specific channel
                  const notification = NotificationFactory.createNotification(
                    channel,
                    creator,
                    message,
                    metadata
                  );

                  // DECORATOR PATTERN: Add personalization, priority, tracking, and retry
                  const enhancedNotification = new NotificationBuilder(notification)
                    .withPersonalization(creator.full_name || 'Creator')
                    .withPriority('high') // Pledges are high priority
                    .withFormatting({ emoji: '💰' })
                    .withTracking()
                    .withRetry(3, 2000) // Retry 3 times with 2 second delay
                    .build();

                  const result = await enhancedNotification.send();
                  console.log(`Notification sent via ${channel}:`, result);
                } catch (channelError) {
                  console.error(`Failed to send notification via ${channel}:`, channelError);
                }
              }

              // OBSERVER PATTERN: Notify all project subscribers about new donation
              try {
                await observerManager.notifyProjectEvent(project_id, 'new_donation', {
                  projectTitle: project.title,
                  donorName: backer?.full_name || 'Anonymous',
                  amount: amount,
                  rewardTitle: reward_id ? 'Reward Tier' : null,
                });
                console.log('Project subscribers notified about new donation');
              } catch (observerError) {
                console.error('Failed to notify project subscribers:', observerError);
              }
            }
          }
        } catch (notifErr) {
          console.error("Failed to send notifications:", notifErr);
          // Don't fail the payment validation if notifications fail
        }
      }

      return res.status(200).json({ ok: true, validation, pledge: pledgeData?.[0] ?? null });
    }

    return res.status(400).json({ ok: false, validation });
  } catch (err) {
    console.error("validatePayment error:", err);
    return res.status(500).json({ error: err.message || "Validation failed" });
  }
};

// Success redirect handler: GET /api/payments/success
// SSLCommerz will redirect here with query params including val_id and tran_id
export const successHandler = async (req, res) => {
  try {
    // SSLCommerz may send data via query params (GET) or form body (POST).
    const params = req.method === "GET" ? req.query || {} : req.body || {};
    const { val_id, tran_id, project_id, user_id, reward_id, amount } = params;
    
    console.log("successHandler: received params:", { 
      val_id, 
      tran_id, 
      project_id, 
      user_id, 
      reward_id, 
      amount,
      return_url: params.return_url 
    });
    
    if (!val_id) return res.status(400).send("val_id required");

    // Use Strategy Pattern to validate payment
    const gatewayConfig = getGatewayConfig('sslcommerz');
    const strategy = PaymentStrategyFactory.createStrategy('sslcommerz', gatewayConfig);
    const processor = new PaymentProcessor(strategy);
    const validationResult = await processor.validate({ val_id });
    const validation = validationResult.validation;

    // treat as success when validation indicates valid
    const status = validation?.status || validation?.status_code || null;
    const ok = (typeof status === "string" && status.toLowerCase().includes("valid")) || validation?.risk_level === 0 || validation?.status === "VALID";

    if (ok) {
      // Resolve tran_id and metadata similar to validatePayment
      const tran = tran_id || validation?.tran_id || null;
      let project_id_res = project_id || null;
      let user_id_res = user_id || null;
      let reward_id_res = reward_id || null;
      let amount_res = amount ? Number(amount) : (validation?.amount ? Number(validation.amount) : 0);

      if (!project_id_res && tran) {
        console.log("successHandler: Looking up payment_session for tran_id:", tran);
        try {
          const { data: sess, error: sessErr } = await supabase.from("payment_sessions").select("project_id,user_id,reward_id,amount").eq("tran_id", tran).single();
          console.log("successHandler: payment_session lookup result:", { sess, error: sessErr });
          if (sess) {
            project_id_res = project_id_res || sess.project_id;
            user_id_res = user_id_res || sess.user_id;
            reward_id_res = reward_id_res || sess.reward_id;
            amount_res = amount_res || Number(sess.amount || 0);
            console.log("successHandler: Updated from session:", { project_id_res, user_id_res, reward_id_res, amount_res });
          }
        } catch (e) {
          console.error("successHandler: Error looking up payment_session:", e);
        }
      }
      // Also try to read return_url from the persisted session in case the gateway
      // stripped custom query params during redirect.
      let session_return_url = null;
      if (tran) {
        try {
          const { data: sess2, error: sessErr2 } = await supabase.from("payment_sessions").select("return_url").eq("tran_id", tran).single();
          if (!sessErr2 && sess2 && sess2.return_url) session_return_url = sess2.return_url;
        } catch (e) {
          // ignore
        }
      }

      // If project still missing but we have a reward id, try to resolve project via reward_table
      if (!project_id_res && reward_id_res) {
        try {
          const { data: rewardRow, error: rewardErr } = await supabase.from("reward_table").select("project_id").eq("id", reward_id_res).single();
          if (!rewardErr && rewardRow && rewardRow.project_id) {
            project_id_res = rewardRow.project_id;
          }
        } catch (e) {
          // ignore
        }
      }

      // If still missing, attempt to parse a project id from a return_url (if present in params)
      if (!project_id_res) {
        const possibleReturn = params.return_url || params.returnUrl || params.return || null;
        if (possibleReturn && typeof possibleReturn === 'string') {
          try {
            // common frontend route: /project/<id> - support UUIDs with hyphens
            const m1 = possibleReturn.match(/\/project\/(?:detail\/)?([a-zA-Z0-9_-]+)/);
            if (m1 && m1[1]) {
              project_id_res = m1[1];
              console.log("successHandler: Extracted project_id from return_url path:", project_id_res);
            }
            const m2 = possibleReturn.match(/[?&](?:projectId|project_id|id)=([a-zA-Z0-9_-]+)/);
            if (!project_id_res && m2 && m2[1]) {
              project_id_res = m2[1];
              console.log("successHandler: Extracted project_id from return_url query:", project_id_res);
            }
          } catch (e) {
            console.error("successHandler: Error parsing return_url:", e);
          }
        }
      }

      // If we still don't have a project id, avoid inserting and show fallback
      if (!project_id_res) {
        console.error("successHandler: missing project_id after all lookup attempts", { 
          tran, 
          reward_id: reward_id_res, 
          return_url: params.return_url || params.returnUrl || null,
          params_project_id: params.project_id,
          all_params: params
        });
        // Show user-friendly HTML indicating payment succeeded but server couldn't record pledge
        const msg = `<!doctype html><html><body><h1>Payment Received</h1><p>Transaction ${tran} succeeded, but we couldn't associate it with a project so it was not recorded.</p><p>Please contact support or retry from the project page.</p><p><small>Debug: project_id from params: ${params.project_id}, return_url: ${params.return_url}</small></p></body></html>`;
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(msg);
      }

      // Idempotency: return existing pledge if tran already stored
      if (tran) {
        try {
          const { data: existing } = await supabase.from("pledges").select("*").eq("tran_id", tran).single();
          if (existing) {
            console.log("successHandler: Pledge already exists, redirecting user");
            
            // Redirect to return_url or frontend
            const returnUrl = params.return_url || params.returnUrl || params.return || session_return_url || null;
            if (returnUrl) {
              const separator = returnUrl.includes("?") ? "&" : "?";
              const redirectTo = `${returnUrl}${separator}payment_status=success&tran_id=${encodeURIComponent(tran)}`;
              return res.redirect(redirectTo);
            }
            
            // Fallback: redirect to frontend success page
            const frontendSuccess = process.env.FRONTEND_SUCCESS_URL || "http://localhost:5173/payment-success";
            return res.redirect(frontendSuccess);
          }
        } catch (e) {
          // ignore
        }
      }

      // Insert pledge
      const pledgeRow = {
        project_id: project_id_res,
        user_id: user_id_res || null,
        reward_id: reward_id_res || null,
        tran_id: tran || null,
        amount: amount_res || 0,
        status: "paid",
      };

      const { data: pledgeData, error: pledgeError } = await supabase.from("pledges").insert([pledgeRow]).select();
      if (pledgeError) console.error("pledge insert error:", pledgeError);

      if (reward_id_res) {
        try {
          const { data: reward } = await supabase.from("reward_table").select("backers, available").eq("id", reward_id_res).single();
          if (reward) {
            const newBackers = (Number(reward.backers) || 0) + 1;
            const newAvailable = Number(reward.available) > 0 ? Number(reward.available) - 1 : 0;
            await supabase.from("reward_table").update({ backers: newBackers, available: newAvailable }).eq("id", reward_id_res);
          }
        } catch (e) {
          console.error("failed updating reward counts", e);
        }
      }

      // Update project backed amount (computed from pledges)
      await updateProjectBackedAmount(project_id_res);

      // Send notification to project owner
      if (project_id_res && user_id_res && amount_res) {
        try {
          // Get backer_message from payment_sessions
          const { data: sess } = await supabase.from("payment_sessions").select("backer_message").eq("tran_id", tran).single();
          const backerMessage = sess?.backer_message || null;
          
          // Get project owner
          const { data: project } = await supabase
            .from("main_projects")
            .select("user_id, title")
            .eq("id", project_id_res)
            .single();
          
          if (project && project.user_id) {
            // Get backer info
            const { data: backer } = await supabase.from("users").select("full_name").eq("id", user_id_res).single();
            // Get creator email and preferences
            const { data: creator } = await supabase.from("users").select("email, full_name").eq("id", project.user_id).single();
            const { data: prefs } = await supabase.from("notification_preferences").select("*").eq("user_id", project.user_id).single();
            
            // Check if user wants pledge notifications (default true if no preferences)
            const wantsPledgeNotif = prefs ? prefs.pledge_notifications : true;
            const wantsEmail = prefs ? prefs.email_enabled : true;
            
            // Create in-app notification if enabled
            if (wantsPledgeNotif) {
              await supabase.from("notifications").insert([{
                project_id: project_id_res,
                sender_id: user_id_res,
                receiver_id: project.user_id,
                amount: amount_res,
                message: `You received a new pledge of $${amount_res} from a supporter!`,
                backer_message: backerMessage,
              }]);
              console.log(`Notification sent to project owner ${project.user_id} for pledge of $${amount_res}`);
            }
            
            // Send email notification if enabled
            if (creator?.email && wantsEmail && wantsPledgeNotif) {
              await EmailService.sendPledgeNotification({
                recipientEmail: creator.email,
                recipientName: creator.full_name || 'Creator',
                donorName: backer?.full_name || 'Anonymous',
                amount: amount_res,
                projectTitle: project.title || 'Your Project',
                donorMessage: backerMessage,
              });
              console.log(`Email notification sent to ${creator.email}`);
            } else if (!wantsEmail) {
              console.log(`Email notification skipped - user disabled email notifications`);
            }
          }
        } catch (notifErr) {
          console.error("Failed to send notification:", notifErr);
          // Don't fail the payment if notification fails
        }
      }

      // Prefer a return_url supplied by the gateway redirect or persisted in session.
      // The frontend includes the original project page in `return_url` when calling
      // the init endpoint; some gateways drop custom params so we persisted it earlier.
      const returnUrl = params.return_url || params.returnUrl || params.return || session_return_url || null;
      
      console.log("successHandler: returnUrl resolution:", {
        params_return_url: params.return_url,
        params_returnUrl: params.returnUrl,
        params_return: params.return,
        session_return_url: session_return_url,
        final_returnUrl: returnUrl
      });
      
      if (returnUrl) {
        // Append status and tran_id so frontend can show a toast and refresh state
        const tran_for_redirect = (pledgeRow && pledgeRow.tran_id) || (validation && validation.tran_id) || (params.tran_id || params.tranId || params.tran || "");
        const separator = returnUrl.includes("?") ? "&" : "?";
        const redirectTo = `${returnUrl}${separator}payment_status=success&tran_id=${encodeURIComponent(tran_for_redirect)}`;
        console.log("successHandler: Redirecting to:", redirectTo);
        return res.redirect(redirectTo);
      }

      // Fallback: if we have project_id, construct the project page URL
      if (project_id_res) {
        const frontendBase = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || "http://localhost:8080";
        const projectUrl = `${frontendBase}/project/${project_id_res}?payment_status=success&tran_id=${encodeURIComponent(tran || "")}`;
        console.log("successHandler: Fallback redirect to project page:", projectUrl);
        return res.redirect(projectUrl);
      }

      // Redirect to frontend success page if configured. If no FRONTEND_SUCCESS_URL is set
      // (common during local development) return a simple HTML confirmation so the
      // user still sees a success page even if the frontend dev server isn't running.
      const frontendSuccess = process.env.FRONTEND_SUCCESS_URL || "http://localhost:8080/payment-success";
      if (frontendSuccess && frontendSuccess.length > 0) {
        return res.redirect(frontendSuccess);
      }

      // Fallback: send a minimal HTML confirmation with pledge details and a link to
      // the expected frontend route so developers can still see the result.
      const defaultFront = "http://localhost:8080/payment-success";
      const targetFront = frontendSuccess && frontendSuccess.length > 0 ? frontendSuccess : defaultFront;

      // HTML fallback that attempts to go back in history, and falls back to the
      // frontend success page if that fails. Also provides buttons for the user.
      const pledgeSummary = `<!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Payment Successful</title>
          <style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.4;padding:20px}button,a{margin-right:12px;padding:8px 12px;border-radius:6px;text-decoration:none;border:1px solid #ddd;background:#f6f6f7;color:#111}h1{color:green}</style>
        </head>
        <body>
          <h1>Payment Successful</h1>
          <p>Transaction ID: ${pledgeRow.tran_id}</p>
          <p>Amount: ${pledgeRow.amount}</p>
          <p>Project: ${project_id_res || 'N/A'}</p>
          <p>Reward: ${reward_id_res || 'N/A'}</p>
          <p>Return URL: ${session_return_url || (params.return_url || params.returnUrl || params.return) || 'N/A'}</p>
          <p>
            <button id="backBtn">Return to previous page</button>
            <a id="openSuccess" href="${targetFront}">Open frontend payment-success page</a>
            ${returnUrl ? `<a id="openProject" href="${returnUrl}">Open project page</a>` : ""}
          </p>
          <script>
            // First try to navigate back (useful when browser history contains the app page).
            function tryBack(){
              try{ window.history.back(); }catch(e){}
            }
            document.getElementById('backBtn').addEventListener('click', tryBack);

            // Attempt an automatic back, then fallback to frontend success after short delays.
            setTimeout(function(){ tryBack(); }, 800);
            setTimeout(function(){ window.location.href = '${targetFront}'; }, 3000);
          </script>
        </body>
        </html>`;

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(pledgeSummary);
    }

  // On failure, redirect to a failure page (frontend) and include status
  const frontendFail = process.env.FRONTEND_FAIL_URL || "http://localhost:5173/payment-fail";
  const failSep = frontendFail.includes("?") ? "&" : "?";
  const failRedirect = `${frontendFail}${failSep}payment_status=failed`;
  return res.redirect(failRedirect);
  } catch (err) {
    console.error("successHandler error:", err);
    return res.status(500).send("Server error");
  }
};

/**
 * Get all projects backed by a user
 */
export const getBackedProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Get all successful pledges by this user with project details
    const { data: pledges, error } = await supabase
      .from("pledges")
      .select(`
        id,
        amount,
        created_at,
        project_id,
        tran_id,
        status,
        main_projects (
          id,
          title,
          tagline,
          image_url,
          category,
          funding_goal,
          funding_deadline,
          location,
          user_id
        )
      `)
      .eq("user_id", userId)
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching backed projects:", error);
      return res.status(500).json({ error: "Failed to fetch backed projects" });
    }

    // Get backer messages from payment_sessions
    const tranIds = pledges.map(p => p.tran_id).filter(Boolean);
    let sessions = [];
    if (tranIds.length > 0) {
      const { data: sessionData } = await supabase
        .from("payment_sessions")
        .select("tran_id, backer_message")
        .in("tran_id", tranIds);
      sessions = sessionData || [];
    }

    // Create a map of tran_id to backer_message
    const messageMap = sessions.reduce((acc, session) => {
      acc[session.tran_id] = session.backer_message;
      return acc;
    }, {});

    // Format the response
    const backedProjects = pledges.map(pledge => ({
      id: pledge.id,
      amount: pledge.amount,
      created_at: pledge.created_at,
      project_id: pledge.project_id,
      backer_message: messageMap[pledge.tran_id] || null,
      payment_status: pledge.status,
      project: pledge.main_projects ? {
        id: pledge.main_projects.id,
        title: pledge.main_projects.title,
        tagline: pledge.main_projects.tagline,
        image_url: pledge.main_projects.image_url,
        category: pledge.main_projects.category,
        fundingGoal: pledge.main_projects.funding_goal,
        fundingDeadline: pledge.main_projects.funding_deadline,
        location: pledge.main_projects.location,
        creator_id: pledge.main_projects.user_id
      } : null
    }));

    return res.status(200).json({ 
      success: true,
      backedProjects,
      total: backedProjects.length 
    });

  } catch (error) {
    console.error("Error in getBackedProjects:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};

// IPN endpoint (SSLCommerz server-to-server notification)
export const ipnHandler = async (req, res) => {
  try {
    // SSLCommerz may send values in body (form-encoded). We accept val_id from body.
    const { val_id, tran_id, status } = req.body || {};
    console.log("IPN received:", { val_id, tran_id, status, body: req.body });
    
    if (!val_id) return res.status(400).send("val_id required");

    // Use Strategy Pattern to validate payment
    const gatewayConfig = getGatewayConfig('sslcommerz');
    const strategy = PaymentStrategyFactory.createStrategy('sslcommerz', gatewayConfig);
    const processor = new PaymentProcessor(strategy);
    const validationResult = await processor.validate({ val_id });
    const validation = validationResult.validation;

    console.log("IPN validation response:", validation);

    // Check if payment is valid
    const validStatus = validation?.status || validation?.status_code || null;
    const isValid = (typeof validStatus === "string" && validStatus.toLowerCase().includes("valid")) || 
                    validation?.risk_level === 0 || 
                    validation?.status === "VALID";

    if (isValid) {
      // Extract transaction details
      const tran = tran_id || validation?.tran_id || null;
      
      // Try to get project details from payment session
      let project_id = null;
      let user_id = null;
      let reward_id = null;
      let amount = validation?.amount ? Number(validation.amount) : 0;

      if (tran) {
        try {
          const { data: sess } = await supabase
            .from("payment_sessions")
            .select("project_id,user_id,reward_id,amount")
            .eq("tran_id", tran)
            .single();
          
          if (sess) {
            project_id = sess.project_id;
            user_id = sess.user_id;
            reward_id = sess.reward_id;
            amount = amount || Number(sess.amount || 0);
          }
        } catch (e) {
          console.warn("IPN: Could not fetch payment session:", e);
        }
      }

      // Check if pledge already exists (idempotency)
      if (tran) {
        try {
          const { data: existing } = await supabase
            .from("pledges")
            .select("*")
            .eq("tran_id", tran)
            .single();
          
          if (existing) {
            console.log("IPN: Pledge already exists for tran_id:", tran);
            return res.status(200).json({ received: true, message: "Pledge already recorded", validation });
          }
        } catch (e) {
          // No existing pledge, continue to create
        }
      }

      // Create pledge if we have project_id
      if (project_id && tran) {
        const pledgeRow = {
          project_id: project_id,
          user_id: user_id || null,
          reward_id: reward_id || null,
          tran_id: tran,
          amount: amount || 0,
          status: "paid",
        };

        const { data: pledgeData, error: pledgeError } = await supabase
          .from("pledges")
          .insert([pledgeRow])
          .select();

        if (pledgeError) {
          console.error("IPN: Pledge insert error:", pledgeError);
        } else {
          console.log("IPN: Pledge created successfully:", pledgeData[0]);

          // Update reward counts if applicable
          if (reward_id) {
            try {
              const { data: reward } = await supabase
                .from("reward_table")
                .select("backers, available")
                .eq("id", reward_id)
                .single();
              
              if (reward) {
                const newBackers = (Number(reward.backers) || 0) + 1;
                const newAvailable = Number(reward.available) > 0 ? Number(reward.available) - 1 : 0;
                await supabase
                  .from("reward_table")
                  .update({ backers: newBackers, available: newAvailable })
                  .eq("id", reward_id);
              }
            } catch (e) {
              console.error("IPN: Failed updating reward counts", e);
            }
          }

          // Update project backed amount
          await updateProjectBackedAmount(project_id);

          // Send notification to project owner
          try {
            // Get backer_message from payment_sessions
            const { data: sess } = await supabase.from("payment_sessions").select("backer_message").eq("tran_id", tran).single();
            const backerMessage = sess?.backer_message || null;
            
            const { data: project } = await supabase.from("main_projects").select("user_id, title").eq("id", project_id).single();
            if (project && project.user_id && user_id) {
              // Get backer info
              const { data: backer } = await supabase.from("users").select("full_name").eq("id", user_id).single();
              // Get creator email and preferences
              const { data: creator } = await supabase.from("users").select("email, full_name").eq("id", project.user_id).single();
              const { data: prefs } = await supabase.from("notification_preferences").select("*").eq("user_id", project.user_id).single();
              
              // Check if user wants pledge notifications (default true if no preferences)
              const wantsPledgeNotif = prefs ? prefs.pledge_notifications : true;
              const wantsEmail = prefs ? prefs.email_enabled : true;
              
              // Create in-app notification if enabled
              if (wantsPledgeNotif) {
                await supabase.from("notifications").insert([{
                  project_id: project_id,
                  sender_id: user_id,
                  receiver_id: project.user_id,
                  amount: amount,
                  message: `You received a new pledge of $${amount} from a supporter!`,
                  backer_message: backerMessage,
                }]);
                console.log(`IPN: Notification sent to project owner ${project.user_id}`);
              }
              
              // Send email notification if enabled
              if (creator?.email && wantsEmail && wantsPledgeNotif) {
                await EmailService.sendPledgeNotification({
                  recipientEmail: creator.email,
                  recipientName: creator.full_name || 'Creator',
                  donorName: backer?.full_name || 'Anonymous',
                  amount: amount,
                  projectTitle: project.title || 'Your Project',
                  donorMessage: backerMessage,
                });
                console.log(`IPN: Email notification sent to ${creator.email}`);
              } else if (!wantsEmail) {
                console.log(`IPN: Email notification skipped - user disabled email notifications`);
              }
            }
          } catch (notifErr) {
            console.error("IPN: Failed to send notification:", notifErr);
          }
        }
      } else {
        console.warn("IPN: Missing project_id or tran_id, cannot create pledge");
      }
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true, validation });
  } catch (err) {
    console.error("ipnHandler error:", err);
    return res.status(500).json({ error: err.message || "IPN error" });
  }
};

/**
 * Helper function to get configuration for different payment gateways
 * Enables strategy pattern's runtime gateway switching
 */
function getConfigForGateway(gateway) {
  const configs = {
    sslcommerz: {
      storeId: process.env.SSLCZ_STORE_ID,
      storePass: process.env.SSLCZ_STORE_PASS,
      isLive: false,
    },
    stripe: {
      apiKey: process.env.STRIPE_API_KEY,
    },
    // Add more gateways as needed
  };
  return configs[gateway.toLowerCase()] || {};
}

export default {
  initPayment,
  validatePayment,
  successHandler,
  ipnHandler,
};
/*
const express = require('express')
const app = express()

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = '<your_store_id>'
const store_passwd = '<your_store_password>'
const is_live = false //true for live, false for sandbox

const port = 3030

//sslcommerz init
app.get('/init', (req, res) => {
    const data = {
        total_amount: 100,
        currency: 'BDT',
        tran_id: 'REF123', // use unique tran_id for each api call
        success_url: 'http://localhost:3030/success',
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        res.redirect(GatewayPageURL)
        console.log('Redirecting to: ', GatewayPageURL)
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
*/
