# 151-300: P2 中優先度機能群

このドキュメントには、P2（中優先度）の151番から300番までの150機能の詳細設計をまとめています。

---

## カテゴリ1: 写真・メディア管理（151-170）

### 151-155: 基本写真機能
- **151: 施術前写真撮影** - カメラまたはファイルアップロードで撮影
- **152: 施術後写真撮影** - ビフォーアフター用の写真撮影
- **153: ビフォーアフター比較** - 2枚の写真を並べて比較表示
- **154: 写真タグ付け** - 写真に部位、症状などのタグを付与
- **155: 写真検索** - タグ、日付、顧客で写真を検索

```typescript
type Photo = {
  id: string;
  url: string;
  customerId: string;
  recordId: string | null;
  type: 'before' | 'after' | 'progress' | 'other';
  tags: string[];
  bodyPart: string | null; // '顔', '腕', '脚' など
  notes: string | null;
  takenAt: Date;
  takenBy: string;
};

// 写真アップロード（S3使用）
async function uploadPhoto(file: File, metadata: PhotoMetadata): Promise<Photo> {
  // 画像を圧縮・リサイズ
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
  });

  // S3にアップロード
  const key = `photos/${metadata.customerId}/${generatePhotoId()}.jpg`;
  const url = await uploadToS3(compressed, key);

  // サムネイル生成
  const thumbnail = await generateThumbnail(compressed, 300, 300);
  const thumbnailUrl = await uploadToS3(thumbnail, `${key}-thumb.jpg`);

  // データベースに記録
  const photo = await db.photos.create({
    data: {
      url,
      thumbnailUrl,
      customerId: metadata.customerId,
      recordId: metadata.recordId,
      type: metadata.type,
      tags: metadata.tags,
      bodyPart: metadata.bodyPart,
      takenAt: new Date(),
      takenBy: session.user.id,
    }
  });

  return photo;
}

// ビフォーアフター比較UI
function BeforeAfterComparison({ beforeId, afterId }: { beforeId: string; afterId: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full h-[600px]">
      <img src={beforePhoto.url} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={afterPhoto.url} alt="After" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      />
    </div>
  );
}
```

### 156-165: 高度な写真機能
- **156: 写真アルバム管理** - 写真をアルバムで整理
- **157: 写真共有機能** - 顧客と写真を共有（期限付きリンク）
- **158: 写真印刷** - 写真をプリント
- **159: 動画記録** - 動画の撮影・保存
- **160: 音声メモ記録** - 音声メモの録音
- **161: ドキュメントアップロード** - PDF等のドキュメント保存
- **162: 同意書管理** - デジタル同意書の管理
- **163: 契約書管理** - 契約書のデジタル管理
- **164: 画像圧縮・最適化** - 自動的に画像を最適化
- **165: 画像編集機能** - 簡易的な画像編集（回転、トリミング等）

### 166-170: メディア管理機能
- **166: 画像注釈機能** - 写真に矢印やテキストで注釈
- **167: 画像バージョン管理** - 編集履歴の管理
- **168: クラウドストレージ連携** - Google Drive、Dropbox連携
- **169: 写真自動バックアップ** - 定期的な自動バックアップ
- **170: 写真アクセス権限管理** - スタッフごとの閲覧権限設定

---

## カテゴリ2: 商品・在庫管理（171-190）

### 171-180: 基本在庫機能
```typescript
type Product = {
  id: string;
  sku: string; // 商品コード
  name: string;
  category: string;
  brand: string | null;
  description: string | null;
  unitPrice: number;
  costPrice: number; // 原価
  stock: number; // 在庫数
  unit: string; // 'ml', 'g', 'piece'
  minStockLevel: number; // 最小在庫レベル
  reorderPoint: number; // 発注点
  supplier: string | null; // 仕入先
  barcodeBarcode: string | null;
  expiryDate: Date | null;
  status: 'active' | 'discontinued';
};

// 在庫警告チェック
async function checkLowStockProducts(): Promise<Product[]> {
  const lowStockProducts = await db.products.findMany({
    where: {
      stock: {
        lte: db.products.fields.minStockLevel
      },
      status: 'active',
    }
  });

  // 管理者に通知
  if (lowStockProducts.length > 0) {
    await sendNotification({
      to: 'admin',
      type: 'low_stock_alert',
      data: {
        products: lowStockProducts.map(p => ({
          name: p.name,
          stock: p.stock,
          minLevel: p.minStockLevel,
        }))
      }
    });
  }

  return lowStockProducts;
}
```

- **171: 商品マスタ登録**
- **172: 商品在庫管理**
- **173: 在庫入出庫**
- **174: 在庫アラート**
- **175: 発注管理**
- **176: 仕入管理**
- **177: 棚卸機能**
- **178: 商品販売履歴**
- **179: 商品人気ランキング**
- **180: 商品推奨機能**

### 181-190: 高度な在庫機能
- **181: セット商品管理**
- **182: 商品カテゴリ管理**
- **183: 商品価格管理**
- **184: 商品画像管理**
- **185: 商品説明管理**
- **186: バーコード管理**
- **187: SKU管理**
- **188: ロット管理**
- **189: 消費期限管理**
- **190: 在庫評価**

---

## カテゴリ3: マーケティング・CRM拡張（191-205）

### 191-205: キャンペーン・プロモーション
```typescript
type Campaign = {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'line' | 'push';
  segmentId: string; // 対象セグメント
  content: string;
  scheduledAt: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
};

// キャンペーン実行
async function executeCampaign(campaignId: string) {
  const campaign = await db.campaigns.findUnique({
    where: { id: campaignId },
    include: {
      segment: {
        include: { customers: true }
      }
    }
  });

  for (const customer of campaign.segment.customers) {
    // パーソナライズされたメッセージ
    const personalizedContent = personalizeMessage(campaign.content, customer);

    switch (campaign.type) {
      case 'email':
        await sendEmail({
          to: customer.email,
          subject: campaign.name,
          html: personalizedContent,
        });
        break;
      case 'sms':
        await sendSMS({
          to: customer.mobileNumber,
          message: personalizedContent,
        });
        break;
      case 'line':
        await sendLINEMessage({
          to: customer.lineId,
          message: personalizedContent,
        });
        break;
    }

    // 配信記録
    await db.campaignDeliveries.create({
      data: {
        campaignId,
        customerId: customer.id,
        deliveredAt: new Date(),
        status: 'delivered',
      }
    });
  }

  // キャンペーンステータス更新
  await db.campaigns.update({
    where: { id: campaignId },
    data: {
      status: 'sent',
      metrics: {
        sent: campaign.segment.customers.length,
      }
    }
  });
}
```

- **191: キャンペーン管理**
- **192: プロモーションコード**
- **193: 会員ランク別特典**
- **194: ポイント有効期限管理**
- **195: ポイント交換機能**
- **196: 会員証発行**
- **197: デジタル会員証**
- **198: 顧客行動トラッキング**
- **199: 顧客嗜好分析**
- **200: レコメンド機能**
- **201: クロスセル提案**
- **202: アップセル提案**
- **203: 休眠顧客掘り起こし**
- **204: 来店予測**
- **205: 解約予測**

---

## カテゴリ4: コミュニケーション（206-225）

### 206-215: チャット・メッセージング
```typescript
type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'staff' | 'customer';
  content: string;
  type: 'text' | 'image' | 'file';
  attachments: string[];
  readAt: Date | null;
  createdAt: Date;
};

// リアルタイムチャット（WebSocket使用）
function ChatInterface({ customerId }: { customerId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // WebSocket接続
    const ws = new WebSocket(`${WS_URL}/chat/${customerId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => ws.close();
  }, [customerId]);

  async function sendMessage() {
    const message = await createMessage({
      conversationId: customerId,
      content: newMessage,
      type: 'text',
    });

    setNewMessage('');
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>送信</Button>
        </div>
      </div>
    </div>
  );
}
```

- **206: 顧客チャット機能**
- **207: スタッフ間チャット**
- **208: 社内掲示板**
- **209: お知らせ配信**
- **210: プッシュ通知**
- **211: メール自動返信**
- **212: メールテンプレート管理**
- **213: SMSテンプレート管理**
- **214: LINE連携**
- **215: Slack連携**

### 216-225: サポート・フィードバック
- **216: 問い合わせ管理**
- **217: クレーム管理**
- **218: フィードバック管理**
- **219: レビュー管理**
- **220: ビデオ通話機能**
- **221: オンライン相談**
- **222: チャットボット**
- **223: FAQ管理**
- **224: ナレッジベース**
- **225: コミュニケーション履歴**

---

## カテゴリ5: 分析・レポート拡張（226-245）

### 226-245: 詳細分析機能
```typescript
// コホート分析
async function performCohortAnalysis(input: {
  startDate: Date;
  endDate: Date;
  groupBy: 'month' | 'week';
}): Promise<CohortAnalysis> {
  // 期間内の新規顧客を取得
  const newCustomers = await db.customers.findMany({
    where: {
      createdAt: {
        gte: input.startDate,
        lte: input.endDate,
      }
    },
    include: {
      visits: true,
    }
  });

  // コホートごとにグループ化
  const cohorts = groupCustomersByCohort(newCustomers, input.groupBy);

  // 各コホートのリテンション率を計算
  const analysis = cohorts.map(cohort => {
    const retentionByPeriod = [];

    for (let period = 0; period < 12; period++) {
      const periodStart = addMonths(cohort.startDate, period);
      const periodEnd = addMonths(cohort.startDate, period + 1);

      const activeCustomers = cohort.customers.filter(customer => {
        return customer.visits.some(visit =>
          isWithinInterval(visit.date, { start: periodStart, end: periodEnd })
        );
      });

      const retentionRate = activeCustomers.length / cohort.customers.length;
      retentionByPeriod.push({
        period,
        customerCount: activeCustomers.length,
        retentionRate,
      });
    }

    return {
      cohortName: format(cohort.startDate, 'yyyy-MM'),
      startDate: cohort.startDate,
      initialCustomers: cohort.customers.length,
      retentionByPeriod,
    };
  });

  return { cohorts: analysis };
}
```

- **226: 予約分析**
- **227: キャンセル率分析**
- **228: 稼働率分析**
- **229: 商品別売上**
- **230: カテゴリ別売上**
- **231: 客単価分析**
- **232: 購買バスケット分析**
- **233: 時系列分析**
- **234: トレンド分析**
- **235: 予測分析**
- **236: 比較分析（前年同月等）**
- **237: ABC分析**
- **238: パレート分析**
- **239: 地域別分析**
- **240: 年齢層別分析**
- **241: 性別分析**
- **242: 流入経路分析**
- **243: コンバージョン分析**
- **244: ROI分析**
- **245: KPI管理**

---

## カテゴリ6: セキュリティ・コンプライアンス（246-265）

### 246-255: 認証・アクセス制御
```typescript
// 2要素認証
async function enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
  const secret = generateTOTPSecret();

  // QRコード生成
  const qrCode = await generateQRCode({
    issuer: 'CustomerRecord',
    label: userId,
    secret,
  });

  // シークレットを保存（暗号化）
  await db.users.update({
    where: { id: userId },
    data: {
      twoFactorSecret: await encrypt(secret),
      twoFactorEnabled: false, // 検証後に有効化
    }
  });

  return { secret, qrCode };
}

async function verify2FA(userId: string, token: string): Promise<boolean> {
  const user = await db.users.findUnique({ where: { id: userId } });

  if (!user.twoFactorSecret) {
    return false;
  }

  const secret = await decrypt(user.twoFactorSecret);
  const isValid = verifyTOTP(token, secret);

  if (isValid && !user.twoFactorEnabled) {
    // 初回検証成功時に有効化
    await db.users.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });
  }

  return isValid;
}
```

- **246: 2要素認証**
- **247: IPアドレス制限**
- **248: デバイス認証**
- **249: 不正ログイン検知**
- **250: パスワードポリシー設定**
- **251: 個人情報マスキング**
- **252: データ保持期限設定**
- **253: データ削除リクエスト対応**
- **254: アクセスログ詳細**
- **255: 操作ログ詳細**

### 256-265: コンプライアンス
- **256: GDPR対応**
- **257: HIPAA対応**
- **258: 同意管理**
- **259: プライバシーポリシー管理**
- **260: 利用規約管理**
- **261: データ匿名化**
- **262: データ仮名化**
- **263: セキュリティ診断**
- **264: 脆弱性スキャン**
- **265: ペネトレーションテスト記録**

---

## カテゴリ7: スタッフ管理拡張（266-280）

### 266-280: 詳細スタッフ管理
```typescript
type StaffProfile = {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  specialties: string[]; // 得意分野
  certifications: Certification[]; // 資格
  experience: number; // 経験年数
  languages: string[]; // 対応言語
  workingHours: WorkingHours[];
  holidaySchedule: Date[];
  rating: number;
  reviewCount: number;
};

type Certification = {
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate: Date | null;
  certificateUrl: string | null;
};

// スタッフスケジュール管理
async function setStaffSchedule(input: {
  staffId: string;
  date: Date;
  shifts: Shift[];
}) {
  // シフトの重複チェック
  const hasOverlap = checkShiftOverlap(input.shifts);
  if (hasOverlap) {
    throw new Error('Shift overlap detected');
  }

  await db.staffSchedules.create({
    data: {
      staffId: input.staffId,
      date: input.date,
      shifts: input.shifts,
    }
  });

  // スタッフに通知
  await sendNotification({
    to: input.staffId,
    type: 'schedule_updated',
    message: `${format(input.date, 'yyyy-MM-dd')}のシフトが更新されました`,
  });
}
```

- **266: スタッフプロフィール**
- **267: スタッフスキル管理**
- **268: スタッフ資格管理**
- **269: スタッフトレーニング記録**
- **270: スタッフ評価**
- **271: スタッフ目標管理**
- **272: スタッフメッセージング**
- **273: スタッフスケジュール共有**
- **274: スタッフ休暇管理**
- **275: スタッフタスク管理**
- **276: スタッフTo-Doリスト**
- **277: スタッフノート**
- **278: スタッフ間引き継ぎ**
- **279: スタッフ顧客担当設定**
- **280: スタッフ顧客レビュー**

---

## カテゴリ8: 統合・連携（281-300）

### 281-300: 外部サービス連携
```typescript
// Google Calendar連携
async function syncToGoogleCalendar(appointment: Appointment) {
  const oauth2Client = getGoogleOAuthClient();

  const event = {
    summary: `予約: ${appointment.customer.name}`,
    description: `サービス: ${appointment.services.join(', ')}`,
    start: {
      dateTime: appointment.date.toISOString(),
      timeZone: 'Asia/Tokyo',
    },
    end: {
      dateTime: addMinutes(appointment.date, appointment.duration).toISOString(),
      timeZone: 'Asia/Tokyo',
    },
    attendees: [
      { email: appointment.customer.email },
      { email: appointment.staff.email },
    ],
  };

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  // Google Calendar Event IDを保存
  await db.appointments.update({
    where: { id: appointment.id },
    data: {
      googleCalendarEventId: response.data.id,
    }
  });
}

// Stripe連携
async function processStripePayment(input: {
  amount: number;
  customerId: string;
  paymentMethodId: string;
}): Promise<PaymentResult> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(input.amount * 100),
    currency: 'jpy',
    payment_method: input.paymentMethodId,
    confirm: true,
    metadata: {
      customerId: input.customerId,
    }
  });

  if (paymentIntent.status === 'succeeded') {
    await createPayment({
      customerId: input.customerId,
      amount: input.amount,
      paymentMethod: 'credit',
      stripePaymentIntentId: paymentIntent.id,
      status: 'paid',
    });

    return { success: true };
  }

  return { success: false, error: 'Payment failed' };
}

// Webhook処理
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;
  }
}
```

- **281: カレンダー連携（Google/Outlook）**
- **282: 会計ソフト連携**
- **283: POSシステム連携**
- **284: 決済代行サービス連携**
- **285: メール配信サービス連携**
- **286: SMS配信サービス連携**
- **287: クラウドストレージ連携**
- **288: CRM連携**
- **289: MA（マーケティングオートメーション）連携**
- **290: 電子カルテ連携**
- **291: API提供**
- **292: Webhook設定**
- **293: Zapier連携**
- **294: IFTTT連携**
- **295: CSV一括操作**
- **296: Excel連携**
- **297: Google Sheets連携**
- **298: Salesforce連携**
- **299: HubSpot連携**
- **300: 外部レビューサイト連携**

---

## まとめ: P2機能完結

これで P2（中優先度）の 150 機能（151-300）の設計が完了しました。

### P2機能の特徴
1. **利便性向上**: 業務をさらに効率化し、使いやすくする機能群
2. **差別化**: 競合との差別化を図る高度な機能
3. **統合**: 外部サービスとの連携でエコシステムを構築
4. **拡張性**: ビジネスの成長に合わせて追加できる機能

### 実装の優先順位
P0、P1の機能が安定稼働した後、ビジネス戦略に応じて P2 機能を選択的に実装します。

次のステップとして、P3（低優先度）の 125 機能の設計に進みます。
