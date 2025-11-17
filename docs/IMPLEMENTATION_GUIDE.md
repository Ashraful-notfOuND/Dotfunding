# Design Patterns Implementation Guide
**Dotfunding Project - Exact Code Locations**

This guide shows you **exactly where** to implement each design pattern in your codebase.

---

## 📋 Table of Contents

1. [Singleton Pattern (Backend)](#1-singleton-pattern-backend)
2. [Repository Pattern (Backend)](#2-repository-pattern-backend)
3. [Factory Pattern (Frontend)](#3-factory-pattern-frontend)
4. [Observer Pattern (Frontend)](#4-observer-pattern-frontend)

---

## 1. Singleton Pattern (Backend)

### 🎯 **Location:** Database Client Configuration

### 📁 **File to Modify:**
`backend/src/config/supabaseClient.js`

### 📝 **Current Code (BEFORE):**
```javascript
// File: backend/src/config/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### ✅ **New Code (AFTER - Singleton Pattern):**
```javascript
// File: backend/src/config/DatabaseClient.js
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
```

### 🔄 **Files That Need Updates:**

**Update all files that import supabaseClient:**

#### `backend/src/controllers/projectController.js`
```javascript
// OLD:
import { supabase } from "../config/supabaseClient.js";

// NEW:
import DatabaseClient from "../config/DatabaseClient.js";
const supabase = DatabaseClient.getInstance().getClient();
```

#### `backend/src/controllers/userController.js`
```javascript
// OLD:
import { supabase } from "../config/supabaseClient.js";

// NEW:
import DatabaseClient from "../config/DatabaseClient.js";
const supabase = DatabaseClient.getInstance().getClient();
```

#### `backend/src/controllers/paymentController.js`
```javascript
// OLD:
import { supabase } from "../config/supabaseClient.js";

// NEW:
import DatabaseClient from "../config/DatabaseClient.js";
const supabase = DatabaseClient.getInstance().getClient();
```

---

## 2. Repository Pattern (Backend)

### 🎯 **Location:** Data Access Layer

### 📁 **Files to Create:**

#### **Step 1: Create Repository Directory**
```bash
mkdir -p backend/src/repositories
```

#### **Step 2: Create ProjectRepository**
**File:** `backend/src/repositories/ProjectRepository.js`

```javascript
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

  async delete(id) {
    const { error } = await this.db
      .from("main_projects")
      .delete()
      .eq("id", id);
      
    if (error) throw new Error(error.message);
    return true;
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
      videoUrl: row.video_url,
      createdAt: row.created_at
    };
  }
}

export default ProjectRepository;
```

### 🔄 **Files to Modify:**

#### **Update:** `backend/src/controllers/projectController.js`

**Add at the top:**
```javascript
import ProjectRepository from "../repositories/ProjectRepository.js";

const projectRepo = new ProjectRepository();
```

**Find this code (around line 10-30):**
```javascript
export const createProject = async (req, res) => {
  try {
    const { user_id, title, tagline, funding_goal, funding_deadline, video_url, location, category } = req.body;
    console.log("Request body:", req.body.user_id);
    if (!user_id) return res.status(400).json({ error: "User ID is required" });
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageFile = req.file;
    const fileExt = imageFile.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    // Upload file buffer to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("project-pictures")
      .upload(filePath, imageFile.buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("project-pictures")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // Insert project into database
    const { data, error } = await supabase
      .from("main_projects")
      .insert([
        {
          user_id,
          title,
          tagline,
          image_url: imageUrl,
          funding_goal,
          funding_deadline,
          video_url,
          location,
          category,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
```

**Replace the database insert section with:**
```javascript
export const createProject = async (req, res) => {
  try {
    const { user_id, title, tagline, funding_goal, funding_deadline, video_url, location, category } = req.body;
    console.log("Request body:", req.body.user_id);
    if (!user_id) return res.status(400).json({ error: "User ID is required" });
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageFile = req.file;
    const fileExt = imageFile.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    // Upload file buffer to Supabase Storage
    const supabase = DatabaseClient.getInstance().getClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("project-pictures")
      .upload(filePath, imageFile.buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("project-pictures")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // ✅ USE REPOSITORY instead of direct database access
    const projectData = {
      user_id,
      title,
      tagline,
      image_url: imageUrl,
      funding_goal,
      funding_deadline,
      video_url,
      location,
      category,
    };

    const project = await projectRepo.create(projectData);
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
```

**Similarly, update these functions:**

```javascript
// BEFORE:
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Project id is required" });

    const { data: project, error } = await supabase
      .from("main_projects")
      .select(`id, user_id, title, tagline, image_url, funding_goal, funding_deadline, video_url, location, category`)
      .eq("id", id)
      .single();
    // ... rest of code
  }
}

// AFTER (Using Repository):
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Project id is required" });

    const project = await projectRepo.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    
    // ... rest of enrichment logic (campaigns, rewards, etc.)
    res.status(200).json({ project });
  } catch (err) {
    console.error("getProjectById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
```

---

## 3. Factory Pattern (Frontend)

### 🎯 **Location:** Component Creation

### 📁 **File to Create:**
`frontend/src/components/CardFactory.tsx`

```javascript
import React from 'react';
import ProjectCard from './ProjectCard';
import FeaturedProjectCard from './FeaturedProjectCard';
import CreatorCard from './CreatorCard';

type CardType = 'project' | 'featured' | 'creator';

interface BaseCardProps {
  id: string;
  title?: string;
  [key: string]: any;
}

class CardFactory {
  static createCard(
    type: CardType, 
    props: BaseCardProps
  ): React.ReactElement {
    const componentMap = {
      project: ProjectCard,
      featured: FeaturedProjectCard,
      creator: CreatorCard,
    };

    const Component = componentMap[type];
    
    if (!Component) {
      console.warn(`Unknown card type: ${type}, defaulting to ProjectCard`);
      return <ProjectCard {...props} />;
    }

    return <Component key={props.id} {...props} />;
  }

  static createCards(
    items: Array<BaseCardProps & { type?: CardType }>
  ): React.ReactElement[] {
    return items.map((item) => {
      const type = item.type || 'project';
      const { type: _, ...props } = item;
      return CardFactory.createCard(type, props);
    });
  }
}

export default CardFactory;
```

### 🔄 **Files to Modify:**

#### **Update:** `frontend/src/pages/Explore.tsx`

**Find this code (around line 50-80):**
```javascript
{projects.map((project) => (
  <ProjectCard
    key={project.id}
    id={project.id}
    title={project.title}
    creator={project.creator}
    image={project.image}
    fundingGoal={project.fundingGoal}
    fundingCurrent={project.fundingCurrent}
    daysLeft={project.daysLeft}
    category={project.category}
  />
))}
```

**Replace with:**
```javascript
import CardFactory from '@/components/CardFactory';

// In the JSX:
{projects.map((project) => 
  CardFactory.createCard('project', {
    key: project.id,
    id: project.id,
    title: project.title,
    creator: project.creator,
    image: project.image,
    fundingGoal: project.fundingGoal,
    fundingCurrent: project.fundingCurrent,
    daysLeft: project.daysLeft,
    category: project.category,
  })
)}
```

#### **Update:** `frontend/src/pages/Index.tsx`

**Find featured projects section (around line 100-130):**
```javascript
{featuredProjects.map((project) => (
  <FeaturedProjectCard
    key={project.id}
    project={project}
  />
))}
```

**Replace with:**
```javascript
import CardFactory from '@/components/CardFactory';

// In the JSX:
{featuredProjects.map((project) => 
  CardFactory.createCard('featured', {
    key: project.id,
    project: project,
  })
)}
```

#### **Update:** `frontend/src/pages/Categorypage.tsx`

**Similar pattern - find ProjectCard usage and replace with:**
```javascript
import CardFactory from '@/components/CardFactory';

{filteredProjects.map((project) => 
  CardFactory.createCard('project', {
    key: project.id,
    ...project
  })
)}
```

---

## 4. Observer Pattern (Frontend)

### 🎯 **Location:** State Management

### 📁 **File to Create:**
`frontend/src/hooks/useProjectStore.ts`

```typescript
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

interface Project {
  id: string;
  title: string;
  fundingCurrent: number;
  fundingGoal: number;
  [key: string]: any;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

interface ProjectActions {
  setProjects: (projects: Project[]) => void;
  selectProject: (id: string) => void;
  updateProjectFunding: (id: string, amount: number) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  clearError: () => void;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      projects: [],
      selectedProject: null,
      loading: false,
      error: null,

      // Actions
      setProjects: (projects) => 
        set({ projects, loading: false }),

      selectProject: (id) => 
        set((state) => ({
          selectedProject: state.projects.find(p => p.id === id) || null
        })),

      updateProjectFunding: (id, amount) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, fundingCurrent: p.fundingCurrent + amount }
              : p
          ),
        })),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      clearError: () => set({ error: null }),
    }))
  )
);

// Observer utility
export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  return useProjectStore.subscribe(
    (state) => state.projects,
    callback,
    { fireImmediately: true }
  );
};
```

### 🔄 **Files to Modify:**

#### **Update:** `frontend/src/pages/Explore.tsx`

**Find state management (around line 10-30):**
```javascript
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      const data = await response.json();
      setProjects(data.projects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };
  fetchProjects();
}, []);
```

**Replace with:**
```javascript
import { useProjectStore } from '@/hooks/useProjectStore';

const Explore = () => {
  // ✅ Use Observer pattern instead of local state
  const projects = useProjectStore((state) => state.projects);
  const loading = useProjectStore((state) => state.loading);
  const setProjects = useProjectStore((state) => state.setProjects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        const data = await response.json();
        setProjects(data.projects); // Automatically notifies all observers
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, [setProjects]);

  // Rest of component...
}
```

#### **Update:** `frontend/src/pages/ProjectDetail.tsx`

**Find pledge handling (around line 100-150):**
```javascript
const handlePledgeSuccess = (amount: number) => {
  // Update local state
  setProject({
    ...project,
    fundingCurrent: project.fundingCurrent + amount
  });
};
```

**Replace with:**
```javascript
import { useProjectStore } from '@/hooks/useProjectStore';

const ProjectDetail = () => {
  const updateProjectFunding = useProjectStore(
    (state) => state.updateProjectFunding
  );

  const handlePledgeSuccess = (amount: number, projectId: string) => {
    // ✅ Update global store - all observers get notified
    updateProjectFunding(projectId, amount);
  };

  // Rest of component...
}
```

#### **Update:** `frontend/src/components/FundingStats.tsx`

**Replace local state with store:**
```javascript
import { useProjectStore } from '@/hooks/useProjectStore';

const FundingStats = ({ projectId }: { projectId: string }) => {
  // ✅ Automatically re-renders when project funding changes
  const project = useProjectStore(
    (state) => state.projects.find(p => p.id === projectId)
  );

  if (!project) return null;

  const percentage = (project.fundingCurrent / project.fundingGoal) * 100;

  return (
    <div>
      <p>Raised: ${project.fundingCurrent}</p>
      <p>Goal: ${project.fundingGoal}</p>
      <p>{Math.round(percentage)}% funded</p>
    </div>
  );
};
```

---

## 📊 Summary of Changes

### Backend Changes

| File | Pattern | Action |
|------|---------|--------|
| `backend/src/config/DatabaseClient.js` | Singleton | CREATE NEW |
| `backend/src/repositories/ProjectRepository.js` | Repository | CREATE NEW |
| `backend/src/controllers/projectController.js` | Both | MODIFY |
| `backend/src/controllers/userController.js` | Singleton | MODIFY |
| `backend/src/controllers/paymentController.js` | Singleton | MODIFY |

### Frontend Changes

| File | Pattern | Action |
|------|---------|--------|
| `frontend/src/components/CardFactory.tsx` | Factory | CREATE NEW |
| `frontend/src/hooks/useProjectStore.ts` | Observer | CREATE NEW |
| `frontend/src/pages/Explore.tsx` | Both | MODIFY |
| `frontend/src/pages/Index.tsx` | Factory | MODIFY |
| `frontend/src/pages/Categorypage.tsx` | Factory | MODIFY |
| `frontend/src/pages/ProjectDetail.tsx` | Observer | MODIFY |
| `frontend/src/components/FundingStats.tsx` | Observer | MODIFY |

---

## 🚀 Implementation Steps

### Step 1: Backend (30 minutes)

1. Create `backend/src/config/DatabaseClient.js` ✅
2. Create `backend/src/repositories/ProjectRepository.js` ✅
3. Update all controllers to use new imports ✅
4. Run tests: `cd backend && npm test` ✅

### Step 2: Frontend (30 minutes)

1. Create `frontend/src/components/CardFactory.tsx` ✅
2. Create `frontend/src/hooks/useProjectStore.ts` ✅
3. Update Explore.tsx to use both patterns ✅
4. Update other pages as needed ✅
5. Run tests: `cd frontend && npm test` ✅

### Step 3: Testing (15 minutes)

1. Run backend tests ✅
2. Run frontend tests ✅
3. Manual testing of features ✅
4. Document results ✅

---

## ✅ Verification Checklist

- [ ] DatabaseClient.js created and working
- [ ] ProjectRepository.js created with CRUD methods
- [ ] All controllers updated to use Singleton
- [ ] CardFactory.tsx created
- [ ] useProjectStore.ts created
- [ ] At least 3 pages use Factory pattern
- [ ] At least 2 components use Observer pattern
- [ ] Backend tests passing (17/17)
- [ ] Frontend tests passing (15+/16)
- [ ] Application runs without errors

---

## 🎯 Key Points

### Singleton Pattern
- **Where:** `backend/src/config/`
- **Why:** Single database connection
- **Files affected:** All controllers

### Repository Pattern
- **Where:** `backend/src/repositories/`
- **Why:** Separate data access from business logic
- **Files affected:** Controllers that access database

### Factory Pattern
- **Where:** `frontend/src/components/`
- **Why:** Centralize component creation
- **Files affected:** Pages that render cards

### Observer Pattern
- **Where:** `frontend/src/hooks/`
- **Why:** Reactive state management
- **Files affected:** Components that share state

---

**✅ All implementation locations specified!**
**Ready to code!** 🚀
