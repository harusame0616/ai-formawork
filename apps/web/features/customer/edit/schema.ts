import { fail, type Result, succeed } from "@harusame0616/result";
import * as v from "valibot";
import { emailSchema, nameSchema, phoneSchema } from "../schema";

const editCustomerSchema = v.object({
	customerId: v.pipe(v.string(), v.uuid()),
	email: emailSchema,
	name: nameSchema,
	phone: phoneSchema,
});

export type EditCustomerParams = v.InferInput<typeof editCustomerSchema>;

export function parseEditCustomerParams(
	value: unknown,
): Result<EditCustomerParams, Error> {
	const result = v.safeParse(editCustomerSchema, value);

	if (result.success) {
		return succeed(result.output);
	}

	return fail(new v.ValiError(result.issues));
}
