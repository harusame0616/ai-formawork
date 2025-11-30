import * as v from "valibot";
import {
	staffEmailSchema,
	staffFirstNameSchema,
	staffLastNameSchema,
	staffPasswordSchema,
	staffRoleSchema,
} from "../schema";

export const registerStaffSchema = v.object({
	email: staffEmailSchema,
	firstName: staffFirstNameSchema,
	lastName: staffLastNameSchema,
	password: staffPasswordSchema,
	role: staffRoleSchema,
});

export type RegisterStaffParams = v.InferOutput<typeof registerStaffSchema>;
