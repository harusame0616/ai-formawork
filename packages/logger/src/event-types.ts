/**
 * ログイベント種別
 *
 * OWASP Logging Cheat Sheet に基づいた最小限必要なイベントを定義
 * その他のイベントはアプリケーション側で必要に応じて拡張
 */

export const AuthenticationEvent = {
	AuthenticationFailure: "AuthenticationFailure",
	AuthenticationSuccess: "AuthenticationSuccess",
} as const;

export const AuthorizationEvent = {
	AuthorizationError: "AuthorizationError",
} as const;

export const ValidationEvent = {
	InputValidationError: "InputValidationError",
	OutputValidationError: "OutputValidationError",
} as const;

export const ErrorEvent = {
	ApplicationError: "ApplicationError",
	DatabaseError: "DatabaseError",
} as const;

export const EventType = {
	...AuthenticationEvent,
	...AuthorizationEvent,
	...ValidationEvent,
	...ErrorEvent,
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];
