import * as winston from 'winston';
import * as moment from 'moment';

export const logger: winston.LoggerInstance = new winston.Logger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      timestamp: () => moment().format('DD.MM.YYYY(Z) HH:mm:ss'),
      colorize: true,
    }),
  ],
});

export default logger;
