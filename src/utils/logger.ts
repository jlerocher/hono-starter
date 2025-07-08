import pino from "pino";

export const logger = pino({
    level: "info",
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
});
