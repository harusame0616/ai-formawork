import { fail, type Result, succeed } from "@harusame0616/result";
import * as v from "valibot";
import { emailSchema, nameSchema, phoneSchema } from "../schema";

export const registerCustomerSchema = v.object({
	email: emailSchema,
	name: nameSchema,
	phone: phoneSchema,
});

export type RegisterCustomerParams = v.InferOutput<
	typeof registerCustomerSchema
>;

export function parseRegisterCustomerParams(
	value: unknown,
): Result<RegisterCustomerParams, Error> {
	const result = v.safeParse(registerCustomerSchema, value);

	if (result.success) {
		return succeed(result.output);
	}

	return fail(new v.ValiError(result.issues));
}
