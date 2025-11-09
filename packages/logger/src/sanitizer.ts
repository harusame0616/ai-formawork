import type { SensitivePattern } from "./types";

const SENSITIVE_PATTERNS: SensitivePattern[] = [
	{
		mask: '"password":"[REDACTED]"',
		name: "password",
		pattern: /"password"\s*:\s*"[^"]*"/gi,
	},
	{
		mask: '"token":"[REDACTED]"',
		name: "token",
		pattern:
			/"(?:access_token|refresh_token|auth_token|api_token)"\s*:\s*"[^"]*"/gi,
	},
	{
		mask: '"api_key":"[REDACTED]"',
		name: "apiKey",
		pattern: /"(?:api[-_]?key|secret[-_]?key|secret)"\s*:\s*"[^"]*"/gi,
	},
	{
		mask: '"authorization":"[REDACTED]"',
		name: "authorization",
		pattern: /"authorization"\s*:\s*"[^"]*"/gi,
	},
	{
		mask: "Bearer [REDACTED]",
		name: "bearer",
		pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
	},
];

function escapeControlCharacters(value: string): string {
	return (
		value
			.replace(/\r/g, "\\r")
			.replace(/\n/g, "\\n")
			.replace(/\t/g, "\\t")
			// biome-ignore lint/suspicious/noControlCharactersInRegex: OWASP推奨の制御文字除外処理
			.replace(/[\x00-\x1F\x7F]/g, "")
	);
}

function maskSensitiveData(value: string): string {
	let masked = value;

	for (const pattern of SENSITIVE_PATTERNS) {
		masked = masked.replace(pattern.pattern, pattern.mask);
	}

	return masked;
}

function sanitizeString(value: string): string {
	let sanitized = escapeControlCharacters(value);
	sanitized = maskSensitiveData(sanitized);
	return sanitized;
}

function isSensitiveKey(key: string): boolean {
	const lowerKey = key.toLowerCase();
	const sensitivePatterns = [
		/^.*password.*$/,
		/^.*token$/,
		/^.*secret.*$/,
		/^.*[-_]key$/,
		/^api[-_]?key$/,
	];

	return sensitivePatterns.some((pattern) => pattern.test(lowerKey));
}

function isErrorObject(value: unknown): value is Error {
	return value instanceof Error;
}

function serializeError(error: Error): Record<string, unknown> {
	return {
		message: error.message,
		name: error.name,
		stack: error.stack,
	};
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(obj)) {
		if (isSensitiveKey(key)) {
			sanitized[key] = "[REDACTED]";
			continue;
		}

		if (key === "err" && isErrorObject(value)) {
			sanitized[key] = serializeError(value);
			continue;
		}

		sanitized[key] = sanitizeValue(value);
	}

	return sanitized;
}

function sanitizeArray(arr: unknown[]): unknown[] {
	return arr.map((item) => sanitizeValue(item));
}

function sanitizeValue(value: unknown): unknown {
	if (value === null || value === undefined) {
		return value;
	}

	if (typeof value === "string") {
		return sanitizeString(value);
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return value;
	}

	if (Array.isArray(value)) {
		return sanitizeArray(value);
	}

	if (typeof value === "object") {
		return sanitizeObject(value as Record<string, unknown>);
	}

	return value;
}

export function sanitizeLogObject(
	obj: Record<string, unknown>,
): Record<string, unknown> {
	return sanitizeObject(obj);
}
