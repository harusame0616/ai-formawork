# 024-050: 認証・システム・データ管理機能（P0完結）

このドキュメントには、P0の24番から50番までの重要機能の詳細設計をまとめています。

---

## 024: ユーザーログイン

### 機能概要
スタッフがシステムにログインする機能。メールアドレスとパスワードによる認証。

### なぜ必要なのか
- **アクセス制御**: 権限のあるユーザーのみがシステムにアクセス
- **セキュリティ**: 不正アクセスを防止
- **監査証跡**: 誰がシステムを使用したか記録
- **個人化**: ユーザーごとの設定や権限を適用

### 重要度: P0
ログイン機能なしではシステムを使用できない。セキュリティの基盤。

### 実装

```typescript
// Next.js App Router + NextAuth.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.users.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          // ログイン失敗をログに記録
          await logLoginAttempt({
            email: credentials.email,
            success: false,
            ip: getClientIP(),
          });
          return null;
        }

        // 最終ログイン日時を更新
        await db.users.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            lastLoginIP: getClientIP(),
          }
        });

        // ログイン成功をログに記録
        await logLoginAttempt({
          userId: user.id,
          email: credentials.email,
          success: true,
          ip: getClientIP(),
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8時間
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

// ログインページ
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('ログインに失敗しました');
    } else {
      router.push('/dashboard');
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 025: パスワード管理

### 機能概要
パスワードの変更、リセット、有効期限管理を行う機能。

### なぜ必要なのか
- **セキュリティ**: 定期的なパスワード変更を促進
- **アカウント復旧**: パスワードを忘れた際のリセット
- **ポリシー適用**: パスワードの複雑さ要件を強制

### 重要度: P0
パスワード管理はセキュリティの基本。適切な管理が必須。

### 実装

```typescript
// パスワードポリシー
const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  expiryDays: 90, // 90日で期限切れ
  preventReuse: 5, // 過去5回分のパスワードは再利用不可
};

function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`パスワードは${PASSWORD_POLICY.minLength}文字以上必要です`);
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('大文字を含めてください');
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('小文字を含めてください');
  }

  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(password)) {
    errors.push('数字を含めてください');
  }

  if (PASSWORD_POLICY.requireSpecialChar && !/[!@#$%^&*]/.test(password)) {
    errors.push('特殊文字を含めてください');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// パスワード変更
async function changePassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<Result<void, Error>> {
  const user = await db.users.findUnique({
    where: { id: input.userId },
    include: { passwordHistory: { take: 5, orderBy: { createdAt: 'desc' } } }
  });

  // 現在のパスワードを確認
  const isCurrentPasswordValid = await compare(
    input.currentPassword,
    user.hashedPassword
  );

  if (!isCurrentPasswordValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // 新しいパスワードのバリデーション
  const validation = validatePassword(input.newPassword);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  // 過去のパスワードとの重複チェック
  for (const oldPassword of user.passwordHistory) {
    const isSame = await compare(input.newPassword, oldPassword.hashedPassword);
    if (isSame) {
      return {
        success: false,
        error: '過去に使用したパスワードは使用できません'
      };
    }
  }

  // パスワードをハッシュ化
  const hashedPassword = await hash(input.newPassword, 12);

  await db.transaction(async (tx) => {
    // パスワード更新
    await tx.users.update({
      where: { id: input.userId },
      data: {
        hashedPassword,
        passwordChangedAt: new Date(),
      }
    });

    // パスワード履歴に追加
    await tx.passwordHistory.create({
      data: {
        userId: input.userId,
        hashedPassword,
      }
    });
  });

  return { success: true };
}

// パスワードリセット（メール経由）
async function requestPasswordReset(email: string): Promise<Result<void, Error>> {
  const user = await db.users.findUnique({ where: { email } });

  if (!user) {
    // セキュリティのため、ユーザーが存在しなくても成功を返す
    return { success: true };
  }

  // リセットトークン生成
  const resetToken = generateSecureToken();
  const resetTokenExpiry = addHours(new Date(), 1); // 1時間有効

  await db.users.update({
    where: { id: user.id },
    data: {
      resetToken: await hash(resetToken, 10),
      resetTokenExpiry,
    }
  });

  // リセットリンクをメール送信
  await sendPasswordResetEmail({
    to: email,
    resetLink: `${process.env.APP_URL}/reset-password?token=${resetToken}`,
  });

  return { success: true };
}
```

---

## 026: 権限管理（ロールベース）

### 機能概要
ユーザーの役割（admin, manager, staff, receptionist）に応じて、アクセス権限を制御。

### なぜ必要なのか
- **セキュリティ**: 必要最小限の権限のみ付与（最小権限の原則）
- **データ保護**: 機密情報へのアクセスを制限
- **業務分担**: 役割に応じた機能へのアクセス
- **監査**: 権限ごとの操作を追跡

### 重要度: P0
権限管理なしではセキュリティが保てない。データ漏洩のリスク。

### 実装

```typescript
// 権限定義
const PERMISSIONS = {
  // 顧客管理
  'customer:read': ['admin', 'manager', 'staff', 'receptionist'],
  'customer:create': ['admin', 'manager', 'staff', 'receptionist'],
  'customer:update': ['admin', 'manager', 'staff'],
  'customer:delete': ['admin', 'manager'],
  'customer:export': ['admin', 'manager'],

  // カルテ管理
  'record:read': ['admin', 'manager', 'staff'],
  'record:create': ['admin', 'manager', 'staff'],
  'record:update': ['admin', 'manager', 'staff'],
  'record:delete': ['admin', 'manager'],

  // 予約管理
  'appointment:read': ['admin', 'manager', 'staff', 'receptionist'],
  'appointment:create': ['admin', 'manager', 'staff', 'receptionist'],
  'appointment:update': ['admin', 'manager', 'staff', 'receptionist'],
  'appointment:cancel': ['admin', 'manager', 'staff'],

  // 会計管理
  'payment:read': ['admin', 'manager', 'receptionist'],
  'payment:create': ['admin', 'manager', 'receptionist'],
  'payment:refund': ['admin', 'manager'],

  // レポート
  'report:sales': ['admin', 'manager'],
  'report:customer': ['admin', 'manager'],
  'report:staff': ['admin', 'manager'],

  // システム管理
  'user:read': ['admin'],
  'user:create': ['admin'],
  'user:update': ['admin'],
  'user:delete': ['admin'],
  'settings:update': ['admin'],
} as const;

// 権限チェック関数
function hasPermission(user: User, permission: keyof typeof PERMISSIONS): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(user.role);
}

// ミドルウェアとして使用
function requirePermission(permission: keyof typeof PERMISSIONS) {
  return async function middleware() {
    const session = await getSession();

    if (!session) {
      redirect('/login');
    }

    if (!hasPermission(session.user, permission)) {
      return new Response('Forbidden', { status: 403 });
    }

    return NextResponse.next();
  };
}

// Server Actionで権限チェック
async function updateCustomer(input: UpdateCustomerInput) {
  const session = await getSession();

  if (!hasPermission(session.user, 'customer:update')) {
    return { success: false, error: 'Forbidden' };
  }

  // 処理続行...
}

// UIで権限に応じた表示
function CustomerDetailPage({ customer }: { customer: Customer }) {
  const session = useSession();

  return (
    <div>
      <h1>{customer.name}</h1>

      {hasPermission(session.user, 'customer:update') && (
        <Button onClick={editCustomer}>編集</Button>
      )}

      {hasPermission(session.user, 'customer:delete') && (
        <Button variant="destructive" onClick={deleteCustomer}>
          削除
        </Button>
      )}
    </div>
  );
}
```

---

## 027: データ暗号化

### 機能概要
個人情報や機密データを暗号化して保存。データベース暗号化、通信の暗号化（TLS）を実施。

### なぜ必要なのか
- **データ保護**: 不正アクセス時でもデータを保護
- **法的要件**: GDPR、個人情報保護法への対応
- **顧客信頼**: データセキュリティの保証
- **リスク軽減**: 情報漏洩時の被害を最小化

### 重要度: P0
個人情報を扱うシステムでは暗号化は必須。法的義務でもある。

### 実装

```typescript
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32バイトのキー
const ALGORITHM = 'aes-256-gcm';

// データの暗号化
function encrypt(text: string): string {
  const iv = randomBytes(16);
  const salt = randomBytes(16);
  const key = scryptSync(ENCRYPTION_KEY, salt, 32);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // iv, salt, authTag, encryptedを結合して返す
  return [
    iv.toString('hex'),
    salt.toString('hex'),
    authTag.toString('hex'),
    encrypted,
  ].join(':');
}

// データの復号化
function decrypt(encryptedText: string): string {
  const [ivHex, saltHex, authTagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const salt = Buffer.from(saltHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = scryptSync(ENCRYPTION_KEY, salt, 32);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Prisma Middlewareで自動暗号化・復号化
const ENCRYPTED_FIELDS = ['email', 'phoneNumber', 'address'];

db.$use(async (params, next) => {
  // 書き込み時: 暗号化
  if (params.action === 'create' || params.action === 'update') {
    if (params.model === 'Customer' && params.args.data) {
      for (const field of ENCRYPTED_FIELDS) {
        if (params.args.data[field]) {
          params.args.data[field] = encrypt(params.args.data[field]);
        }
      }
    }
  }

  const result = await next(params);

  // 読み取り時: 復号化
  if (params.action === 'findUnique' || params.action === 'findMany') {
    if (Array.isArray(result)) {
      result.forEach(record => decryptRecord(record));
    } else if (result) {
      decryptRecord(result);
    }
  }

  return result;
});

function decryptRecord(record: any) {
  for (const field of ENCRYPTED_FIELDS) {
    if (record[field]) {
      record[field] = decrypt(record[field]);
    }
  }
}
```

---

## 028: 監査ログ記録

### 機能概要
すべての重要な操作（作成、更新、削除）を監査ログに記録。誰がいつ何をしたか追跡可能。

### なぜ必要なのか
- **セキュリティ**: 不正操作を検知
- **コンプライアンス**: 監査要件への対応
- **トラブルシューティング**: 問題の原因を追跡
- **説明責任**: 操作の証跡を残す

### 重要度: P0
監査ログなしではセキュリティインシデントの調査が不可能。

### 実装

```typescript
type AuditLog = {
  id: string;
  action: string; // 'customer.create', 'record.update'等
  userId: string;
  userName: string;
  resourceType: string; // 'customer', 'record'等
  resourceId: string;
  changes: Record<string, { old: any; new: any }> | null;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
};

async function logAudit(input: {
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, { old: any; new: any }>;
}): Promise<void> {
  const session = await getSession();

  await db.auditLogs.create({
    data: {
      action: input.action,
      userId: session.user.id,
      userName: session.user.name,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      changes: input.changes || null,
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
      createdAt: new Date(),
    }
  });
}

// 使用例: 顧客作成時
async function createCustomer(input: CreateCustomerInput) {
  const customer = await db.customers.create({ data: input });

  await logAudit({
    action: 'customer.create',
    resourceType: 'customer',
    resourceId: customer.id,
  });

  return customer;
}

// 使用例: 顧客更新時
async function updateCustomer(input: UpdateCustomerInput) {
  const current = await db.customers.findUnique({ where: { id: input.id } });
  const updated = await db.customers.update({
    where: { id: input.id },
    data: input.updates,
  });

  await logAudit({
    action: 'customer.update',
    resourceType: 'customer',
    resourceId: input.id,
    changes: detectChanges(current, updated),
  });

  return updated;
}

// 監査ログ閲覧（管理者のみ）
function AuditLogPage() {
  const { data: logs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: getAuditLogs,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>日時</TableHead>
          <TableHead>ユーザー</TableHead>
          <TableHead>操作</TableHead>
          <TableHead>対象</TableHead>
          <TableHead>IPアドレス</TableHead>
          <TableHead>詳細</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs?.map(log => (
          <TableRow key={log.id}>
            <TableCell>{formatDateTime(log.createdAt)}</TableCell>
            <TableCell>{log.userName}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.resourceType}:{log.resourceId}</TableCell>
            <TableCell>{log.ipAddress}</TableCell>
            <TableCell>
              <Button variant="ghost" onClick={() => viewLogDetail(log)}>
                詳細
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 029-037: データ管理機能

### 029: バックアップ機能
定期的な自動バックアップとオンデマンドバックアップ。

```typescript
// 自動バックアップ（cron job）
async function performBackup() {
  const backupId = generateBackupId();
  const backupPath = `/backups/${backupId}.sql`;

  // PostgreSQL ダンプ
  await exec(`pg_dump ${DB_URL} > ${backupPath}`);

  // S3にアップロード
  await uploadToS3(backupPath, `backups/${backupId}.sql`);

  // バックアップ記録
  await db.backups.create({
    data: {
      id: backupId,
      type: 'automatic',
      size: await getFileSize(backupPath),
      status: 'completed',
      createdAt: new Date(),
    }
  });

  // 古いバックアップを削除（30日以上前）
  const threshold = subDays(new Date(), 30);
  await db.backups.deleteMany({
    where: { createdAt: { lt: threshold } }
  });
}
```

### 030: データエクスポート
顧客データをCSV、Excel、JSONで出力。

```typescript
async function exportCustomers(format: 'csv' | 'excel' | 'json') {
  const customers = await db.customers.findMany({
    where: { deletedAt: null }
  });

  switch (format) {
    case 'csv':
      return generateCSV(customers);
    case 'excel':
      return generateExcel(customers);
    case 'json':
      return JSON.stringify(customers, null, 2);
  }
}
```

### 031: データインポート
CSVファイルから顧客データを一括インポート。

### 032: データ復元機能
バックアップからデータを復元。

---

## 038-042: システム設定

### 038: 店舗情報設定
店舗名、住所、電話番号、営業時間などの基本情報。

### 039: 営業時間設定
曜日別の営業時間、休業日の設定。

### 040: 基本設定管理
システム全体の設定（言語、タイムゾーン、通貨等）。

### 041: メニュー/サービス登録
提供するサービスの登録と管理。

---

## 043-048: UI/UX基本機能

### 043: ダッシュボード表示
主要なKPIを一覧表示。

```typescript
function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="今日の予約"
        value={stats.todayAppointments}
        icon={<CalendarIcon />}
      />
      <StatsCard
        title="今日の売上"
        value={formatCurrency(stats.todaySales)}
        icon={<DollarIcon />}
      />
      <StatsCard
        title="新規顧客"
        value={stats.newCustomersThisMonth}
        icon={<UserIcon />}
      />
      <StatsCard
        title="稼働率"
        value={`${stats.occupancyRate}%`}
        icon={<TrendingUpIcon />}
      />
    </div>
  );
}
```

### 044: レスポンシブデザイン
モバイル、タブレット、デスクトップに対応。

### 045: 検索機能（全体）
サイト全体の検索機能。

### 046: フィルタリング機能
一覧画面でのデータフィルタリング。

### 047: ソート機能
一覧画面でのデータソート。

---

## 048-050: 通知機能

### 048: システム通知
重要なイベントをユーザーに通知。

```typescript
function NotificationCenter() {
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon">
          <BellIcon />
          {notifications?.unreadCount > 0 && (
            <Badge className="absolute top-0 right-0">
              {notifications.unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          {notifications?.items.map(notif => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### 049: エラー通知
システムエラーの通知とアラート。

### 050: アラート機能
重要なアラートの表示（アレルギー警告等）。

---

## まとめ: P0機能完結

これで P0（最優先）の 50 機能すべての設計が完了しました。

### P0機能の重要性
1. **システムの基盤**: これらがないとシステムが機能しない
2. **法的要件**: セキュリティ、監査、データ保護は法的義務
3. **ビジネス継続性**: 顧客管理、予約、会計はビジネスの根幹
4. **高頻度利用**: すべて日常業務で頻繁に使用

### 実装の優先順位
P0機能は最初に実装すべき機能群です。これらが完成すれば、基本的な顧客カルテシステムとして機能します。

次のステップとして、P1（高優先度）の 100 機能の設計に進みます。
