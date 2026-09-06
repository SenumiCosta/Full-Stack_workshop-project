import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  Plus, 
  Trash2, 
  WifiOff, 
  Building2, 
  User, 
  ChevronDown, 
  UserPlus, 
  LogOut, 
  Check 
} from 'lucide-react';
import api from '../../api/apiClient';
import { useCache } from '../../context/CacheContext';

const Sidebar = ({
  boards = [],
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  organizations = [],
  activeOrgId = null,
  onSelectOrg,
  onCreateOrgClick,
  onInviteClick,
  currentUser = null,
  onLogout
}) => {
  const [newBoardName, setNewBoardName] = useState('');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [internalBoards, setInternalBoards] = useState([]);
  const dropdownRef = useRef(null);
  const { isOffline } = useCache();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOrgDropdownOpen(false);
      }
    };
    if (isOrgDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOrgDropdownOpen]);

  useEffect(() => {
    if (!boards || boards.length === 0) {
      const fetchBoards = async () => {
        try {
          const res = await api.get('/boards');
          const data = res.data.data || res.data || [];
          setInternalBoards(data);
        } catch (err) {
          // silently handle
        }
      };
      fetchBoards();
    }
  }, [boards]);

  const effectiveBoards = (boards && boards.length > 0) ? boards : internalBoards;

  const currentOrg = organizations.find(o => o._id === activeOrgId);

  // Check if current user is admin/owner of active organization
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOrgAdmin = Boolean(
    currentOrg && currentUserId && (
      String(currentOrg.owner?._id || currentOrg.owner || '') === String(currentUserId) ||
      currentOrg.members?.some(
        m => String(m.user?._id || m.user || '') === String(currentUserId) && m.role === 'admin'
      )
    )
  );

  const handleCreateBoardSubmit = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    if (onCreateBoard) {
      await onCreateBoard(newBoardName.trim());
      setNewBoardName('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this board?')) return;
    if (onDeleteBoard) {
      await onDeleteBoard(id);
    }
  };

  return (
    <div style={styles.container}>
      {/* Workspace / Organization Switcher */}
      <div style={styles.switcherSection} ref={dropdownRef}>
        <label style={styles.switcherLabel}>Workspace</label>
        <button
          type="button"
          style={styles.switcherBtn}
          onClick={() => setIsOrgDropdownOpen(prev => !prev)}
          aria-expanded={isOrgDropdownOpen}
          aria-label="Switch organization or workspace"
        >
          <div style={styles.switcherLeft}>
            {activeOrgId && currentOrg ? (
              <div style={{ ...styles.orgIconBadge, background: currentOrg.color || 'var(--color-primary)' }}>
                <Building2 size={15} color="#ffffff" />
              </div>
            ) : (
              <div style={styles.personalIconBadge}>
                <User size={15} color="#6366f1" />
              </div>
            )}
            <span style={styles.switcherName}>
              {activeOrgId && currentOrg ? currentOrg.name : 'Personal Workspace'}
            </span>
          </div>
          <ChevronDown 
            size={16} 
            style={{ 
              transform: isOrgDropdownOpen ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.2s ease',
              color: 'var(--text-muted)'
            }} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOrgDropdownOpen && (
          <div style={styles.dropdownMenu}>
            <div style={styles.dropdownSectionTitle}>Your Workspaces</div>
            
            {/* Personal Workspace Option */}
            <div
              style={{
                ...styles.dropdownItem,
                background: !activeOrgId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                fontWeight: !activeOrgId ? '600' : '400'
              }}
              onClick={() => {
                if (onSelectOrg) onSelectOrg(null);
                setIsOrgDropdownOpen(false);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={15} color="#6366f1" />
                <span>Personal Workspace</span>
              </div>
              {!activeOrgId && <Check size={14} color="#6366f1" />}
            </div>

            <div style={styles.dropdownDivider} />
            <div style={styles.dropdownSectionTitle}>Organizations</div>

            {organizations.length === 0 ? (
              <div style={styles.emptyOrgsText}>No organizations yet</div>
            ) : (
              organizations.map(org => (
                <div
                  key={org._id}
                  style={{
                    ...styles.dropdownItem,
                    background: activeOrgId === org._id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    fontWeight: activeOrgId === org._id ? '600' : '400'
                  }}
                  onClick={() => {
                    if (onSelectOrg) onSelectOrg(org._id);
                    setIsOrgDropdownOpen(false);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{ ...styles.orgDot, background: org.color || '#6366f1' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {org.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={styles.memberCountBadge}>
                      {org.members?.length || 1}
                    </span>
                    {activeOrgId === org._id && <Check size={14} color="#6366f1" />}
                  </div>
                </div>
              ))
            )}

            <div style={styles.dropdownDivider} />

            {/* Create Organization Button */}
            <button
              type="button"
              style={styles.createOrgBtn}
              onClick={() => {
                setIsOrgDropdownOpen(false);
                if (onCreateOrgClick) onCreateOrgClick();
              }}
            >
              <Plus size={15} /> Create Organization
            </button>
          </div>
        )}
      </div>

      {/* Active Organization Info & Invite Banner */}
      {currentOrg && (
        <div style={styles.activeOrgBanner}>
          <div style={styles.activeOrgTop}>
            <div style={styles.activeOrgMeta}>
              <span style={styles.memberCountText}>
                {currentOrg.members?.length || 1} {currentOrg.members?.length === 1 ? 'member' : 'members'}
              </span>
              {isOrgAdmin && <span style={styles.roleTag}>Admin</span>}
            </div>
            {isOrgAdmin && (
              <button
                type="button"
                onClick={onInviteClick}
                style={styles.inviteButton}
                title="Invite team member"
              >
                <UserPlus size={13} /> Invite
              </button>
            )}
          </div>
        </div>
      )}

      {/* Boards Section Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          {currentOrg ? `${currentOrg.name} Boards` : 'My Boards'}
        </h3>
        {isOffline && (
          <span style={styles.offlineBadge}>
            <WifiOff size={12} aria-hidden="true" /> Offline
          </span>
        )}
      </div>

      {/* Boards List */}
      <div style={styles.list}>
        {!effectiveBoards || effectiveBoards.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem' }}>No boards in this workspace.</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Create one below to start collaborating!
            </p>
          </div>
        ) : (
          effectiveBoards.map(board => (
            <div
              key={board._id}
              style={{
                ...styles.item,
                background: board._id === activeBoardId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderColor: board._id === activeBoardId ? 'var(--color-primary)' : 'transparent'
              }}
            >
              <span style={styles.link} onClick={() => onSelectBoard && onSelectBoard(board._id)}>
                <Folder size={16} aria-hidden="true" color={board._id === activeBoardId ? 'var(--color-primary)' : 'currentColor'} /> 
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {board.name}
                </span>
              </span>
              {boards.length > 1 && (
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(board._id)}
                  aria-label={`Delete ${board.name} board`}
                  title={`Delete ${board.name} board`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Board Form */}
      <form onSubmit={handleCreateBoardSubmit} style={styles.form}>
        <input
          type="text"
          placeholder={currentOrg ? `Add board to ${currentOrg.name}...` : "New Board Name..."}
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" className="btn-primary" style={styles.createBtn}>
          <Plus size={15} aria-hidden="true" /> Create Board
        </button>
      </form>

      {/* Current User Profile & Logout Section */}
      {currentUser && (
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{currentUser.name}</div>
              <div style={styles.userEmail}>{currentUser.email}</div>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              style={styles.logoutBtn}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  switcherSection: {
    position: 'relative',
    marginBottom: '14px',
    zIndex: 40
  },
  switcherLabel: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '6px'
  },
  switcherBtn: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  switcherLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0
  },
  switcherName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  personalIconBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  orgIconBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: '#16172b',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    zIndex: 100,
    maxHeight: '280px',
    overflowY: 'auto'
  },
  dropdownSectionTitle: {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    padding: '4px 8px 6px 8px'
  },
  dropdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    transition: 'background 0.15s ease'
  },
  orgDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  memberCountBadge: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    background: 'rgba(255,255,255,0.08)',
    padding: '2px 6px',
    borderRadius: '10px'
  },
  emptyOrgsText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    padding: '6px 8px',
    fontStyle: 'italic'
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '6px 0'
  },
  createOrgBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px dashed rgba(99, 102, 241, 0.4)',
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
    transition: 'background 0.2s ease'
  },
  activeOrgBanner: {
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '14px'
  },
  activeOrgTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  activeOrgMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  memberCountText: {
    fontWeight: '500'
  },
  roleTag: {
    fontSize: '0.65rem',
    padding: '1px 6px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: 'var(--color-primary)',
    fontWeight: '600'
  },
  inviteButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 9px',
    fontSize: '0.72rem',
    borderRadius: '6px',
    background: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  title: {
    margin: 0,
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    fontWeight: '600'
  },
  offlineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.7rem',
    background: '#f59e0b',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid transparent',
    alignItems: 'center',
    transition: 'all 0.15s ease'
  },
  link: {
    cursor: 'pointer',
    flex: 1,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflow: 'hidden',
    color: 'var(--text-primary)'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s'
  },
  form: {
    marginTop: '14px',
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '14px'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    marginBottom: '8px',
    fontSize: '0.8rem',
    borderRadius: '6px',
    border: '1px solid var(--glass-border)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '8px',
    fontSize: '0.85rem',
    borderRadius: '8px'
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '24px 10px'
  },
  userSection: {
    marginTop: '14px',
    paddingTop: '12px',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0
  },
  userAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    flexShrink: 0
  },
  userDetails: {
    minWidth: 0
  },
  userName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userEmail: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s'
  }
};

export default Sidebar;