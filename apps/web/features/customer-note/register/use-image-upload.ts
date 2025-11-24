import { useCallback, useState } from "react";
import { createUploadUrlAction } from "./create-upload-url-action";

type ImageUploadStatus = "pending" | "uploading" | "uploaded" | "error";

export type UploadingImage = {
	id: string;
	file: File;
	previewUrl: string;
	status: ImageUploadStatus;
	temporaryPath: string | null;
	error: string | null;
};

type UploadImage = {
	temporaryPath: string;
	permanentPath: string;
};

type UseImageUploadReturn = {
	images: UploadingImage[];
	addImages: (files: File[]) => void;
	removeImage: (id: string) => void;
	uploadAll: (
		customerId: string,
	) => Promise<{ success: boolean; uploadImages: UploadImage[] }>;
	isUploading: boolean;
	clearAll: () => void;
};

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function useImageUpload(): UseImageUploadReturn {
	const [images, setImages] = useState<UploadingImage[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	const addImages = useCallback((files: File[]) => {
		setImages((prev) => {
			const remainingSlots = MAX_FILES - prev.length;
			const filesToAdd = files.slice(0, remainingSlots);

			const newImages: UploadingImage[] = filesToAdd
				.filter((file) => {
					// 画像ファイルのみ
					if (!file.type.startsWith("image/")) {
						return false;
					}
					// サイズチェック
					if (file.size > MAX_FILE_SIZE) {
						return false;
					}
					return true;
				})
				.map((file) => ({
					error: null,
					file,
					id: crypto.randomUUID(),
					previewUrl: URL.createObjectURL(file),
					status: "pending" as const,
					temporaryPath: null,
				}));

			return [...prev, ...newImages];
		});
	}, []);

	const removeImage = useCallback((id: string) => {
		setImages((prev) => {
			const image = prev.find((img) => img.id === id);
			if (image) {
				URL.revokeObjectURL(image.previewUrl);
			}
			return prev.filter((img) => img.id !== id);
		});
	}, []);

	const clearAll = useCallback(() => {
		setImages((prev) => {
			for (const image of prev) {
				URL.revokeObjectURL(image.previewUrl);
			}
			return [];
		});
	}, []);

	const uploadAll = useCallback(
		async (customerId: string) => {
			if (images.length === 0) {
				return { success: true, uploadImages: [] };
			}

			setIsUploading(true);
			const uploadImages: UploadImage[] = [];
			let allSuccess = true;

			try {
				for (const image of images) {
					if (image.status === "uploaded" && image.temporaryPath) {
						const permanentPath = `customers/${customerId}/attachments/${image.id}`;
						uploadImages.push({
							permanentPath,
							temporaryPath: image.temporaryPath,
						});
						continue;
					}

					// ステータスを uploading に更新
					setImages((prev) =>
						prev.map((img) =>
							img.id === image.id
								? { ...img, status: "uploading" as const }
								: img,
						),
					);

					try {
						// signed upload URL を取得
						const urlResult = await createUploadUrlAction({ fileId: image.id });

						if (!urlResult.success) {
							throw new Error(urlResult.error);
						}

						const { signedUrl, path } = urlResult.data;

						// ファイルをアップロード
						const response = await fetch(signedUrl, {
							body: image.file,
							headers: {
								"Content-Type": image.file.type,
							},
							method: "PUT",
						});

						if (!response.ok) {
							throw new Error(`Upload failed: ${response.statusText}`);
						}

						// ステータスを uploaded に更新
						setImages((prev) =>
							prev.map((img) =>
								img.id === image.id
									? { ...img, status: "uploaded" as const, temporaryPath: path }
									: img,
							),
						);

						const permanentPath = `customers/${customerId}/attachments/${image.id}`;
						uploadImages.push({
							permanentPath,
							temporaryPath: path,
						});
					} catch (error) {
						allSuccess = false;
						const errorMessage =
							error instanceof Error
								? error.message
								: "アップロードに失敗しました";

						setImages((prev) =>
							prev.map((img) =>
								img.id === image.id
									? { ...img, error: errorMessage, status: "error" as const }
									: img,
							),
						);
					}
				}

				return { success: allSuccess, uploadImages };
			} finally {
				setIsUploading(false);
			}
		},
		[images],
	);

	return {
		addImages,
		clearAll,
		images,
		isUploading,
		removeImage,
		uploadAll,
	};
}
