/** biome-ignore-all lint/complexity/useLiteralKeys: ts(4111) */
import * as v from "valibot";

export const schemaName = v.parse(
	v.pipe(
		v.union([
			v.object({
				appName: v.pipe(
					v.string("appName は文字列である必要があります"),
					v.transform((appName) => appName.replace(/[\W]/g, "_")),
				),
				branchName: v.pipe(
					v.string("branchName は文字列である必要があります"),
					v.transform((branchName) => branchName.replace(/[\W]/g, "_")),
				),
				environment: v.picklist(["production", "preview"]),
				serviceName: v.pipe(
					v.string("serviceName は必須です"),
					v.transform((serviceName) => serviceName.replace(/[\W]/g, "_")),
				),
			}),
			v.object({
				environment: v.optional(v.literal("local"), "local"),
			}),
		]),
		v.transform((result) =>
			result.environment === "local"
				? "public"
				: `${result.appName}__${result.serviceName}__${result.branchName}`.toLowerCase(),
		),
	),
	{
		appName: process.env["APP_NAME"],
		branchName: process.env["VERCEL_GIT_COMMIT_REF"],
		environment: process.env["VERCEL_ENV"],
		serviceName: process.env["SERVICE_NAME"],
	},
);
