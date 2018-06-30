import * as winston from 'winston';
import { createLogger, Logger, format } from 'winston';

export const logger: Logger = createLogger({
  level: 'debug',
  transports: [ new winston.transports.Console()],
  format: format.combine(
    format.json(),
    format.timestamp(),
    format.colorize(),
  ),
});

export default logger;
