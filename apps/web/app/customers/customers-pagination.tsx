"use client";

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { useSearchParams } from "next/navigation";

type CustomersPaginationProps = {
	currentPage: number;
	totalPages: number;
	totalCount: number;
};

export function CustomersPagination({
	currentPage,
	totalPages,
	totalCount,
}: CustomersPaginationProps) {
	const searchParams = useSearchParams();

	function createPageUrl(page: number) {
		const params = new URLSearchParams(searchParams);
		params.set("page", page.toString());
		return `/customers?${params.toString()}`;
	}

	if (totalPages <= 1) {
		return (
			<div className="text-sm text-muted-foreground">
				全{totalCount}件
			</div>
		);
	}

	// ページ番号の生成ロジック
	const pages: (number | "ellipsis")[] = [];
	const showEllipsisStart = currentPage > 3;
	const showEllipsisEnd = currentPage < totalPages - 2;

	if (showEllipsisStart) {
		pages.push(1);
		pages.push("ellipsis");
	} else {
		for (let i = 1; i < currentPage; i++) {
			pages.push(i);
		}
	}

	pages.push(currentPage);

	if (showEllipsisEnd) {
		pages.push("ellipsis");
		pages.push(totalPages);
	} else {
		for (let i = currentPage + 1; i <= totalPages; i++) {
			pages.push(i);
		}
	}

	return (
		<div className="flex items-center justify-between">
			<div className="text-sm text-muted-foreground">
				全{totalCount}件 ({currentPage} / {totalPages}ページ)
			</div>
			<Pagination>
				<PaginationContent>
					{currentPage > 1 && (
						<PaginationItem>
							<PaginationPrevious href={createPageUrl(currentPage - 1)} />
						</PaginationItem>
					)}
					{pages.map((page, index) =>
						page === "ellipsis" ? (
							<PaginationItem key={`ellipsis-${index}`}>
								<PaginationEllipsis />
							</PaginationItem>
						) : (
							<PaginationItem key={page}>
								<PaginationLink
									href={createPageUrl(page)}
									isActive={page === currentPage}
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						),
					)}
					{currentPage < totalPages && (
						<PaginationItem>
							<PaginationNext href={createPageUrl(currentPage + 1)} />
						</PaginationItem>
					)}
				</PaginationContent>
			</Pagination>
		</div>
	);
}
