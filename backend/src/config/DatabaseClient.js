import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

class DatabaseClient {
  static instance = null;
  client = null;

  constructor() {
    if (DatabaseClient.instance) {
      return DatabaseClient.instance;
    }
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    this.client = createClient(supabaseUrl, supabaseKey);
    DatabaseClient.instance = this;
  }

  static getInstance() {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  getClient() {
    return this.client;
  }
}

export default DatabaseClient;
