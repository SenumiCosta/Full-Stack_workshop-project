import React, { useState } from 'react';

const CreateTaskModal = ({ onClose, onSave, onTaskCreated, isOrg = false, orgMembers = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('Unassigned');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: isOrg ? (assignee || 'Unassigned') : 'Unassigned',
      status: 'Not Started',
    };

    if (onSave) {
      onSave(taskData);
    } else if (onTaskCreated) {
      onTaskCreated(taskData);
    }
    if (onClose) onClose();
  };

  return (
    <div style={styles.backdrop}>
      <form
        onSubmit={handleSubmit}
        className="glass-panel"
        style={styles.modal}
      >
        <h3 style={styles.title}>Create Task</h3>
        <p style={styles.subtitle}>
          {isOrg ? 'Create a task card for your team board.' : 'Create a personal task card.'}
        </p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Task Title</label>

          <input
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Description</label>

          <textarea
            rows="3"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label style={styles.label}>Priority</label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.select}
            >
              <option value="Low" style={styles.option}>Low</option>
              <option value="Medium" style={styles.option}>Medium</option>
              <option value="High" style={styles.option}>High</option>
            </select>
          </div>

          {/* Only display Assignee dropdown for Organization boards */}
          {isOrg && (
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Assignee</label>

              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                style={styles.select}
              >
                <option value="Unassigned" style={styles.option}>Unassigned</option>
                {orgMembers.map((member, idx) => {
                  const name = member.user?.name || member.name || (typeof member.user === 'string' ? member.user : `Member ${idx + 1}`);
                  const role = member.role === 'admin' ? 'Admin' : 'Member';
                  return (
                    <option key={member._id || member.user?._id || idx} value={name} style={styles.option}>
                      {name} ({role})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>


        <div style={styles.actions}>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ marginRight: '10px', borderRadius: '999px' }}
          >
            Cancel
          </button>


          <button type="submit" className="btn-primary" style={{ borderRadius: '999px' }}>
            Save Task
          </button>

        </div>

      </form>
    </div>
  );
};


const styles = {

  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },


  modal: {
    width: '100%',
    maxWidth: '520px',
    padding: '32px',
    borderRadius: '28px',
  },


  inputGroup: {
    marginTop: '15px',
  },


  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '5px',
  },
  title: { fontSize: '1.6rem', marginBottom: '6px' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '14px' },

  select: {
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
    cursor: 'pointer'
  },

  option: {
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    padding: '8px 12px'
  },

  actions: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'flex-end',
  },

};


export default CreateTaskModal;