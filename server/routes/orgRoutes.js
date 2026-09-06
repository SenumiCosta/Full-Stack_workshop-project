const express = require('express');
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  checkUserEmail,
  sendInvitation,
  getInvitationDetails,
  acceptInvitation
} = require('../controllers/orgController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Organization routes
router.route('/')
  .post(protect, createOrganization)
  .get(protect, getOrganizations);

router.route('/check-user')
  .get(protect, checkUserEmail);

router.route('/:id')
  .get(protect, getOrganization);

router.route('/:id/invite')
  .post(protect, sendInvitation);

// Invitation response routes
router.route('/invitation/:token')
  .get(getInvitationDetails);

router.route('/invitation/:token/accept')
  .post(protect, acceptInvitation);

module.exports = router;
