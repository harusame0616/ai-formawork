import { getLoggerConfig } from "./config";
import { Logger } from "./logger";
import type { LoggerContext } from "./types";

export function getBaseLogger(
	context: Omit<LoggerContext, "application" | "environment" | "service"> = {},
): Logger {
	const config = getLoggerConfig();

	const bindings = {
		application: config.application,
		environment: config.environment,
		service: config.service,
		...context,
	};

	const logger = new Logger(config.level);
	logger.setContext(bindings);

	return logger;
}
