## 開発原則

- You Aren't Gonna Need It (YAGNI)
- Single Responsibility Principle
- Keep it Simple, Stupid (KISS)
- Avoid Hasty Abstractions (AHA)
- Don't repeat yourself (DRY)
- **シンプルさの優先**: 汎用性や厳密性よりも常にシンプルな選択を採用すること
  - 将来の拡張性を過度に考慮せず、現在必要な機能に絞ること
  - 複雑な型定義や厳密なバリデーションよりも、読みやすく理解しやすいコードを優先すること
  - 環境に応じた分岐処理よりも、シンプルなデフォルト値を優先すること

## API設計とバージョニング

### 後方互換性

**基本方針: 後方互換性を保つのではなく、新方式に既存コードを修正する。**
- 変更時は影響範囲を特定し、すべての使用箇所を一括で更新する

**例外: 後方互換性を保つべきケース**

- 外部に公開されているAPI（将来的な可能性を含む）
- データベーススキーマの変更（マイグレーション戦略が必要）
- ユーザーデータに影響する変更

**破壊的変更の手順**

1. 変更の影響範囲をコードベース全体で検索
2. すべての使用箇所を特定
3. 変更を実装し、すべての使用箇所を一括更新
4. テストを実行して問題がないことを確認
5. 必要に応じてドキュメントを更新

## コーディングスタイル

- 型定義では type を優先する
- 関数定義では function を優先する
- TypeScript ネイティブの Enum の利用は避け Object Literal を使用する
- **環境変数へのアクセス**: 環境変数に直接アクセスせず、必ず valibot でパースした値を使用すること
  - `process.env.VARIABLE_NAME` を直接使用しない
  - 環境変数を使用するモジュールごとに専用の設定ファイルを作成し、valibot でバリデーションを行う
  - 例: `getConfig()` のような関数経由でアクセスする

## 命名規則

名前は直感的でわかりやすく、同じ概念には一貫した命名を使用すること。

- **ファイル名**: kebab（例: `user-profile.tsx`）
- **関数名**: camel（例: `createUser`）
- **変数名**: camel（例: `fooBar`）
- **コンポーネント名: pascal（例：LoginButton）
- **Object Literal**: pascal（例: `const UserStatus = { Active: 'active', Inactive: 'inactive' } as const`）

## ユーザー体験

ユーザーインターフェースは直感的で一貫性があり、予測可能でなければならない。

- デザインシステムに準拠し、統一された UI/UX パターンを使用すること
- すべての画面はレスポンシブデザインで、モバイル・タブレット・デスクトップに対応すること
- ローディング状態を明示し、ユーザーにフィードバックを提供すること
  - Skeleton を使用する際はロード後のデザインと一致させ CLS を防ぐこと
- エラーメッセージは統一されたフォーマットで、ユーザーフレンドリーであること
- アクセシビリティ標準（WCAG 2.1 レベル AA）を満たすこと
- ナビゲーションは直感的で、ユーザーが迷わない設計にすること
- **楽観的更新 (Optimistic Updates)**: 可能な場合はユーザーアクションに対して即座にフィードバックを提供すること
  - サーバーレスポンスを待たずに UI を更新し、体感速度を向上
  - 失敗時のロールバック処理を適切に実装すること
  - ユーザーに処理状態（pending, success, error）を明確に伝えること
- **マイクロインタラクション**: 細やかなアニメーションとフィードバックで UX を向上すること
  - ボタンクリック、ホバー、フォーカス時の視覚的フィードバック
  - 状態遷移時のスムーズなアニメーション（例: フェードイン、スライド）
  - ローディング、成功、エラーの視覚的な合図（例: スピナー、チェックマーク、エラーアイコン）
  - 過度なアニメーションは避け、パフォーマンスと accessibility を損なわないこと

## 外部ライブラリ

- ユースケースに絞った薄いラッパーの使用を検討すること
  - 過度に複雑になる場合や十分にシンプルな場合はラッパーを使用しない選択も可
  - ラッパーを作る目的は、外部ライブラリの API 変更や代替ライブラリへの移行時に、内部実装のみの変更で対応できるようにするため
  - 完全な API 互換性は不要で、プロジェクトで必要な機能のみを提供すればよい

## Nextjs

### Server Component First

- Server Component での実装を最優先とし、ユーザーのインタラクションが必要な場合にのみクライアントコンポーネントを採用すること
- データの取得は極力末端で行い、上位からバケツリレーで下位に渡すことを避けること

### Server Action

- データのミューテーションには Server Action を使用すること
- Server Action ではカバーできないことや、クライアントからのデータフェッチ用 API には Route Handler を使用すること
- Server Component で利用するデータ取得には使用しないこと
- Server Action はシンタックスシュガーであり、本質的には API と変わらず自由なパラメータで呼び出せるため、引き数がある場合は必ずバリデーションと適切な認証、認可を実施する

### Route Handler

- データフェッチなどのミューテーションを伴わないサーバー操作に使用すること
- cron 用の API など外部から利用されることを想定した API に使用すること

### Container / Presenter / Custom Hook

**Server Component:**

- データ取得やロジックは Container / Presenter パターンとして分離すること

```tsx
async function FooContainer({ id }: { id: string }) {
  const foo = await getFoo(id);
  return <FooPresenter foo={foo} />;
}
```

**Client Component:**

- データ取得やロジックを分離する場合は Custom Hook として分離すること

```tsx
function Foo({ id }: { id: string }) {
  const { foo } = useFoo(id);

  return <div>{foo.bar}</div>;
}
```

### ハイドレーション対応

クライアントコンポーネントでフォームやコントロールを使用する際は、ハイドレーション完了前の操作に対処すること。

- **必須**: `useIsHydrated` フックを使用してハイドレーション状態を管理すること
- ハイドレーション前は入力コントロールを無効化（disabled）するなど、誤操作を防ぐ処理を実装すること
- これにより以下の問題を回避する:
  - ハイドレーション前の入力内容がクリアされる
  - イベントリスナーが正しく設定される前の操作により動作が失敗する

### Cache Component のキャッシュ戦略

#### cache directive

適切な use cache ディレクティブを利用すること。

Next.js は、それぞれ異なるユースケース向けに設計された 3 つのキャッシュディレクティブを提供する。

| 特徴                                 | `use cache`                      | `use cache: remote`                                              | `use cache: private`                         |
| ------------------------------------ | -------------------------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| **動的なコンテキストで動作する**     | いいえ（静的コンテキストが必要） | はい（動的なコンテキスト向けに設計）                             | はい                                         |
| **`await cookies()` にアクセス**     | いいえ                           | いいえ                                                           | はい                                         |
| **`await headers()` にアクセス**     | いいえ                           | いいえ                                                           | はい                                         |
| **`await connection()` の後**        | いいえ（キャッシュしません）     | いいえ                                                           | いいえ                                       |
| **キャッシュハンドラーに保存**       | はい（サーバー側）               | はい（サーバー側）                                               | いいえ（クライアント側のみ）                 |
| **キャッシュスコープ**               | グローバル（共有）               | グローバル（共有）                                               | ユーザーごと（分離）                         |
| **ランタイムプリフェッチをサポート** | N/A (ビルド時に事前レンダリング) | いいえ                                                           | はい（設定されている場合）                   |
| **使用事例**                         | 静的共有コンテンツ（ビルド時）   | ランタイムコンテキストでの動的な共有コンテンツ（リクエストごと） | パーソナライズされたユーザー固有のコンテンツ |

##### "use cache" のユースケース

- コンテンツがビルド時に事前レンダリングできる場合
- コンテンツがすべてのユーザー間で共有される場合
- コンテンツがリクエスト固有のデータに依存しない場合

##### "use cache: remote" のユースケース

- 動的コンテキスト内でのキャッシュが必要な場合
- コンテンツがユーザー間で共有されるが、リクエストごとにレンダリングする必要がある場合（`await connection()` のあと）
- 高価な操作をサーバー側のキャッシュハンドラーにキャッシュしたい場合

##### "use cache: private" のユースケース

- コンテンツがユーザーごとにパーソナライズされる場合（Cookie、ヘッダーによって異なる）
- ユーザー固有のコンテンツの実行時プリフェッチが必要な場合
- コンテンツをユーザー間で共有してはならない場合

#### cacheLife

##### データの更新をアプリで制御できる場合

アプリ内の DB のデータや webhook で検知できる外部データが対象。

- カスタムプロファイル permanent を利用し、キャッシュの更新が必要なタイミングで `revalidateTag()` を行うこと
- `cacheTag()` を使って更新タイミングに応じたタグを設定すること
  - 例: `cacheTag("parent-delete", "foo-update")`

##### データの更新タイミングをアプリで制御できない場合

外部 API やデータの更新を制御できても一定間隔での更新で十分な場合が対象。

- `"hours"`、`"days"`、カスタム時間など要件に応じた時間を指定すること

### テスト基準

テストは品質保証の基盤であり、すべての新機能に対して必須である。

**テストファイルの命名規則:**

テストファイル名は以下の命名規則に従うこと：

- **E2Eテスト**: `*.e2e.test.{ts,tsx}` （例: `login.e2e.test.ts`）
- **ブラウザテスト（UI/hooks）**: `*.browser.test.{ts,tsx}` （例: `login-form.browser.test.tsx`）
- **サーバーテスト（Server Action/RSC/Route Handler）**: `*.server.test.{ts,tsx}` （例: `login-action.server.test.ts`）

**テスト哲学:**

- **公開インターフェースのテスト**: 公開された API、関数、コンポーネントの動作をテストすること
- **内部実装のテストを避ける**: 内部のプライベートメソッドや実装詳細に依存したテストは避けること
  - 実装の変更に対してテストが壊れることを防ぐ
  - リファクタリングの自由度を保つ
  - テストは「何をするか」に焦点を当て、「どうやるか」には焦点を当てない

**統合テストの優先:**

- **結合された状態でのテスト**: 極力、実際の依存関係を使用した統合テストを優先すること
- **過剰な Mock の使用を避ける**: Mock は最小限にとどめ、必要な場合のみ使用すること
  - Mock を使うと実際の統合問題を見逃す可能性がある
  - Mock の保守コストが高くなる
  - テストが実装詳細に依存しやすくなる

**Mock 使用の原則:**

- **Mock が許容される場合**: 外部 API やサードパーティサービスなど、制御できない外部依存のみ
  - 例: 決済サービス、メール送信サービス、外部データプロバイダー
  - これらは信頼性、コスト、テスト実行速度の観点から Mock が適切
- **Mock を避けるべき場合**: プロジェクト内部の依存関係、データベース、ファイルシステム
  - これらは実際の実装を使用してテストすること

**内部実装とモックの扱い:**

- **基本原則**: 内部実装の詳細（どの関数が呼ばれたか）はテストしない
  - テストは「何をするか」に焦点を当て、「どうやるか」には焦点を当てない
  - 公開された振る舞い（UIの変化、ユーザーに見える結果）をテストする
- **例外: 外部への副作用のテスト**
  - セキュリティやパフォーマンスの観点から、特定の操作で外部への副作用がないことを確認する必要がある場合は例外的に許容
  - 例: バリデーションエラー時にサーバーリクエストが発生しない、権限不足時に認証APIが呼ばれない
  - この場合は、必ず意図を明確にするコメントを付けること:
    ```typescript
    // バリデーションエラー時にログインが実施されないことを確認
    // 注: 内部実装に依存するが、外部への副作用がないという重要な振る舞いをテストするため
    expect(loginActionMock).not.toHaveBeenCalled();
    ```

**データベーステスト:**

- **Mock データベースを避ける**: Mock や Fake のデータベース実装は使用しないこと
- **実際のデータベースを使用**: テストには以下のいずれかを使用すること
  - Docker コンテナで起動した実際のデータベース（PostgreSQL, MySQL など）
  - In-memory データベース（SQLite in-memory mode など）
  - トランザクションロールバックを使用したテスト分離
- これにより、SQL クエリ、制約、トリガーなどの実際の動作を検証できる

**テストカバレッジとタイプ:**

- 新機能・変更には必ずテストを作成すること
- テストカバレッジ目標は 80%以上を維持すること
- E2E テストで主要なユーザーフローを検証すること
- テストファースト開発を推奨し、Red-Green-Refactor サイクルを意識すること
- テストは読みやすく、保守しやすく、意図が明確であること
- エッジケース・エラーハンドリングもテストでカバーすること

**テスト構造の共通原則:**

- **fixture 機能を優先**: テストのセットアップ・ティアダウンなど共通処理は fixture 機能を使用すること
  - `beforeEach`/`afterEach` よりも fixture を優先する理由:
    - テストごとに必要な依存関係のみを明示的に宣言できる
    - 自動的にクリーンアップが行われる
    - テストの独立性が高まり、テストの順序に依存しない
  - Playwright と Vitest の両方で `test.extend()` を使用してカスタム fixture を定義
  - Vitest Browser Mode での実装例:
    ```typescript
    import { test as base } from "vitest";

    const test = base.extend<{ loginActionMock: Mock }>({
      loginActionMock: async ({}, use) => {
        const loginActionModule = await import("./login-action");
        const mock = vi.mocked(loginActionModule.loginAction);
        await use(mock);
        vi.clearAllMocks();  // 自動クリーンアップ
      },
    });

    test("ログインテスト", async ({ loginActionMock }) => {
      // loginActionMock が自動的に提供され、テスト後に自動クリーンアップされる
    });
    ```

- **フラットな構造を優先**: `test.describe()` は単純なグルーピングのためには使用しない
  - `describe` はグループごとに共通処理（beforeEach, afterEach など）を実施したい場合にのみ使用すること
  - 基本的にはフラットな構造でテストを作成すること

**テストのクエリ優先度:**

テストでは以下の優先順位でクエリを使用すること。上位のクエリほどアクセシビリティを保証し、実装の詳細に依存しない。

1. **アクセシブルクエリ（最優先）**
   - すべてのユーザー（視覚/マウス利用者、支援技術利用者）の体験を反映
   - 例: `getByRole()`, `getByLabelText()`, `getByPlaceholderText()`, `getByText()`
2. **セマンティッククエリ**
   - HTML5 と ARIA に準拠したセレクター（ブラウザや支援技術で体験が異なる場合がある）
   - 例: `getByAltText()`, `getByTitle()`
3. **テスト ID（最終手段）**
   - 他の方法で特定できない場合のみ使用
   - 例: `getByTestId()`

**コンポーネントテスト（Vitest Browser Mode）の原則:**

- **page オブジェクトの使用**: `screen` ではなく `page` を常に使用すること
  - クエリ: `page.getByRole()`, `page.getByLabelText()` など
  - アサーション: `await expect.element(page.getByRole(...)).toBeInTheDocument()` を使用
  - 理由: Vitest Browser Mode では `page` が標準のブラウザAPIを提供する
  - `screen` は Testing Library の概念であり、Vitest Browser Mode では使用しない

**E2E テスト固有の原則:**

- **テストの統合**: E2E テストは実行コストが高いため、フローが同一の場合は別観点のテストケースであっても統合して実施すること
  - 例: 「ログイン成功」と「ブラウザバック後の挙動」は同一フロー内で検証
- **test.step の使用**: 操作単位で `test.step()` を使用し、テストレポートで操作内容を明確にすること
  - 各ステップは簡潔で意味のある名前を付ける
  - ステップ内では関連する操作をまとめる
  - テスト失敗時にどのステップで失敗したかが一目でわかるようにする

### ロギング

すべてのログ出力には `@repo/logger` パッケージを使用すること（OWASP Logging Cheat Sheet 準拠）。

**基本原則:**

- **Next.js Server Component/Server Action**: `@repo/logger/nextjs/server` から `getLogger()` を使用（IP アドレスとリクエストIDを自動取得）
- **Next.js Route Handler**: `getBaseLogger()` を使用し、`request` オブジェクトから IP アドレスとリクエストIDを取得
- **Next.js Middleware**: リクエストIDを自動生成するため middleware を設定すること（推奨）
- **その他の環境**: `getBaseLogger()` を使用
- `application`、`environment`、`service` は環境変数から自動取得
- 動的なコンテキスト（userId など）は `logger.child()` で追加すること
- 機密情報（パスワード、トークン、キーなど）は自動的にマスキングされるが、意図的に含めないこと

**環境変数（必須）:**

- `APP_NAME`: アプリケーション名
- `HOST_ENVIRONMENT`: ホスト環境（development/staging/production）
- `SERVICE_NAME`: サービス名（web/api/db など）

**ログレベルの使い分け:**

- `fatal`: 全体に影響する深刻なエラー。サービスの正常な動作を阻害（通知対象）
- `error`: 特定の操作に影響する重要なエラー。早急な対応が必要（通知対象）
- `warn`: 注意が必要な事象や潜在的な問題。サービスの正常な動作には影響しない
- `info`: サービスの正常な流れや重要なイベント
- `debug`: 開発やデバッグ用の詳細情報（本番環境では通常無効化）
- `trace`: 非常に詳細な処理ステップ（本番環境では無効化）

**通知ポリシー:**

- ERROR レベル以上（ERROR, FATAL）は通知対象
- 通知は observability サービス（監視ツール）によって行われる
- アプリケーションレベルでは通知を行わない

**記録必須のセキュリティイベント（OWASP 推奨）:**

- **認証・認可**: ログイン成功/失敗、アクセス拒否、パスワードリセット
- **データ操作**: CRUD 操作（特に削除・更新）、ユーザー管理操作、管理者権限での操作
- **入力検証**: バリデーション失敗、不正なファイルアップロード試行
- **セッション管理**: Cookie 値の変更、JWT 検証の失敗
- **システムイベント**: 起動/停止、設定変更、外部 API 呼び出し

**ログに含めるべき情報:**

- **必須**: タイムスタンプ、ログレベル、メッセージ、アプリケーション名、環境、サービス名
- **推奨**: ユーザー ID、IP アドレス、リクエスト ID、アクション種別、影響を受けたリソース

**絶対に記録してはいけない情報:**

- パスワード、API トークン、暗号化キー
- 支払いカード情報、銀行口座情報
- セッション ID（必要な場合はハッシュ化）
- 機密な個人情報（PII）

**Middleware設定（Next.js）:**

Next.js Middleware でロギングに必要なヘッダーを自動設定すること。以下のヘッダーを設定することで、`@repo/logger/nextjs/server` の `getLogger()` が自動的にコンテキスト情報を取得できる。

設定すべきヘッダー：
- `x-request-id`: リクエストトレーシング用のUUID（必須）
- `x-git-commit-sha`: Gitコミットハッシュ（Vercel環境変数 `VERCEL_GIT_COMMIT_SHA` から取得）
- `x-deployment-id`: デプロイID（Vercel環境変数 `VERCEL_DEPLOYMENT_ID` から取得）
- `x-auth-user-id`: 認証ユーザーID（Supabase認証から取得）

**使用例:**

```typescript
// Next.js Server Component/Server Action
import { getLogger } from "@repo/logger/nextjs/server";

export async function loginAction(formData: FormData) {
	const logger = await getLogger(); // IPアドレスとリクエストIDを自動取得
	logger.info({ userId, action: "login" }, "User logged in successfully");
}

// Next.js Route Handler
import { getBaseLogger } from "@repo/logger";

export async function POST(request: Request) {
	const logger = getBaseLogger({});

	// requestから直接取得
	const forwardedFor = request.headers.get("x-forwarded-for");
	const ipAddress = forwardedFor?.split(",")[0]?.trim();
	const requestId = request.headers.get("x-request-id");

	const requestLogger = logger.child({
		requestId,
		ipAddress,
	});

	requestLogger.info("Processing request");
}

// その他の環境
import { getBaseLogger } from "@repo/logger";

const logger = getBaseLogger({});
logger.error({ err }, "Authentication failed");
```

詳細は [packages/logger/README.md](packages/logger/README.md) を参照。

### モニタリング・観測可能性

システムの状態を常に把握し、問題を早期に発見・対応できなければならない。

**ログとメトリクス:**

- ログは構造化された形式（JSON 等）で出力し、集約・検索可能にすること
- メトリクス（レスポンスタイム、エラー率、リソース使用率等）を継続的に収集すること
- ビジネスメトリクス（ユーザー行動、コンバージョン等）も追跡すること

**監視とアラート:**

- 重要な指標（エラー率、パフォーマンス低下等）に対してアラートを設定すること
- ダッシュボードでシステムの健全性を可視化すること
- 異常検知とアラート通知の仕組みを構築すること

**エラートラッキング:**

- クライアント・サーバー双方のエラーを追跡すること
- エラーの文脈情報（ユーザー ID、リクエスト内容等）を記録すること
- エラーの優先度付けとトリアージプロセスを確立すること

**パフォーマンス監視:**

- リアルユーザーモニタリング（RUM）でユーザー体験を計測すること
- API エンドポイントのレスポンスタイムを監視すること
- ボトルネックを特定し、継続的に改善すること

## タスク完了の条件

- lint エラーがないこと
- ソースコードが format されていること
- 型エラーがないこと
- ランタイムエラーがないこと

## マージ条件

- タスク完了の条件を満たしていること
- ユニットテスト、コンポーネントテスト、E2E テストがパスしていること
- デプロイが成功していること

## コマンド

### バリデーションチェック

lint, format, デッドコード検出、スペルチェックを行います
タスク完了時には必ず実施し、エラーが出ていないことを確認してください
エラーが出ているときはバリデーション自動修正の実施や、手動での改善を行ってください

`pnpm validate:check `

### バリデーション自動修正
lint, format, デッドコードの自動修正を行います。スペルチェックは手動で追加が必要です

`pnpm validate:fix`

## モノレポ

- 各モノレポパッケージでは JIT パッケージとして実装し、使用する側でビルド時にコンパイルすること

## GitHub Actions

GitHub Actionsワークフローは以下のルールに従うこと。

**必須設定:**

- **ステップ名の日本語化**: 各ステップには日本語でわかりやすい名前を必ず付けること
  - 例: `name: リポジトリのチェックアウト`, `name: 依存関係のインストール`
- **pnpm バージョン**: `pnpm/action-setup@v4` でバージョンを省略し、`package.json` の `packageManager` フィールドのバージョンを自動使用させること
  - ❌ 悪い例: `version: 10.12.4`
  - ✅ 良い例: バージョン指定なし（省略）
- **Node.js バージョン**: `setup-node` で `.node-version` ファイルを参照すること
  - 設定: `node-version-file: .node-version`
- **concurrency 設定**: PR ごとに重複実行を防ぐため、必ず concurrency を設定すること
  ```yaml
  concurrency:
    group: <workflow-name>-${{ github.ref }}
    cancel-in-progress: true
  ```
- **タイムアウト設定**: 各ジョブには最低でも 10 分のタイムアウトを設定すること
  - 設定: `timeout-minutes: 10`（またはそれ以上）

## MCP

- 外部ライブラリを使用する場合は必ず Context7 のツールを利用して、使用バージョンと一致した情報を取得すること
- GitHub の操作を行う際は Github のツールを優先すること
