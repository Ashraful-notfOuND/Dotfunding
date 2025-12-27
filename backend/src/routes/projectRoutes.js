// import express from "express";
// import { createProject, createCampaign, getUserProjects, getProjectById, createRewards, getRewards, getCampaignByProjectId, getAllProjects, getProjectCreator, getProjectDonations, getProjectStatus, batchUpdateProjectStatuses, getProjectForEdit, editProject, getProjectBackers, getProjectAnalytics, trackProjectView } from "../controllers/projectController.js";
// import multer from "multer";

// const upload = multer({ storage: multer.memoryStorage() });

// const router = express.Router();


// router.post("/create", upload.single("image"), createProject);
// // Public: get all projects for homepage
// router.get("/", getAllProjects);
// router.post("/campaign", upload.array("images"), createCampaign);
// router.post("/rewards", express.json(), createRewards);
// router.get("/rewards/:projectId", getRewards);
// router.get("/userProjects/:userId", getUserProjects);
// // Project status endpoints
// router.get("/:id/status", getProjectStatus);
// router.post("/batch-update-status", batchUpdateProjectStatuses);
// router.get("/:id/donations", getProjectDonations);
// router.get("/:id/backers", getProjectBackers);
// router.get("/:id/analytics", getProjectAnalytics);
// router.post("/:id/track-view", trackProjectView);
// router.get("/:id", getProjectById);
// router.get("/campaign/:projectId", getCampaignByProjectId);
// router.get("/creator/:projectId", getProjectCreator);
// // fetch data to prefill edit page
// router.get("/getEditProjectInfo/:id", getProjectForEdit);       
// router.post("/edit/:id", ...editProject);

// export default router;


import express from "express";
import { 
  createProject, 
  createCampaign, 
  getUserProjects, 
  getProjectById, 
  createRewards, 
  getRewards, 
  getCampaignByProjectId, 
  getAllProjects, 
  getProjectCreator, 
  getProjectDonations, 
  getProjectStatus, 
  batchUpdateProjectStatuses, 
  getProjectForEdit, 
  editProject, 
  getProjectBackers, 
  getProjectAnalytics, 
  trackProjectView, 
  deselectReward,    // ✅ NEW
  getSelectedReward,  // ✅ NEW
  saveRewardSelection  // ✅ NEW
} from "../controllers/projectController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/create", upload.single("image"), createProject);
router.get("/", getAllProjects);
router.post("/campaign", upload.array("images"), createCampaign);
router.post("/rewards", express.json(), createRewards);
router.get("/rewards/:projectId", getRewards);
router.get("/userProjects/:userId", getUserProjects);
router.get("/:id/status", getProjectStatus);
router.post("/batch-update-status", batchUpdateProjectStatuses);
router.get("/:id/donations", getProjectDonations);
router.get("/:id/backers", getProjectBackers);
router.get("/:id/analytics", getProjectAnalytics);
router.post("/:id/track-view", trackProjectView);

// // ✅ NEW: Reward selection routes (TODO: Implement these controllers)
// router.post("/:projectId/rewards/:rewardId/select", selectReward);
// router.delete("/:projectId/rewards/deselect", deselectReward);
// router.get("/:projectId/rewards/selected", getSelectedReward);
// router.get("/pledges/user/:userId/project/:projectId", checkUserPaidPledge);

// // Save reward after successful payment
// router.post('/:projectId/rewards/:rewardId/save', saveRewardSelection);

// // Get selected reward
// router.get('/:projectId/rewards/selected', getSelectedReward);

// // Deselect reward
// router.delete('/:projectId/rewards/deselect', deselectReward);
// Save reward after successful payment
router.post('/:projectId/rewards/:rewardId/save', saveRewardSelection);

// Get selected reward
router.get('/:projectId/rewards/selected', getSelectedReward);

// Deselect reward
router.delete('/:projectId/rewards/deselect', deselectReward);

router.get("/:id", getProjectById);
router.get("/campaign/:projectId", getCampaignByProjectId);
router.get("/creator/:projectId", getProjectCreator);
router.get("/getEditProjectInfo/:id", getProjectForEdit);       
router.post("/edit/:id", ...editProject);

export default router;