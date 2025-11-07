# 006: 顧客ステータス管理（アクティブ/非アクティブ）

## 機能概要

顧客のステータス（active/inactive/suspended）を管理する機能。来店状況や利用状況に応じてステータスを変更し、マーケティング施策や業務フローを最適化する。

## なぜ必要なのか

### ビジネス上の必要性
- **顧客セグメンテーション**: アクティブ顧客と休眠顧客を区別
- **マーケティング効率化**: アクティブ顧客のみに施策を実施してコスト削減
- **業務の最適化**: 非アクティブ顧客を検索結果から除外し、効率向上
- **顧客理解**: 顧客のライフサイクルステージを把握

### システム上の必要性
- **データのフィルタリング**: ステータスで顧客を絞り込み
- **自動化の基盤**: ステータスに応じた自動処理
- **レポーティング**: アクティブ率などのKPI算出

## どのようなときに役立つのか

### 日常業務での活用

1. **休眠顧客の特定**
   ```
   6ヶ月以上来店のない顧客を自動的にinactiveに
   → 休眠顧客掘り起こし施策の対象に
   ```

2. **問題顧客の管理**
   ```
   支払いトラブルのあった顧客をsuspendedに
   → 予約受付時に警告表示
   ```

3. **検索の効率化**
   ```
   デフォルトでactive顧客のみ表示
   → 現役顧客の検索が高速化
   ```

4. **再来店時の自動復帰**
   ```
   inactive顧客が予約/来店
   → 自動的にactiveに変更
   ```

## 重要度評価

### 優先度: P0 (Critical)

### 理由
1. **顧客管理の基本**: ステータスなしでは顧客の状態管理が不可能
2. **高頻度利用**: 検索時に毎回使用されるフィルター条件
3. **マーケティング必須**: セグメンテーションの基礎
4. **自動化の前提**: ステータスベースの自動処理に必要

## 基本設計

### データ構造

```typescript
type CustomerStatus = 'active' | 'inactive' | 'suspended';

type Customer = {
  status: CustomerStatus;
  statusChangedAt: Date; // ステータス変更日時
  statusChangedBy: string | null; // 変更者
  statusReason: string | null; // 変更理由
};

type CustomerStatusLog = {
  id: string;
  customerId: string;
  fromStatus: CustomerStatus;
  toStatus: CustomerStatus;
  changedAt: Date;
  changedBy: string;
  reason: string;
  automatic: boolean; // 自動変更かどうか
};
```

### API仕様

```typescript
async function updateCustomerStatus(input: {
  customerId: string;
  status: CustomerStatus;
  reason: string;
}): Promise<Result<Customer, Error>> {
  const session = await getSession();

  if (!hasPermission(session.user, 'customer:update:status')) {
    return { success: false, error: 'Forbidden' };
  }

  const customer = await db.customers.findUnique({
    where: { id: input.customerId }
  });

  if (!customer) {
    return { success: false, error: 'Customer not found' };
  }

  await db.transaction(async (tx) => {
    // ステータス変更ログ
    await tx.customerStatusLogs.create({
      data: {
        customerId: input.customerId,
        fromStatus: customer.status,
        toStatus: input.status,
        changedBy: session.user.id,
        changedAt: new Date(),
        reason: input.reason,
        automatic: false,
      }
    });

    // 顧客ステータス更新
    await tx.customers.update({
      where: { id: input.customerId },
      data: {
        status: input.status,
        statusChangedAt: new Date(),
        statusChangedBy: session.user.id,
        statusReason: input.reason,
      }
    });
  });

  revalidateTag(`customer-${input.customerId}`);

  return { success: true, data: updatedCustomer };
}

// 自動ステータス更新（バッチ処理）
async function autoUpdateInactiveCustomers() {
  const sixMonthsAgo = subMonths(new Date(), 6);

  const inactiveCustomers = await db.customers.findMany({
    where: {
      status: 'active',
      deletedAt: null,
      lastVisit: {
        lt: sixMonthsAgo
      }
    }
  });

  for (const customer of inactiveCustomers) {
    await updateCustomerStatus({
      customerId: customer.id,
      status: 'inactive',
      reason: '6ヶ月以上未来店のため自動的に非アクティブ化',
    });
  }

  return inactiveCustomers.length;
}
```

### UI/UX設計

```typescript
function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const config = {
    active: { label: 'アクティブ', color: 'green' },
    inactive: { label: '休眠', color: 'gray' },
    suspended: { label: '停止', color: 'red' },
  };

  const { label, color } = config[status];

  return (
    <Badge variant={color}>
      {label}
    </Badge>
  );
}

function ChangeStatusDialog({ customer }: { customer: Customer }) {
  const [newStatus, setNewStatus] = useState(customer.status);
  const [reason, setReason] = useState('');

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ステータス変更</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>現在のステータス</Label>
            <CustomerStatusBadge status={customer.status} />
          </div>

          <div>
            <Label>新しいステータス</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectItem value="active">アクティブ</SelectItem>
              <SelectItem value="inactive">休眠</SelectItem>
              <SelectItem value="suspended">停止</SelectItem>
            </Select>
          </div>

          <div>
            <Label>変更理由</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ステータスを変更する理由を入力"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => updateCustomerStatus({
            customerId: customer.id,
            status: newStatus,
            reason,
          })}>
            変更
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## まとめ

顧客ステータス管理は、効率的な顧客管理とマーケティングの基盤となる重要な機能です。

### 成功指標
- 自動ステータス更新: 毎日実行
- ステータス変更の記録率: 100%
- inactive顧客の掘り起こし率: 20%以上
