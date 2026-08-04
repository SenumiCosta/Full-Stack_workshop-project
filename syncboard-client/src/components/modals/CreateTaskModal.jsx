import React, { useState } from 'react';

const CreateTaskModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('Unassigned');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSave({
      title,
      description,
      priority,
      assignee,
      status: 'Not Started',
    });

    onClose();
  };

  return (
    <div style={styles.backdrop}>
      <form
        onSubmit={handleSubmit}
        className="glass-panel"
        style={styles.modal}
      >
        <h3 style={styles.title}>Add New Task</h3>
        <p style={styles.subtitle}>Create a task card for the selected board.</p>

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
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>


          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label style={styles.label}>Assignee</label>

            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="Senumi (Lead)">Senumi (Lead)</option>
              <option value="Member 2">Member 2</option>
              <option value="Member 3">Member 3</option>
              <option value="Member 4">Member 4</option>
              <option value="Member 5">Member 5</option>
              <option value="Member 6">Member 6</option>
              <option value="Member 7">Member 7</option>
            </select>
          </div>

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


  actions: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'flex-end',
  },

};


export default CreateTaskModal;