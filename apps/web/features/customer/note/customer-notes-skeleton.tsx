import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CustomerNotesSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-4 w-32" />

			{Array.from({ length: 3 }).map((_, index) => (
				<Card key={index}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
						<div className="space-y-1">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-48" />
						</div>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>

						<div className="flex gap-2">
							<Skeleton className="h-[120px] w-[120px] rounded-lg" />
							<Skeleton className="h-[120px] w-[120px] rounded-lg" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
