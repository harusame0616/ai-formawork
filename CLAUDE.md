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

- 型定義を行う場合は interface より type を優先する
- 関数定義ではアロー関数より function を優先する
- TypeScript ネイティブの Enum の利用は避け Object Literal を使用する
- **環境変数へのアクセス**: 環境変数に直接アクセスせず、必ず valibot でパースした値を使用すること
  - `process.env.VARIABLE_NAME` を直接使用しない
  - 環境変数を使用するモジュールごとに専用の設定ファイルを作成し、valibot でバリデーションを行う
  - 例: `getConfig()` のような関数経由でアクセスする
- **コメントの最小化**: コードを読めば分かる自明な内容はコメントを書かないこと
  - ❌ 悪い例: `// バリデーション`、`// 顧客詳細ページへリダイレクト`
  - ✅ 良い例: 複雑なビジネスロジックの「なぜ」を説明するコメント、アルゴリズムの意図を説明するコメント
  - コメントが必要と感じる場合は、コードをより明確にリファクタリングできないか検討すること
- **中間変数・型の最小化**: 複数箇所から参照されない中間変数や型は使用せず、直接指定すること
  - 1箇所でしか使われない型エイリアスは作成せず、直接型を記述する
  - 1箇所でしか使われない定数は、複数の場所で同じ値を使用する場合を除き、直接値を記述する
  - 例外: 同じ文字列リテラルや数値を複数箇所で使用する場合は、定数として定義すること（DRY原則）
  - **型として使用する定数の扱い**: 定数を複数箇所で使用し、かつその型も必要な場合は、`const` で定義して `typeof` で型を参照すること
    - ❌ 悪い例: 型エイリアスと定数を別々に定義
      ```typescript
      const ERROR_MESSAGE = "エラーが発生しました" as const;
      export type ErrorMessage = typeof ERROR_MESSAGE;  // 不要な型定義
      ```
    - ✅ 良い例: `const` だけを定義し、型は `typeof` で参照
      ```typescript
      const ERROR_MESSAGE = "エラーが発生しました" as const;
      // 型が必要な箇所では typeof ERROR_MESSAGE を直接使用
      function handleError(): typeof ERROR_MESSAGE { return ERROR_MESSAGE; }
      ```

## 命名規則

名前は直感的でわかりやすく、同じ概念には一貫した命名を使用すること。

- **ファイル名**: kebab（例: `user-profile.tsx`）
  - **一貫性の原則**: 同じ概念やエンティティを指す場合は、ファイル名に関わらず常に同じ表現を使用すること
  - **単数形・複数形の使い分け**: 複数を表す場合は複数形、単数を表す場合は単数形を適切に使い分けること
  - 例: 顧客ノートに関連するファイル
    - ✅ 良い例:
      - `customer-notes-container.tsx` - 複数のノートを扱う
      - `customer-notes-presenter.tsx` - 複数のノートを表示
      - `customer-notes-search-form.tsx` - 複数のノートを検索
      - `customer-note-card.tsx` - 単一のノートカード（単数形が適切）
    - ❌ 悪い例:
      - `customer-notes-container.tsx`、`note-search-form.tsx`（`customer-notes` と `note` で表現が不統一。`customer-notes-search-form.tsx` とすべき）
  - この原則はファイル名だけでなく、変数名、関数名、型名などコード全体に適用すること
- **関数名**: camel（例: `createUser`）
- **変数名**: camel（例: `fooBar`）
- **コンポーネント名**: pascal（例：LoginButton）
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
- **フォームの説明**: `placeholder` の使用を避け、必要な情報は Label の下に説明テキストとして記載すること
  - `placeholder` はフィールドが空でない場合に見えなくなるため、重要な情報の提供には不適切
  - 説明テキストは `<p className="text-sm text-muted-foreground">` を使用して Label の直下に配置する
  - 例:
    ```tsx
    <Label htmlFor="keyword">キーワード検索</Label>
    <p className="text-sm text-muted-foreground">
      本文または記入者の名前で検索できます
    </p>
    <Input id="keyword" type="text" value={keyword} />
    ```
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

### Suspense とローディング状態

**Container 配置時の必須対応:**

- Container コンポーネント（async component）を配置する際は、**Page コンポーネント側で必ず** `Suspense` でラップすること
- Container 自体に Suspense を配置してはいけない（Page で配置する）
  - **例外**: Container 内で別の Container や非同期コンポーネントをネストする場合は、Container 内で Suspense を配置すること
- `fallback` には専用のスケルトンコンポーネントを指定すること
- スケルトンはロード後のデザインと一致させ、CLS（Cumulative Layout Shift）を防ぐこと

**スケルトンの種類:**

- **通常のコンテンツ**: `Skeleton` コンポーネントを使用してロード後のレイアウトと同じ構造を作成
- **フォームコンポーネント**: 入力フィールドを `disabled` にした実際のフォームコンポーネントを配置

**命名規則:**

- Next.js の組み込み型や標準 API と紛らわしい名前は避けること
  - 例: `searchParams` は Next.js の searchParams（`string | string[] | undefined` の型）や URLSearchParams を連想させるため、パース済みのオブジェクトには使用しない
  - パース済みや変換済みのデータには、その性質を明確に表す名前を使用すること
  - 例: `searchParams` → `searchCondition`、`rawData` → `parsedData` など

**実装例:**

```tsx
// Page コンポーネント（Suspense を配置）
export default async function Page({
  params,
  searchParams
}: PageProps<"/foo/[id]">) {
  const idPromise = params.then(({ id }) => id);
  const searchConditionPromise = searchParams.then((sp) =>
    parse(searchConditionSchema, sp)
  );

  return (
    <Suspense fallback={<FooSkeleton />}>
      <FooContainer
        idPromise={idPromise}
        searchConditionPromise={searchConditionPromise}
      />
    </Suspense>
  );
}

// Container コンポーネント（Suspense は含めない）
async function FooContainer({
  idPromise,
  searchConditionPromise
}: FooContainerProps) {
  const id = await idPromise;
  const searchCondition = await searchConditionPromise;
  const data = await getData(id, searchCondition);

  return <FooPresenter data={data} />;
}

// スケルトンコンポーネント（ロード後と完全に一致するレイアウト）
function FooSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

// フォームの場合
function FooFormSkeleton() {
  return <FooForm disabled />;  // 実際のフォームを disabled で表示
}

// Container 内で別の非同期コンポーネントをネストする場合（例外）
async function ParentContainer({ idPromise }: ParentContainerProps) {
  const id = await idPromise;
  const parentData = await getParentData(id);

  return (
    <div>
      <ParentPresenter data={parentData} />

      {/* Container 内で別の非同期コンポーネントをネストする場合は Suspense を配置 */}
      <Suspense fallback={<ChildSkeleton />}>
        <ChildContainer idPromise={Promise.resolve(id)} />
      </Suspense>
    </div>
  );
}
```

### Page と Layout の型定義

Page と Layout では Next.js が提供する型ヘルパーを使用すること。

**Page コンポーネント:**

- `PageProps<ルートリテラル>` を使用すること
- ルートリテラルにより `params` と `searchParams` が型安全になる
- グローバルに利用可能でインポート不要

**Layout コンポーネント:**

- `LayoutProps<ルートリテラル>` を使用すること
- `children` と `params` が型安全になる
- グローバルに利用可能でインポート不要

**params と searchParams の扱い:**

- Page/Layout で `params` や `searchParams` を `await` すると、そのコンポーネントが Dynamic になってしまう
- **必要がなければ** `await` を避け、`.then()` で変換して子コンポーネントに Promise として渡すこと
- `.then()` 内でデストラクチャリングを使用してシンプルに記述すること
- `searchParams` は `.then()` 内で必ず valibot でパースすること（型の保証だけでは不十分）
- クライアントコンポーネントなど、値が必要な場合は `await` して使用すること（この場合は Dynamic になることを理解する）
- 不要な省略や中間変数は避け、シンプルでわかりやすいコードを優先すること

```tsx
// params の例
async function Page({ params }: PageProps<"/customers/[customerId]">) {
  const customerIdPromise = params.then(({ customerId }) => customerId);
  return <CustomerContainer customerIdPromise={customerIdPromise} />;
}

// searchParams の例
const customerSearchCondition = v.object({ hoo: v.optional(v.string(), v.transform(number)) });

async function Page({ searchParams }: PageProps<"/customers">) {
  const parsedSearchParamsPromise = searchParams.then((searchParams) =>
    parse(searchParamsSchema, searchParams)
  );
  return <Customers condition={customerSearchCondition} />;
}


### ハイドレーション対応

クライアントコンポーネントでフォームやコントロールを使用する際は、ハイドレーション完了前の操作に対処すること。

- **必須**: `useIsHydrated` フックを使用してハイドレーション状態を管理すること
- ハイドレーション前は入力コントロールを無効化（disabled）するなど、誤操作を防ぐ処理を実装すること
- これにより以下の問題を回避する:
  - ハイドレーション前の入力内容がクリアされる
  - イベントリスナーが正しく設定される前の操作により動作が失敗する

### フォーム実装

**必須要件:**

フォームは必ず shadcn/ui の Form コンポーネント、react-hook-form、valibot を使用して実装すること。

**使用するライブラリとコンポーネント:**

- **shadcn/ui Form コンポーネント**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormDescription`, `FormControl`
- **react-hook-form**: `useForm` フック、フォーム状態管理
- **valibot**: スキーマ定義とバリデーション（`@hookform/resolvers/valibot` の `valibotResolver` を使用）

**重要な原則:**

- `placeholder` 属性の使用を避け、`FormDescription` で説明を記載すること
  - `placeholder` は入力中に見えなくなるため、重要な情報の提供には不適切
  - `FormDescription` は常に表示され、ユーザーに継続的なガイダンスを提供する

**実装例:**

```tsx
"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";

// valibot でスキーマを定義
const formSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  name: v.string(),
  age: v.optional(v.pipe(v.string(), v.transform(Number))),
});

type FormValues = v.InferOutput<typeof formSchema>;

export function ExampleForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      name: "",
      age: "",
    },
    resolver: valibotResolver(formSchema),
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormDescription>
                ログインに使用するメールアドレスを入力してください
              </FormDescription>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormDescription>フルネームで入力してください</FormDescription>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">送信</Button>
      </form>
    </Form>
  );
}
```

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

**テストサイズの定義（Google Testing Blog 準拠）:**

テストは実行時間と外部依存によって以下の3つのサイズに分類される：

- **Small テスト**: `*.small.test.{ts,tsx}`
  - 単一プロセス内で完結するテスト
  - 外部依存（ネットワーク、データベース、ファイルシステム等）を使用しない
  - 高速に実行される（通常 < 100ms）
  - 例: 純粋関数、ユーティリティ、ビジネスロジックのユニットテスト

- **Medium テスト**: `*.medium.test.{ts,tsx}`
  - 単一マシン内で完結するテスト
  - ローカルの外部依存（データベース、ファイルシステム等）を使用可能
  - ネットワークを介した外部サービスへのアクセスは不可
  - 例: データベース統合テスト、ファイル I/O を含むテスト

- **Large テスト (E2E)**: `*.e2e.test.{ts,tsx}`
  - 複数プロセス・マシンにまたがるテスト
  - すべての外部依存を使用可能
  - 実際のユーザーフローをエンドツーエンドで検証
  - 例: ブラウザ自動化テスト、API 統合テスト

**テストファイルの命名規則:**

テストファイル名は以下の命名規則に従うこと：

- **E2Eテスト**: `*.e2e.test.{ts,tsx}` （例: `login.e2e.test.ts`）
- **ブラウザテスト（UI/hooks）**: `*.browser.test.{ts,tsx}` （例: `login-form.browser.test.tsx`）
- **サーバーテスト（Server Action/RSC/Route Handler）**: `*.server.test.{ts,tsx}` （例: `login-action.server.test.ts`）
- **Small テスト**: `*.small.test.{ts,tsx}` （例: `utils.small.test.ts`）
- **Medium テスト**: `*.medium.test.{ts,tsx}` （例: `get-customers.medium.test.ts`）

**テスト哲学:**

- **振る舞いをテストする**: ユーザーから見た振る舞い（外部から観察可能な動作）をテストすること
  - ❌ 悪い例: 「maxlength属性が設定されている」「特定のテキストが表示される」
  - ✅ 良い例: 「最大文字数を超えて入力できない」「エラー時に送信できない」
  - 実装方法（どの属性を使うか、どの関数を呼ぶか）ではなく、結果（何が起こるか）をテストする
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

**ブラウザテストとE2Eテストの使い分け:**

- **ブラウザテスト（Vitest Browser Mode）**: 同期的でブラウザ内で完結する振る舞いをテストする
  - クライアントサイドバリデーション（必須項目、フォーマット検証など）
  - ユニバーサルコンポーネントやクライアントコンポーネントの表示・操作
  - ローディング状態やエラー表示などのUI状態
  - Server Actionやバックエンドとの統合は含まない（モックを使用）

- **E2Eテスト（Playwright）**: サーバー、クライアント、データベースが統合して動作する振る舞いをテストする
  - ユーザー登録からログイン、データ作成までのフロー全体
  - Server Actionを経由したデータベース操作
  - 認証・認可を含む実際のユーザーフロー
  - 外部APIとの統合やリダイレクトなど

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

### 開発

#### 開発サーバー起動

デプロイ先が Vercel でタイムゾーンが UTC 固定のため、UTC で起動する

```bash
pnpm dev
```

#### ビルド

デプロイ先が Vercel でタイムゾーンが UTC 固定のため、UTC でビルドする

```bash
pnpm build
```

#### 本番サーバー起動

デプロイ先が Vercel でタイムゾーンが UTC 固定のため、UTC で起動する

```bash
pnpm start
```

### テスト

#### ブラウザテスト（コンポーネント/UI/hooks）
```bash
pnpm test:browser
```
- Vitest Browser Mode を使用したコンポーネントテストを実行
- `*.browser.test.{ts,tsx}` ファイルが対象

#### サーバーテスト（Server Action/RSC/Route Handler）
```bash
pnpm test:server
```
- サーバーサイドのロジックをテスト
- `*.server.test.{ts,tsx}` ファイルが対象

#### E2E テスト
```bash
pnpm test:e2e
```
- データベースをリセットしてから E2E テストを実行
- `*.e2e.test.{ts,tsx}` ファイルが対象
- Playwright を使用した実際のブラウザでのテスト

### バリデーション

#### バリデーションチェック
```bash
pnpm validate:check
```
- lint, format, デッドコード検出、スペルチェック、型チェックを実行
- タスク完了時には必ず実施し、エラーが出ていないことを確認すること
- 実行内容:
  - `biome check .` - lint と format のチェック
  - `knip` - デッドコード検出
  - `cspell .` - スペルチェック
  - `pnpm -r type:check` - 全パッケージの型チェック

#### バリデーション自動修正
```bash
pnpm validate:fix
```
- lint, format, デッドコードの自動修正を実行
- スペルチェックのエラーは手動で修正が必要
- 実行内容:
  - `biome check --write .` - lint と format の自動修正
  - `knip --fix --allow-remove-files` - デッドコードの自動削除

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
