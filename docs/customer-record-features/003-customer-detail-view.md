# 003: 顧客詳細表示

## 機能概要

特定の顧客の詳細情報を包括的に表示する機能。基本情報、来店履歴、カルテ履歴、支払い履歴、写真などすべての関連情報を一画面で確認できる顧客の「デジタルカルテ」。

## なぜ必要なのか

### ビジネス上の必要性
- **顧客理解の深化**: 顧客の全体像を把握し、パーソナライズされたサービスを提供
- **情報の一元化**: 複数の画面を行き来せず、一箇所ですべての情報にアクセス
- **意思決定の支援**: 過去の履歴を参照して、適切な施術やサービスを提案
- **顧客体験の向上**: スムーズな対応により、顧客満足度が向上

### システム上の必要性
- **データの可視化**: 複雑な関連データを理解しやすく表示
- **他機能へのハブ**: 編集、予約、会計など他機能への起点
- **監査証跡**: 顧客に関する操作履歴を追跡

## どのようなときに役立つのか

### 日常業務での活用

1. **来店対応・カウンセリング**
   ```
   受付 → 顧客検索 → 詳細表示
   ↓
   - 前回の施術内容確認
   - アレルギー・既往歴確認
   - お好みやリクエスト確認
   - 前回の写真参照
   ```

2. **施術中の情報参照**
   ```
   施術スタッフがタブレットで確認
   ↓
   - 過去の施術記録
   - 使用した薬剤
   - 注意事項
   - 顧客の好み
   ```

3. **会計処理**
   ```
   会計画面から詳細表示
   ↓
   - 未払い金確認
   - ポイント残高
   - 購入履歴
   - 利用可能なクーポン
   ```

4. **電話対応**
   ```
   電話番号で検索 → 詳細表示
   ↓
   - 顧客の状況を即座に把握
   - 前回の来店日時
   - 予約状況
   - 問い合わせ履歴
   ```

5. **マーケティング施策**
   ```
   セグメント抽出 → 個別顧客確認
   ↓
   - 来店頻度の確認
   - 購買傾向の分析
   - キャンペーン対象の判断
   ```

### 具体的なシナリオ

**シナリオ1: 美容サロンでの施術前カウンセリング**
```
顧客が来店
↓
受付スタッフが詳細画面を開く
↓
「前回は〇〇のトリートメントでしたね」
「お肌の調子はいかがですか?」
↓
前回の写真を見せながら
「前回と比べてこのように...」
↓
顧客満足度向上
```

**シナリオ2: アレルギー情報の確認**
```
施術前チェック
↓
詳細画面のアレルギー情報欄を確認
↓
「〇〇にアレルギーがあります」の警告表示
↓
該当成分を避けた薬剤を選択
↓
安全な施術の提供
```

**シナリオ3: VIP顧客への特別対応**
```
顧客ランク: プラチナ 表示
↓
スタッフが特別対応を意識
↓
「いつもありがとうございます」
過去の購入履歴から好みを把握
↓
パーソナライズされた提案
```

## 重要度評価

### 優先度: P0 (Critical - 最優先)

### 理由

1. **顧客情報へのアクセスポイント**
   - すべての顧客操作の起点
   - 検索の次に必ず使用される機能
   - 1日に数十〜数百回表示される

2. **業務判断の基盤**
   - 顧客対応の質が変わる
   - 安全な施術のために必須（アレルギー等）
   - 適切なサービス提案の根拠

3. **システムのハブ機能**
   - 他の機能への導線
   - 編集、予約、会計、カルテなどへのアクセス
   - 情報の集約点

4. **UX の中核**
   - 使いやすさがシステム全体の評価を左右
   - 情報設計の良し悪しが業務効率に直結
   - レスポンシブ対応が必須

## 基本設計

### システム構成

```
┌─────────────────────────┐
│  顧客詳細ページ          │
│  /customers/:id          │
└──────────┬──────────────┘
           │
           ↓ Server Component
┌─────────────────────────┐
│  データ取得層            │
│  (parallel queries)     │
├─────────────────────────┤
│  - 基本情報             │
│  - 来店履歴             │
│  - カルテ履歴           │
│  - 支払い履歴           │
│  - 写真                 │
│  - メモ                 │
└──────────┬──────────────┘
           │
           ↓ Database
┌─────────────────────────┐
│  PostgreSQL             │
│  + Relations            │
└─────────────────────────┘
```

### データ構造

```typescript
type CustomerDetail = {
  // 基本情報
  customer: Customer;

  // 統計情報
  stats: {
    totalVisits: number;
    totalSpent: number;
    averageSpent: number;
    lastVisit: Date | null;
    memberSince: Date;
    daysSinceLastVisit: number | null;
  };

  // 来店履歴（最新5件）
  recentVisits: Visit[];

  // カルテ履歴（最新5件）
  recentRecords: Record[];

  // 予約情報
  upcomingAppointments: Appointment[];

  // 支払い情報
  paymentSummary: {
    unpaidAmount: number;
    pointBalance: number;
    availableCoupons: Coupon[];
  };

  // 写真（最新10件）
  recentPhotos: Photo[];

  // タグとカテゴリ
  tags: Tag[];
  categories: Category[];

  // メモ（最新5件）
  recentNotes: Note[];
};
```

### 処理フロー

```typescript
// Server Component で並列データ取得
async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customerId = params.id;

  // 並列でデータ取得（最速表示）
  const [
    customer,
    stats,
    recentVisits,
    recentRecords,
    upcomingAppointments,
    paymentSummary,
    recentPhotos,
    recentNotes
  ] = await Promise.all([
    getCustomer(customerId),
    getCustomerStats(customerId),
    getRecentVisits(customerId, 5),
    getRecentRecords(customerId, 5),
    getUpcomingAppointments(customerId),
    getPaymentSummary(customerId),
    getRecentPhotos(customerId, 10),
    getRecentNotes(customerId, 5),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerDetailView
      customer={customer}
      stats={stats}
      recentVisits={recentVisits}
      recentRecords={recentRecords}
      upcomingAppointments={upcomingAppointments}
      paymentSummary={paymentSummary}
      recentPhotos={recentPhotos}
      recentNotes={recentNotes}
    />
  );
}
```

## 詳細設計

### UI/UXレイアウト

```
┌──────────────────────────────────────────────────┐
│  ← 戻る    山田 太郎 (ヤマダ タロウ)              │
│  C202401010001 | 男性 | 35歳 | プラチナ会員      │
├──────────────────────────────────────────────────┤
│  [編集] [予約] [会計] [カルテ作成] [メモ追加]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐  ┌──────────────────┐        │
│  │   統計情報   │  │   基本情報         │        │
│  │ 来店: 24回   │  │ 📧 email          │        │
│  │ 累計: ¥48万  │  │ 📞 phone          │        │
│  │ 最終: 7日前  │  │ 🏠 address        │        │
│  └─────────────┘  └──────────────────┘        │
│                                                  │
│  ┌────────────────────────────────────┐        │
│  │ ⚠️ アレルギー: 化粧品A, 薬剤B         │        │
│  │ 💊 既往歴: アトピー性皮膚炎           │        │
│  └────────────────────────────────────┘        │
│                                                  │
│  【タブナビゲーション】                          │
│  [来店履歴] [カルテ] [支払い] [写真] [メモ]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│                                                  │
│  📅 来店履歴                                     │
│  ┌────────────────────────────────────┐        │
│  │ 2024/01/15 フェイシャル 施術者:佐藤  │ >     │
│  │ 2024/01/08 カット      施術者:鈴木  │ >     │
│  │ 2023/12/20 トリートメント 施術者:佐藤 │ >    │
│  └────────────────────────────────────┘        │
│  [すべて見る]                                    │
│                                                  │
│  📝 最近のカルテ                                 │
│  ┌────────────────────────────────────┐        │
│  │ 2024/01/15 お肌の状態良好。次回は...  │ >    │
│  │ 2024/01/08 前回より乾燥が改善...     │ >     │
│  └────────────────────────────────────┘        │
│  [すべて見る]                                    │
│                                                  │
│  📷 最近の写真                                   │
│  [📷][📷][📷][📷][📷]                           │
│  [すべて見る]                                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

### コンポーネント設計

```typescript
// packages/customer/src/components/customer-detail-view.tsx

function CustomerDetailView({ customer, stats, ... }: CustomerDetailProps) {
  return (
    <div className="container mx-auto p-4">
      {/* ヘッダー */}
      <CustomerHeader customer={customer} />

      {/* アクションバー */}
      <CustomerActions customer={customer} />

      {/* アラート（アレルギー等） */}
      {customer.hasAlerts && (
        <CustomerAlerts customer={customer} />
      )}

      {/* 統計情報 + 基本情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <CustomerStats stats={stats} />
        <CustomerBasicInfo customer={customer} className="md:col-span-2" />
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">来店履歴</TabsTrigger>
          <TabsTrigger value="records">カルテ</TabsTrigger>
          <TabsTrigger value="payments">支払い</TabsTrigger>
          <TabsTrigger value="photos">写真</TabsTrigger>
          <TabsTrigger value="notes">メモ</TabsTrigger>
        </TabsList>

        <TabsContent value="visits">
          <RecentVisits visits={recentVisits} customerId={customer.id} />
        </TabsContent>

        <TabsContent value="records">
          <RecentRecords records={recentRecords} customerId={customer.id} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentSummary summary={paymentSummary} customerId={customer.id} />
        </TabsContent>

        <TabsContent value="photos">
          <RecentPhotos photos={recentPhotos} customerId={customer.id} />
        </TabsContent>

        <TabsContent value="notes">
          <RecentNotes notes={recentNotes} customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 統計情報カード
function CustomerStats({ stats }: { stats: CustomerStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>統計情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">来店回数</span>
          <span className="font-bold">{stats.totalVisits}回</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">累計利用額</span>
          <span className="font-bold">¥{stats.totalSpent.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">平均単価</span>
          <span className="font-bold">¥{stats.averageSpent.toLocaleString()}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-muted-foreground">最終来店</span>
          <span>
            {stats.lastVisit ? (
              <>
                {formatDate(stats.lastVisit)}
                <span className="text-xs text-muted-foreground ml-1">
                  ({stats.daysSinceLastVisit}日前)
                </span>
              </>
            ) : (
              '未来店'
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">会員歴</span>
          <span>{formatDate(stats.memberSince)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// アラート表示
function CustomerAlerts({ customer }: { customer: Customer }) {
  const alerts = [];

  if (customer.allergies?.length > 0) {
    alerts.push({
      type: 'danger',
      icon: '⚠️',
      message: `アレルギー: ${customer.allergies.join(', ')}`
    });
  }

  if (customer.medicalHistory?.length > 0) {
    alerts.push({
      type: 'warning',
      icon: '💊',
      message: `既往歴: ${customer.medicalHistory.join(', ')}`
    });
  }

  if (customer.notes) {
    alerts.push({
      type: 'info',
      icon: '📝',
      message: customer.notes
    });
  }

  return (
    <div className="space-y-2 my-4">
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={alert.type === 'danger' ? 'destructive' : 'default'}
        >
          <span className="mr-2">{alert.icon}</span>
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}
```

### データ取得の最適化

```typescript
// キャッシング戦略
async function getCustomer(customerId: string) {
  'use cache: remote';
  cacheLife('minutes');
  cacheTag('customer', `customer-${customerId}`);

  return await db.customers.findUnique({
    where: { id: customerId, deletedAt: null }
  });
}

async function getCustomerStats(customerId: string) {
  'use cache: remote';
  cacheLife('minutes');
  cacheTag(`customer-${customerId}-stats`);

  const [visits, payments] = await Promise.all([
    db.visits.aggregate({
      where: { customerId, deletedAt: null },
      _count: true,
      _min: { date: true },
      _max: { date: true },
    }),
    db.payments.aggregate({
      where: { customerId, deletedAt: null },
      _sum: { amount: true },
      _avg: { amount: true },
    })
  ]);

  return {
    totalVisits: visits._count,
    totalSpent: payments._sum.amount || 0,
    averageSpent: payments._avg.amount || 0,
    lastVisit: visits._max.date,
    memberSince: visits._min.date,
    daysSinceLastVisit: visits._max.date
      ? differenceInDays(new Date(), visits._max.date)
      : null,
  };
}

// N+1問題の回避
async function getRecentVisits(customerId: string, limit: number) {
  return await db.visits.findMany({
    where: { customerId, deletedAt: null },
    include: {
      staff: {
        select: { id: true, name: true }
      },
      services: {
        select: { id: true, name: true }
      }
    },
    orderBy: { date: 'desc' },
    take: limit
  });
}
```

### セキュリティとアクセス制御

```typescript
// 個人情報の表示権限制御
async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // 基本的な閲覧権限
  if (!hasPermission(session.user, 'customer:read')) {
    return <Forbidden />;
  }

  const customer = await getCustomer(params.id);

  // 詳細情報の権限
  const canViewFullDetails = hasPermission(session.user, 'customer:read:full');
  const canViewPayments = hasPermission(session.user, 'customer:read:payments');
  const canViewRecords = hasPermission(session.user, 'customer:read:records');

  return (
    <CustomerDetailView
      customer={customer}
      permissions={{
        fullDetails: canViewFullDetails,
        payments: canViewPayments,
        records: canViewRecords,
      }}
    />
  );
}

// データマスキング
function maskCustomerData(customer: Customer, permissions: Permissions): Customer {
  if (permissions.fullDetails) {
    return customer;
  }

  return {
    ...customer,
    phoneNumber: maskPhone(customer.phoneNumber),
    email: maskEmail(customer.email),
    address1: '***',
    address2: '***',
    dateOfBirth: null,
  };
}
```

### パフォーマンス最適化

```typescript
// 1. Streaming SSR で段階的に表示
async function CustomerDetailPage({ params }: { params: { id: string } }) {
  // 基本情報は即座に表示
  const customer = await getCustomer(params.id);

  return (
    <div>
      <CustomerHeader customer={customer} />

      {/* 統計情報は Suspense でストリーミング */}
      <Suspense fallback={<CustomerStatsSkeleton />}>
        <CustomerStatsContainer customerId={customer.id} />
      </Suspense>

      {/* タブコンテンツは遅延ロード */}
      <Suspense fallback={<TabsSkeleton />}>
        <CustomerTabsContainer customerId={customer.id} />
      </Suspense>
    </div>
  );
}

// 2. プリフェッチ
function CustomerSearchResultCard({ customer }: { customer: Customer }) {
  return (
    <Link
      href={`/customers/${customer.id}`}
      prefetch={true} // ホバー時にプリフェッチ
    >
      <Card>
        {customer.name}
      </Card>
    </Link>
  );
}

// 3. 画像の最適化
import Image from 'next/image';

function CustomerPhoto({ photo }: { photo: Photo }) {
  return (
    <Image
      src={photo.url}
      alt={photo.description}
      width={200}
      height={200}
      loading="lazy"
      placeholder="blur"
      blurDataURL={photo.blurDataURL}
    />
  );
}
```

### テスト方針

```typescript
// E2Eテスト
describe('顧客詳細表示', () => {
  test('すべての情報が正しく表示される', async ({ page }) => {
    await page.goto('/customers/test-customer-id');

    // ヘッダー
    await expect(page.locator('h1')).toContainText('山田 太郎');

    // 統計情報
    await expect(page.locator('[data-testid="total-visits"]')).toContainText('24回');
    await expect(page.locator('[data-testid="total-spent"]')).toContainText('¥480,000');

    // タブ
    await page.click('[data-testid="tab-visits"]');
    await expect(page.locator('[data-testid="visit-list"]')).toBeVisible();

    await page.click('[data-testid="tab-records"]');
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test('権限がない情報はマスキングされる', async ({ page }) => {
    // 限定権限ユーザーでログイン
    await loginAsLimitedUser(page);

    await page.goto('/customers/test-customer-id');

    // 電話番号がマスキングされている
    await expect(page.locator('[data-testid="phone"]')).toContainText('090-****-5678');

    // 住所が表示されない
    await expect(page.locator('[data-testid="address"]')).toContainText('***');
  });

  test('Streaming SSRで段階的に表示される', async ({ page }) => {
    await page.goto('/customers/test-customer-id');

    // 即座にヘッダーが表示される
    await expect(page.locator('h1')).toBeVisible({ timeout: 1000 });

    // スケルトンが表示される
    await expect(page.locator('[data-testid="stats-skeleton"]')).toBeVisible();

    // 統計情報が読み込まれる
    await expect(page.locator('[data-testid="total-visits"]')).toBeVisible({ timeout: 3000 });
  });
});
```

## まとめ

顧客詳細表示は、顧客情報へのアクセスポイントとして最も重要な機能です。

### 重要ポイント
1. **情報の一元化**: 必要な情報をすべて一画面に集約
2. **パフォーマンス**: Streaming SSRで高速表示
3. **セキュリティ**: 権限に応じた情報のマスキング
4. **UX**: 直感的なレイアウトと操作性

### 成功指標
- 初期表示: 1秒以内
- フルレンダリング: 3秒以内
- ユーザー満足度: 4.5/5.0以上
