"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { OptionalBadge } from "@workspace/ui/components/optional-badge";
import { RequiredBadge } from "@workspace/ui/components/required-badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { CustomerNoteImageInput } from "../list/customer-note-image-input";
import { registerCustomerNoteAction } from "./register-customer-note-action";
import { useImageUpload } from "./use-image-upload";

const formSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
});

type FormValues = v.InferOutput<typeof formSchema>;

type RegisterCustomerNoteDialogProps = {
	customerId: string;
};

export function RegisterCustomerNoteDialog({
	customerId,
}: RegisterCustomerNoteDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [imageErrorMessage, setImageErrorMessage] = useState<string | null>(
		null,
	);

	const {
		addImages: addImagesOriginal,
		clearAll: clearImages,
		images,
		isUploading,
		removeImage,
		uploadAll,
	} = useImageUpload();

	// 画像枚数チェック付きの追加関数
	const addImages = (files: File[]) => {
		const MAX_IMAGES = 5;
		const currentImagesCount = images.length;
		const availableSlots = MAX_IMAGES - currentImagesCount;

		if (availableSlots <= 0) {
			setImageErrorMessage("画像は最大5枚までです");
			return;
		}

		if (files.length > availableSlots) {
			setImageErrorMessage(
				`画像は最大5枚までです。あと${availableSlots}枚まで追加できます`,
			);
			// 追加可能な枚数分だけ追加
			addImagesOriginal(files.slice(0, availableSlots));
			return;
		}

		setImageErrorMessage(null);
		addImagesOriginal(files);
	};

	function handleRemoveImage(id: string) {
		removeImage(id);
		setImageErrorMessage(null);
	}

	const form = useForm<FormValues>({
		defaultValues: {
			content: "",
		},
		resolver: valibotResolver(formSchema),
	});

	function onSubmit(values: FormValues) {
		setErrorMessage(null);

		startTransition(async () => {
			// 画像がある場合は先にアップロード
			let uploadImages: { permanentPath: string; temporaryPath: string }[] = [];
			if (images.length > 0) {
				const uploadResult = await uploadAll(customerId);
				if (!uploadResult.success) {
					setErrorMessage("画像のアップロードに失敗しました");
					return;
				}
				uploadImages = uploadResult.uploadImages;
			}

			const result = await registerCustomerNoteAction({
				content: values.content,
				customerId,
				uploadImages,
			});

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			form.reset();
			clearImages();
			setErrorMessage(null);
			setOpen(false);
			router.refresh();
		});
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			form.reset();
			clearImages();
			setErrorMessage(null);
			setImageErrorMessage(null);
		}
		setOpen(open);
	}

	const isProcessing = isPending || isUploading;

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					ノートを追加
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ノートを追加</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						{errorMessage && (
							<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
								<AlertCircle className="h-4 w-4 shrink-0" />
								<p>{errorMessage}</p>
							</div>
						)}

						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-2">
										内容
										<RequiredBadge />
									</FormLabel>
									<FormDescription>
										顧客に関するメモや連絡事項を記録できます
									</FormDescription>
									<FormControl>
										<Textarea
											{...field}
											className="max-h-32"
											disabled={isProcessing}
											maxLength={4096}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div>
							<FormLabel className="flex items-center gap-2">
								画像
								<OptionalBadge />
							</FormLabel>
							<FormDescription className="mb-2">
								ノートに添付する画像を選択できます（最大5枚）
							</FormDescription>

							{imageErrorMessage && (
								<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm mb-3">
									<AlertCircle className="h-4 w-4 shrink-0" />
									<p>{imageErrorMessage}</p>
								</div>
							)}

							<CustomerNoteImageInput
								disabled={isProcessing}
								images={images}
								onAddImages={addImages}
								onRemoveImage={handleRemoveImage}
							/>
						</div>

						<DialogFooter>
							<Button
								disabled={isProcessing}
								onClick={() => handleOpenChange(false)}
								type="button"
								variant="outline"
							>
								キャンセル
							</Button>
							<Button
								className="min-w-[120]"
								disabled={isProcessing}
								type="submit"
							>
								{isProcessing ? (
									<>
										{isUploading ? "アップロード中" : "登録中"}
										<Loader2 className="ml-2 size-4 animate-spin" />
									</>
								) : (
									"登録"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
