const Board = require('../models/Board');
const Task = require('../models/Task');
const Organization = require('../models/Organization');

exports.getBoards = async (req, res) => {
  try {
    const { organization, personal } = req.query;

    // Get all organizations where user is a member
    const userOrgs = await Organization.find({
      'members.user': req.user.id
    }).select('_id');
    const userOrgIds = userOrgs.map(o => o._id);

    let query = {
      isArchived: false
    };

    if (organization) {
      query.organization = organization;
      query.$or = [
        { organization: { $in: userOrgIds } },
        { owner: req.user.id },
        { members: req.user.id }
      ];
    } else if (personal === 'true') {
      query.organization = null;
      query.$or = [{ owner: req.user.id }, { members: req.user.id }];
    } else {
      query.$or = [
        { owner: req.user.id },
        { members: req.user.id },
        { organization: { $in: userOrgIds } }
      ];
    }

    const boards = await Board.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('organization', 'name color')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: boards.length, data: boards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('organization', 'name color');

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const isOwner = board.owner._id.toString() === req.user.id;
    const isMember = board.members.some(m => m._id.toString() === req.user.id);
    let isOrgMember = false;

    if (board.organization) {
      const orgId = board.organization._id || board.organization;
      const org = await Organization.findOne({
        _id: orgId,
        'members.user': req.user.id
      });
      if (org) isOrgMember = true;
    }

    if (!isOwner && !isMember && !isOrgMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this board' });
    }

    res.status(200).json({ success: true, data: board });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { name, description, organization, members, color } = req.body;

    let orgId = organization || null;
    if (orgId) {
      const org = await Organization.findOne({
        _id: orgId,
        'members.user': req.user.id
      });
      if (!org) {
        return res.status(403).json({ success: false, message: 'You are not a member of this organization' });
      }
    }

    const board = await Board.create({
      name,
      description: description || '',
      owner: req.user.id,
      organization: orgId,
      members: members || [],
      color: color || '#6366f1'
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('organization', 'name color');

    res.status(201).json({ success: true, data: populatedBoard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    let board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only board owner can update' });
    }
    board = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: board });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only board owner can delete' });
    }
    await Task.deleteMany({ board: req.params.id });
    await board.deleteOne();
    res.status(200).json({ success: true, message: 'Board and all tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};