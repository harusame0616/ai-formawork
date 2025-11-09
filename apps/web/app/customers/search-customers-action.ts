"use server";

import { fail, type Result } from "@harusame0616/result";
import { getLogger } from "@repo/logger/nextjs/server";
import {
	searchCustomers,
	type SearchCustomersError,
	type SearchCustomersResult,
} from "../../features/customer/search-customers";
import {
	searchCustomersSchema,
	type SearchCustomersSchema,
} from "../../features/customer/schema";
import * as v from "valibot";

export type SearchCustomersActionErrorMessage =
	| "VALIDATION_ERROR"
	| "SEARCH_ERROR";

export async function searchCustomersAction(
	params: SearchCustomersSchema,
): Promise<Result<SearchCustomersResult, SearchCustomersActionErrorMessage>> {
	const logger = getLogger();

	// バリデーション
	const paramsParseResult = v.safeParse(searchCustomersSchema, params);
	if (!paramsParseResult.success) {
		logger.warn(
			"Validation error in searchCustomersAction",
			{ error: paramsParseResult.issues },
		);
		return fail("VALIDATION_ERROR");
	}

	// 顧客検索実行
	logger.info("Searching customers", { params: paramsParseResult.output });
	const result = await searchCustomers(paramsParseResult.output);

	if (!result.success) {
		logger.error("Failed to search customers", { error: result.error });
		return fail("SEARCH_ERROR");
	}

	logger.info("Successfully searched customers", {
		totalCount: result.data.totalCount,
	});
	return result;
}
