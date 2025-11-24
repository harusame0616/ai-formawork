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
import { Textarea } from "@workspace/ui/components/textarea";
import { AlertCircle, Edit, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { CustomerNoteImageInput } from "@/features/customer-note/list/customer-note-image-input";
import type { CustomerNoteImageWithUrl } from "@/features/customer-note/list/get-customer-notes";
import { useImageUpload } from "@/features/customer-note/register/use-image-upload";
import { editCustomerNoteAction } from "./edit-customer-note-action";

const formSchema = v.object({
	content: v.pipe(
		v.string(),
		v.minLength(1, "内容を入力してください"),
		v.maxLength(4096, "内容は4096文字以内で入力してください"),
	),
});

type FormValues = v.InferOutput<typeof formSchema>;

type EditCustomerNoteDialogProps = {
	customerId: string;
	noteId: string;
	initialContent: string;
	initialImages: CustomerNoteImageWithUrl[];
};

export function EditCustomerNoteDialog({
	customerId,
	noteId,
	initialContent,
	initialImages,
}: EditCustomerNoteDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [imageErrorMessage, setImageErrorMessage] = useState<string | null>(
		null,
	);

	// 既存画像の管理（削除されていない画像のパスを保持）
	const [keepImagePaths, setKeepImagePaths] = useState<string[]>(
		initialImages.map((img) => img.path),
	);

	const {
		addImages: addImagesOriginal,
		clearAll: clearImages,
		images,
		isUploading,
		removeImage,
		uploadAll,
	} = useImageUpload();

	// 既存画像数を考慮した画像追加関数
	const addImages = (files: File[]) => {
		const MAX_IMAGES = 5;
		const existingImagesCount = keepImagePaths.length;
		const currentImagesCount = images.length;
		const totalCount = existingImagesCount + currentImagesCount;
		const availableSlots = MAX_IMAGES - totalCount;

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

	const form = useForm<FormValues>({
		defaultValues: {
			content: initialContent,
		},
		resolver: valibotResolver(formSchema),
	});

	function handleRemoveExistingImage(path: string) {
		setKeepImagePaths((prev) => prev.filter((p) => p !== path));
		setImageErrorMessage(null);
	}

	function handleRemoveNewImage(id: string) {
		removeImage(id);
		setImageErrorMessage(null);
	}

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

			const result = await editCustomerNoteAction({
				content: values.content,
				keepImagePaths,
				noteId,
				uploadImages,
			});

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			clearImages();
			setErrorMessage(null);
			setOpen(false);
			router.refresh();
		});
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			form.reset({
				content: initialContent,
			});
			clearImages();
			setKeepImagePaths(initialImages.map((img) => img.path));
			setErrorMessage(null);
			setImageErrorMessage(null);
		}
		setOpen(open);
	}

	// 削除されていない既存画像を取得
	const existingImages = initialImages.filter((img) =>
		keepImagePaths.includes(img.path),
	);

	const isProcessing = isPending || isUploading;

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" type="button" variant="outline">
					<Edit className="h-4 w-4 mr-1" />
					編集
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ノートを編集</DialogTitle>
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
									<FormLabel>内容</FormLabel>
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
							<FormLabel>画像</FormLabel>
							<FormDescription className="mb-2">
								既存の画像を削除したり、新しい画像を追加できます（最大5枚）
							</FormDescription>

							{imageErrorMessage && (
								<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm mb-3">
									<AlertCircle className="h-4 w-4 shrink-0" />
									<p>{imageErrorMessage}</p>
								</div>
							)}

							<div className="space-y-3">
								{/* 既存画像の表示 */}
								{existingImages.length > 0 && (
									<div>
										<p className="text-sm text-muted-foreground mb-2">
											既存の画像
										</p>
										<div className="grid grid-cols-5 gap-2">
											{existingImages.map((image) => (
												<div
													className="relative aspect-square"
													key={image.path}
												>
													{image.url && (
														<Image
															alt="既存の画像"
															className="rounded-md border object-cover"
															fill
															sizes="80px"
															src={image.url}
														/>
													)}
													{/* 削除ボタン */}
													{!isProcessing && (
														<Button
															className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
															onClick={() =>
																handleRemoveExistingImage(image.path)
															}
															size="icon"
															type="button"
															variant="destructive"
														>
															<X className="h-3 w-3" />
														</Button>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{/* 新規画像の追加 */}
								<div>
									{images.length > 0 && (
										<p className="text-sm text-muted-foreground mb-2">
											新しい画像
										</p>
									)}
									<CustomerNoteImageInput
										disabled={isProcessing}
										images={images}
										onAddImages={addImages}
										onRemoveImage={handleRemoveNewImage}
									/>
								</div>
							</div>
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
								className="min-w-[120px]"
								disabled={isProcessing}
								type="submit"
							>
								{isProcessing ? (
									<>
										{isUploading ? "アップロード中" : "更新中"}
										<Loader2 className="ml-2 size-4 animate-spin" />
									</>
								) : (
									"更新"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
