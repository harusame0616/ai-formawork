import { Skeleton } from "@workspace/ui/components/skeleton";

export function StaffBasicInfoSkeleton() {
	return (
		<div className="space-y-4">
			<div className="grid gap-2">
				<Skeleton className="text-sm text-muted-foreground h-[1.25rem] w-28" />
				<Skeleton className="font-bold h-[1.5rem] w-48" />
			</div>
			<div className="grid gap-2">
				<Skeleton className="text-sm text-muted-foreground h-[1.25rem] w-12" />
				<Skeleton className="font-bold h-[1.5rem] w-40" />
			</div>
			<div className="grid gap-2">
				<Skeleton className="text-sm text-muted-foreground h-[1.25rem] w-12" />
				<Skeleton className="font-bold h-[1.5rem] w-40" />
			</div>
		</div>
	);
}
