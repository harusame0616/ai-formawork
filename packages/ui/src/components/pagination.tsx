import { cn } from "@workspace/ui/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
	<nav
		aria-label="pagination"
		className={cn("mx-auto flex w-full justify-center", className)}
		{...props}
	/>
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
	HTMLUListElement,
	React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
	<ul
		className={cn("flex flex-row items-center gap-1", className)}
		ref={ref}
		{...props}
	/>
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
	<li className={cn("", className)} ref={ref} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<React.ComponentProps<"a">, "className"> &
	React.ComponentProps<"button">;

const PaginationLink = ({
	className,
	isActive,
	...props
}: PaginationLinkProps) => (
	<button
		aria-current={isActive ? "page" : undefined}
		className={cn(
			"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
			"hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
			"h-10 px-4 py-2",
			isActive &&
				"border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950",
			className,
		)}
		type="button"
		{...props}
	/>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="Go to previous page"
		className={cn("gap-1 pl-2.5", className)}
		{...props}
	>
		<ChevronLeft className="size-4" />
		<span>Previous</span>
	</PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="Go to next page"
		className={cn("gap-1 pr-2.5", className)}
		{...props}
	>
		<span>Next</span>
		<ChevronRight className="size-4" />
	</PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
	className,
	...props
}: React.ComponentProps<"span">) => (
	<span
		aria-hidden
		className={cn("flex size-9 items-center justify-center", className)}
		{...props}
	>
		<MoreHorizontal className="size-4" />
		<span className="sr-only">More pages</span>
	</span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
