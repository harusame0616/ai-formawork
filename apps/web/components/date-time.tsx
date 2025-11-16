"use client";

import { useSyncExternalStore } from "react";

type DateTimeProps = {
	date: Date;
};

export function DateTime({ date }: DateTimeProps) {
	const formatted = useSyncExternalStore(
		() => () => {},
		() =>
			date.toLocaleString("ja-JP", {
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				month: "long",
				year: "numeric",
			}),
		() =>
			date.toLocaleString("ja-JP", {
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				month: "long",
				timeZone: "Asia/Tokyo",
				year: "numeric",
			}),
	);

	return <time dateTime={date.toISOString()}>{formatted}</time>;
}
