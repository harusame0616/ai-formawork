import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { CalendarClock, Edit, Trash2, UserPen } from "lucide-react";
import { DateTime } from "../../../components/date-time";
import { CustomerNoteImageGallery } from "./customer-note-image-gallery";
import type { CustomerNoteWithImages } from "./get-customer-notes";

type CustomerNoteCardProps = {
	note: CustomerNoteWithImages;
	authorName: string;
	canEdit: boolean;
};

export function CustomerNoteCard({
	note,
	authorName,
	canEdit,
}: CustomerNoteCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<div className="space-y-1">
					<div className="text-sm flex gap-2">
						<CalendarClock className="size-4" />
						<DateTime date={new Date(note.createdAt)} />
					</div>
					<div className="text-sm font-medium flex gap-2">
						<UserPen className="size-4" />
						{authorName}
					</div>
				</div>

				{canEdit && (
					<div className="flex gap-2">
						<Button size="sm" type="button" variant="outline">
							<Edit className="h-4 w-4 mr-1" />
							編集
						</Button>
						<Button size="sm" type="button" variant="outline">
							<Trash2 className="h-4 w-4 mr-1" />
							削除
						</Button>
					</div>
				)}
			</CardHeader>

			<CardContent className="space-y-4">
				<p className="whitespace-pre-wrap text-sm">{note.content}</p>
				<CustomerNoteImageGallery images={note.images} />
			</CardContent>
		</Card>
	);
}
