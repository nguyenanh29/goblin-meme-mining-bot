const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logFile = path.join(__dirname, 'goblin-automation.log');
        this.maxLogSize = 10 * 1024 * 1024; // 10MB
        this.maxLogFiles = 5;
        
        // Ensure log file exists
        this.ensureLogFile();
    }
    
    ensureLogFile() {
        try {
            if (!fs.existsSync(this.logFile)) {
                fs.writeFileSync(this.logFile, '', 'utf8');
            }
        } catch (error) {
            console.error('Failed to create log file:', error.message);
        }
    }
    
    getTimestamp() {
        return new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    }
    
    writeToFile(level, message, error = null) {
        try {
            const timestamp = this.getTimestamp();
            let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            
            if (error) {
                logEntry += `\nError: ${error}`;
                if (error.stack) {
                    logEntry += `\nStack: ${error.stack}`;
                }
            }
            
            logEntry += '\n';
            
            // Check log file size
            if (fs.existsSync(this.logFile)) {
                const stats = fs.statSync(this.logFile);
                if (stats.size > this.maxLogSize) {
                    this.rotateLogFile();
                }
            }
            
            fs.appendFileSync(this.logFile, logEntry, 'utf8');
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }
    
    rotateLogFile() {
        try {
            // Rotate log files
            for (let i = this.maxLogFiles - 1; i >= 1; i--) {
                const oldFile = `${this.logFile}.${i}`;
                const newFile = `${this.logFile}.${i + 1}`;
                
                if (fs.existsSync(oldFile)) {
                    if (i === this.maxLogFiles - 1) {
                        fs.unlinkSync(oldFile); // Remove oldest file
                    } else {
                        fs.renameSync(oldFile, newFile);
                    }
                }
            }
            
            // Rename current log file
            fs.renameSync(this.logFile, `${this.logFile}.1`);
        } catch (error) {
            console.error('Failed to rotate log file:', error.message);
        }
    }
    
    info(message) {
        const timestamp = this.getTimestamp();
        console.log(`\x1b[36m[${timestamp}] [INFO]\x1b[0m ${message}`);
        this.writeToFile('info', message);
    }
    
    success(message) {
        const timestamp = this.getTimestamp();
        console.log(`\x1b[32m[${timestamp}] [SUCCESS]\x1b[0m ${message}`);
        this.writeToFile('success', message);
    }
    
    warn(message) {
        const timestamp = this.getTimestamp();
        console.log(`\x1b[33m[${timestamp}] [WARN]\x1b[0m ${message}`);
        this.writeToFile('warn', message);
    }
    
    error(message, error = null) {
        const timestamp = this.getTimestamp();
        console.log(`\x1b[31m[${timestamp}] [ERROR]\x1b[0m ${message}`);
        this.writeToFile('error', message, error);
    }
    
    debug(message) {
        const timestamp = this.getTimestamp();
        if (process.env.DEBUG === 'true') {
            console.log(`\x1b[90m[${timestamp}] [DEBUG]\x1b[0m ${message}`);
        }
        this.writeToFile('debug', message);
    }
    
    // Method to read log
    readLogs(lines = 100) {
        try {
            if (!fs.existsSync(this.logFile)) {
                return 'Log file not found';
            }
            
            const data = fs.readFileSync(this.logFile, 'utf8');
            const logLines = data.split('\n').filter(line => line.trim() !== '');
            
            if (lines === 'all') {
                return logLines.join('\n');
            }
            
            return logLines.slice(-lines).join('\n');
        } catch (error) {
            return `Failed to read log: ${error.message}`;
        }
    }
    
    // Method to clear log
    clearLogs() {
        try {
            fs.writeFileSync(this.logFile, '', 'utf8');
            this.info('Log file has been cleared');
        } catch (error) {
            this.error('Failed to clear log file:', error);
        }
    }
}

module.exports = new Logger();
