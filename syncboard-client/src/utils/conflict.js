// Conflict detection utilities
export const CONFLICT_TYPES = {
  NONE: 'NONE',
  SERVER_NEWER: 'SERVER_NEWER',
  CLIENT_NEWER: 'CLIENT_NEWER',
  BOTH_MODIFIED: 'BOTH_MODIFIED'
};

// Check if there is a conflict between client and server data
export const detectConflict = (clientData, serverData) => {
  // If either data is missing, no conflict
  if (!clientData || !serverData) {
    return { type: CONFLICT_TYPES.NONE, conflict: false };
  }

  // If timestamps are missing, no conflict check possible
  if (!clientData.updatedAt || !serverData.updatedAt) {
    return { type: CONFLICT_TYPES.NONE, conflict: false };
  }

  const clientTime = new Date(clientData.updatedAt).getTime();
  const serverTime = new Date(serverData.updatedAt).getTime();

  // If server data is newer than client data
  if (serverTime > clientTime) {
    return {
      type: CONFLICT_TYPES.SERVER_NEWER,
      conflict: true,
      clientTime,
      serverTime,
      message: 'Server has newer version of this data'
    };
  }

  // If client data is newer than server data (should not happen normally)
  if (clientTime > serverTime) {
    return {
      type: CONFLICT_TYPES.CLIENT_NEWER,
      conflict: true,
      clientTime,
      serverTime,
      message: 'Client has newer version of this data'
    };
  }

  // Same timestamp - no conflict
  return { type: CONFLICT_TYPES.NONE, conflict: false };
};

// Compare two objects and get differences
export const getDifferences = (obj1, obj2) => {
  const differences = [];
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  allKeys.forEach(key => {
    // Skip internal fields
    if (['_id', '__v', 'createdAt', 'updatedAt', 'history'].includes(key)) {
      return;
    }

    const val1 = obj1[key];
    const val2 = obj2[key];

    // Deep compare for objects and arrays
    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences.push({
          field: key,
          clientValue: val1,
          serverValue: val2
        });
      }
    } else if (val1 !== val2) {
      differences.push({
        field: key,
        clientValue: val1,
        serverValue: val2
      });
    }
  });

  return differences;
};

// Merge client and server data (choose which one to keep)
export const mergeData = (clientData, serverData, resolution) => {
  if (resolution === 'client') {
    return { ...clientData, updatedAt: new Date().toISOString() };
  } else if (resolution === 'server') {
    return { ...serverData };
  } else if (resolution === 'merge') {
    // Smart merge - keep client changes, but update timestamps
    const merged = { ...serverData, ...clientData };
    merged.updatedAt = new Date().toISOString();
    return merged;
  }
  return serverData;
};

// Format conflict for display
export const formatConflictMessage = (conflict, data) => {
  if (!conflict || !conflict.conflict) {
    return 'No conflict detected';
  }

  let message = '⚠️ Conflict Detected!\n\n';
  
  if (conflict.type === CONFLICT_TYPES.SERVER_NEWER) {
    message += `Server has newer version (${new Date(conflict.serverTime).toLocaleString()})\n`;
    message += `Your version: ${new Date(conflict.clientTime).toLocaleString()}\n\n`;
  } else if (conflict.type === CONFLICT_TYPES.CLIENT_NEWER) {
    message += `Your version is newer (${new Date(conflict.clientTime).toLocaleString()})\n`;
    message += `Server version: ${new Date(conflict.serverTime).toLocaleString()}\n\n`;
  }

  if (data) {
    const differences = getDifferences(data.client, data.server);
    if (differences.length > 0) {
      message += 'Differences found:\n';
      differences.forEach(diff => {
        message += `  - ${diff.field}: "${diff.clientValue}" ≠ "${diff.serverValue}"\n`;
      });
    }
  }

  return message;
};

export default {
  detectConflict,
  getDifferences,
  mergeData,
  formatConflictMessage,
  CONFLICT_TYPES
};