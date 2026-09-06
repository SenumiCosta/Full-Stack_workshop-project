import { describe, it, expect } from "vitest";

describe("CreateTaskModal", () => {
  it("test file is working", () => {
    expect(true).toBe(true);
  });
});

const CreateTaskModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [assignee, setAssignee] = useState('Senumi (Lead)');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee
    };

    onSave(taskData);
  };

  return (
    <div style={styles.overlay}>
      <form
        className="glass-panel"
        style={styles.modal}
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <h3 style={styles.heading}>
          Add New Task
        </h3>

        <p style={styles.subtitle}>
          Create a task card for the selected board.
        </p>

        {/* Task Title */}
        <div style={styles.field}>
          <label htmlFor="task-title" style={styles.label}>
            Task Title
          </label>

          <input
            id="task-title"
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div style={styles.field}>
          <label htmlFor="task-description" style={styles.label}>
            Description
          </label>

          <textarea
            id="task-description"
            placeholder="Enter task description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Priority + Assignee */}
        <div style={styles.row}>

          {/* Priority */}
          <div style={{ ...styles.field, flex: 1 }}>
            <label htmlFor="task-priority" style={styles.label}>
              Priority
            </label>

            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Assignee */}
          <div style={{ ...styles.field, flex: 1 }}>
            <label htmlFor="task-assignee" style={styles.label}>
              Assignee
            </label>

            <select
              id="task-assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="Senumi (Lead)">
                Senumi (Lead)
              </option>

              <option value="Member 2">
                Member 2
              </option>

              <option value="Member 3">
                Member 3
              </option>

              <option value="Member 4">
                Member 4
              </option>

              <option value="Member 5">
                Member 5
              </option>

              <option value="Member 6">
                Member 6
              </option>

              <option value="Member 7">
                Member 7
              </option>
            </select>
          </div>

        </div>

        {/* Buttons */}
        <div style={styles.buttons}>

          <button
            type="button"
            className="btn-secondary"
            style={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-primary"
            style={styles.saveButton}
          >
            Save Task
          </button>

        </div>
      </form>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },

  modal: {
    width: '100%',
    maxWidth: '520px',
    padding: '32px',
    borderRadius: '28px'
  },

  heading: {
    fontSize: '1.6rem',
    marginBottom: '6px'
  },

  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    marginBottom: '14px'
  },

  field: {
    marginTop: '15px'
  },

  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '5px'
  },

  row: {
    display: 'flex',
    gap: '15px'
  },

  buttons: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'flex-end'
  },

  cancelButton: {
    marginRight: '10px',
    borderRadius: '999px'
  },

  saveButton: {
    borderRadius: '999px'
  }
};

export default CreateTaskModal;