import winston from "winston";

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
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
