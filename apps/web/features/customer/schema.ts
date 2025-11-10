import * as v from "valibot";

// searchParams用のschema（URLパラメータは文字列または文字列配列）
export const customerSearchParamsSchema = v.object({
	keyword: v.optional(v.pipe(v.string())),
	page: v.optional(v.pipe(v.string(), v.regex(/\d+/), v.transform(Number))),
});

// 内部処理用のschema（パース済みのデータ）
const customerSearchConditionSchema = v.object({
	keyword: v.optional(v.string()),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
});

export type CustomerSearchCondition = v.InferOutput<
	typeof customerSearchConditionSchema
>;
