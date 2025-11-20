"use client";

import { Button } from "@workspace/ui/components/button";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef } from "react";
import type { UploadingImage } from "./use-image-upload";

type CustomerNoteImageInputProps = {
	images: UploadingImage[];
	onAddImages: (files: File[]) => void;
	onRemoveImage: (id: string) => void;
	disabled?: boolean;
};

const MAX_FILES = 5;

export function CustomerNoteImageInput({
	disabled = false,
	images,
	onAddImages,
	onRemoveImage,
}: CustomerNoteImageInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (files) {
				onAddImages(Array.from(files));
			}
			// 同じファイルを再選択できるようにリセット
			if (inputRef.current) {
				inputRef.current.value = "";
			}
		},
		[onAddImages],
	);

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			const files = event.dataTransfer.files;
			if (files) {
				onAddImages(Array.from(files));
			}
		},
		[onAddImages],
	);

	const handleDragOver = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
		},
		[],
	);

	const canAddMore = images.length < MAX_FILES;

	return (
		<div className="space-y-3">
			<input
				accept="image/*"
				className="hidden"
				disabled={disabled || !canAddMore}
				multiple
				onChange={handleFileChange}
				ref={inputRef}
				type="file"
			/>

			{/* プレビュー表示 */}
			{images.length > 0 && (
				<div className="grid grid-cols-5 gap-2">
					{images.map((image) => (
						<div className="relative aspect-square" key={image.id}>
							<Image
								alt="プレビュー"
								className="rounded-md border object-cover"
								fill
								sizes="80px"
								src={image.previewUrl}
							/>
							{/* ステータスオーバーレイ */}
							{image.status === "uploading" && (
								<div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-md">
									<Loader2 className="text-primary h-5 w-5 animate-spin" />
								</div>
							)}
							{image.status === "error" && (
								<div className="absolute inset-0 flex items-center justify-center rounded-md bg-red-500/20">
									<span className="text-xs text-red-500">エラー</span>
								</div>
							)}
							{/* 削除ボタン */}
							{!disabled && image.status !== "uploading" && (
								<Button
									className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
									onClick={() => onRemoveImage(image.id)}
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
			)}

			{/* ドロップエリア */}
			{canAddMore && (
				<button
					className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 transition-colors ${
						disabled
							? "cursor-not-allowed opacity-50"
							: "hover:border-primary hover:bg-muted/50"
					}`}
					disabled={disabled}
					onClick={() => inputRef.current?.click()}
					onDragOver={handleDragOver}
					onDrop={!disabled ? handleDrop : undefined}
					type="button"
				>
					<ImageIcon className="text-muted-foreground mb-2 h-6 w-6" />
					<p className="text-muted-foreground text-sm">
						画像を選択またはドロップ
					</p>
					<p className="text-muted-foreground mt-1 text-xs">
						最大{MAX_FILES}枚、各10MBまで（残り{MAX_FILES - images.length}枚）
					</p>
				</button>
			)}
		</div>
	);
}
