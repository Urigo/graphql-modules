import * as winston from 'winston';
import { createLogger, format, Logger } from 'winston';
import { inspect } from 'util';

export const logger: Logger = createLogger({
  level: 'debug',
  transports: [new winston.transports.Console()],
  format: format.combine(
    format.metadata(),
    format.colorize(),
    format.timestamp(),
    format.printf(nfo => {
      let data = '';

      if (nfo.metadata && ((typeof nfo.metadata === 'object' && Object.keys(nfo.metadata).length > 0) || Array.isArray(nfo))) {
        data = '\n' + inspect(nfo.metadata, { depth: null, colors: true });
      }

      return `[${nfo.timestamp}][${nfo.level}]: ${nfo.message}${data}`;
    }),
  ),
});

export default logger;
