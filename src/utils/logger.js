export const logger = {
  log: (...args) => {
    if (process.env.APPLICATION_ENVIRONMENT === "development")
      console.log(...args);
  },

  warn: (...args) => {
    if (process.env.APPLICATION_ENVIRONMENT === "development")
      console.warn(...args);
  },
  error: (...args) => {
    if (process.env.APPLICATION_ENVIRONMENT === "development")
      console.error(...args);
  },
};
