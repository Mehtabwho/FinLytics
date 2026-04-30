const express = require('express');
const router = express.Router();
const {
  getGoals,
  upsertGoal,
  deleteGoal,
  getGoalInsights,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(upsertGoal);

router.route('/:id')
  .delete(deleteGoal);

router.route('/:id/insights')
  .get(getGoalInsights);

module.exports = router;
