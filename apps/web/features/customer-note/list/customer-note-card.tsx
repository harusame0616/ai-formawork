import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { CalendarClock, UserPen } from "lucide-react";
import { DateTime } from "@/components/date-time";
import { DeleteCustomerNoteDialog } from "@/features/customer-note/delete/delete-customer-note-dialog";
import { EditCustomerNoteDialog } from "@/features/customer-note/edit/edit-customer-note-dialog";
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
						<EditCustomerNoteDialog
							customerId={note.customerId}
							initialContent={note.content}
							initialImages={note.images}
							// 古い state が残ってしまい、編集後に再度ダイアログを開いたときに新しい状態にならないため、
							// updatedAt をキーにして変更があった際にコンポーネントを再マウントさせる
							// updatedAt.getTime() は UNIX タイムスタンプでタイムゾーン非依存のためハイドレーションエラーなし
							key={note.updatedAt.getTime()}
							noteId={note.id}
						/>
						<DeleteCustomerNoteDialog noteId={note.id} />
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
