import { type Logger as PinoLogger, pino } from "pino";
import { sanitizeLogObject } from "./sanitizer";
import type { LogLevel } from "./types";

export class Logger {
	readonly pino: PinoLogger;
	private defaultContext: Record<string, unknown> = {};

	constructor(logLevel: LogLevel) {
		this.pino = pino({
			formatters: {
				level: (label) => {
					return { level: label };
				},
			},
			level: logLevel,
			messageKey: "message",
			timestamp: pino.stdTimeFunctions.isoTime,
		});
	}

	setContext(context: Record<string, unknown>) {
		const sanitized = sanitizeLogObject(context);
		this.defaultContext = sanitized;
	}

	fatal(message: string, context?: Record<string, unknown>): void {
		if (context) {
			const sanitized = sanitizeLogObject(context);
			this.pino.fatal({ ...this.defaultContext, ...sanitized }, message);
		} else {
			this.pino.fatal(this.defaultContext, message);
		}
	}

	error(message: string, context?: Record<string, unknown>): void {
		if (context) {
			const sanitized = sanitizeLogObject(context);
			this.pino.error({ ...this.defaultContext, ...sanitized }, message);
		} else {
			this.pino.error(this.defaultContext, message);
		}
	}

	warn(message: string, context?: Record<string, unknown>): void {
		if (context) {
			const sanitized = sanitizeLogObject(context);
			this.pino.warn({ ...this.defaultContext, ...sanitized }, message);
		} else {
			this.pino.warn(this.defaultContext, message);
		}
	}

	info(message: string, context?: Record<string, unknown>): void {
		if (context) {
			const sanitized = sanitizeLogObject(context);
			this.pino.info({ ...this.defaultContext, ...sanitized }, message);
		} else {
			this.pino.info(this.defaultContext, message);
		}
	}

	debug(message: string, context?: Record<string, unknown>): void {
		if (context) {
			const sanitized = sanitizeLogObject(context);
			this.pino.debug({ ...this.defaultContext, ...sanitized }, message);
		} else {
			this.pino.debug(this.defaultContext, message);
		}
	}

	trace(message: string, context?: Record<string, unknown>): void {
		if (context) {
			const sanitized = sanitizeLogObject(context);
			this.pino.trace({ ...this.defaultContext, ...sanitized }, message);
		} else {
			this.pino.trace(this.defaultContext, message);
		}
	}
}
