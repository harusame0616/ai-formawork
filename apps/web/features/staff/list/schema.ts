import { succeed } from "@harusame0616/result";
import * as v from "valibot";

export const STAFF_SEARCH_KEYWORD_MAX_LENGTH = 300;

const keywordSchema = v.pipe(
	v.string(),
	v.maxLength(STAFF_SEARCH_KEYWORD_MAX_LENGTH),
);

const pageSchema = v.pipe(v.number(), v.minValue(1));

export const staffsConditionSchema = v.object({
	keyword: keywordSchema,
	page: pageSchema,
});

const staffsConditionSearchParamsSchema = v.object({
	keyword: v.optional(keywordSchema, ""),
	page: v.optional(v.pipe(v.string(), v.transform(Number), pageSchema), "1"),
});

export type StaffsConditionSearchParams = v.InferOutput<
	typeof staffsConditionSearchParamsSchema
>;

export type StaffsCondition = v.InferOutput<typeof staffsConditionSchema>;

export function parseStaffsConditionSearchParams(value: unknown) {
	const result = v.safeParse(staffsConditionSearchParamsSchema, value);

	return result.success
		? succeed(result.output)
		: succeed({ keyword: "", page: 1 });
}

export type StaffsListItem = {
	email: string;
	firstName: string;
	lastName: string;
	staffId: string;
};
