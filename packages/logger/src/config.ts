import * as v from "valibot";
import type { LoggerConfig } from "./types";

export function getLoggerConfig(): LoggerConfig {
	return v.parse(
		v.object({
			application: v.string(),
			environment: v.optional(
				v.picklist(["development", "staging", "production"]),
				"development",
			),
			level: v.optional(
				v.picklist([
					"fatal",
					"error",
					"warn",
					"info",
					"debug",
					"trace",
					"silent",
				]),
				"info",
			),
			service: v.string(),
		}),
		{
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			APP_NAME: process.env["APP_NAME"],
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			HOST_ENVIRONMENT: process.env["HOST_ENVIRONMENT"],
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			LOG_LEVEL: process.env["LOG_LEVEL"],
			// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
			SERVICE_NAME: process.env["SERVICE_NAME"],
		},
	);
}
