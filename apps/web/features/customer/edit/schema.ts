import * as v from "valibot";
import { emailSchema, nameSchema, phoneSchema } from "../schema";

export const editCustomerSchema = v.object({
	customerId: v.pipe(v.string(), v.uuid()),
	email: emailSchema,
	name: nameSchema,
	phone: phoneSchema,
});

export type EditCustomerParams = v.InferInput<typeof editCustomerSchema>;
