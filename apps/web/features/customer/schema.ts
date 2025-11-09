import * as v from "valibot";

export const customerSearchSchema = v.object({
	keyword: v.optional(v.string()),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
});

export type CustomerSearchParams = v.InferOutput<typeof customerSearchSchema>;
