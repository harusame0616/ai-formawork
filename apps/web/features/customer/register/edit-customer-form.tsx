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
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { editCustomerAction } from "@/features/customer/edit/edit-customer-action";
import { useIsHydrated } from "@/libs/use-is-hydrated";
import { type RegisterCustomerInput, registerCustomerSchema } from "../schema";
import { registerCustomerAction } from "./register-customer-action";

type EditCustomerFormProps = {
	customerId?: string;
	initialValues?: {
		name: string;
		email: string | null;
		phone: string | null;
	};
};

export function EditCustomerForm(
	props?: EditCustomerFormProps & { disabled?: boolean },
) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { isHydrated } = useIsHydrated();

	const defaultValues = props?.initialValues
		? {
				email: props.initialValues.email ?? "",
				name: props.initialValues.name,
				phone: props.initialValues.phone ?? "",
			}
		: {
				email: "",
				name: "",
				phone: "",
			};

	const form = useForm<RegisterCustomerInput>({
		defaultValues,
		resolver: valibotResolver(registerCustomerSchema),
	});

	function onSubmit(values: RegisterCustomerInput) {
		form.clearErrors("root");
		startTransition(async () => {
			if (!props?.customerId) {
				const result = await registerCustomerAction(values);
				if (!result.success) {
					form.setError("root", {
						message: result.error,
					});
				}
				// 成功時はredirect()によって自動的にリダイレクトされる
			} else {
				const result = await editCustomerAction({
					customerId: props.customerId,
					email: values.email || null,
					name: values.name,
					phone: values.phone || null,
				});
				if (!result.success) {
					form.setError("root", {
						message: result.error,
					});
					return;
				}
				router.push(`/customers/${props.customerId}`);
			}
		});
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-6"
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					disabled={!isHydrated || props?.disabled}
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
					disabled={!isHydrated || props?.disabled}
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
					disabled={!isHydrated || props?.disabled}
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
						disabled={isPending || !isHydrated || props?.disabled}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					{props?.customerId ? (
						<Button
							className="min-w-[120px]"
							disabled={isPending || !isHydrated || props.disabled}
							type="submit"
						>
							{isPending ? (
								<>
									編集中
									<Loader2 className="ml-2 size-4 animate-spin" />
								</>
							) : (
								"編集する"
							)}
						</Button>
					) : (
						<Button
							className="min-w-[120px]"
							disabled={isPending || !isHydrated || props?.disabled}
							type="submit"
						>
							{isPending ? (
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
