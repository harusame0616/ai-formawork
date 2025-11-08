# @repo/logger

OWASP Logging Cheat Sheet に準拠したロギングパッケージ。構造化ログ、セキュリティ重視の設計、環境別設定を提供します。

## ロギング方針

### 基本原則

- **構造化ログ**: JSON 形式で出力し、機械可読性と検索性を確保
- **セキュリティ重視**: OWASP 推奨に従い、機密情報を自動的に除外・マスキング
- **ログインジェクション対策**: 制御文字を自動エスケープ
- **環境別設定**: 開発環境では pino-pretty でパイプ、本番環境では JSON 出力

### ログレベル

| レベル  | 用途                                                                                         | 例                                       | 通知 |
| ------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- | ---- |
| `fatal` | 全体に影響する深刻なエラー。サービスの正常な動作を阻害し、重大な障害を引き起こす             | データベース接続不可、コア機能の通信失敗 | ✅   |
| `error` | 特定の操作に影響する重要なエラー。早急な対応が必要。予期せぬエラーもこちらでロギング         | API 呼び出し失敗、実行時エラー           | ✅   |
| `warn`  | 注意が必要な事象や潜在的な問題。サービスの正常な動作には影響しない                           | リトライ中の通信失敗、API 応答時間超過   | ❌   |
| `info`  | サービスの正常な流れや重要なイベント                                                         | ユーザーログイン、データ更新             | ❌   |
| `debug` | 開発やデバッグ用の詳細情報。変数の値や条件分岐の結果など。本番環境では通常無効化             | 関数呼び出し、内部状態                   | ❌   |
| `trace` | 非常に詳細な処理ステップやデータの変化。デバッグやトラブルシューティング用。本番環境では無効 | メソッド内の処理ステップ                 | ❌   |

**通知ポリシー:**

- **ERROR レベル以上**（ERROR, FATAL）は通知対象
- 通知は observability サービス（監視ツール）によって行われる
- アプリケーションレベルでは通知を行わない

### 記録すべきセキュリティイベント（OWASP推奨）

**認証・認可**

- ログイン成功/失敗
- ログアウト
- パスワードリセット
- アクセス拒否（認可エラー）

**データ操作**

- CRUD 操作（特に削除・更新）
- 機密データへのアクセス
- 一括操作
- ユーザー管理操作
- 管理者権限での操作
- デフォルトアカウントの使用

**入力検証**

- バリデーション失敗（プロトコル違反、不正なエンコーディング、無効なパラメータ）
- 不正なファイルアップロード試行

**セッション管理**

- Cookie値の変更
- JWT検証の失敗

**システムイベント**

- アプリケーション起動/停止
- 設定変更
- 外部 API 呼び出し

### イベントタイプ

ログには `eventType` フィールドを含めることで、イベントの種類を明示的に記録できます。
以下の最小限必要なイベントタイプが定義されています。その他のイベントはアプリケーション側で必要に応じて拡張してください。

#### 認証イベント (AuthenticationEvent)

| イベント名                      | 説明                           | 具体的なケース                               |
| ------------------------------- | ------------------------------ | -------------------------------------------- |
| `AuthenticationSuccess`         | 認証成功                       | ログイン成功、MFA認証成功                    |
| `AuthenticationFailure`         | 認証失敗                       | パスワード不一致、存在しないユーザー         |

#### 認可イベント (AuthorizationEvent)

| イベント名                      | 説明                           | 具体的なケース                               |
| ------------------------------- | ------------------------------ | -------------------------------------------- |
| `AuthorizationError`            | 認可エラー                     | 権限不足によるアクセス拒否                   |

#### バリデーションイベント (ValidationEvent)

| イベント名                      | 説明                           | 具体的なケース                               |
| ------------------------------- | ------------------------------ | -------------------------------------------- |
| `InputValidationError`          | 入力バリデーションエラー       | 不正なフォーマット、型不一致                 |
| `OutputValidationError`         | 出力バリデーションエラー       | APIレスポンスの検証失敗、データ整合性エラー  |

#### エラーイベント (ErrorEvent)

| イベント名                      | 説明                           | 具体的なケース                               |
| ------------------------------- | ------------------------------ | -------------------------------------------- |
| `ApplicationError`              | アプリケーションエラー         | 未処理例外、実行時エラー                     |
| `DatabaseError`                 | データベースエラー             | 接続失敗、クエリエラー、トランザクション失敗 |

**使用例:**

```typescript
import { EventType } from "@repo/logger/event-types";

// 認証成功ログ
logger.info("User logged in successfully", {
  eventType: EventType.AuthenticationSuccess,
  userId: "user_123",
});

// バリデーションエラーログ
logger.warn("Invalid email format", {
  eventType: EventType.InputValidationError,
  field: "email",
});

// エラーログ
logger.error("Failed to connect to database", {
  eventType: EventType.DatabaseError,
  err: error,
});

### ログに含めるべき情報

各ログエントリには以下の情報を含めることを推奨します。

| 項目                   | 重要度 | 具体例                                       | 設定方法                                                                         |
| ---------------------- | ------ | -------------------------------------------- | -------------------------------------------------------------------------------- |
| **タイムスタンプ**     | 必須   | `2025-01-08T12:34:56.789Z`                   | 自動設定（ISO 8601形式）                                                         |
| **ログレベル**         | 必須   | `info`, `error`, `warn`                      | ログメソッドで指定（`logger.info()`, `logger.error()`）                         |
| **メッセージ**         | 必須   | `User logged in successfully`                | ログメソッドの引数で指定                                                         |
| **アプリケーション名** | 必須   | `ai-formawork`                               | 環境変数 `APP_NAME` で設定                                                       |
| **環境**               | 必須   | `production`, `development`                  | 環境変数 `HOST_ENVIRONMENT` で設定                                               |
| **サービス名**         | 必須   | `web`, `api`, `worker`                       | 環境変数 `SERVICE_NAME` で設定                                                   |
| **コード位置**         | 必須   | `loginAction`, `UserPage`                    | `getLogger(codeLocation)` の引数で指定                                           |
| **ホスト名**           | 推奨   | `example.com`, `localhost:3000`              | Next.js: 自動設定（`Host`ヘッダー）<br>その他: コンテキストで渡す                |
| **ユーザーID**         | 推奨   | `user_123`                                   | Next.js: 自動設定（`X-Auth-User-Id`）<br>その他: コンテキストで渡す              |
| **IPアドレス**         | 推奨   | `192.168.1.100`                              | Next.js: 自動設定（`X-Forwarded-For`）<br>その他: コンテキストで渡す             |
| **リクエストID**       | 推奨   | `req_550e8400-e29b-41d4-a716-446655440000`   | Next.js: 自動設定（`X-Request-ID`、proxy で生成）<br>その他: コンテキストで渡す |
| **ユーザーエージェント** | 推奨 | `Mozilla/5.0 ...`                            | Next.js: 自動設定（`User-Agent`ヘッダー）<br>その他: コンテキストで渡す         |
| **Gitコミットハッシュ** | 推奨  | `a1b2c3d4`                                   | Next.js: 自動設定（`X-Git-Commit-Sha`、proxy で生成）                           |
| **デプロイID**         | 推奨   | `dpl_abc123xyz`                              | Next.js: 自動設定（`X-Deployment-Id`、proxy で生成）                            |
| **イベントタイプ**     | 推奨   | `AuthenticationSuccess`, `DataCreation`      | `logger.info("message", { eventType: "AuthenticationSuccess" })`                 |
| **影響を受けたリソース** | 推奨 | `users/123`, `/api/posts/456`                | `logger.info("message", { resource: "users/123" })`                              |
| **エラー情報**         | 推奨   | エラーオブジェクト、スタックトレース         | `logger.error("message", { err: error })`                                        |

### 除外すべきデータ

以下の情報は**絶対に**ログに記録しません：

- パスワード（平文・ハッシュ値）
- 暗号化キー・秘密鍵
- セッション ID・アクセストークン・リフレッシュトークン
- クレジットカード情報
- データベース接続文字列
- API 秘密鍵

これらは自動的にマスキング（`[REDACTED]`）されます。

## 使用方法

### Next.js での使い方（推奨）

**Server Component / Server Action での使用:**

```typescript
import { getLogger } from "@repo/logger/nextjs/server";

// Server Component での使用例
export default async function UserPage({ params }: { params: { id: string } }) {
	const logger = await getLogger("UserPage");
	logger.info("User page accessed", { userId: params.id });
	return <div>...</div>;
}

// Server Action での使用例
export async function loginAction(formData: FormData) {
	const logger = await getLogger("loginAction");
	logger.info("User logged in successfully", { action: "login" });
}
```

**自動取得される情報:**
- **IPアドレス** (`X-Forwarded-For`)
- **リクエストID** (`X-Request-ID`)
- **ホスト名** (`Host`)
- **Gitコミットハッシュ** (`X-Git-Commit-Sha`)
- **デプロイID** (`X-Deployment-Id`)
- **ユーザーID** (`X-Auth-User-Id`)
- **ユーザーエージェント** (`User-Agent`)

**重要な注意:**
- `getLogger(codeLocation: string)` は必須の `codeLocation` パラメータを受け取ります
- `codeLocation` には関数名やコンポーネント名を文字列リテラルで指定してください
- これによりミニファイ後も正しい関数名がログに記録されます

**Proxy でヘッダーを自動設定（必須）:**

Next.js プロジェクトのルートに `proxy.ts` を作成し、logger 用のヘッダーを設定します。

```typescript
// apps/web/proxy.ts
import { updateSession } from "@repo/supabase/nextjs/proxy";
import type { NextRequest, NextResponse } from "next/server";
import { getLoggerConfig } from "./config/logger";

function setLoggerHeaders(
	response: NextResponse,
	request: NextRequest,
	userId: string | null,
): void {
	const config = getLoggerConfig();

	response.headers.set(
		"x-request-id",
		request.headers.get("x-request-id") ?? crypto.randomUUID(),
	);
	response.headers.set("x-git-commit-sha", config.gitCommitSha ?? "");
	response.headers.set("x-deployment-id", config.deploymentId ?? "");
	response.headers.set("x-auth-user-id", userId ?? "");
}

export async function proxy(request: NextRequest) {
	const { response, userId } = await updateSession(request);
	setLoggerHeaders(response, request, userId);
	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

**Logger設定ファイル:**

```typescript
// apps/web/config/logger.ts
import * as v from "valibot";

const envSchema = v.object({
	VERCEL_DEPLOYMENT_ID: v.optional(v.string()),
	VERCEL_GIT_COMMIT_SHA: v.optional(v.string()),
});

export function getLoggerConfig() {
	const parsed = v.parse(envSchema, {
		VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID,
		VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
	});

	return {
		deploymentId: parsed.VERCEL_DEPLOYMENT_ID,
		gitCommitSha: parsed.VERCEL_GIT_COMMIT_SHA,
	};
}
```

**Route Handler での使用:**

Route Handler では `request` オブジェクトから直接ヘッダー情報を取得できるため、`getBaseLogger` を使用してください。

```typescript
import { getBaseLogger } from "@repo/logger";

export async function POST(request: Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	const ipAddress = forwardedFor?.split(",")[0]?.trim();
	const requestId = request.headers.get("x-request-id");

	const logger = getBaseLogger({
		codeLocation: "POST /api/webhook",
		requestId,
		ipAddress,
	});

	logger.info("Processing request");
}
```

### その他の環境での使い方

Next.js 以外の環境では `getBaseLogger` を使用してください。

```typescript
import { getBaseLogger } from "@repo/logger";

// ロガーインスタンスを取得
const logger = getBaseLogger({
	codeLocation: "mainFunction",
});

// ログ出力
logger.info("Application started");
logger.error("Authentication failed", { err: error });
logger.debug("User action logged", { userId, action });
```

### ログレベル別の使用例

```typescript
// fatal: アプリケーション停止レベル
logger.fatal("Database connection failed. Shutting down.");

// error: エラー（復旧可能）
logger.error("Failed to process payment", { err, userId });

// warn: 警告
logger.warn("Multiple failed login attempts detected", { userId, attempts });

// info: 業務イベント
logger.info("User logged in successfully", { userId, action: "login" });

// debug: デバッグ情報
logger.debug("Function called with parameters", { params });

// trace: 詳細トレース
logger.trace("HTTP request/response details", { req, res });
```

## 環境変数

| 変数名             | 説明                                                    | 必須 | デフォルト    |
| ------------------ | ------------------------------------------------------- | ---- | ------------- |
| `APP_NAME`         | アプリケーション名                                      | ✅   | -             |
| `HOST_ENVIRONMENT` | ホスト環境（development/staging/production）            | ❌   | `development` |
| `SERVICE_NAME`     | サービス名（web/api/db など）                           | ✅   | -             |
| `LOG_LEVEL`        | ログレベル（fatal/error/warn/info/debug/trace/silent） | ❌   | `info`        |

**設定例:**

```bash
# 開発環境
APP_NAME=ai-formawork
SERVICE_NAME=web
LOG_LEVEL=debug

# 本番環境（最小限の設定）
APP_NAME=ai-formawork
HOST_ENVIRONMENT=production
SERVICE_NAME=api
```

## 開発環境での読みやすいログ出力

開発環境でログを読みやすくするには、`pino-pretty` を使用してパイプします。

**インストール:**

```bash
pnpm add -D pino-pretty
```

**使用方法:**

```bash
# devスクリプトでパイプする
pnpm dev | pnpm exec pino-pretty

# または package.json に専用スクリプトを追加
{
  "scripts": {
    "dev": "next dev",
    "dev:pretty": "next dev | pnpm exec pino-pretty"
  }
}
```

これにより、JSON形式のログが色付きで読みやすく整形されます。本番環境では通常のJSON形式で出力されます。

## API

### `getLogger(codeLocation: string): Promise<Logger>` (Next.js Server Component/Server Action専用)

Next.js の Server Component と Server Action 用の Logger インスタンスを作成します。
リクエストヘッダーから複数の情報を自動取得してログに含めます。

**パラメータ:**

- `codeLocation` (string, 必須): コードの位置を示す文字列（関数名やコンポーネント名）

**自動取得される情報:**

- **IPアドレス**: `X-Forwarded-For` ヘッダーから取得
- **リクエストID**: `X-Request-ID` ヘッダーから取得（proxy で自動生成）
- **ホスト名**: `Host` ヘッダーから取得
- **Gitコミットハッシュ**: `X-Git-Commit-Sha` ヘッダーから取得（proxy で設定）
- **デプロイID**: `X-Deployment-Id` ヘッダーから取得（proxy で設定）
- **ユーザーID**: `X-Auth-User-Id` ヘッダーから取得（proxy で設定）
- **ユーザーエージェント**: `User-Agent` ヘッダーから取得

**注意:**

- `application`、`environment`、`service` は環境変数 `APP_NAME`、`HOST_ENVIRONMENT`、`SERVICE_NAME` から自動取得されます
- Next.js 16.0.0 以降が必要です（proxy ファイルのサポート）
- **Server Component または Server Action 内でのみ使用してください**
- **Route Handler では使用しないでください**（Route Handler では `request` オブジェクトから直接取得できます）
- すべての自動取得情報を利用するには proxy の設定が必要です

**戻り値:**

Logger インスタンスの Promise

**使用例:**

```typescript
import { getLogger } from "@repo/logger/nextjs/server";

export async function createUserAction(formData: FormData) {
  const logger = await getLogger("createUserAction");
  logger.info("User creation started");
}
```

### `getBaseLogger(context?: Omit<LoggerContext, 'application' | 'environment' | 'service'>): Logger`

汎用的な Logger インスタンスを作成します。

**パラメータ:**

- `context` (object, オプション): 静的コンテキスト情報
  - `codeLocation` (string): コードの位置（関数名など）
  - `[key: string]` (unknown): その他の任意のコンテキスト

**注意:**

- `application`、`environment`、`service` は環境変数 `APP_NAME`、`HOST_ENVIRONMENT`、`SERVICE_NAME` から自動取得されます
- Next.js 環境では `getLogger` の使用を推奨します

**戻り値:**

Logger インスタンス

**使用例:**

```typescript
import { getBaseLogger } from "@repo/logger";

const logger = getBaseLogger({
  codeLocation: "processPayment",
  userId: "user_123",
});

logger.info("Processing payment");
```

### `Logger` クラス

#### メソッド

- `fatal(msg: string): void`
- `fatal(obj: object, msg?: string): void`
- `error(msg: string): void`
- `error(obj: object, msg?: string): void`
- `warn(msg: string): void`
- `warn(obj: object, msg?: string): void`
- `info(msg: string): void`
- `info(obj: object, msg?: string): void`
- `debug(msg: string): void`
- `debug(obj: object, msg?: string): void`
- `trace(msg: string): void`
- `trace(obj: object, msg?: string): void`
- `setContext(context: Record<string, unknown>): void` - コンテキスト情報を設定（Logger インスタンスを変更）

## セキュリティ

### 自動マスキング

以下のパターンは自動的にマスキングされます：

- `password` キーを含むフィールド
- `token`, `access_token`, `refresh_token` などのトークン
- `api_key`, `secret_key` などのキー
- `authorization` ヘッダー
- Bearer トークン

### ログインジェクション対策

改行文字（CR/LF）や制御文字は自動的にエスケープされ、ログインジェクション攻撃を防ぎます。

## ベストプラクティス

### コード位置情報（codeLocation）の指定

ログが出力された関数やコンポーネントを明示的に記録するために `codeLocation` を必ず指定してください。

**重要な注意:**
- `function.name` は使用しない（ミニファイ時に名前が変わる）
- 文字列リテラルで明示的に指定する

```typescript
// ✅ 良い例（文字列リテラルで指定）
export async function createUserAction() {
  const logger = await getLogger("createUserAction");
  logger.info("User creation started");
}

// ❌ 悪い例（ミニファイで壊れる）
export async function createUserAction() {
  const logger = await getLogger(createUserAction.name); // ミニファイで "a" などになる
}
```

### イベントタイプの使い分け

適切なイベントタイプを選択してください：

**認証・認可:**
- `AuthenticationSuccess`, `AuthenticationFailure` - ユーザーのログイン、権限チェック
- `AuthorizationError` - アクセス拒否

**バリデーション:**
- `InputValidationError` - 入力検証失敗
- `OutputValidationError` - 出力検証失敗

**エラー:**
- `ApplicationError` - アプリケーションエラー
- `DatabaseError` - データベースエラー

### エラーオブジェクトのログ

エラー情報は `err` キーで渡してください（pinoが自動的にスタックトレースを含めます）：

```typescript
try {
  // ... 処理
} catch (error) {
  logger.error("Operation failed", {
    err: error,
    eventType: EventType.ApplicationError,
  });
}
```

## 設計原則

### OWASP準拠

このロガーパッケージは [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) に準拠しています。

**主要な準拠事項:**

1. **セキュリティイベントの記録**: 認証、認可、バリデーション、セッション管理などのセキュリティ関連イベントを記録
2. **機密情報の保護**: パスワード、トークン、秘密鍵などを自動的にマスキング
3. **ログインジェクション対策**: 制御文字を自動エスケープ
4. **構造化ログ**: JSON形式で機械可読性を確保
5. **適切なコンテキスト情報**: ユーザーID、IPアドレス、リクエストIDなどを含める

### 薄いラッパーアプローチ

このパッケージは pino の薄いラッパーとして設計されています。

**理由:**

- pino の高性能性を損なわない
- pino の機能を最大限活用できる
- 必要最小限のセキュリティ機能のみを追加
- 将来的にロガーライブラリを変更する際の柔軟性

**実装方針:**

- pino の API をそのまま公開
- セキュリティ関連の処理（サニタイズ、マスキング）のみを追加
- 過度な抽象化は避ける

## 参考資料

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Pino Documentation](https://getpino.io/)
