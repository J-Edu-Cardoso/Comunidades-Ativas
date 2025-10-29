/**
 * Logger utility - Sistema de logging para a aplicação
 */
class Logger {
    constructor() {
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        this.currentLevel = this.levels[process.env.LOG_LEVEL || 'info'];
    }

    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    error(message, error = null) {
        if (this.currentLevel >= this.levels.error) {
            console.error(this.formatMessage('error', message));
            if (error) {
                console.error(error);
            }
        }
    }

    warn(message) {
        if (this.currentLevel >= this.levels.warn) {
            console.warn(this.formatMessage('warn', message));
        }
    }

    info(message) {
        if (this.currentLevel >= this.levels.info) {
            console.log(this.formatMessage('info', message));
        }
    }

    debug(message) {
        if (this.currentLevel >= this.levels.debug) {
            console.log(this.formatMessage('debug', message));
        }
    }
}

module.exports = new Logger();
