import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DatabaseClient from '../src/config/DatabaseClient.js';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    storage: vi.fn(),
  })),
}));

describe('DatabaseClient - Singleton Pattern', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    DatabaseClient.instance = null;
  });

  it('should create only one instance (Singleton)', () => {
    const instance1 = DatabaseClient.getInstance();
    const instance2 = DatabaseClient.getInstance();
    
    expect(instance1).toBe(instance2);
    expect(instance1).toBeInstanceOf(DatabaseClient);
  });

  it('should return the same client from multiple getInstance calls', () => {
    const instance1 = DatabaseClient.getInstance();
    const instance2 = DatabaseClient.getInstance();
    
    const client1 = instance1.getClient();
    const client2 = instance2.getClient();
    
    expect(client1).toBe(client2);
  });

  it('should throw error if Supabase credentials are missing', () => {
    // Temporarily remove environment variables
    const originalUrl = process.env.SUPABASE_URL;
    const originalKey = process.env.SUPABASE_KEY;
    
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
    
    // Reset singleton
    DatabaseClient.instance = null;
    
    expect(() => {
      new DatabaseClient();
    }).toThrow('Missing Supabase credentials');
    
    // Restore environment variables
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_KEY = originalKey;
  });

  it('should return a valid client object', () => {
    const instance = DatabaseClient.getInstance();
    const client = instance.getClient();
    
    expect(client).toBeDefined();
    expect(typeof client).toBe('object');
  });

  it('should maintain instance across multiple requires', () => {
    const instance1 = DatabaseClient.getInstance();
    
    // Simulate a new require
    const instance2 = DatabaseClient.getInstance();
    
    expect(instance1).toBe(instance2);
  });
});
