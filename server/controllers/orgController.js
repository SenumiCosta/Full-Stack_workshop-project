const crypto = require('crypto');
const Organization = require('../models/Organization');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const { sendInvitationEmail } = require('../utils/sendEmail');

// @desc    Create new organization
// @route   POST /api/orgs
// @access  Private
exports.createOrganization = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an organization name' });
    }

    const organization = await Organization.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#6366f1',
      owner: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    const populatedOrg = await Organization.findById(organization._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedOrg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user organizations
// @route   GET /api/orgs
// @access  Private
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({
      'members.user': req.user.id
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single organization
// @route   GET /api/orgs/:id
// @access  Private
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const isMember = organization.members.some(
      m => m.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this organization' });
    }

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if a user email is registered in SyncBoard
// @route   GET /api/orgs/check-user
// @access  Private
exports.checkUserEmail = async (req, res) => {
  try {
    const email = req.query.email ? req.query.email.trim().toLowerCase() : '';

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email }).select('name email');

    if (!user) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'This email is not registered on SyncBoard. Members must sign up first.'
      });
    }

    res.status(200).json({
      success: true,
      exists: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send invitation to a registered user
// @route   POST /api/orgs/:id/invite
// @access  Private
exports.sendInvitation = async (req, res) => {
  try {
    const { email } = req.body;
    const orgId = req.params.id;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verify organization exists and requester has admin/owner role
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const memberRecord = organization.members.find(
      m => m.user.toString() === req.user.id
    );

    if (!memberRecord || (memberRecord.role !== 'admin' && organization.owner.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'Only organization admins can send invitations' });
    }

    // 2. Verify target user exists in SyncBoard
    const targetUser = await User.findOne({ email: normalizedEmail });
    if (!targetUser) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist. The member must sign up on SyncBoard before being invited.'
      });
    }

    // 3. Check if user is already a member
    const alreadyMember = organization.members.some(
      m => m.user.toString() === targetUser._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this organization' });
    }

    // 4. Invalidate any existing pending invites for this user & org
    await Invitation.updateMany(
      { organization: orgId, email: normalizedEmail, status: 'pending' },
      { status: 'expired' }
    );

    // 5. Generate secure invitation token
    const token = crypto.randomBytes(24).toString('hex');
    const invitation = await Invitation.create({
      organization: orgId,
      inviter: req.user.id,
      recipient: targetUser._id,
      email: normalizedEmail,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl}/invite/${token}`;

    // 6. Send email invitation
    const emailResult = await sendInvitationEmail({
      to: normalizedEmail,
      inviterName: req.user.name,
      orgName: organization.name,
      inviteLink
    });

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${normalizedEmail}`,
      data: {
        invitationId: invitation._id,
        inviteLink,
        previewUrl: emailResult.previewUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get invitation details by token
// @route   GET /api/invitations/:token
// @access  Public
exports.getInvitationDetails = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token })
      .populate('organization', 'name description color')
      .populate('inviter', 'name email');

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invitation link' });
    }

    if (invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: `This invitation has ${invitation.status === 'accepted' ? 'already been accepted' : 'expired'}`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        organization: invitation.organization,
        inviter: invitation.inviter,
        email: invitation.email,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept invitation and join organization
// @route   POST /api/invitations/:token/accept
// @access  Private
exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invitation link' });
    }

    if (invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: `This invitation has ${invitation.status === 'accepted' ? 'already been accepted' : 'expired'}`
      });
    }

    // Verify recipient email matches current logged-in user
    if (invitation.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `This invitation was sent to ${invitation.email}. Please log in with that account to accept.`
      });
    }

    const organization = await Organization.findById(invitation.organization);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization no longer exists' });
    }

    // Add user to members if not already present
    const alreadyMember = organization.members.some(
      m => m.user.toString() === req.user.id
    );

    if (!alreadyMember) {
      organization.members.push({
        user: req.user.id,
        role: 'member',
        joinedAt: new Date()
      });
      await organization.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: `Successfully joined ${organization.name}!`,
      data: organization
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
