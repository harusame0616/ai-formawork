import * as v from "valibot";

// 検索キーワードの最大文字数
export const CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH = 300;

// SearchParams を適切な方に変換のみ
export const customerSearchParamsSchema = v.object({
	keyword: v.optional(v.pipe(v.string())),
	page: v.optional(v.pipe(v.string(), v.regex(/\d+/), v.transform(Number))),
});

// 内部処理用のschema（パース済みのデータ）
const customerSearchConditionSchema = v.object({
	keyword: v.optional(
		v.pipe(v.string(), v.maxLength(CUSTOMER_SEARCH_KEYWORD_MAX_LENGTH)),
	),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
});

export type CustomerSearchCondition = v.InferOutput<
	typeof customerSearchConditionSchema
>;
