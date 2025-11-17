/**
 * Strategy Pattern for Payment Processing
 * Allows different payment gateway implementations without changing client code
 */

// Payment Strategy Interface
class PaymentStrategy {
  async processPayment(paymentData) {
    throw new Error("processPayment() must be implemented by subclass");
  }

  async validatePayment(validationData) {
    throw new Error("validatePayment() must be implemented by subclass");
  }

  async refundPayment(refundData) {
    throw new Error("refundPayment() must be implemented by subclass");
  }
}

// SSLCommerz Strategy Implementation
class SSLCommerzStrategy extends PaymentStrategy {
  constructor(storeId, storePass, isLive = false) {
    super();
    this.storeId = storeId;
    this.storePass = storePass;
    this.isLive = isLive;
  }

  async processPayment(paymentData) {
    try {
      const mod = await import("sslcommerz-lts");
      const SSLCommerzPayment = mod.default || mod;
      const sslcz = new SSLCommerzPayment(this.storeId, this.storePass, this.isLive);

      const response = await sslcz.init(paymentData);
      return {
        success: true,
        gatewayUrl: response?.GatewayPageURL || response?.gatewayPageURL,
        response: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async validatePayment(validationData) {
    try {
      const mod = await import("sslcommerz-lts");
      const SSLCommerzPayment = mod.default || mod;
      const sslcz = new SSLCommerzPayment(this.storeId, this.storePass, this.isLive);

      const validation = await sslcz.validate({ val_id: validationData.val_id });
      const status = validation?.status || validation?.status_code || null;
      const isValid = 
        (typeof status === "string" && status.toLowerCase().includes("valid")) ||
        validation?.risk_level === 0 ||
        validation?.status === "VALID";

      return {
        success: isValid,
        validation: validation,
        amount: validation?.amount || 0,
        tran_id: validation?.tran_id || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async refundPayment(refundData) {
    // SSLCommerz refund implementation
    console.log("SSLCommerz refund not implemented yet");
    return { success: false, message: "Refund not supported yet" };
  }
}

// Stripe Strategy (Placeholder for future implementation)
class StripeStrategy extends PaymentStrategy {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async processPayment(paymentData) {
    // Stripe payment processing would go here
    console.log("Stripe payment processing - To be implemented");
    return { success: false, message: "Stripe not implemented yet" };
  }

  async validatePayment(validationData) {
    console.log("Stripe validation - To be implemented");
    return { success: false, message: "Stripe not implemented yet" };
  }

  async refundPayment(refundData) {
    console.log("Stripe refund - To be implemented");
    return { success: false, message: "Stripe not implemented yet" };
  }
}

// Payment Context - Uses strategy pattern
class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async process(paymentData) {
    if (!this.strategy) {
      throw new Error("Payment strategy not set");
    }
    return await this.strategy.processPayment(paymentData);
  }

  async validate(validationData) {
    if (!this.strategy) {
      throw new Error("Payment strategy not set");
    }
    return await this.strategy.validatePayment(validationData);
  }

  async refund(refundData) {
    if (!this.strategy) {
      throw new Error("Payment strategy not set");
    }
    return await this.strategy.refundPayment(refundData);
  }
}

// Factory to create payment strategies
class PaymentStrategyFactory {
  static createStrategy(type, config) {
    switch (type.toLowerCase()) {
      case "sslcommerz":
        return new SSLCommerzStrategy(
          config.storeId,
          config.storePass,
          config.isLive
        );
      case "stripe":
        return new StripeStrategy(config.apiKey);
      default:
        throw new Error(`Unknown payment strategy: ${type}`);
    }
  }
}

export {
  PaymentStrategy,
  SSLCommerzStrategy,
  StripeStrategy,
  PaymentProcessor,
  PaymentStrategyFactory,
};
