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
