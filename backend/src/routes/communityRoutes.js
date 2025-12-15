import express from 'express';
import {
  getCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  togglePinPost,
  toggleLockPost,
  getPostComments,
  createComment,
  deleteComment,
  toggleReaction,
  voteInPoll,
  getPollResults,
  markQuestionAnswered
} from '../controllers/communityController.js';

const router = express.Router();

// ==========================================
// POSTS
// ==========================================
router.get('/:projectId/posts', getCommunityPosts);
router.post('/:projectId/posts', createCommunityPost);
router.delete('/posts/:postId', deleteCommunityPost);
router.patch('/posts/:postId/pin', togglePinPost);
router.patch('/posts/:postId/lock', toggleLockPost);

// ==========================================
// COMMENTS
// ==========================================
router.get('/posts/:postId/comments', getPostComments);
router.post('/posts/:postId/comments', createComment);
router.delete('/comments/:commentId', deleteComment);

// ==========================================
// REACTIONS
// ==========================================
router.post('/reactions', toggleReaction);

// ==========================================
// POLLS
// ==========================================
router.post('/polls/:postId/vote', voteInPoll);
router.get('/polls/:postId/results', getPollResults);

// ==========================================
// Q&A
// ==========================================
router.patch('/posts/:postId/answer', markQuestionAnswered);

export default router;
