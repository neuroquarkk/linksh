import { appendFile, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Custom stream object for morgan that write to date-partitioned files
 * structure: logs/yyyy/mm/dd.log
 */
export const logStream = {
    write: (message: string) => {
        const now = new Date();
        const year = String(now.getFullYear());
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const logDir = join(process.cwd(), 'logs', year, month);
        if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });

        const logFile = join(logDir, `${day}.log`);

        appendFile(logFile, message, (err) => {
            if (err) console.error('Failed to write log:', err);
        });
    },
};
