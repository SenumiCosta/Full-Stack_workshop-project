exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // --- CONFLICT DETECTION ---
    // If client sends updatedAt, check for conflicts
    if (req.body._clientUpdatedAt) {
      const clientTime = new Date(req.body._clientUpdatedAt).getTime();
      const serverTime = new Date(task.updatedAt).getTime();
      
      // If server has newer version, return conflict
      if (serverTime > clientTime) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: 'Conflict detected - data has been modified by someone else',
          serverData: task,
          serverUpdatedAt: task.updatedAt
        });
      }
    }
    // --- END CONFLICT DETECTION ---

    // Track changes for history
    const changes = [];
    if (req.body.status && req.body.status !== task.status) {
      changes.push(`Status changed from "${task.status}" to "${req.body.status}"`);
    }
    if (req.body.priority && req.body.priority !== task.priority) {
      changes.push(`Priority changed from "${task.priority}" to "${req.body.priority}"`);
    }
    if (req.body.assignee && req.body.assignee !== task.assignee?.toString()) {
      changes.push(`Assignee updated`);
    }

    // Remove client timestamp before saving
    delete req.body._clientUpdatedAt;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignee', 'name');

    if (changes.length > 0) {
      task.history.push({
        text: changes.join(', '),
        user: req.user.id,
        timestamp: new Date()
      });
      await task.save();
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};