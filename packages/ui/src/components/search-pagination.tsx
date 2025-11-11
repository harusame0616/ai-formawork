"use client";

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
} from "./pagination";
import { PaginationButton } from "./pagination-button";

type SearchPaginationProps = {
	totalPages: number;
	currentPage: number;
};

export function SearchPagination({
	totalPages,
	currentPage,
}: SearchPaginationProps) {
	function getPageNumbers(): (number | "ellipsis")[] {
		if (totalPages <= 5) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages: (number | "ellipsis")[] = [1];

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

		return pages;
	}

	const isAllDisabled = totalPages <= 1;

	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationButton
						disabled={isAllDisabled || currentPage <= 1}
						page={currentPage - 1}
						size="default"
						variant="previous"
					/>
				</PaginationItem>

				{getPageNumbers().map((pageNum, index) => (
					<PaginationItem key={`${pageNum}-${index}`}>
						{pageNum === "ellipsis" ? (
							<PaginationEllipsis />
						) : (
							<PaginationButton
								disabled={isAllDisabled}
								isActive={pageNum === currentPage}
								page={pageNum}
								size="icon"
							>
								{pageNum}
							</PaginationButton>
						)}
					</PaginationItem>
				))}

				<PaginationItem>
					<PaginationButton
						disabled={isAllDisabled || currentPage >= totalPages}
						page={currentPage + 1}
						size="default"
						variant="next"
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
