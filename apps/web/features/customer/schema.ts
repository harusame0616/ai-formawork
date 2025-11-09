import * as v from "valibot";

export const GetCustomersQuerySchema = v.object({
	keyword: v.optional(v.string(), ""),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	perPage: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
});

export type GetCustomersQuery = v.InferOutput<typeof GetCustomersQuerySchema>;
