import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";

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
	size?: "default" | "sm" | "lg" | "icon";
} & React.ComponentProps<"a">;

const PaginationLink = ({
	className,
	isActive,
	size = "icon",
	...props
}: PaginationLinkProps) => (
	<a
		aria-current={isActive ? "page" : undefined}
		className={cn(
			"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:no-underline underline",
			isActive && "font-black",
			size === "default" && "h-10 px-4 py-2",
			size === "sm" && "h-9 rounded-md px-3",
			size === "lg" && "h-11 rounded-md px-8",
			size === "icon" && "h-10 w-10",
			className,
		)}
		{...props}
	/>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		className={cn("gap-1 pl-2.5", className)}
		size="default"
		{...props}
	>
		<ChevronLeft className="h-4 w-4" />
		<span>前へ</span>
	</PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="次へ"
		className={cn("gap-1 pr-2.5", className)}
		size="default"
		{...props}
	>
		<span>次へ</span>
		<ChevronRight className="h-4 w-4" />
	</PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
	className,
	...props
}: React.ComponentProps<"span">) => (
	<span
		aria-hidden
		className={cn("flex h-9 w-9 items-center justify-center", className)}
		{...props}
	>
		<MoreHorizontal className="h-4 w-4" />
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
