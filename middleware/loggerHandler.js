import winston from "winston";

// Custom timestamp format for Indian timezone
const indianTimestamp = winston.format((info) => {
  const now = new Date();
  const indianTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  // Format: DD/MM/YYYY HH:mm:ss
  const formattedDate = indianTime.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
  const formattedTime = indianTime.toLocaleTimeString("en-GB", { 
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  
  info.timestamp = `${formattedDate} ${formattedTime}`;
  return info;
});

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    indianTimestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
  ],
});

// Middleware function to log requests and responses
const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info("Incoming Request", {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - start;

    logger.info("Outgoing Response", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    });

    res.end = originalEnd;
    res.end(chunk, encoding);
  };

  next();
};

export default loggerMiddleware;
