# 002: 顧客検索（名前・電話番号・ID）

## 機能概要

顧客データベースから、名前・電話番号・顧客IDなどの検索キーワードを使って顧客を素早く検索する機能。部分一致、あいまい検索に対応し、大量の顧客データからでも瞬時に目的の顧客を見つけ出せる。

## なぜ必要なのか

### ビジネス上の必要性
- **業務効率化**: 受付時に顧客を素早く特定し、待ち時間を削減
- **顧客体験向上**: スムーズな対応により、顧客満足度が向上
- **正確な顧客管理**: 同姓同名や類似した顧客を区別して正しく特定
- **オペレーションコスト削減**: 手作業での顧客探しの時間を大幅に削減

### システム上の必要性
- **データアクセスの起点**: 顧客情報へのアクセスは検索から始まる
- **パフォーマンス要求**: 数万〜数十万件の顧客データから高速に検索
- **データ整合性**: 正確な顧客を特定することで誤った顧客への操作を防ぐ

## どのようなときに役立つのか

### 日常業務での活用

1. **受付・来店対応**
   - 来店した顧客を名前で検索し、カルテを開く
   - 予約時に電話番号から顧客を特定
   - 新規か既存顧客かの判別

2. **電話対応**
   - 電話番号（発信者番号）から即座に顧客を特定
   - 名前の聞き取りが不明瞭でも部分一致で検索
   - 過去の来店履歴を確認しながら対応

3. **予約管理**
   - 予約変更時に顧客を素早く検索
   - 同姓同名の顧客を電話番号で区別
   - 家族や関連顧客をまとめて検索

4. **会計・請求**
   - 未収金の顧客を検索
   - 領収書の再発行時に顧客を特定
   - 顧客番号から顧客情報を取得

5. **マーケティング**
   - 特定条件に合う顧客をフィルタリング
   - セグメント作成のための顧客抽出
   - キャンペーン対象者の検索

### 具体的なシナリオ

**シナリオ1: 受付での来店対応**
```
顧客: 「山田です」
スタッフ: [検索ボックスに「やまだ」と入力]
システム: 山田さん10名をリストアップ
スタッフ: 「お名前は太郎様でしょうか?」
顧客: 「はい」
スタッフ: [該当顧客を選択] → カルテ表示
```

**シナリオ2: 電話予約での顧客特定**
```
顧客: 「予約したいのですが」
スタッフ: 「お電話番号をお伺いしてもよろしいですか?」
顧客: 「090-1234-5678です」
スタッフ: [電話番号で検索]
システム: 佐藤花子さんを表示
スタッフ: 「佐藤花子様ですね、前回は...」
```

**シナリオ3: 名前が聞き取りづらい場合**
```
顧客: 「タカ...です」（声が小さい）
スタッフ: [「たか」で部分検索]
システム: 高橋、田中、田川、高山など候補を表示
スタッフ: リストから顧客を視覚的に特定
```

**シナリオ4: 顧客番号での検索**
```
顧客: 「会員番号C202401010042です」
スタッフ: [顧客番号で検索]
システム: 該当顧客を即座に表示
→ 電話対応でも正確に特定可能
```

## 重要度評価

### 優先度: P0 (Critical - 最優先)

### 理由

1. **使用頻度が極めて高い**
   - 1日に数十〜数百回使用される機能
   - すべてのスタッフが毎日使用
   - システムで最も頻繁に実行される操作

2. **業務の起点となる機能**
   - 顧客情報へのアクセスは必ず検索から始まる
   - カルテ、予約、会計などすべての機能の前提
   - この機能が遅いとすべての業務が遅延

3. **顧客体験への直接的影響**
   - 検索が遅い → 待ち時間増加 → 顧客満足度低下
   - 検索が的確 → スムーズな対応 → 良い印象
   - 検索ミス → 誤った顧客へのサービス → 重大なトラブル

4. **スケーラビリティの要**
   - 顧客数が増えても性能を維持する必要
   - 10件でも10万件でも同じ速度で検索
   - パフォーマンスがビジネスの成長を左右

5. **技術的な重要性**
   - 全文検索、インデックス設計の腕の見せ所
   - データベースパフォーマンスの要
   - キャッシング戦略が重要

## 基本設計

### システム構成

```
┌────────────────────┐
│   検索UI           │
│  ・入力ボックス     │
│  ・サジェスト       │
│  ・フィルター       │
└──────┬─────────────┘
       │
       ↓ リアルタイム検索
┌────────────────────┐
│  検索API           │
│ (Server Action)    │
└──────┬─────────────┘
       │
       ├─→ [キャッシュ層]
       │    Redis/Memory
       │
       ↓ クエリ最適化
┌────────────────────┐
│  PostgreSQL        │
│  ・全文検索        │
│  ・インデックス    │
│  ・トライグラム    │
└────────────────────┘
```

### データ構造

#### 検索クエリ型

```typescript
type SearchQuery = {
  // 検索キーワード
  keyword: string;

  // 検索対象フィールド
  fields?: ('name' | 'phone' | 'email' | 'id')[];

  // フィルター条件
  filters?: {
    status?: ('active' | 'inactive')[];
    gender?: ('male' | 'female' | 'other')[];
    tags?: string[];
    ageRange?: { min?: number; max?: number };
    lastVisit?: { from?: Date; to?: Date };
  };

  // ソート順
  sort?: {
    field: 'name' | 'lastVisit' | 'createdAt' | 'relevance';
    order: 'asc' | 'desc';
  };

  // ページネーション
  pagination?: {
    page: number;
    limit: number;
  };

  // 検索モード
  mode?: 'exact' | 'partial' | 'fuzzy';
};

type SearchResult = {
  customers: Customer[];
  total: number;
  took: number; // 検索時間（ミリ秒）
  hasMore: boolean;
  suggestions?: string[]; // サジェスト
};
```

#### 検索インデックス

```sql
-- 全文検索インデックス（PostgreSQL）
CREATE INDEX idx_customers_fulltext ON customers
USING gin(
  to_tsvector(
    'japanese',
    coalesce(last_name, '') || ' ' ||
    coalesce(first_name, '') || ' ' ||
    coalesce(last_name_kana, '') || ' ' ||
    coalesce(first_name_kana, '')
  )
);

-- トライグラムインデックス（あいまい検索用）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_customers_trgm_name ON customers
USING gin(
  (last_name || first_name) gin_trgm_ops
);

CREATE INDEX idx_customers_trgm_kana ON customers
USING gin(
  (last_name_kana || first_name_kana) gin_trgm_ops
);

-- 電話番号検索用（正規化した値でインデックス）
CREATE INDEX idx_customers_phone_normalized ON customers (
  regexp_replace(phone_number, '[^0-9]', '', 'g')
);

CREATE INDEX idx_customers_mobile_normalized ON customers (
  regexp_replace(mobile_number, '[^0-9]', '', 'g')
);

-- 複合インデックス（ステータスと作成日）
CREATE INDEX idx_customers_status_created ON customers (
  status, created_at DESC
) WHERE deleted_at IS NULL;
```

### 処理フロー

```typescript
async function searchCustomers(query: SearchQuery): Promise<SearchResult> {
  const startTime = performance.now();

  // 1. 入力値の正規化
  const normalizedKeyword = normalizeSearchKeyword(query.keyword);

  // 2. キャッシュチェック
  const cacheKey = generateCacheKey(query);
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // 3. 検索戦略の決定
  const strategy = determineSearchStrategy(normalizedKeyword);

  // 4. データベース検索
  let customers: Customer[];
  switch (strategy) {
    case 'id':
      customers = await searchById(normalizedKeyword);
      break;
    case 'phone':
      customers = await searchByPhone(normalizedKeyword);
      break;
    case 'email':
      customers = await searchByEmail(normalizedKeyword);
      break;
    case 'name':
      customers = await searchByName(normalizedKeyword, query.mode);
      break;
    default:
      customers = await searchAll(normalizedKeyword, query.mode);
  }

  // 5. フィルター適用
  if (query.filters) {
    customers = applyFilters(customers, query.filters);
  }

  // 6. ソート
  if (query.sort) {
    customers = sortCustomers(customers, query.sort);
  }

  // 7. ページネーション
  const { page = 1, limit = 20 } = query.pagination || {};
  const offset = (page - 1) * limit;
  const paginatedCustomers = customers.slice(offset, offset + limit);

  // 8. 結果の構築
  const result: SearchResult = {
    customers: paginatedCustomers,
    total: customers.length,
    took: performance.now() - startTime,
    hasMore: customers.length > offset + limit,
  };

  // 9. キャッシュに保存
  await cache.set(cacheKey, result, { ttl: 300 }); // 5分

  return result;
}
```

## 詳細設計

### API仕様

```typescript
/**
 * 顧客を検索する
 * @param query 検索クエリ
 * @returns 検索結果
 */
async function searchCustomers(
  query: SearchQuery
): Promise<Result<SearchResult, Error>> {
  // 認証チェック
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  // 権限チェック
  if (!hasPermission(session.user, 'customer:read')) {
    return { success: false, error: 'Forbidden' };
  }

  // バリデーション
  if (!query.keyword || query.keyword.trim().length === 0) {
    return { success: false, error: 'Keyword is required' };
  }

  if (query.keyword.length < 2) {
    return { success: false, error: 'Keyword must be at least 2 characters' };
  }

  try {
    const result = await performSearch(query);
    return { success: true, data: result };
  } catch (error) {
    logger.error('Search failed', { error, query });
    return { success: false, error: 'Search failed' };
  }
}
```

### 検索戦略

#### 1. 顧客番号検索（最高優先）

```typescript
async function searchById(keyword: string): Promise<Customer[]> {
  // 完全一致検索
  const customer = await db.customers.findUnique({
    where: { customerNumber: keyword }
  });

  return customer ? [customer] : [];
}
```

#### 2. 電話番号検索

```typescript
async function searchByPhone(keyword: string): Promise<Customer[]> {
  // ハイフンやスペースを除去して正規化
  const normalized = keyword.replace(/[^0-9]/g, '');

  return await db.$queryRaw`
    SELECT *
    FROM customers
    WHERE deleted_at IS NULL
      AND (
        regexp_replace(phone_number, '[^0-9]', '', 'g') LIKE ${normalized + '%'}
        OR regexp_replace(mobile_number, '[^0-9]', '', 'g') LIKE ${normalized + '%'}
      )
    LIMIT 50
  `;
}
```

#### 3. メールアドレス検索

```typescript
async function searchByEmail(keyword: string): Promise<Customer[]> {
  return await db.customers.findMany({
    where: {
      email: {
        contains: keyword,
        mode: 'insensitive'
      },
      deletedAt: null
    },
    take: 50
  });
}
```

#### 4. 名前検索（全文検索）

```typescript
async function searchByName(
  keyword: string,
  mode: 'exact' | 'partial' | 'fuzzy' = 'partial'
): Promise<Customer[]> {
  switch (mode) {
    case 'exact':
      return await exactNameSearch(keyword);

    case 'partial':
      return await partialNameSearch(keyword);

    case 'fuzzy':
      return await fuzzyNameSearch(keyword);
  }
}

// 完全一致
async function exactNameSearch(keyword: string): Promise<Customer[]> {
  return await db.customers.findMany({
    where: {
      OR: [
        { lastName: keyword },
        { firstName: keyword },
        { lastNameKana: keyword },
        { firstNameKana: keyword },
      ],
      deletedAt: null
    },
    take: 50
  });
}

// 部分一致
async function partialNameSearch(keyword: string): Promise<Customer[]> {
  return await db.$queryRaw`
    SELECT *,
      ts_rank(
        to_tsvector('japanese',
          coalesce(last_name, '') || ' ' ||
          coalesce(first_name, '') || ' ' ||
          coalesce(last_name_kana, '') || ' ' ||
          coalesce(first_name_kana, '')
        ),
        plainto_tsquery('japanese', ${keyword})
      ) as rank
    FROM customers
    WHERE deleted_at IS NULL
      AND to_tsvector('japanese',
          coalesce(last_name, '') || ' ' ||
          coalesce(first_name, '') || ' ' ||
          coalesce(last_name_kana, '') || ' ' ||
          coalesce(first_name_kana, '')
        ) @@ plainto_tsquery('japanese', ${keyword})
    ORDER BY rank DESC
    LIMIT 50
  `;
}

// あいまい検索
async function fuzzyNameSearch(keyword: string): Promise<Customer[]> {
  return await db.$queryRaw`
    SELECT *,
      similarity(
        last_name || first_name,
        ${keyword}
      ) +
      similarity(
        last_name_kana || first_name_kana,
        ${keyword}
      ) as similarity_score
    FROM customers
    WHERE deleted_at IS NULL
      AND (
        similarity(last_name || first_name, ${keyword}) > 0.3
        OR similarity(last_name_kana || first_name_kana, ${keyword}) > 0.3
      )
    ORDER BY similarity_score DESC
    LIMIT 50
  `;
}
```

### UI/UX設計

#### コンポーネント構成

```typescript
function CustomerSearch() {
  return (
    <div className="relative">
      <SearchInput />
      <SearchFilters />
      <SearchResults />
      <SearchSuggestions />
    </div>
  );
}

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-3" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="名前、電話番号、顧客番号で検索..."
        className="pl-10"
      />
      {query && (
        <ClearButton onClick={() => setQuery('')} />
      )}
    </div>
  );
}
```

#### 検索結果表示

```typescript
function SearchResults({ results }: { results: SearchResult }) {
  if (results.customers.length === 0) {
    return (
      <EmptyState>
        <p>該当する顧客が見つかりませんでした</p>
        <Button onClick={createNewCustomer}>
          新規顧客として登録
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-2">
      {results.customers.map(customer => (
        <CustomerSearchResultCard
          key={customer.id}
          customer={customer}
          onClick={() => selectCustomer(customer)}
        />
      ))}
      {results.hasMore && (
        <Button variant="ghost" onClick={loadMore}>
          さらに表示
        </Button>
      )}
    </div>
  );
}

function CustomerSearchResultCard({ customer }: { customer: Customer }) {
  return (
    <Card className="p-4 hover:bg-accent cursor-pointer">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold">
            {customer.lastName} {customer.firstName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {customer.lastNameKana} {customer.firstNameKana}
          </p>
        </div>
        <div className="text-right text-sm">
          <p>{customer.phoneNumber}</p>
          <p className="text-muted-foreground">
            {customer.customerNumber}
          </p>
        </div>
      </div>
      {customer.lastVisit && (
        <p className="text-xs text-muted-foreground mt-2">
          最終来店: {formatDate(customer.lastVisit)}
        </p>
      )}
    </Card>
  );
}
```

### パフォーマンス最適化

#### 1. デバウンス

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

#### 2. キャッシング

```typescript
// Redis でのキャッシング
async function getCachedSearch(query: SearchQuery): Promise<SearchResult | null> {
  const cacheKey = `search:${JSON.stringify(query)}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  return null;
}

async function setCachedSearch(
  query: SearchQuery,
  result: SearchResult
): Promise<void> {
  const cacheKey = `search:${JSON.stringify(query)}`;
  await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5分
}
```

#### 3. インクリメンタルローディング

```typescript
function useInfiniteSearch(initialQuery: SearchQuery) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (!hasMore) return;

    const result = await searchCustomers({
      ...initialQuery,
      pagination: { page: page + 1, limit: 20 }
    });

    setCustomers(prev => [...prev, ...result.customers]);
    setPage(page + 1);
    setHasMore(result.hasMore);
  };

  return { customers, loadMore, hasMore };
}
```

### セキュリティ考慮事項

```typescript
// 個人情報のマスキング
function maskSensitiveData(customer: Customer, user: User): Customer {
  // 権限に応じてマスキング
  if (!hasPermission(user, 'customer:read:full')) {
    return {
      ...customer,
      phoneNumber: maskPhone(customer.phoneNumber),
      email: maskEmail(customer.email),
      address1: '***',
      address2: '***',
    };
  }

  return customer;
}

function maskPhone(phone: string): string {
  // 090-1234-5678 → 090-****-5678
  return phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3');
}

function maskEmail(email: string): string {
  // test@example.com → t***@example.com
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}
```

### テスト方針

```typescript
describe('searchCustomers', () => {
  describe('顧客番号検索', () => {
    it('完全一致で検索できる', async () => {
      const result = await searchCustomers({
        keyword: 'C202401010001'
      });

      expect(result.customers).toHaveLength(1);
      expect(result.customers[0].customerNumber).toBe('C202401010001');
    });
  });

  describe('名前検索', () => {
    it('部分一致で検索できる', async () => {
      const result = await searchCustomers({
        keyword: '山田'
      });

      expect(result.customers.length).toBeGreaterThan(0);
      result.customers.forEach(customer => {
        expect(
          customer.lastName.includes('山田') ||
          customer.firstName.includes('山田')
        ).toBe(true);
      });
    });

    it('カタカナで検索できる', async () => {
      const result = await searchCustomers({
        keyword: 'ヤマダ'
      });

      expect(result.customers.length).toBeGreaterThan(0);
    });
  });

  describe('パフォーマンス', () => {
    it('10万件のデータから300ms以内で検索できる', async () => {
      // 10万件のテストデータを投入
      await seedCustomers(100000);

      const start = performance.now();
      const result = await searchCustomers({ keyword: '田中' });
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(300);
      expect(result.took).toBeLessThan(300);
    });
  });
});
```

## まとめ

顧客検索機能は、使用頻度が最も高く、業務効率とユーザー体験に直接影響する重要な機能です。

### 重要ポイント
1. **速度**: 大量データでも300ms以内のレスポンス
2. **精度**: 完全一致、部分一致、あいまい検索の使い分け
3. **使いやすさ**: 直感的なUI、リアルタイムサジェスト
4. **スケーラビリティ**: 10万件以上でも性能劣化なし

### 成功指標
- 検索速度: 300ms以内
- 検索成功率: 95%以上
- ユーザー満足度: 4.5/5.0以上
