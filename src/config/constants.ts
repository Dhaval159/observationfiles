export const constants = {
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  debounce: {
    search: 300,
    save: 500,
    resize: 200,
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024,
    maxUploads: 10,
    maxInventoryItems: 50,
    maxEvidencePerCase: 100,
    maxDialogueOptions: 6,
  },
  timings: {
    autoSaveInterval: 30000,
    sessionTimeout: 3600000,
    toastDuration: 5000,
  },
} as const;
