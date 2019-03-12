import { createLogger, Logger } from "bs-logger";

const logger: Logger = createLogger({
    targets: "errors.log+:error", // specifying out formatter
    });

export default logger;