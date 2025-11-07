# 051-150: P1 高優先度機能群

このドキュメントには、P1（高優先度）の51番から150番までの100機能の詳細設計をまとめています。

---

## カテゴリ1: 顧客情報管理の拡張（051-065）

### 051: 顧客タグ付け
顧客にタグを付けて分類。「VIP」「要注意」「アレルギーあり」等。

```typescript
type CustomerTag = {
  id: string;
  name: string;
  color: string;
  icon: string;
  customerId: string[];
};

// タグの付与
await db.customers.update({
  where: { id: customerId },
  data: {
    tags: {
      connect: [{ id: tagId }]
    }
  }
});

// タグで検索
const customers = await db.customers.findMany({
  where: {
    tags: {
      some: { name: 'VIP' }
    }
  }
});
```

### 052: 顧客カテゴリ分類
顧客を業種、年齢層、利用頻度などでカテゴリ分け。

### 053: 顧客ランク管理
ブロンズ、シルバー、ゴールド、プラチナなどのランク管理。

```typescript
type CustomerRank = 'bronze' | 'silver' | 'gold' | 'platinum';

// 自動ランクアップ
async function updateCustomerRank(customerId: string) {
  const customer = await db.customers.findUnique({
    where: { id: customerId },
    include: { payments: true }
  });

  const totalSpent = customer.payments.reduce((sum, p) => sum + p.amount, 0);

  let newRank: CustomerRank = 'bronze';
  if (totalSpent >= 1000000) newRank = 'platinum';
  else if (totalSpent >= 500000) newRank = 'gold';
  else if (totalSpent >= 200000) newRank = 'silver';

  if (customer.customerRank !== newRank) {
    await db.customers.update({
      where: { id: customerId },
      data: { customerRank: newRank }
    });

    // ランクアップ通知
    await sendRankUpNotification(customer, newRank);
  }
}
```

### 054: 顧客メモ機能
スタッフが自由にメモを記入。内部用の情報共有。

### 055: 顧客重複チェック
重複する顧客を検出して統合を提案。

### 056: 顧客マージ機能
重複顧客を統合して、履歴を1つにまとめる。

### 057: 家族・関連顧客紐付け
家族や紹介関係を記録。

```typescript
type CustomerRelation = {
  id: string;
  customerId: string;
  relatedCustomerId: string;
  relationType: 'family' | 'referral' | 'friend';
  notes: string | null;
};

// 家族割引の計算
function calculateFamilyDiscount(customerIds: string[]): number {
  if (customerIds.length >= 3) {
    return 0.15; // 15% off
  } else if (customerIds.length >= 2) {
    return 0.10; // 10% off
  }
  return 0;
}
```

### 058-065: その他の顧客情報機能
- 058: 顧客生年月日管理
- 059: 顧客性別管理
- 060: 顧客住所管理
- 061: 顧客連絡先管理（複数）
- 062: 顧客緊急連絡先
- 063: 顧客アレルギー情報
- 064: 顧客既往歴
- 065: 顧客紹介元管理

---

## カテゴリ2: カルテ・診療記録の拡張（066-080）

### 066: カルテ詳細記録（テキスト）
リッチテキストエディタで詳細な記録。

```typescript
// Tiptap エディタの使用
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function RecordEditor({ content, onChange }: RecordEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
}
```

### 067: カルテ症状記録
症状を構造化して記録。

### 068: カルテ診断記録
診断結果を記録。

### 069: カルテ処方記録
処方した薬剤や製品を記録。

### 070: カルテ経過記録
施術後の経過を時系列で記録。

### 071: カルテ印刷
カルテをPDF形式で印刷。

```typescript
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

async function printRecord(recordId: string) {
  const record = await getRecord(recordId);

  const doc = new jsPDF();

  // ヘッダー
  doc.setFontSize(20);
  doc.text('カルテ', 20, 20);

  // 顧客情報
  doc.setFontSize(12);
  doc.text(`顧客: ${record.customer.name}`, 20, 40);
  doc.text(`日付: ${formatDate(record.recordDate)}`, 20, 50);

  // カルテ内容
  doc.autoTable({
    startY: 60,
    head: [['項目', '内容']],
    body: [
      ['施術前の状態', record.beforeCondition],
      ['施術内容', record.content],
      ['スタッフ所見', record.observation],
    ],
  });

  doc.save(`record-${record.recordNumber}.pdf`);
}
```

### 072: カルテPDF出力
カルテをPDFでエクスポート。

### 073: カルテ承認ワークフロー
上級スタッフがカルテを承認する仕組み。

```typescript
async function approveRecord(recordId: string, approverId: string) {
  await db.medicalRecords.update({
    where: { id: recordId },
    data: {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
    }
  });

  // 承認通知
  const record = await db.medicalRecords.findUnique({
    where: { id: recordId },
    include: { createdBy: true }
  });

  await sendNotification({
    to: record.createdBy.id,
    message: 'あなたのカルテが承認されました',
  });
}
```

### 074: カルテ修正履歴
カルテの変更履歴を記録。

### 075: カルテ添付ファイル
PDFや画像をカルテに添付。

### 076: カルテバイタル記録
血圧、体温などのバイタルサインを記録。

### 077: カルテ検査結果記録
検査結果を構造化して記録。

### 078: カルテ画像添付
施術部位の写真を添付。

### 079: カルテコメント機能
スタッフ間でコメントを追加。

### 080: カルテ共有機能（スタッフ間）
特定のスタッフとカルテを共有。

---

## カテゴリ3: 来店・予約管理の拡張（081-100）

### 081: 予約リマインダー（自動）
予約の前日・当日に自動でリマインダーを送信。

```typescript
// Cron job で毎日実行
async function sendAppointmentReminders() {
  const tomorrow = addDays(new Date(), 1);

  const appointments = await db.appointments.findMany({
    where: {
      date: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
      status: 'confirmed',
      reminderSent: false,
    },
    include: { customer: true }
  });

  for (const appointment of appointments) {
    // SMS送信
    await sendSMS({
      to: appointment.customer.mobileNumber,
      message: `明日 ${appointment.startTime} にご予約があります。お待ちしております。`,
    });

    // メール送信
    await sendEmail({
      to: appointment.customer.email,
      subject: 'ご予約のリマインダー',
      template: 'appointment-reminder',
      data: appointment,
    });

    // リマインダー送信済みフラグ
    await db.appointments.update({
      where: { id: appointment.id },
      data: {
        reminderSent: true,
        reminderSentAt: new Date(),
      }
    });
  }
}
```

### 082: 予約時間枠設定
予約可能な時間枠を設定（15分単位、30分単位等）。

### 083: 予約受付設定（オンライン/オフライン）
オンライン予約の受付可否を設定。

### 084: 予約待ちリスト
満席の場合、キャンセル待ちリストに登録。

```typescript
type WaitingList = {
  id: string;
  customerId: string;
  desiredDate: Date;
  desiredTimeRange: string; // "morning", "afternoon", "evening"
  serviceIds: string[];
  priority: number; // 優先度
  status: 'waiting' | 'offered' | 'accepted' | 'expired';
  createdAt: Date;
};

// キャンセルが発生したら待ちリストに通知
async function notifyWaitingList(cancelledAppointment: Appointment) {
  const waitingCustomers = await db.waitingList.findMany({
    where: {
      desiredDate: cancelledAppointment.date,
      status: 'waiting',
    },
    orderBy: { priority: 'desc' },
    take: 5,
  });

  for (const waiting of waitingCustomers) {
    await sendNotification({
      to: waiting.customerId,
      message: `ご希望の日時に空きが出ました。予約しますか?`,
      action: {
        type: 'book_appointment',
        data: {
          date: cancelledAppointment.date,
          startTime: cancelledAppointment.startTime,
        }
      }
    });

    await db.waitingList.update({
      where: { id: waiting.id },
      data: { status: 'offered' }
    });
  }
}
```

### 085: 予約変更履歴
予約の変更履歴を記録。

### 086: 予約ステータス管理
pending, confirmed, completed, cancelled, noshow のステータス管理。

### 087: 予約メモ機能
予約に内部メモを追加。

### 088: 複数スタッフ予約
1つの予約に複数のスタッフを割り当て。

### 089: グループ予約
複数の顧客を同時に予約。

### 090: 繰り返し予約
毎週、隔週などの定期予約。

```typescript
type RecurringAppointment = {
  id: string;
  customerId: string;
  serviceIds: string[];
  staffId: string;
  startTime: string;
  duration: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  startDate: Date;
  endDate: Date | null; // null = 無期限
  status: 'active' | 'paused' | 'cancelled';
};

// 定期予約から個別予約を生成
async function generateRecurringAppointments(recurringId: string) {
  const recurring = await db.recurringAppointments.findUnique({
    where: { id: recurringId }
  });

  const dates = calculateRecurringDates(recurring);

  for (const date of dates) {
    await createAppointment({
      customerId: recurring.customerId,
      serviceIds: recurring.serviceIds,
      staffId: recurring.staffId,
      date,
      startTime: recurring.startTime,
      duration: recurring.duration,
      recurringAppointmentId: recurringId,
    });
  }
}
```

### 091: 予約通知（メール/SMS）
予約確認、変更、キャンセルの通知。

### 092: 来店履歴表示
顧客の来店履歴を一覧表示。

### 093: 来店頻度分析
顧客の来店頻度を分析。

### 094: 無断キャンセル管理
ノーショー（無断キャンセル）を記録。

```typescript
type NoShowRecord = {
  id: string;
  appointmentId: string;
  customerId: string;
  date: Date;
  reason: string | null;
  penaltyApplied: boolean;
};

// ノーショーの記録
async function recordNoShow(appointmentId: string) {
  const appointment = await db.appointments.update({
    where: { id: appointmentId },
    data: { status: 'noshow' }
  });

  await db.noShowRecords.create({
    data: {
      appointmentId,
      customerId: appointment.customerId,
      date: appointment.date,
    }
  });

  // 3回目のノーショーでペナルティ
  const noShowCount = await db.noShowRecords.count({
    where: { customerId: appointment.customerId }
  });

  if (noShowCount >= 3) {
    await db.customers.update({
      where: { id: appointment.customerId },
      data: { status: 'suspended' }
    });

    await sendWarningEmail(appointment.customerId);
  }
}
```

### 095: 予約確認機能
顧客が予約を確認する機能。

### 096: 予約枠の色分け
予約状況を色で視覚化。

### 097: 予約ブロック機能（休憩等）
スタッフの休憩時間や会議をブロック。

### 098: オンライン予約受付
Webサイトからの予約受付。

### 099: 予約承認機能
予約を承認制にする。

### 100: 予約キャンセル待ち
キャンセル待ちの管理と通知。

---

## カテゴリ4: 支払い・会計の拡張（101-118）

### 101: 請求書作成
サービスと製品の請求書を作成。

```typescript
type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  sentAt: Date | null;
  paidAt: Date | null;
};

async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const invoice = await db.invoices.create({
    data: {
      invoiceNumber: await generateInvoiceNumber(),
      customerId: input.customerId,
      items: input.items,
      subtotal: calculateSubtotal(input.items),
      tax: calculateTax(input.items),
      total: calculateTotal(input.items),
      dueDate: addDays(new Date(), 30), // 30日後
      status: 'draft',
    }
  });

  return invoice;
}

// 請求書PDF生成
async function generateInvoicePDF(invoiceId: string) {
  const invoice = await db.invoices.findUnique({
    where: { id: invoiceId },
    include: { customer: true, items: true }
  });

  const doc = new jsPDF();

  // ヘッダー
  doc.text('請求書', 20, 20);
  doc.text(`請求書番号: ${invoice.invoiceNumber}`, 20, 30);

  // 顧客情報
  doc.text(`宛先: ${invoice.customer.name}様`, 20, 50);

  // 明細
  doc.autoTable({
    startY: 70,
    head: [['項目', '数量', '単価', '金額']],
    body: invoice.items.map(item => [
      item.name,
      item.quantity,
      formatCurrency(item.unitPrice),
      formatCurrency(item.total)
    ]),
  });

  // 合計
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.text(`小計: ${formatCurrency(invoice.subtotal)}`, 140, finalY + 10);
  doc.text(`消費税: ${formatCurrency(invoice.tax)}`, 140, finalY + 20);
  doc.text(`合計: ${formatCurrency(invoice.total)}`, 140, finalY + 30);

  return doc.output('blob');
}
```

### 102: 請求書送付
メールで請求書を送付。

### 103: 分割払い管理
分割払いのスケジュールと支払い状況を管理。

### 104: クレジットカード決済
Stripe等の決済サービスと連携。

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function processCardPayment(input: {
  amount: number;
  customerId: string;
  paymentMethodId: string;
}): Promise<PaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100), // 円からセントへ
      currency: 'jpy',
      payment_method: input.paymentMethodId,
      confirm: true,
      metadata: {
        customerId: input.customerId,
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // 支払い記録を作成
      await createPayment({
        customerId: input.customerId,
        amount: input.amount,
        paymentMethod: 'credit',
        stripePaymentIntentId: paymentIntent.id,
        status: 'paid',
      });

      return { success: true, paymentIntentId: paymentIntent.id };
    } else {
      return { success: false, error: 'Payment failed' };
    }
  } catch (error) {
    logger.error('Card payment failed', { error, input });
    return { success: false, error: error.message };
  }
}
```

### 105: 電子マネー決済
Suica、PASMOなどの電子マネー決済。

### 106: QRコード決済
PayPay、LINE Payなどの QR コード決済。

### 107: 回数券管理
回数券の発行、使用、残高管理。

```typescript
type Ticket = {
  id: string;
  ticketNumber: string;
  customerId: string;
  serviceId: string;
  totalCount: number; // 総回数
  usedCount: number; // 使用回数
  remainingCount: number; // 残回数
  purchaseDate: Date;
  expiryDate: Date;
  status: 'active' | 'used' | 'expired';
};

async function useTicket(ticketId: string, appointmentId: string) {
  const ticket = await db.tickets.findUnique({ where: { id: ticketId } });

  if (ticket.remainingCount <= 0) {
    throw new Error('Ticket already used');
  }

  if (isAfter(new Date(), ticket.expiryDate)) {
    throw new Error('Ticket expired');
  }

  await db.transaction(async (tx) => {
    // 回数券を使用
    await tx.tickets.update({
      where: { id: ticketId },
      data: {
        usedCount: { increment: 1 },
        remainingCount: { decrement: 1 },
        status: ticket.remainingCount === 1 ? 'used' : 'active',
      }
    });

    // 使用履歴を記録
    await tx.ticketUsages.create({
      data: {
        ticketId,
        appointmentId,
        usedAt: new Date(),
      }
    });
  });
}
```

### 108: ポイント管理
ポイントの付与、使用、有効期限管理。

### 109: クーポン管理
クーポンの発行、適用、有効期限管理。

### 110: 割引管理
各種割引の設定と適用。

### 111: 売上日報
1日の売上を集計。

### 112: 売上月報
1ヶ月の売上を集計。

### 113: 売上集計
期間指定で売上を集計。

### 114: 入金管理
入金予定と実績を管理。

### 115: 返金管理
返金処理と記録。

### 116: 前受金管理
前払い金の管理。

### 117: 債権管理
売掛金の管理。

### 118: 請求漏れチェック
請求漏れを自動検出。

---

## カテゴリ5: マーケティング・CRM（119-132）

### 119: 顧客セグメント作成
条件に基づいて顧客をグループ化。

```typescript
type Segment = {
  id: string;
  name: string;
  description: string;
  conditions: SegmentCondition[];
  customerCount: number;
  createdAt: Date;
};

type SegmentCondition = {
  field: string; // 'totalSpent', 'lastVisit', 'age', etc.
  operator: 'gt' | 'lt' | 'eq' | 'contains';
  value: any;
};

// セグメント作成
async function createSegment(input: {
  name: string;
  conditions: SegmentCondition[];
}): Promise<Segment> {
  // 条件に合う顧客を検索
  const customers = await findCustomersByConditions(input.conditions);

  const segment = await db.segments.create({
    data: {
      name: input.name,
      conditions: input.conditions,
      customerCount: customers.length,
      customerIds: customers.map(c => c.id),
    }
  });

  return segment;
}

// 条件による顧客検索
async function findCustomersByConditions(
  conditions: SegmentCondition[]
): Promise<Customer[]> {
  let query: any = { where: {} };

  for (const condition of conditions) {
    switch (condition.field) {
      case 'totalSpent':
        if (condition.operator === 'gt') {
          query.where.totalSpent = { gte: condition.value };
        }
        break;
      case 'lastVisit':
        if (condition.operator === 'lt') {
          const date = subDays(new Date(), condition.value);
          query.where.lastVisit = { lt: date };
        }
        break;
      case 'age':
        // 年齢の計算
        break;
    }
  }

  return await db.customers.findMany(query);
}

// セグメント例
const vipSegment = await createSegment({
  name: 'VIP顧客',
  conditions: [
    { field: 'totalSpent', operator: 'gt', value: 500000 },
    { field: 'visits', operator: 'gt', value: 10 },
  ]
});

const dormantSegment = await createSegment({
  name: '休眠顧客',
  conditions: [
    { field: 'lastVisit', operator: 'lt', value: 180 }, // 180日以上未来店
  ]
});
```

### 120: ターゲット配信
特定のセグメントにメッセージ配信。

### 121: メールマーケティング
一斉メール配信とパーソナライズ。

### 122: SMSマーケティング
SMS による販促メッセージ配信。

### 123: LINEメッセージ配信
LINE公式アカウントからのメッセージ配信。

### 124: 誕生日メッセージ自動送信
顧客の誕生日に自動でメッセージと特典を送信。

```typescript
// 毎日実行するcron job
async function sendBirthdayMessages() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const birthdayCustomers = await db.customers.findMany({
    where: {
      OR: [
        {
          dateOfBirth: {
            // PostgreSQLのEXTRACT関数を使用
            extract: {
              month,
              day,
            }
          }
        }
      ],
      status: 'active',
    }
  });

  for (const customer of birthdayCustomers) {
    // 誕生日クーポンを発行
    const coupon = await db.coupons.create({
      data: {
        code: generateCouponCode(),
        type: 'birthday',
        discountRate: 0.20, // 20% off
        customerId: customer.id,
        expiryDate: addDays(today, 30), // 30日間有効
      }
    });

    // メール送信
    await sendEmail({
      to: customer.email,
      subject: 'お誕生日おめでとうございます！',
      template: 'birthday',
      data: {
        customerName: customer.name,
        couponCode: coupon.code,
        discountRate: 20,
      }
    });

    // SMS送信
    await sendSMS({
      to: customer.mobileNumber,
      message: `${customer.name}様、お誕生日おめでとうございます！特別クーポン: ${coupon.code}`,
    });
  }
}
```

### 125: 来店促進キャンペーン
休眠顧客への来店促進施策。

### 126: 顧客満足度調査
アンケートの作成と配信。

### 127: アンケート作成
カスタムアンケートフォームの作成。

### 128: アンケート結果集計
回答の集計と分析。

### 129: 顧客ロイヤリティプログラム
ポイント、ランク、特典の総合管理。

### 130: 紹介プログラム管理
紹介者と被紹介者の管理、特典付与。

```typescript
type Referral = {
  id: string;
  referrerId: string; // 紹介者
  referredId: string; // 被紹介者
  status: 'pending' | 'completed' | 'rewarded';
  rewardGiven: boolean;
  createdAt: Date;
  completedAt: Date | null;
};

// 紹介登録
async function registerReferral(input: {
  referrerId: string;
  referredEmail: string;
}): Promise<Referral> {
  const referral = await db.referrals.create({
    data: {
      referrerId: input.referrerId,
      referralCode: generateReferralCode(),
      referredEmail: input.referredEmail,
      status: 'pending',
    }
  });

  // 被紹介者に招待メール送信
  await sendReferralInvitation({
    to: input.referredEmail,
    referrerName: (await db.customers.findUnique({ where: { id: input.referrerId } })).name,
    referralCode: referral.referralCode,
  });

  return referral;
}

// 被紹介者が初回来店したら特典付与
async function completeReferral(referralId: string) {
  const referral = await db.referrals.update({
    where: { id: referralId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    }
  });

  // 紹介者に特典付与（例: 2000ポイント）
  await db.customers.update({
    where: { id: referral.referrerId },
    data: {
      points: { increment: 2000 }
    }
  });

  // 被紹介者に特典付与（例: 20% off クーポン）
  await db.coupons.create({
    data: {
      code: generateCouponCode(),
      type: 'referral',
      discountRate: 0.20,
      customerId: referral.referredId,
      expiryDate: addDays(new Date(), 60),
    }
  });

  await db.referrals.update({
    where: { id: referralId },
    data: { rewardGiven: true }
  });
}
```

### 131: キャンペーン管理
期間限定キャンペーンの設定と管理。

### 132: プロモーションコード
プロモーションコードの発行と適用。

---

## カテゴリ6: 分析・レポート（133-145）

### 133: 売上分析
売上の推移、内訳、トレンドを分析。

```typescript
async function getSalesAnalytics(input: {
  startDate: Date;
  endDate: Date;
  groupBy: 'day' | 'week' | 'month';
}): Promise<SalesAnalytics> {
  const payments = await db.payments.findMany({
    where: {
      paidAt: {
        gte: input.startDate,
        lte: input.endDate,
      },
      status: 'paid',
    },
    include: {
      items: true,
    }
  });

  // グループ化
  const grouped = groupPaymentsByPeriod(payments, input.groupBy);

  // 集計
  const analytics = {
    total: payments.reduce((sum, p) => sum + p.total, 0),
    average: payments.length > 0
      ? payments.reduce((sum, p) => sum + p.total, 0) / payments.length
      : 0,
    count: payments.length,
    byPeriod: grouped.map(group => ({
      period: group.period,
      total: group.payments.reduce((sum, p) => sum + p.total, 0),
      count: group.payments.length,
    })),
    byService: groupByService(payments),
    byPaymentMethod: groupByPaymentMethod(payments),
  };

  return analytics;
}
```

### 134: 顧客分析
顧客のセグメント、行動パターン、LTVを分析。

### 135: 施術分析
人気の施術、施術効果、組み合わせを分析。

### 136: スタッフ別売上
スタッフごとの売上、施術数、顧客満足度を分析。

### 137: 時間帯別分析
時間帯ごとの予約状況、売上を分析。

### 138: 曜日別分析
曜日ごとの傾向を分析。

### 139: 月次レポート
月次の総合レポート。

### 140: 年次レポート
年次の総合レポート。

### 141: リピート率分析
顧客のリピート率、再来店期間を分析。

### 142: 新規顧客数推移
新規顧客の獲得状況を分析。

### 143: 離反顧客分析
離反した顧客の傾向を分析。

### 144: LTV（顧客生涯価値）分析
顧客のLTVを計算・分析。

```typescript
async function calculateCustomerLTV(customerId: string): Promise<number> {
  const customer = await db.customers.findUnique({
    where: { id: customerId },
    include: {
      payments: true,
      visits: true,
    }
  });

  const totalSpent = customer.payments.reduce((sum, p) => sum + p.amount, 0);
  const visitCount = customer.visits.length;
  const membershipDays = differenceInDays(new Date(), customer.createdAt);

  // 平均来店間隔（日）
  const avgVisitInterval = visitCount > 1
    ? membershipDays / visitCount
    : 30; // デフォルト30日

  // 平均単価
  const avgTransactionValue = visitCount > 0
    ? totalSpent / visitCount
    : 0;

  // 予測来店回数（年間）
  const estimatedAnnualVisits = 365 / avgVisitInterval;

  // 予測年間売上
  const estimatedAnnualRevenue = avgTransactionValue * estimatedAnnualVisits;

  // 予測顧客寿命（年）- 簡易計算
  const estimatedCustomerLifespan = 5; // 仮定

  // LTV
  const ltv = estimatedAnnualRevenue * estimatedCustomerLifespan;

  return ltv;
}
```

### 145: RFM分析
Recency（最終購買日）、Frequency（購買頻度）、Monetary（購買金額）で顧客をスコアリング。

```typescript
async function performRFMAnalysis(): Promise<RFMAnalysis[]> {
  const customers = await db.customers.findMany({
    include: {
      payments: true,
      visits: true,
    }
  });

  const rfmScores = customers.map(customer => {
    // Recency: 最終来店からの日数（少ないほど高スコア）
    const daysSinceLastVisit = customer.lastVisit
      ? differenceInDays(new Date(), customer.lastVisit)
      : 999;
    const recencyScore = daysSinceLastVisit <= 30 ? 5
      : daysSinceLastVisit <= 60 ? 4
      : daysSinceLastVisit <= 90 ? 3
      : daysSinceLastVisit <= 180 ? 2
      : 1;

    // Frequency: 来店回数（多いほど高スコア）
    const visitCount = customer.visits.length;
    const frequencyScore = visitCount >= 20 ? 5
      : visitCount >= 10 ? 4
      : visitCount >= 5 ? 3
      : visitCount >= 2 ? 2
      : 1;

    // Monetary: 累計購買額（多いほど高スコア）
    const totalSpent = customer.totalSpent;
    const monetaryScore = totalSpent >= 500000 ? 5
      : totalSpent >= 200000 ? 4
      : totalSpent >= 100000 ? 3
      : totalSpent >= 50000 ? 2
      : 1;

    // セグメント分類
    let segment = '';
    if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
      segment = 'Champions'; // 最優良顧客
    } else if (recencyScore >= 3 && frequencyScore >= 3) {
      segment = 'Loyal Customers'; // ロイヤル顧客
    } else if (recencyScore >= 4 && frequencyScore <= 2) {
      segment = 'Promising'; // 有望顧客
    } else if (recencyScore <= 2 && frequencyScore >= 3) {
      segment = 'At Risk'; // 離反リスク
    } else if (recencyScore <= 2 && frequencyScore <= 2) {
      segment = 'Lost'; // 離反顧客
    } else {
      segment = 'Others';
    }

    return {
      customerId: customer.id,
      customerName: customer.name,
      recencyScore,
      frequencyScore,
      monetaryScore,
      rfmScore: recencyScore + frequencyScore + monetaryScore,
      segment,
    };
  });

  return rfmScores;
}
```

---

## カテゴリ7: スタッフ管理の拡張（146-150）

### 146: スタッフ権限設定
スタッフごとに細かい権限を設定。

### 147: スタッフパフォーマンス管理
スタッフの売上、施術数、評価を管理。

```typescript
async function getStaffPerformance(input: {
  staffId: string;
  startDate: Date;
  endDate: Date;
}): Promise<StaffPerformance> {
  const [appointments, payments, reviews] = await Promise.all([
    db.appointments.count({
      where: {
        staffId: input.staffId,
        date: { gte: input.startDate, lte: input.endDate },
        status: 'completed',
      }
    }),
    db.payments.aggregate({
      where: {
        appointment: {
          staffId: input.staffId,
          date: { gte: input.startDate, lte: input.endDate },
        },
        status: 'paid',
      },
      _sum: { total: true },
      _avg: { total: true },
    }),
    db.reviews.aggregate({
      where: {
        staffId: input.staffId,
        createdAt: { gte: input.startDate, lte: input.endDate },
      },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  return {
    staffId: input.staffId,
    period: { start: input.startDate, end: input.endDate },
    appointmentCount: appointments,
    totalSales: payments._sum.total || 0,
    averageSale: payments._avg.total || 0,
    averageRating: reviews._avg.rating || 0,
    reviewCount: reviews._count,
  };
}
```

### 148: スタッフ売上管理
スタッフごとの売上を追跡・管理。

### 149: スタッフ勤怠管理
出勤、退勤、休憩を記録。

### 150: スタッフコミッション管理
売上に応じたコミッションを計算・管理。

```typescript
type Commission = {
  id: string;
  staffId: string;
  month: string; // 'YYYY-MM'
  baseSales: number; // 対象売上
  commissionRate: number; // 料率
  commissionAmount: number; // コミッション額
  bonus: number; // ボーナス
  total: number; // 合計
  status: 'pending' | 'approved' | 'paid';
};

async function calculateMonthlyCommission(
  staffId: string,
  month: string
): Promise<Commission> {
  const [startDate, endDate] = getMonthRange(month);

  // 対象売上を集計
  const sales = await db.payments.aggregate({
    where: {
      appointment: {
        staffId,
        date: { gte: startDate, lte: endDate },
      },
      status: 'paid',
    },
    _sum: { total: true },
  });

  const baseSales = sales._sum.total || 0;

  // コミッション料率を決定（段階的）
  let commissionRate = 0.10; // 基本10%
  if (baseSales >= 2000000) commissionRate = 0.15; // 200万以上15%
  else if (baseSales >= 1000000) commissionRate = 0.12; // 100万以上12%

  const commissionAmount = baseSales * commissionRate;

  // ボーナス（目標達成等）
  const bonus = baseSales >= 2000000 ? 50000 : 0;

  const total = commissionAmount + bonus;

  const commission = await db.commissions.create({
    data: {
      staffId,
      month,
      baseSales,
      commissionRate,
      commissionAmount,
      bonus,
      total,
      status: 'pending',
    }
  });

  return commission;
}
```

---

## まとめ: P1機能完結

これで P1（高優先度）の 100 機能（051-150）の設計が完了しました。

### P1機能の特徴
1. **業務効率化**: 日常業務を効率化する機能群
2. **顧客満足度向上**: 顧客体験を向上させる機能
3. **データ活用**: 分析とマーケティングの基盤
4. **差別化**: 競合との差別化要因

### 実装の優先順位
P0の基盤機能が完成した後、ビジネスニーズに応じて P1 機能を順次実装します。

次のステップとして、P2（中優先度）の 150 機能の設計に進みます。
