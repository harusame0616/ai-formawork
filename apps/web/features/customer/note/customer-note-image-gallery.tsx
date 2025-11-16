"use client";

import type { SelectCustomerNoteImage } from "@workspace/db/schema/customer-note";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@workspace/ui/components/carousel";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTitle,
} from "@workspace/ui/components/drawer";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type CustomerNoteImageGalleryProps = {
	images: SelectCustomerNoteImage[];
};

export function CustomerNoteImageGallery({
	images,
}: CustomerNoteImageGalleryProps) {
	const [open, setOpen] = useState(false);
	const [initialIndex, setInitialIndex] = useState(0);
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	const handleImageClick = (index: number) => {
		setInitialIndex(index);
		setOpen(true);
	};

	useEffect(() => {
		if (!api) {
			return;
		}

		setCurrent(api.selectedScrollSnap());

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	useEffect(() => {
		if (api && open) {
			api.scrollTo(initialIndex);
		}
	}, [api, open, initialIndex]);

	if (images.length === 0) {
		return null;
	}

	return (
		<>
			<div className="flex gap-2 flex-wrap">
				{images.map((image, index) => (
					<button
						className="relative h-[120px] w-[120px] overflow-hidden rounded-lg border hover:opacity-80 transition-opacity"
						key={image.id}
						onClick={() => handleImageClick(index)}
						type="button"
					>
						<Image
							alt={image.alternativeText ?? image.fileName}
							className="object-cover"
							fill
							sizes="120px"
							src={image.imageUrl}
						/>
					</button>
				))}
			</div>

			<Drawer onOpenChange={setOpen} open={open}>
				<DrawerContent className="h-[90vh]">
					<DrawerTitle className="sr-only">
						{images[current]?.fileName}
					</DrawerTitle>

					<DrawerClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
						<X className="h-6 w-6" />
						<span className="sr-only">閉じる</span>
					</DrawerClose>

					<div className="flex h-full flex-col items-center justify-center p-4">
						<Carousel
							className="w-full max-w-4xl"
							opts={{ loop: true }}
							setApi={setApi}
						>
							<CarouselContent>
								{images.map((image) => (
									<CarouselItem key={image.id}>
										<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
											<Image
												alt={image.alternativeText ?? image.fileName}
												className="object-contain"
												fill
												priority
												sizes="(max-width: 1024px) 100vw, 1024px"
												src={image.imageUrl}
											/>
										</div>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="left-4" />
							<CarouselNext className="right-4" />
						</Carousel>

						<div className="mt-4 text-center">
							<p className="text-sm font-medium">
								{current + 1} / {images.length}
							</p>
							<p className="text-sm text-muted-foreground">
								{images[current]?.fileName}
							</p>
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}
