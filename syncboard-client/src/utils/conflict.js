export const CONFLICT_TYPES = {
  NONE: 'NONE',
  SERVER_NEWER: 'SERVER_NEWER',
  CLIENT_NEWER: 'CLIENT_NEWER',
  BOTH_MODIFIED: 'BOTH_MODIFIED'
};

export const detectConflict = (clientData, serverData) => {
  if (!clientData || !serverData) {
    return { type: CONFLICT_TYPES.NONE, conflict: false };
  }
  if (!clientData.updatedAt || !serverData.updatedAt) {
    return { type: CONFLICT_TYPES.NONE, conflict: false };
  }
  const clientTime = new Date(clientData.updatedAt).getTime();
  const serverTime = new Date(serverData.updatedAt).getTime();
  if (serverTime > clientTime) {
    return {
      type: CONFLICT_TYPES.SERVER_NEWER,
      conflict: true,
      clientTime,
      serverTime,
      message: 'Server has newer version of this data'
    };
  }
  if (clientTime > serverTime) {
    return {
      type: CONFLICT_TYPES.CLIENT_NEWER,
      conflict: true,
      clientTime,
      serverTime,
      message: 'Client has newer version of this data'
    };
  }
  return { type: CONFLICT_TYPES.NONE, conflict: false };
};

export const getDifferences = (obj1, obj2) => {
  const differences = [];
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  allKeys.forEach(key => {
    if (['_id', '__v', 'createdAt', 'updatedAt', 'history'].includes(key)) {
      return;
    }
    const val1 = obj1[key];
    const val2 = obj2[key];
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

export const mergeData = (clientData, serverData, resolution) => {
  if (resolution === 'client') {
    return { ...clientData, updatedAt: new Date().toISOString() };
  } else if (resolution === 'server') {
    return { ...serverData };
  } else if (resolution === 'merge') {
    const merged = { ...serverData, ...clientData };
    merged.updatedAt = new Date().toISOString();
    return merged;
  }
  return serverData;
};