"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
	RadioGroup,
	RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { UserRole } from "@/features/auth/user/role";
import { useIsHydrated } from "@/libs/use-is-hydrated";
import { registerStaffAction } from "./register-staff-action";
import { type RegisterStaffParams, registerStaffSchema } from "./schema";

type EditStaffFormProps = {
	disabled?: boolean;
};

export function EditStaffForm({ disabled: disabledProp }: EditStaffFormProps) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();

	const form = useForm<RegisterStaffParams>({
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
			password: "",
			role: UserRole.User,
		},
		resolver: valibotResolver(registerStaffSchema),
	});

	async function onSubmit(values: RegisterStaffParams) {
		form.clearErrors("root");

		const result = await registerStaffAction(values);

		if (result.success) {
			router.push("/staffs");
		} else {
			form.setError("root", {
				message: result.error || "エラーが発生しました",
			});
		}
	}

	const disabled = !!(
		form.formState.isSubmitting ||
		!isHydrated ||
		disabledProp
	);

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								姓
								<RequiredBadge />
							</FormLabel>
							<FormDescription>24文字以内で入力してください</FormDescription>
							<FormControl>
								<Input
									autoComplete="family-name"
									className="max-w-xs"
									disabled={disabled}
									type="text"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								名
								<RequiredBadge />
							</FormLabel>
							<FormDescription>24文字以内で入力してください</FormDescription>
							<FormControl>
								<Input
									autoComplete="given-name"
									className="max-w-xs"
									disabled={disabled}
									type="text"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								メールアドレス
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								ログインに使用するメールアドレスを入力してください
							</FormDescription>
							<FormControl>
								<Input
									autoComplete="email"
									className="max-w-sm"
									disabled={disabled}
									type="email"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								パスワード
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								8文字以上128文字以内で入力してください
							</FormDescription>
							<FormControl>
								<Input
									autoComplete="new-password"
									className="max-w-sm"
									disabled={disabled}
									type="password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="role"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								ロール
								<RequiredBadge />
							</FormLabel>
							<FormDescription>
								一般は顧客一覧・詳細の表示とノートの一覧・編集・削除が可能。管理者は一般に加えて顧客の登録・編集・削除、スタッフの一覧・登録・編集・削除が可能
							</FormDescription>
							<FormControl>
								<RadioGroup
									defaultValue={field.value}
									disabled={disabled}
									onValueChange={field.onChange}
								>
									<div className="flex items-center gap-2">
										<RadioGroupItem id="role-user" value={UserRole.User} />
										<Label htmlFor="role-user">一般</Label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem id="role-admin" value={UserRole.Admin} />
										<Label htmlFor="role-admin">管理者</Label>
									</div>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{form.formState.errors.root && (
					<div className="text-sm text-destructive" role="alert">
						{form.formState.errors.root.message}
					</div>
				)}

				<div className="flex gap-2">
					<Button
						disabled={disabled}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					<Button className="min-w-[120px]" disabled={disabled} type="submit">
						{form.formState.isSubmitting ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								登録中...
							</>
						) : (
							"登録する"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
