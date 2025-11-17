import DatabaseClient from "../config/DatabaseClient.js";

class ProjectRepository {
  constructor() {
    this.db = DatabaseClient.getInstance().getClient();
  }

  async create(projectData) {
    const { data, error } = await this.db
      .from("main_projects")
      .insert([projectData])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return this.mapToEntity(data);
  }

  async findById(id) {
    const { data, error } = await this.db
      .from("main_projects")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    
    return this.mapToEntity(data);
  }

  async findAll(filters = {}) {
    let query = this.db.from("main_projects").select("*");
    
    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    
    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    return data.map(row => this.mapToEntity(row));
  }

  async update(id, updateData) {
    const { data, error } = await this.db
      .from("main_projects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return this.mapToEntity(data);
  }

  mapToEntity(row) {
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      tagline: row.tagline,
      imageUrl: row.image_url,
      fundingGoal: Number(row.funding_goal),
      fundingDeadline: row.funding_deadline,
      category: row.category,
      location: row.location,
      createdAt: row.created_at
    };
  }
}

export default ProjectRepository;
