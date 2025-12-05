import * as v from "valibot";

export const defaultUserName = v.parse(
	v.optional(v.string(), ""),
	// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
	process.env["NEXT_PUBLIC_DEFAULT_USERNAME"],
);

export const defaultPassword = v.parse(
	v.optional(v.string(), ""),
	// biome-ignore lint/complexity/useLiteralKeys: ts(4111)
	process.env["NEXT_PUBLIC_DEFAULT_PASSWORD"],
);
