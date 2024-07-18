import winston from 'winston';
import { Config } from '.';

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: { service: 'auth-service' },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            level: 'error',
            dirname: 'logs',
            filename: 'error.log',
            silent: Config.NODE_ENV === 'test',
        }),
        new winston.transports.File({
            level: 'info',
            dirname: 'logs',
            filename: 'combined.log',
            silent: Config.NODE_ENV === 'test',
        }),
        new winston.transports.Console({
            level: 'info',
        }),
    ],
});

export default logger;

/* 

Levels:
{
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

If level = error, it captures only logs that has got errors not logs with info
If level = info, it captures all logs that has got info, warn and errors.

If silent is true, then logs are not stored in the directory. We don't want to store the logs in
non prod environments

*/
