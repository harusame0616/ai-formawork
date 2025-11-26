import * as v from "valibot";
import {
	staffEmailSchema,
	staffNameSchema,
	staffPasswordSchema,
	staffRoleSchema,
} from "../schema";

export const registerStaffSchema = v.object({
	email: staffEmailSchema,
	name: staffNameSchema,
	password: staffPasswordSchema,
	role: staffRoleSchema,
});

export type RegisterStaffParams = v.InferOutput<typeof registerStaffSchema>;
