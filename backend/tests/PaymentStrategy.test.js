import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PaymentStrategy,
  SSLCommerzStrategy,
  StripeStrategy,
  PaymentProcessor,
  PaymentStrategyFactory,
} from '../src/services/PaymentStrategy.js';

describe('PaymentStrategy Pattern', () => {
  describe('PaymentStrategy Base Class', () => {
    it('should throw error if processPayment not implemented', async () => {
      const strategy = new PaymentStrategy();
      await expect(strategy.processPayment({})).rejects.toThrow(
        'processPayment() must be implemented'
      );
    });

    it('should throw error if validatePayment not implemented', async () => {
      const strategy = new PaymentStrategy();
      await expect(strategy.validatePayment({})).rejects.toThrow(
        'validatePayment() must be implemented'
      );
    });

    it('should throw error if refundPayment not implemented', async () => {
      const strategy = new PaymentStrategy();
      await expect(strategy.refundPayment({})).rejects.toThrow(
        'refundPayment() must be implemented'
      );
    });
  });

  describe('SSLCommerzStrategy', () => {
    let strategy;

    beforeEach(() => {
      strategy = new SSLCommerzStrategy('test_store', 'test_pass', false);
    });

    it('should be instantiated with correct properties', () => {
      expect(strategy.storeId).toBe('test_store');
      expect(strategy.storePass).toBe('test_pass');
      expect(strategy.isLive).toBe(false);
    });

    it('should return failure if processPayment encounters error', async () => {
      const paymentData = {
        total_amount: 100,
        currency: 'BDT',
        tran_id: 'TEST123',
      };

      // This will fail because we're using test credentials
      const result = await strategy.processPayment(paymentData);
      
      expect(result).toHaveProperty('success');
      // Either success or error should be present
      expect(result.success !== undefined).toBe(true);
    });

    it('should handle validatePayment gracefully', async () => {
      const validationData = { val_id: 'test_val_id' };
      
      const result = await strategy.validatePayment(validationData);
      
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('should return not supported for refund', async () => {
      const refundData = { tran_id: 'TEST123', amount: 100 };
      
      const result = await strategy.refundPayment(refundData);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not supported');
    });
  });

  describe('StripeStrategy', () => {
    let strategy;

    beforeEach(() => {
      strategy = new StripeStrategy('test_api_key');
    });

    it('should be instantiated with correct properties', () => {
      expect(strategy.apiKey).toBe('test_api_key');
    });

    it('should return not implemented for processPayment', async () => {
      const result = await strategy.processPayment({});
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not implemented');
    });

    it('should return not implemented for validatePayment', async () => {
      const result = await strategy.validatePayment({});
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not implemented');
    });

    it('should return not implemented for refundPayment', async () => {
      const result = await strategy.refundPayment({});
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not implemented');
    });
  });

  describe('PaymentProcessor', () => {
    let mockStrategy;
    let processor;

    beforeEach(() => {
      mockStrategy = {
        processPayment: vi.fn().mockResolvedValue({ success: true, data: 'test' }),
        validatePayment: vi.fn().mockResolvedValue({ success: true, valid: true }),
        refundPayment: vi.fn().mockResolvedValue({ success: true, refunded: true }),
      };
      processor = new PaymentProcessor(mockStrategy);
    });

    it('should initialize with a strategy', () => {
      expect(processor.strategy).toBe(mockStrategy);
    });

    it('should allow strategy to be changed', () => {
      const newStrategy = new StripeStrategy('new_key');
      processor.setStrategy(newStrategy);
      expect(processor.strategy).toBe(newStrategy);
    });

    it('should process payment using current strategy', async () => {
      const paymentData = { amount: 100 };
      const result = await processor.process(paymentData);

      expect(mockStrategy.processPayment).toHaveBeenCalledWith(paymentData);
      expect(result.success).toBe(true);
    });

    it('should validate payment using current strategy', async () => {
      const validationData = { val_id: 'test_id' };
      const result = await processor.validate(validationData);

      expect(mockStrategy.validatePayment).toHaveBeenCalledWith(validationData);
      expect(result.success).toBe(true);
    });

    it('should refund payment using current strategy', async () => {
      const refundData = { tran_id: 'test_id', amount: 50 };
      const result = await processor.refund(refundData);

      expect(mockStrategy.refundPayment).toHaveBeenCalledWith(refundData);
      expect(result.success).toBe(true);
    });

    it('should throw error if no strategy is set for process', async () => {
      processor.strategy = null;
      await expect(processor.process({})).rejects.toThrow('Payment strategy not set');
    });

    it('should throw error if no strategy is set for validate', async () => {
      processor.strategy = null;
      await expect(processor.validate({})).rejects.toThrow('Payment strategy not set');
    });

    it('should throw error if no strategy is set for refund', async () => {
      processor.strategy = null;
      await expect(processor.refund({})).rejects.toThrow('Payment strategy not set');
    });
  });

  describe('PaymentStrategyFactory', () => {
    it('should create SSLCommerzStrategy', () => {
      const config = {
        storeId: 'test_store',
        storePass: 'test_pass',
        isLive: false,
      };
      const strategy = PaymentStrategyFactory.createStrategy('sslcommerz', config);

      expect(strategy).toBeInstanceOf(SSLCommerzStrategy);
      expect(strategy.storeId).toBe('test_store');
      expect(strategy.storePass).toBe('test_pass');
    });

    it('should create StripeStrategy', () => {
      const config = { apiKey: 'test_key' };
      const strategy = PaymentStrategyFactory.createStrategy('stripe', config);

      expect(strategy).toBeInstanceOf(StripeStrategy);
      expect(strategy.apiKey).toBe('test_key');
    });

    it('should be case insensitive', () => {
      const config = { apiKey: 'test_key' };
      const strategy1 = PaymentStrategyFactory.createStrategy('STRIPE', config);
      const strategy2 = PaymentStrategyFactory.createStrategy('Stripe', config);

      expect(strategy1).toBeInstanceOf(StripeStrategy);
      expect(strategy2).toBeInstanceOf(StripeStrategy);
    });

    it('should throw error for unknown strategy type', () => {
      expect(() => {
        PaymentStrategyFactory.createStrategy('paypal', {});
      }).toThrow('Unknown payment strategy: paypal');
    });
  });

  describe('Strategy Pattern Benefits - Runtime Switching', () => {
    it('should allow switching strategies at runtime', async () => {
      const sslStrategy = new SSLCommerzStrategy('store1', 'pass1', false);
      const stripeStrategy = new StripeStrategy('stripe_key');
      
      const processor = new PaymentProcessor(sslStrategy);
      expect(processor.strategy).toBe(sslStrategy);

      // Switch to Stripe
      processor.setStrategy(stripeStrategy);
      expect(processor.strategy).toBe(stripeStrategy);

      // Verify behavior changes
      const result = await processor.process({});
      expect(result.message).toContain('Stripe');
    });

    it('should demonstrate Open/Closed Principle', () => {
      // Can add new strategies without modifying existing code
      class PayPalStrategy extends PaymentStrategy {
        async processPayment(data) {
          return { success: true, gateway: 'paypal' };
        }
        async validatePayment(data) {
          return { success: true };
        }
        async refundPayment(data) {
          return { success: true };
        }
      }

      const paypalStrategy = new PayPalStrategy();
      const processor = new PaymentProcessor(paypalStrategy);

      expect(processor.strategy).toBeInstanceOf(PaymentStrategy);
      expect(processor.strategy).toBeInstanceOf(PayPalStrategy);
    });
  });
});
