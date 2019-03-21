import * as winston from "winston";

const logger: winston.Logger = winston.createLogger(
    {
        level: "debug",
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: "error.log", level: "error" }),
        ]
    },
);

export default logger;