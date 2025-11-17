# Quick Reference - Implementation Locations

## 🎯 Exact Files to Create/Modify

### Backend (Node.js)

#### ✨ NEW FILES TO CREATE:

1. **`backend/src/config/DatabaseClient.js`**
   - **Pattern:** Singleton
   - **Lines:** ~30
   - **Purpose:** Single database connection instance
   - **Key Code:**
     ```javascript
     class DatabaseClient {
       static instance = null;
       static getInstance() { /* ... */ }
     }
     ```

2. **`backend/src/repositories/ProjectRepository.js`**
   - **Pattern:** Repository
   - **Lines:** ~80
   - **Purpose:** Data access abstraction
   - **Key Methods:**
     - `create()`
     - `findById()`
     - `findAll()`
     - `update()`
     - `mapToEntity()`

#### 📝 FILES TO MODIFY:

3. **`backend/src/controllers/projectController.js`**
   - **Line 1:** Change import from `supabaseClient` to `DatabaseClient`
   - **Line 12:** Add `const projectRepo = new ProjectRepository()`
   - **Line 20-50:** Replace direct DB calls with `projectRepo.create()`
   - **Line 180-220:** Replace with `projectRepo.findById()`
   - **Line 300+:** Replace with `projectRepo.findAll()`

4. **`backend/src/controllers/userController.js`**
   - **Line 1:** Change import only
   - **Line 15+:** Use `DatabaseClient.getInstance().getClient()`

5. **`backend/src/controllers/paymentController.js`**
   - **Line 1:** Change import only
   - **Line 20+:** Use `DatabaseClient.getInstance().getClient()`

---

### Frontend (React/TypeScript)

#### ✨ NEW FILES TO CREATE:

6. **`frontend/src/components/CardFactory.tsx`**
   - **Pattern:** Factory
   - **Lines:** ~40
   - **Purpose:** Centralized component creation
   - **Key Methods:**
     ```typescript
     static createCard(type, props)
     static createCards(items)
     ```

7. **`frontend/src/hooks/useProjectStore.ts`**
   - **Pattern:** Observer (Zustand)
   - **Lines:** ~60
   - **Purpose:** Global state management
   - **Key Parts:**
     ```typescript
     export const useProjectStore = create<ProjectStore>()(
       devtools(subscribeWithSelector(...))
     )
     ```

#### 📝 FILES TO MODIFY:

8. **`frontend/src/pages/Explore.tsx`**
   - **Line 1-10:** Add imports:
     ```typescript
     import CardFactory from '@/components/CardFactory';
     import { useProjectStore } from '@/hooks/useProjectStore';
     ```
   - **Line 15-25:** Replace `useState` with store:
     ```typescript
     const projects = useProjectStore(state => state.projects);
     const setProjects = useProjectStore(state => state.setProjects);
     ```
   - **Line 120-140:** Replace `<ProjectCard>` with:
     ```typescript
     {projects.map(p => CardFactory.createCard('project', p))}
     ```

9. **`frontend/src/pages/Index.tsx`**
   - **Line 1-10:** Add import:
     ```typescript
     import CardFactory from '@/components/CardFactory';
     ```
   - **Line 180-200:** Replace `<FeaturedProjectCard>` with:
     ```typescript
     {featured.map(p => CardFactory.createCard('featured', {project: p}))}
     ```

10. **`frontend/src/pages/Categorypage.tsx`**
    - **Line 1-10:** Add import
    - **Line 80-100:** Use Factory for cards

11. **`frontend/src/pages/ProjectDetail.tsx`**
    - **Line 1-10:** Add:
      ```typescript
      import { useProjectStore } from '@/hooks/useProjectStore';
      ```
    - **Line 200-250:** Replace pledge handler:
      ```typescript
      const updateFunding = useProjectStore(state => state.updateProjectFunding);
      // In handler:
      updateFunding(projectId, amount);
      ```

12. **`frontend/src/components/FundingStats.tsx`**
    - **Line 1-10:** Add import
    - **Line 20-40:** Get project from store:
      ```typescript
      const project = useProjectStore(
        state => state.projects.find(p => p.id === projectId)
      );
      ```

---

## 📂 File Structure After Implementation

```
backend/
├── src/
│   ├── config/
│   │   ├── DatabaseClient.js       ✨ NEW (Singleton)
│   │   └── supabaseClient.js       ❌ OLD (can delete)
│   ├── repositories/               ✨ NEW FOLDER
│   │   └── ProjectRepository.js    ✨ NEW (Repository)
│   └── controllers/
│       ├── projectController.js    📝 MODIFIED
│       ├── userController.js       📝 MODIFIED
│       └── paymentController.js    📝 MODIFIED

frontend/
├── src/
│   ├── components/
│   │   ├── CardFactory.tsx         ✨ NEW (Factory)
│   │   ├── ProjectCard.tsx         ✅ EXISTING
│   │   ├── FeaturedProjectCard.tsx ✅ EXISTING
│   │   └── FundingStats.tsx        📝 MODIFIED
│   ├── hooks/
│   │   ├── useProjectStore.ts      ✨ NEW (Observer)
│   │   └── useAuth.ts              ✅ EXISTING
│   └── pages/
│       ├── Explore.tsx             📝 MODIFIED (both patterns)
│       ├── Index.tsx               📝 MODIFIED
│       ├── Categorypage.tsx        📝 MODIFIED
│       └── ProjectDetail.tsx       📝 MODIFIED
```

---

## 🎯 Pattern-to-File Mapping

| Pattern | File | Action | Lines |
|---------|------|--------|-------|
| **Singleton** | `backend/src/config/DatabaseClient.js` | CREATE | 30 |
| **Singleton** | `backend/src/controllers/*.js` | MODIFY | 5 per file |
| **Repository** | `backend/src/repositories/ProjectRepository.js` | CREATE | 80 |
| **Repository** | `backend/src/controllers/projectController.js` | MODIFY | 50 |
| **Factory** | `frontend/src/components/CardFactory.tsx` | CREATE | 40 |
| **Factory** | `frontend/src/pages/*.tsx` | MODIFY | 20 per file |
| **Observer** | `frontend/src/hooks/useProjectStore.ts` | CREATE | 60 |
| **Observer** | `frontend/src/pages/*.tsx` | MODIFY | 30 per file |

---

## ⏱️ Time Estimate

- **Backend Singleton:** 10 minutes
- **Backend Repository:** 20 minutes
- **Frontend Factory:** 10 minutes
- **Frontend Observer:** 15 minutes
- **Testing & Debugging:** 15 minutes
- **Total:** ~70 minutes

---

## 🚀 Implementation Order

### Phase 1: Backend (30 min)
1. ✅ Create `DatabaseClient.js`
2. ✅ Create `ProjectRepository.js`
3. ✅ Update `projectController.js`
4. ✅ Update other controllers
5. ✅ Test: `npm test`

### Phase 2: Frontend (30 min)
1. ✅ Create `CardFactory.tsx`
2. ✅ Create `useProjectStore.ts`
3. ✅ Update `Explore.tsx`
4. ✅ Update `Index.tsx`
5. ✅ Update `ProjectDetail.tsx`
6. ✅ Test: `npm test`

### Phase 3: Verification (10 min)
1. ✅ Run all tests
2. ✅ Manual testing
3. ✅ Check console for errors

---

## 📖 Full Documentation

- **Complete Guide:** `/docs/IMPLEMENTATION_GUIDE.md`
- **Testing Summary:** `/docs/TESTING_SUMMARY.md`
- **LaTeX Report:** `/docs/design-patterns-report.tex`

---

## ✅ Success Criteria

- [ ] 4 new files created
- [ ] 6+ existing files modified
- [ ] Backend tests: 17/17 passing
- [ ] Frontend tests: 15+/16 passing
- [ ] No console errors
- [ ] Application runs smoothly

---

**All implementation locations specified!** 🎯
