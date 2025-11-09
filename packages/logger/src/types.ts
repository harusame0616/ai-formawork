export type LogLevel =
	| "fatal"
	| "error"
	| "warn"
	| "info"
	| "debug"
	| "trace"
	| "silent";

export type Environment = "development" | "staging" | "production";

export type LoggerContext = {
	application: string;
	environment: Environment;
	service: string;
	hostname?: string;
	codeLocation?: string;
	[key: string]: unknown;
};

export type LoggerConfig = {
	application: string;
	environment: Environment;
	level: LogLevel;
	service: string;
};

export type SensitivePattern = {
	name: string;
	pattern: RegExp;
	mask: string;
};
