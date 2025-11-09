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
import { useRouter, useSearchParams } from "next/navigation";

type CustomerPaginationProps = {
	currentPage: number;
	totalPages: number;
};

export function CustomerPagination({
	currentPage,
	totalPages,
}: CustomerPaginationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	function navigateToPage(page: number) {
		const params = new URLSearchParams(searchParams);
		params.set("page", page.toString());
		router.push(`/customers?${params.toString()}`);
	}

	function getPageNumbers() {
		const pages: (number | "ellipsis")[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > 3) {
				pages.push("ellipsis");
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("ellipsis");
			}

			pages.push(totalPages);
		}

		return pages;
	}

	if (totalPages <= 1) {
		return null;
	}

	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						disabled={currentPage === 1}
						onClick={() => navigateToPage(currentPage - 1)}
					/>
				</PaginationItem>
				{getPageNumbers().map((page, index) =>
					page === "ellipsis" ? (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={page}>
							<PaginationLink
								isActive={currentPage === page}
								onClick={() => navigateToPage(page)}
							>
								{page}
							</PaginationLink>
						</PaginationItem>
					),
				)}
				<PaginationItem>
					<PaginationNext
						disabled={currentPage === totalPages}
						onClick={() => navigateToPage(currentPage + 1)}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
