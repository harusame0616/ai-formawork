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
import { OptionalBadge } from "@workspace/ui/components/optional-badge";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { editCustomerAction } from "@/features/customer/edit/edit-customer-action";
import { useIsHydrated } from "@/libs/use-is-hydrated";
import type { EditCustomerParams } from "../edit/schema";
import { registerCustomerAction } from "./register-customer-action";
import { type RegisterCustomerParams, registerCustomerSchema } from "./schema";

type EditCustomerFormProps = {
	customerId?: string;
	initialValues?: Omit<EditCustomerParams, "customerId">;
};

export function EditCustomerForm(
	props?: EditCustomerFormProps & { disabled?: boolean },
) {
	const router = useRouter();
	const { isHydrated } = useIsHydrated();

	const form = useForm<RegisterCustomerParams>({
		defaultValues: props?.initialValues
			? props.initialValues
			: {
					email: "",
					name: "",
					phone: "",
				},
		resolver: valibotResolver(registerCustomerSchema),
	});

	async function onSubmit(values: RegisterCustomerParams) {
		form.clearErrors("root");

		const result = props?.customerId
			? await editCustomerAction({
					customerId: props.customerId,
					email: values.email,
					name: values.name,
					phone: values.phone,
				})
			: await registerCustomerAction(values);

		if (result.success) {
			router.push(`/customers/${result.data.customerId}`);
		} else {
			form.setError("root", {
				message: result?.error || "エラーが発生しました",
			});
		}
	}

	const disabled = !!(
		form.formState.isSubmitting ||
		!isHydrated ||
		props?.disabled
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
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								名前
								<RequiredBadge />
							</FormLabel>
							<FormDescription>24文字以内で入力してください</FormDescription>
							<FormControl>
								<Input
									autoComplete="name"
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
								<OptionalBadge />
							</FormLabel>
							<FormDescription>254文字以内で入力してください</FormDescription>
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
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								電話番号
								<OptionalBadge />
							</FormLabel>
							<FormDescription>
								数字のみ20文字以内で入力してください（ハイフンは自動で除去されます）
							</FormDescription>
							<FormControl>
								<Input
									autoComplete="tel"
									className="w-40"
									disabled={disabled}
									type="tel"
									{...field}
								/>
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
					{props?.customerId ? (
						<Button className="min-w-[120px]" disabled={disabled} type="submit">
							{form.formState.isSubmitting ? (
								<>
									編集中
									<Loader2 className="ml-2 size-4 animate-spin" />
								</>
							) : (
								"編集する"
							)}
						</Button>
					) : (
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
					)}
				</div>
			</form>
		</Form>
	);
}
