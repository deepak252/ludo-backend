import winston, { format, transports } from 'winston'

const { combine, timestamp, printf, errors, colorize } = format

// Format the message based on the type of data
const formatData = (data: any) => {
  if (data instanceof Set) {
    return [...data] // Convert Set to array
  } else if (data instanceof Map) {
    return Array.from(data.entries()) // Convert Map to array of [key, value] pairs
  } else if (Array.isArray(data)) {
    return data // Directly return array
  } else if (data && typeof data === 'object') {
    return JSON.stringify(data, null, 2) // Convert objects to pretty JSON
  }
  return data // For primitives (string, number, etc.), return as is
}

// Define custom format for logs
const logFormat = printf(({ level, message, timestamp, stack }) => {
  const formattedMessage = formatData(message)
  return `${timestamp} [${level}]: ${stack || formattedMessage}`
})

// Create Winston logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Include stack trace for errors
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(), // Colorize output for console
        logFormat
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log errors to a file
    new transports.File({ filename: 'logs/combined.log' }) // Log all levels to a combined file
  ]
})

// Handle logging for production environments
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.File({
      filename: 'logs/production.log',
      level: 'info'
    })
  )
}

export default logger
