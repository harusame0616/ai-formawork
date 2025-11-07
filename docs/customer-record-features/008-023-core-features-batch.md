# 008-023: コア機能詳細（P0バッチ）

このドキュメントには、P0の8番から23番までの重要機能の詳細設計をまとめています。

---

## 008: カルテ記録追加

### 機能概要
既存のカルテに追加の記録やコメントを追加する機能。施術後の経過観察、追加の所見、顧客からのフィードバックなどを時系列で記録。

### なぜ必要なのか
- **経過観察**: 施術後の変化を継続的に記録
- **情報の補完**: 後から気づいた点を追加
- **コミュニケーション**: スタッフ間で情報共有
- **顧客対応**: 顧客からの問い合わせ内容を記録

### 重要度: P0
カルテの更新・補完は日常的に発生し、正確な記録の維持に必須。

### 基本設計

```typescript
type RecordAddition = {
  id: string;
  recordId: string; // 元のカルテID
  addedAt: Date;
  addedBy: string;
  content: string; // 追加内容
  type: 'observation' | 'followup' | 'comment' | 'customer_feedback';
  photoIds?: string[];
};

async function addRecordEntry(input: {
  recordId: string;
  content: string;
  type: RecordAddition['type'];
  photoUrls?: string[];
}): Promise<Result<RecordAddition, Error>> {
  // 権限チェック、バリデーション、DB保存
  // ...実装詳細は省略...
}
```

---

## 009: カルテ履歴表示

### 機能概要
顧客のすべてのカルテを時系列で一覧表示。フィルタリング、ソート、詳細表示への遷移が可能。

### なぜ必要なのか
- **履歴の把握**: 顧客の施術履歴を一目で確認
- **トレンド分析**: 施術の効果や変化を追跡
- **施術計画**: 過去の記録を参照して次の施術を計画
- **顧客コミュニケーション**: 過去の施術内容を顧客と共有

### 重要度: P0
カルテの閲覧は毎日の業務で最も頻繁に行われる操作の一つ。

### UI設計

```typescript
function RecordHistory({ customerId }: { customerId: string }) {
  const { data: records, isLoading } = useQuery({
    queryKey: ['records', customerId],
    queryFn: () => getCustomerRecords(customerId),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2>カルテ履歴</h2>
        <RecordFilters />
      </div>

      <Timeline>
        {records?.map(record => (
          <TimelineItem key={record.id}>
            <TimelineDate>{formatDate(record.recordDate)}</TimelineDate>
            <TimelineContent>
              <Card>
                <CardHeader>
                  <CardTitle>{record.services.join(', ')}</CardTitle>
                  <CardDescription>
                    担当: {record.staff.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{record.observation}</p>
                  {record.hasPhotos && (
                    <Badge>写真あり</Badge>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="link" onClick={() => viewRecord(record.id)}>
                    詳細を見る
                  </Button>
                </CardFooter>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
```

---

## 010: カルテ検索

### 機能概要
カルテの内容を全文検索する機能。症状、施術内容、使用製品などから該当するカルテを検索。

### なぜ必要なのか
- **迅速な情報アクセス**: 特定の症状や施術のカルテを素早く見つける
- **データ分析**: 特定の製品や施術の効果を分析
- **トラブル対応**: 過去の問題事例を検索して参照
- **品質管理**: 施術内容の一貫性をチェック

### 重要度: P0
大量のカルテから必要な情報を見つけるために不可欠。

### 検索実装

```typescript
// 全文検索インデックス
CREATE INDEX idx_records_fulltext ON medical_records
USING gin(
  to_tsvector('japanese',
    coalesce(before_condition, '') || ' ' ||
    coalesce(content, '') || ' ' ||
    coalesce(observation, '') || ' ' ||
    coalesce(advice, '')
  )
);

async function searchRecords(query: {
  keyword: string;
  customerId?: string;
  dateRange?: { from: Date; to: Date };
  staffId?: string;
  serviceIds?: string[];
}): Promise<SearchResult<MedicalRecord>> {
  return await db.$queryRaw`
    SELECT *,
      ts_rank(
        to_tsvector('japanese', content || ' ' || observation),
        plainto_tsquery('japanese', ${query.keyword})
      ) as relevance
    FROM medical_records
    WHERE to_tsvector('japanese', content || ' ' || observation)
      @@ plainto_tsquery('japanese', ${query.keyword})
      ${query.customerId ? sql`AND customer_id = ${query.customerId}` : sql``}
      ${query.dateRange ? sql`AND record_date BETWEEN ${query.dateRange.from} AND ${query.dateRange.to}` : sql``}
    ORDER BY relevance DESC, record_date DESC
    LIMIT 50
  `;
}
```

---

## 011: カルテテンプレート管理

### 機能概要
よく使うカルテ内容をテンプレートとして保存・再利用する機能。施術ごとの標準的な記録フォーマットを定義。

### なぜ必要なのか
- **入力効率化**: 定型的な内容を毎回入力する手間を削減
- **品質の統一**: 記録内容の標準化
- **教育ツール**: 新人スタッフの記録例として活用
- **ベストプラクティス**: 優れた記録方法を組織全体で共有

### 重要度: P0
カルテ作成の効率化に直結し、スタッフの作業負担を大幅に軽減。

### データ構造

```typescript
type RecordTemplate = {
  id: string;
  name: string;
  serviceId: string; // 対象サービス
  beforeConditionTemplate: string;
  contentTemplate: string;
  observationTemplate: string;
  adviceTemplate: string;
  recommendedProducts: string[];
  isPublic: boolean; // 全スタッフで共有
  createdBy: string;
  usageCount: number; // 使用回数
};

// テンプレート適用
function applyTemplate(
  template: RecordTemplate,
  variables: Record<string, string>
): Partial<CreateRecordInput> {
  return {
    beforeCondition: replaceVariables(template.beforeConditionTemplate, variables),
    content: replaceVariables(template.contentTemplate, variables),
    observation: replaceVariables(template.observationTemplate, variables),
    advice: replaceVariables(template.adviceTemplate, variables),
    productsUsed: template.recommendedProducts.map(id => ({
      productId: id,
      quantity: 0, // 後で入力
      unit: 'ml',
    })),
  };
}

// 変数置換（例: {{customerName}} → 山田太郎）
function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}
```

---

## 012: 施術内容記録

### 機能概要
実施した施術の詳細を構造化して記録する機能。施術の手順、使用した技術、時間配分などを詳細に記録。

### なぜ必要なのか
- **再現性**: 同じ施術を正確に再現
- **品質管理**: 施術の標準化とばらつき防止
- **教育**: 施術方法の共有と指導
- **効果測定**: 施術内容と結果の関連分析

### 重要度: P0
施術の質と一貫性を保つために必須の機能。

### 構造化データ

```typescript
type TreatmentDetail = {
  id: string;
  recordId: string;
  serviceId: string;
  serviceName: string;

  // 施術の手順
  steps: TreatmentStep[];

  // 使用した技術
  techniques: string[];

  // 機器
  equipment: string[];

  // 時間配分
  duration: number; // 総時間（分）
  stepDurations: Record<string, number>; // 各ステップの時間

  // 設定値（温度、強度など）
  settings: Record<string, string | number>;

  // 特記事項
  notes: string;
};

type TreatmentStep = {
  order: number;
  name: string;
  description: string;
  duration: number; // 分
  productsUsed: ProductUsage[];
  completed: boolean;
  notes?: string;
};
```

---

## 013: 予約作成

### 機能概要
顧客の予約を作成する機能。日時、サービス、担当スタッフを指定して予約を登録。空き枠のチェックと重複防止を実施。

### なぜ必要なのか
- **業務の起点**: すべてのサービス提供は予約から始まる
- **リソース管理**: スタッフと時間の最適配分
- **顧客満足**: 希望の日時でのサービス提供
- **売上予測**: 予約状況から売上を予測

### 重要度: P0
予約管理はビジネスの根幹。この機能なしでは業務が成立しない。

### データ構造

```typescript
type Appointment = {
  id: string;
  appointmentNumber: string; // 予約番号
  customerId: string;
  staffId: string;
  serviceIds: string[];

  // 日時
  date: Date;
  startTime: string; // "10:00"
  endTime: string; // "11:30"
  duration: number; // 分

  // ステータス
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'noshow';
  statusChangedAt: Date;

  // 通知
  reminderSent: boolean;
  reminderSentAt: Date | null;

  // メモ
  notes: string | null;
  customerRequest: string | null; // 顧客からの要望

  // 作成情報
  createdAt: Date;
  createdBy: string;
  source: 'phone' | 'web' | 'walkin' | 'app'; // 予約経路
};

async function createAppointment(
  input: CreateAppointmentInput
): Promise<Result<Appointment, Error>> {
  // 1. 空き枠チェック
  const isAvailable = await checkAvailability({
    staffId: input.staffId,
    date: input.date,
    startTime: input.startTime,
    duration: input.duration,
  });

  if (!isAvailable) {
    return { success: false, error: 'Time slot not available' };
  }

  // 2. 重複予約チェック
  const existingAppointment = await db.appointments.findFirst({
    where: {
      customerId: input.customerId,
      date: input.date,
      status: { in: ['pending', 'confirmed'] },
    }
  });

  if (existingAppointment) {
    return { success: false, error: 'Customer already has an appointment' };
  }

  // 3. 予約作成
  const appointment = await db.appointments.create({
    data: {
      appointmentNumber: await generateAppointmentNumber(),
      ...input,
      status: 'pending',
      createdBy: session.user.id,
    }
  });

  // 4. 確認メール送信
  await sendAppointmentConfirmation(appointment);

  return { success: true, data: appointment };
}
```

---

## 014: 予約一覧表示

### 機能概要
予約をカレンダー形式またはリスト形式で一覧表示。日付、スタッフ、ステータスでフィルタリング可能。

### なぜ必要なのか
- **スケジュール把握**: 当日・今週の予約を一目で確認
- **リソース配分**: スタッフの稼働状況を可視化
- **効率的な受付**: 予約状況を素早く確認して対応
- **業務計画**: 予約状況から必要な準備を計画

### 重要度: P0
受付業務の中心となる機能。使用頻度が極めて高い。

### UI実装

```typescript
function AppointmentCalendar() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [date, setDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  const { data: appointments } = useQuery({
    queryKey: ['appointments', view, date, selectedStaff],
    queryFn: () => getAppointments({ view, date, staffId: selectedStaff }),
  });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            onClick={() => setView('day')}
          >
            日
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => setView('week')}
          >
            週
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => setView('month')}
          >
            月
          </Button>
        </div>

        <DatePicker value={date} onChange={setDate} />

        <StaffSelector value={selectedStaff} onChange={setSelectedStaff} />
      </div>

      {view === 'day' && <DayView appointments={appointments} date={date} />}
      {view === 'week' && <WeekView appointments={appointments} date={date} />}
      {view === 'month' && <MonthView appointments={appointments} date={date} />}
    </div>
  );
}

// 日表示
function DayView({ appointments, date }: DayViewProps) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 9:00-21:00

  return (
    <div className="grid grid-cols-[80px_1fr] gap-0 border">
      {hours.map(hour => (
        <React.Fragment key={hour}>
          <div className="border-b p-2 text-sm text-muted-foreground">
            {hour}:00
          </div>
          <div className="border-b border-l relative" style={{ minHeight: '60px' }}>
            {/* 予約を時間軸に配置 */}
            {appointments
              .filter(apt => getHour(apt.startTime) === hour)
              .map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  style={{
                    position: 'absolute',
                    top: `${getMinuteOffset(apt.startTime)}px`,
                    height: `${apt.duration}px`,
                  }}
                />
              ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
```

---

## 015: 予約編集

### 機能概要
既存の予約を変更する機能。日時変更、サービス変更、キャンセルなどに対応。変更履歴を記録。

### なぜ必要なのか
- **柔軟な対応**: 顧客の予定変更に対応
- **リソース最適化**: 空き時間を有効活用
- **顧客満足**: 変更要求への迅速な対応
- **記録管理**: 変更履歴を保持して証跡を残す

### 重要度: P0
予約変更は日常的に発生し、スムーズな対応が顧客満足度に直結。

### 実装

```typescript
type UpdateAppointmentInput = {
  appointmentId: string;
  updates: {
    date?: Date;
    startTime?: string;
    staffId?: string;
    serviceIds?: string[];
    notes?: string;
  };
  reason: string; // 変更理由
};

async function updateAppointment(
  input: UpdateAppointmentInput
): Promise<Result<Appointment, Error>> {
  const current = await db.appointments.findUnique({
    where: { id: input.appointmentId }
  });

  if (!current) {
    return { success: false, error: 'Appointment not found' };
  }

  // 日時変更の場合、空き枠チェック
  if (input.updates.date || input.updates.startTime || input.updates.staffId) {
    const isAvailable = await checkAvailability({
      staffId: input.updates.staffId || current.staffId,
      date: input.updates.date || current.date,
      startTime: input.updates.startTime || current.startTime,
      duration: current.duration,
      excludeAppointmentId: input.appointmentId, // 自分自身は除外
    });

    if (!isAvailable) {
      return { success: false, error: 'New time slot not available' };
    }
  }

  await db.transaction(async (tx) => {
    // 変更ログ
    await tx.appointmentChangeLogs.create({
      data: {
        appointmentId: input.appointmentId,
        changes: detectChanges(current, input.updates),
        changedBy: session.user.id,
        changedAt: new Date(),
        reason: input.reason,
      }
    });

    // 予約更新
    await tx.appointments.update({
      where: { id: input.appointmentId },
      data: {
        ...input.updates,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      }
    });

    // 顧客に変更通知
    await sendAppointmentChangeNotification(current.customerId, input.updates);
  });

  return { success: true, data: updated };
}
```

---

## 016: 予約キャンセル

### 機能概要
予約をキャンセルする機能。キャンセル理由を記録し、キャンセル料の計算、顧客への通知を実施。

### なぜ必要なのか
- **柔軟な対応**: やむを得ないキャンセルへの対応
- **リソース解放**: キャンセル枠を他の予約で埋める
- **キャンセル分析**: キャンセル理由を分析して改善
- **売上管理**: キャンセル料の計算と記録

### 重要度: P0
キャンセル対応は避けられない業務。適切な処理が必要。

### 実装

```typescript
async function cancelAppointment(input: {
  appointmentId: string;
  reason: string;
  cancelledBy: 'customer' | 'staff' | 'system';
  notifyCustomer?: boolean;
}): Promise<Result<Appointment, Error>> {
  const appointment = await db.appointments.findUnique({
    where: { id: input.appointmentId }
  });

  if (!appointment) {
    return { success: false, error: 'Appointment not found' };
  }

  // キャンセル料の計算
  const cancellationFee = calculateCancellationFee(
    appointment.date,
    appointment.totalAmount
  );

  await db.transaction(async (tx) => {
    // 予約ステータス更新
    await tx.appointments.update({
      where: { id: input.appointmentId },
      data: {
        status: 'cancelled',
        statusChangedAt: new Date(),
        cancellationReason: input.reason,
        cancelledBy: input.cancelledBy,
        cancellationFee,
      }
    });

    // キャンセル料が発生する場合、請求レコード作成
    if (cancellationFee > 0) {
      await tx.invoices.create({
        data: {
          customerId: appointment.customerId,
          type: 'cancellation_fee',
          amount: cancellationFee,
          status: 'unpaid',
        }
      });
    }

    // キャンセルログ
    await tx.appointmentCancellations.create({
      data: {
        appointmentId: input.appointmentId,
        reason: input.reason,
        cancelledBy: input.cancelledBy,
        cancelledAt: new Date(),
        cancellationFee,
      }
    });
  });

  // 顧客に通知
  if (input.notifyCustomer) {
    await sendCancellationNotification(appointment);
  }

  return { success: true, data: updated };
}

// キャンセル料計算
function calculateCancellationFee(
  appointmentDate: Date,
  totalAmount: number
): number {
  const hoursUntilAppointment = differenceInHours(appointmentDate, new Date());

  if (hoursUntilAppointment < 24) {
    return totalAmount; // 100%
  } else if (hoursUntilAppointment < 48) {
    return totalAmount * 0.5; // 50%
  } else {
    return 0; // 無料
  }
}
```

---

## 017: 来店チェックイン

### 機能概要
予約した顧客が来店した際にチェックインする機能。来店時刻を記録し、待ち状況を管理。

### なぜ必要なのか
- **来店管理**: 実際の来店を記録
- **待ち状況の可視化**: 受付から施術までの流れを管理
- **統計データ**: 来店率、遅刻率などを集計
- **スタッフ通知**: 担当スタッフに来店を通知

### 重要度: P0
受付業務の基本機能。来店から施術までのフロー管理に必須。

### 実装

```typescript
type CheckIn = {
  id: string;
  appointmentId: string;
  customerId: string;
  checkedInAt: Date;
  checkedInBy: string;
  status: 'waiting' | 'in_treatment' | 'completed';
  queuePosition: number | null; // 待ち順
};

async function checkInCustomer(input: {
  appointmentId: string;
  actualArrivalTime?: Date;
}): Promise<Result<CheckIn, Error>> {
  const appointment = await db.appointments.findUnique({
    where: { id: input.appointmentId },
    include: { customer: true, staff: true }
  });

  if (!appointment) {
    return { success: false, error: 'Appointment not found' };
  }

  // 既にチェックイン済みかチェック
  const existing = await db.checkIns.findFirst({
    where: { appointmentId: input.appointmentId }
  });

  if (existing) {
    return { success: false, error: 'Already checked in' };
  }

  const checkIn = await db.transaction(async (tx) => {
    // チェックイン記録
    const newCheckIn = await tx.checkIns.create({
      data: {
        appointmentId: input.appointmentId,
        customerId: appointment.customerId,
        checkedInAt: input.actualArrivalTime || new Date(),
        checkedInBy: session.user.id,
        status: 'waiting',
      }
    });

    // 予約ステータス更新
    await tx.appointments.update({
      where: { id: input.appointmentId },
      data: {
        status: 'confirmed',
        actualArrivalTime: newCheckIn.checkedInAt,
      }
    });

    // 待ち順を計算
    const queuePosition = await tx.checkIns.count({
      where: {
        status: 'waiting',
        checkedInAt: { lt: newCheckIn.checkedInAt }
      }
    }) + 1;

    await tx.checkIns.update({
      where: { id: newCheckIn.id },
      data: { queuePosition }
    });

    // 担当スタッフに通知
    await notifyStaff(appointment.staffId, {
      type: 'customer_arrived',
      message: `${appointment.customer.name}様が来店されました`,
      appointmentId: input.appointmentId,
    });

    return newCheckIn;
  });

  return { success: true, data: checkIn };
}

// 待ち状況表示
function WaitingQueue() {
  const { data: queue } = useQuery({
    queryKey: ['waiting-queue'],
    queryFn: getWaitingQueue,
    refetchInterval: 30000, // 30秒ごとに更新
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>待ち状況</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {queue?.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-4">
                <Badge>{index + 1}</Badge>
                <div>
                  <p className="font-semibold">{item.customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    担当: {item.staff.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  待ち時間: {formatWaitTime(item.checkedInAt)}
                </p>
                <Button size="sm" onClick={() => startTreatment(item.id)}>
                  施術開始
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 018: 予約カレンダー表示

### 機能概要
予約状況をカレンダー形式で視覚的に表示。ドラッグ&ドロップで予約の移動が可能。

### なぜ必要なのか
- **視覚的な把握**: 予約状況を一目で理解
- **直感的な操作**: ドラッグで簡単に予約変更
- **スケジュール最適化**: 空き枠を視覚的に確認
- **複数スタッフの管理**: スタッフごとのスケジュールを並べて表示

### 重要度: P0
予約管理の中心となるUI。使いやすさが業務効率に直結。

### 実装（React DnD使用）

```typescript
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function AppointmentCalendarDnD() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CalendarGrid />
    </DndProvider>
  );
}

function CalendarGrid() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleDrop = async (
    appointmentId: string,
    newDate: Date,
    newStartTime: string
  ) => {
    // 予約を移動
    const result = await updateAppointment({
      appointmentId,
      updates: { date: newDate, startTime: newStartTime },
      reason: 'ドラッグ&ドロップによる変更',
    });

    if (result.success) {
      // UIを更新
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, date: newDate, startTime: newStartTime }
            : apt
        )
      );
      toast.success('予約を移動しました');
    } else {
      toast.error('予約の移動に失敗しました');
    }
  };

  return (
    <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-0">
      {/* ヘッダー: 曜日 */}
      <div></div>
      {['月', '火', '水', '木', '金', '土', '日'].map(day => (
        <div key={day} className="border p-2 text-center font-bold">
          {day}
        </div>
      ))}

      {/* 時間軸とセル */}
      {hours.map(hour => (
        <React.Fragment key={hour}>
          <div className="border p-2 text-sm">{hour}:00</div>
          {days.map(day => (
            <TimeSlotCell
              key={`${day}-${hour}`}
              date={day}
              hour={hour}
              appointments={appointments.filter(
                apt =>
                  isSameDay(apt.date, day) &&
                  getHour(apt.startTime) === hour
              )}
              onDrop={(apt, time) => handleDrop(apt.id, day, time)}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

// ドロップ可能なタイムスロット
function TimeSlotCell({ date, hour, appointments, onDrop }: TimeSlotCellProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'appointment',
    drop: (item: { appointment: Appointment }) => {
      onDrop(item.appointment, `${hour}:00`);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`border p-1 min-h-[60px] relative ${
        isOver ? 'bg-blue-50' : ''
      }`}
    >
      {appointments.map(apt => (
        <DraggableAppointment key={apt.id} appointment={apt} />
      ))}
    </div>
  );
}

// ドラッグ可能な予約
function DraggableAppointment({ appointment }: { appointment: Appointment }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'appointment',
    item: { appointment },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 bg-blue-100 rounded mb-1 cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <p className="text-xs font-semibold">{appointment.customer.name}</p>
      <p className="text-xs">{appointment.services.join(', ')}</p>
    </div>
  );
}
```

---

## 019: 会計記録作成

### 機能概要
施術後の会計を記録する機能。サービス料金、製品販売、支払い方法を記録し、領収書を発行。

### なぜ必要なのか
- **売上管理**: すべての売上を記録
- **会計処理**: 日次・月次の売上集計
- **税務対応**: 正確な会計記録は税務申告に必須
- **顧客履歴**: 顧客の購買履歴を記録

### 重要度: P0
売上の記録は

ビジネスの基本。正確な会計記録は法的義務。

### データ構造

```typescript
type Payment = {
  id: string;
  paymentNumber: string; // 会計番号
  customerId: string;
  appointmentId: string | null;

  // 項目
  items: PaymentItem[];

  // 金額
  subtotal: number; // 小計
  discount: number; // 割引額
  tax: number; // 消費税
  total: number; // 合計

  // 支払い方法
  paymentMethods: PaymentMethod[];

  // ステータス
  status: 'paid' | 'partial' | 'unpaid' | 'refunded';

  // 領収書
  receiptIssued: boolean;
  receiptNumber: string | null;

  // メタデータ
  paidAt: Date;
  createdBy: string;
};

type PaymentItem = {
  type: 'service' | 'product';
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
};

type PaymentMethod = {
  method: 'cash' | 'credit' | 'debit' | 'qr' | 'point';
  amount: number;
  details?: Record<string, any>; // カード番号下4桁など
};

async function createPayment(
  input: CreatePaymentInput
): Promise<Result<Payment, Error>> {
  // 金額計算
  const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = input.items.reduce((sum, item) => sum + item.tax, 0);
  const total = subtotal + tax - input.discount;

  // 支払い総額チェック
  const paidAmount = input.paymentMethods.reduce(
    (sum, method) => sum + method.amount,
    0
  );

  if (Math.abs(paidAmount - total) > 0.01) {
    return { success: false, error: 'Payment amount mismatch' };
  }

  const payment = await db.transaction(async (tx) => {
    // 支払い記録作成
    const newPayment = await tx.payments.create({
      data: {
        paymentNumber: await generatePaymentNumber(),
        customerId: input.customerId,
        appointmentId: input.appointmentId,
        items: input.items,
        subtotal,
        discount: input.discount,
        tax,
        total,
        paymentMethods: input.paymentMethods,
        status: 'paid',
        paidAt: new Date(),
        createdBy: session.user.id,
      }
    });

    // 製品在庫を減算
    for (const item of input.items) {
      if (item.type === 'product') {
        await tx.products.update({
          where: { id: item.itemId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    // ポイント付与
    const pointsEarned = Math.floor(total * 0.01); // 1%
    await tx.customers.update({
      where: { id: input.customerId },
      data: {
        points: { increment: pointsEarned },
        totalSpent: { increment: total },
      }
    });

    // 領収書番号発行
    if (input.issueReceipt) {
      const receiptNumber = await generateReceiptNumber();
      await tx.payments.update({
        where: { id: newPayment.id },
        data: {
          receiptIssued: true,
          receiptNumber,
        }
      });
    }

    return newPayment;
  });

  return { success: true, data: payment };
}
```

---

## 020: 支払い方法登録

### 機能概要
現金、クレジットカード、電子マネー、QRコード決済など、複数の支払い方法に対応。

### なぜ必要なのか
- **顧客利便性**: 多様な支払い方法に対応
- **会計の正確性**: 支払い方法ごとに記録
- **レジ締め**: 支払い方法別の売上集計
- **手数料管理**: カード決済手数料などの計算

### 重要度: P0
支払い方法の多様化は顧客満足度に直結。正確な記録は会計処理に必須。

---

## 021: 領収書発行

### 機能概要
支払い後に領収書を発行する機能。PDF形式で印刷またはメール送信。

### なぜ必要なのか
- **法的要件**: 領収書の発行は義務
- **顧客要求**: 経費精算のために必要
- **記録管理**: 領収書番号で取引を追跡
- **税務対応**: 税務調査時の証拠書類

### 重要度: P0
領収書発行は法的義務。適切な発行と管理が必要。

---

## 022: 会計履歴表示

### 機能概要
顧客の会計履歴を時系列で一覧表示。詳細表示、再発行、返金処理が可能。

### なぜ必要なのか
- **顧客の購買履歴**: 過去の購入内容を確認
- **未払い管理**: 未払い金額を追跡
- **トラブル対応**: 過去の取引を参照
- **分析**: 顧客の購買パターンを分析

### 重要度: P0
会計履歴の確認は日常的に発生。顧客対応に必須。

---

## 023: 未収金管理

### 機能概要
未払いの会計を一覧表示し、督促や回収を管理する機能。

### なぜ必要なのか
- **キャッシュフロー管理**: 未収金を把握して資金繰りを管理
- **督促業務**: 未払い顧客への連絡
- **リスク管理**: 長期未払いを早期に発見
- **会計処理**: 貸倒引当金の計算

### 重要度: P0
未収金の管理はキャッシュフロー管理の基本。放置すると経営に影響。

---

## まとめ

これらの16機能（008-023）は、顧客カルテシステムの中核をなす重要な機能群です。

### 共通の重要ポイント
1. **高頻度利用**: すべて日常業務で頻繁に使用される
2. **相互連携**: 各機能が密接に連携して動作
3. **データ整合性**: トランザクション処理で一貫性を保証
4. **監査証跡**: すべての操作を記録

### 実装の優先順位
これらのP0機能は、システムの基盤となるため、最初に実装すべき機能群です。
