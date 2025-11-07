# 301-425: P3 低優先度機能群（完結編）

このドキュメントには、P3（低優先度）の301番から425番までの125機能の詳細設計をまとめています。これで全425機能が完結します。

---

## カテゴリ1: AI・自動化（301-330）

### 301-315: AI支援機能

```typescript
// AI施術提案
async function getAITreatmentRecommendation(input: {
  customerId: string;
  concerns: string[];
  budget?: number;
}): Promise<TreatmentRecommendation[]> {
  const customer = await db.customers.findUnique({
    where: { id: input.customerId },
    include: {
      records: { orderBy: { recordDate: 'desc' }, take: 10 },
      visits: { orderBy: { date: 'desc' }, take: 20 },
    }
  });

  // OpenAI APIを使用
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'あなたは美容・健康分野の専門家です。顧客の履歴に基づいて最適な施術を提案してください。'
      },
      {
        role: 'user',
        content: `
顧客情報:
- 年齢: ${calculateAge(customer.dateOfBirth)}
- 過去の施術: ${customer.records.map(r => r.content).join(', ')}
- 悩み: ${input.concerns.join(', ')}
- 予算: ${input.budget ? `¥${input.budget}` : '指定なし'}

最適な施術プランを3つ提案してください。各提案には以下を含めてください:
1. 施術名
2. 期待される効果
3. 推奨される施術頻度
4. 概算費用
        `
      }
    ],
  });

  // AIの提案をパース
  const recommendations = parseAIRecommendations(completion.choices[0].message.content);

  return recommendations;
}
```

- **301: AI施術提案** - 顧客の悩みや履歴から最適な施術を提案
- **302: AI在庫予測** - 過去の使用パターンから在庫を予測
- **303: AI価格最適化** - 需要に応じた動的価格設定
- **304: AI需要予測** - 予約需要を予測してリソース配分
- **305: AI異常検知** - 売上や顧客行動の異常を検知
- **306: AIチャットボット** - 顧客からの問い合わせに自動応答
- **307: AI画像認識** - 施術前後の写真から変化を定量化
- **308: AI音声認識** - カルテの音声入力を自動的にテキスト化
- **309: AI文章生成** - カルテやレポートの下書きを自動生成
- **310: AIレコメンド** - 顧客に合った製品や施術を推奨

### 316-330: 自動化機能
```typescript
// ワークフロー自動化
type Workflow = {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  active: boolean;
};

type WorkflowTrigger = {
  type: 'appointment_created' | 'payment_completed' | 'customer_created' | 'time_based';
  config: Record<string, any>;
};

type WorkflowAction = {
  type: 'send_email' | 'send_sms' | 'create_task' | 'update_customer' | 'webhook';
  config: Record<string, any>;
};

// ワークフロー例: 予約確定時の自動処理
const appointmentWorkflow: Workflow = {
  id: 'wf-001',
  name: '予約確定時の自動処理',
  trigger: {
    type: 'appointment_created',
    config: {}
  },
  conditions: [
    { field: 'status', operator: 'equals', value: 'confirmed' }
  ],
  actions: [
    {
      type: 'send_email',
      config: {
        template: 'appointment-confirmation',
        to: '{{customer.email}}'
      }
    },
    {
      type: 'send_sms',
      config: {
        message: 'ご予約ありがとうございます。{{appointment.date}}にお待ちしております。',
        to: '{{customer.phoneNumber}}'
      }
    },
    {
      type: 'create_task',
      config: {
        title: '予約前日リマインダー送信',
        assignee: 'system',
        dueDate: '{{appointment.date - 1day}}'
      }
    }
  ],
  active: true,
};

async function executeWorkflow(workflow: Workflow, context: Record<string, any>) {
  // 条件チェック
  const conditionsMet = workflow.conditions.every(condition =>
    evaluateCondition(condition, context)
  );

  if (!conditionsMet) {
    return;
  }

  // アクション実行
  for (const action of workflow.actions) {
    await executeAction(action, context);
  }
}
```

- **311: 自動カルテ入力補助** - 音声や定型文からカルテを自動作成
- **312: 自動スケジューリング** - AIが最適なスケジュールを提案
- **313: 自動リマインダー最適化** - 顧客ごとに最適なタイミングでリマインダー
- **314: 自動セグメント作成** - 行動パターンから自動でセグメント作成
- **315: 自動レポート生成** - 定期的にレポートを自動生成・配信
- **316: OCR（文字認識）** - 紙の書類をスキャンしてデジタル化
- **317: 顔認証** - 顔認証でチェックイン
- **318: 音声入力** - カルテを音声で入力
- **319: 自動翻訳** - 多言語対応の自動翻訳
- **320: 感情分析** - 顧客レビューの感情を分析
- **321: トレンド予測** - 業界トレンドを予測
- **322: RPA連携** - 定型業務をRPAで自動化
- **323: ワークフロー自動化** - カスタムワークフローの自動実行
- **324: 承認フロー自動化** - 条件に応じて自動承認
- **325: タスク自動割り当て** - 適切なスタッフに自動でタスク割り当て
- **326: 自動フォローアップ** - 施術後の自動フォローアップメッセージ
- **327: 自動ランク更新** - 顧客ランクを自動的に更新
- **328: 自動ポイント付与** - 条件に応じて自動でポイント付与
- **329: 自動クーポン発行** - 誕生日や記念日に自動でクーポン発行
- **330: 自動レビュー依頼** - 施術後に自動でレビューを依頼

---

## カテゴリ2: モバイル・アクセシビリティ（331-350）

### 331-340: モバイルアプリ機能
```typescript
// React Native / Expo でのモバイルアプリ
function MobileApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} />
        <Stack.Screen name="Records" component={RecordsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// プッシュ通知（Firebase Cloud Messaging）
async function sendPushNotification(userId: string, message: string) {
  const tokens = await db.deviceTokens.findMany({
    where: { userId }
  });

  const messaging = getMessaging();

  for (const token of tokens) {
    await messaging.send({
      token: token.fcmToken,
      notification: {
        title: 'お知らせ',
        body: message,
      },
      data: {
        type: 'appointment_reminder',
      }
    });
  }
}

// オフライン対応（IndexedDB使用）
async function syncOfflineData() {
  const offlineQueue = await db.offlineQueue.findMany();

  for (const item of offlineQueue) {
    try {
      await syncItemToServer(item);
      await db.offlineQueue.delete({ where: { id: item.id } });
    } catch (error) {
      console.error('Sync failed', error);
    }
  }
}
```

- **331: モバイルアプリ（iOS）**
- **332: モバイルアプリ（Android）**
- **333: オフライン対応** - ネットワークなしでも基本機能が使える
- **334: プッシュ通知（モバイル）**
- **335: 位置情報サービス** - 店舗への道案内
- **336: QRコードスキャン** - 会員証やクーポンのQRコード読み取り
- **337: モバイル決済** - Apple Pay、Google Pay対応
- **338: タブレット最適化** - タブレットUIの最適化
- **339: スマートウォッチ対応** - Apple Watch、Wear OS対応
- **340: 音声アシスタント連携** - Siri、Google Assistant連携

### 341-350: アクセシビリティ
```typescript
// アクセシビリティ対応
function AccessibleButton({ label, onPress }: AccessibleButtonProps) {
  return (
    <button
      onClick={onPress}
      aria-label={label}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onPress();
        }
      }}
    >
      {label}
    </button>
  );
}

// スクリーンリーダー対応
function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <div
      role="article"
      aria-label={`顧客: ${customer.name}, 最終来店: ${formatDate(customer.lastVisit)}`}
    >
      <h3>{customer.name}</h3>
      <p aria-label="最終来店日">{formatDate(customer.lastVisit)}</p>
    </div>
  );
}

// キーボードナビゲーション
function DataTable({ data }: DataTableProps) {
  const [focusedRow, setFocusedRow] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setFocusedRow(prev => Math.min(prev + 1, data.length - 1));
      } else if (e.key === 'ArrowUp') {
        setFocusedRow(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.length]);

  return (
    <table>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={row.id}
            tabIndex={0}
            className={index === focusedRow ? 'focused' : ''}
          >
            <td>{row.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- **341: ダークモード** - 目に優しいダークモード
- **342: アクセシビリティ対応（WCAG）** - WCAG 2.1レベルAA準拠
- **343: スクリーンリーダー対応**
- **344: キーボードナビゲーション** - マウスなしでも操作可能
- **345: 高コントラストモード**
- **346: フォントサイズ調整** - 拡大縮小機能
- **347: 色覚異常対応** - 色覚に配慮した配色
- **348: 多言語切り替え** - 複数言語への切り替え
- **349: RTL（右から左）言語対応** - アラビア語等への対応
- **350: ジェスチャー操作** - スワイプ、ピンチなどのジェスチャー

---

## カテゴリ3: カスタマイズ・設定（351-370）

### 351-370: システムカスタマイズ
```typescript
// カスタムフィールド
type CustomField = {
  id: string;
  entityType: 'customer' | 'record' | 'appointment';
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: string[]; // selectの場合
  required: boolean;
  defaultValue?: any;
};

async function addCustomField(field: CustomField) {
  await db.customFields.create({ data: field });

  // スキーママイグレーション（実際にはカラム追加ではなくJSONB等で柔軟に対応）
  // PostgreSQLのJSONBカラムに保存
}

// カスタムフォーム
type CustomForm = {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  validations: FormValidation[];
};

type FormField = {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  order: number;
};

// ドラッグ&ドロップでフォームを作成
function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>([]);

  const addField = (type: string) => {
    setFields([...fields, {
      id: generateId(),
      label: `新しいフィールド ${fields.length + 1}`,
      type,
      required: false,
      order: fields.length,
    }]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4">
          <h3>フィールドタイプ</h3>
          <div className="space-y-2">
            <Button onClick={() => addField('text')}>テキスト</Button>
            <Button onClick={() => addField('number')}>数値</Button>
            <Button onClick={() => addField('date')}>日付</Button>
            <Button onClick={() => addField('select')}>選択</Button>
          </div>
        </div>
        <div className="border p-4">
          <h3>フォームプレビュー</h3>
          <DraggableFormFields fields={fields} onReorder={setFields} />
        </div>
      </div>
    </DndProvider>
  );
}
```

- **351: カスタムフィールド追加** - 独自のフィールドを追加
- **352: カスタムフォーム作成** - ドラッグ&ドロップでフォーム作成
- **353: カスタムレポート作成** - 独自のレポートを作成
- **354: カスタムダッシュボード** - ウィジェットを自由に配置
- **355: カスタムワークフロー** - 業務フローをカスタマイズ
- **356: カスタム通知ルール** - 通知条件を自由に設定
- **357: カスタム権限設定** - 細かい権限設定
- **358: カスタムタグ管理** - 独自のタグ体系
- **359: カスタムカテゴリ** - 独自のカテゴリ分類
- **360: カスタムステータス** - 独自のステータス定義
- **361: テーマカスタマイズ** - 色やフォントのカスタマイズ
- **362: ロゴ設定** - 独自ロゴの設定
- **363: カラースキーム設定** - ブランドカラーの設定
- **364: レイアウト設定** - レイアウトのカスタマイズ
- **365: メニューカスタマイズ** - メニュー項目のカスタマイズ
- **366: ウィジェット管理** - ダッシュボードウィジェットの管理
- **367: ショートカット設定** - キーボードショートカット設定
- **368: デフォルト設定** - 各種デフォルト値の設定
- **369: テンプレートカスタマイズ** - メールやドキュメントのテンプレート
- **370: 印刷フォーマット設定** - 領収書等の印刷フォーマット

---

## カテゴリ4: 高度な分析（371-385）

### 371-385: 機械学習・予測分析
```typescript
// 予測モデル（Python + scikit-learn）
// Next.jsから Python APIを呼び出し
async function predictChurnRisk(customerId: string): Promise<ChurnPrediction> {
  const customer = await getCustomerFeatures(customerId);

  // Python APIに予測リクエスト
  const response = await fetch(`${ML_API_URL}/predict/churn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features: customer }),
  });

  const prediction = await response.json();

  return {
    customerId,
    churnRisk: prediction.probability,
    riskLevel: prediction.probability > 0.7 ? 'high'
      : prediction.probability > 0.4 ? 'medium'
      : 'low',
    factors: prediction.feature_importance,
    recommendations: generateRetentionStrategies(prediction),
  };
}

// A/Bテスト
type ABTest = {
  id: string;
  name: string;
  variants: Variant[];
  metric: string; // 'conversion_rate', 'revenue', etc.
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'running' | 'completed';
  results: ABTestResults | null;
};

type Variant = {
  id: string;
  name: string;
  weight: number; // 配分率（0-100）
  config: Record<string, any>;
};

async function assignVariant(testId: string, userId: string): Promise<Variant> {
  // 既に割り当て済みかチェック
  const existing = await db.abTestAssignments.findFirst({
    where: { testId, userId }
  });

  if (existing) {
    return existing.variant;
  }

  // ランダムに variant を割り当て
  const test = await db.abTests.findUnique({
    where: { id: testId },
    include: { variants: true }
  });

  const random = Math.random() * 100;
  let cumulative = 0;

  for (const variant of test.variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      await db.abTestAssignments.create({
        data: {
          testId,
          userId,
          variantId: variant.id,
        }
      });

      return variant;
    }
  }

  return test.variants[0]; // フォールバック
}

// ヒートマップ
async function generateHeatmap(input: {
  page: string;
  startDate: Date;
  endDate: Date;
}): Promise<Heatmap> {
  // クリックイベントを集計
  const clicks = await db.clickEvents.groupBy({
    by: ['x', 'y'],
    where: {
      page: input.page,
      timestamp: {
        gte: input.startDate,
        lte: input.endDate,
      }
    },
    _count: true,
  });

  // ヒートマップデータに変換
  const heatmapData = clicks.map(click => ({
    x: click.x,
    y: click.y,
    value: click._count,
  }));

  return {
    page: input.page,
    data: heatmapData,
    maxValue: Math.max(...heatmapData.map(d => d.value)),
  };
}
```

- **371: 機械学習モデル適用** - カスタムMLモデルの適用
- **372: 予測モデル構築** - 独自の予測モデル構築
- **373: クラスタリング分析** - 顧客をクラスタリング
- **374: A/Bテスト機能** - 施策の効果を検証
- **375: マルチバリエートテスト** - 複数要素を同時テスト
- **376: ファネル分析** - コンバージョンファネルの分析
- **377: パス分析** - ユーザー行動パスの分析
- **378: ヒートマップ** - クリック位置のヒートマップ
- **379: セッション録画** - ユーザーセッションの録画
- **380: ユーザー行動フロー** - 行動フローの可視化
- **381: リテンション分析** - 継続率の分析
- **382: エンゲージメント分析** - エンゲージメントスコア
- **383: アトリビューション分析** - 貢献度分析
- **384: センチメント分析** - レビューの感情分析
- **385: ソーシャルリスニング** - SNSでのブランド言及を監視

---

## カテゴリ5: 高度な顧客管理（386-395）

### 386-395: 顧客エクスペリエンス管理
```typescript
// 顧客ジャーニーマップ
type CustomerJourney = {
  customerId: string;
  stages: JourneyStage[];
  currentStage: string;
  touchpoints: Touchpoint[];
  painPoints: string[];
  opportunities: string[];
};

type JourneyStage = {
  name: string; // 'awareness', 'consideration', 'purchase', 'retention', 'advocacy'
  enteredAt: Date | null;
  completedAt: Date | null;
  events: JourneyEvent[];
};

type Touchpoint = {
  type: 'website' | 'email' | 'phone' | 'instore' | 'social';
  timestamp: Date;
  details: string;
};

// NPS（Net Promoter Score）
async function calculateNPS(startDate: Date, endDate: Date): Promise<NPSResult> {
  const surveys = await db.npsSurveys.findMany({
    where: {
      completedAt: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  const promoters = surveys.filter(s => s.score >= 9).length;
  const passives = surveys.filter(s => s.score >= 7 && s.score <= 8).length;
  const detractors = surveys.filter(s => s.score <= 6).length;

  const nps = ((promoters - detractors) / surveys.length) * 100;

  return {
    nps: Math.round(nps),
    promoters,
    passives,
    detractors,
    totalResponses: surveys.length,
    breakdown: {
      promoterRate: (promoters / surveys.length) * 100,
      passiveRate: (passives / surveys.length) * 100,
      detractorRate: (detractors / surveys.length) * 100,
    }
  };
}
```

- **386: 顧客ジャーニーマップ** - 顧客体験を可視化
- **387: 顧客ライフサイクル管理** - ライフサイクルステージの管理
- **388: 顧客価値スコアリング** - 顧客の価値をスコア化
- **389: 顧客エンゲージメントスコア** - エンゲージメントを数値化
- **390: NPS（Net Promoter Score）** - 顧客ロイヤルティ測定
- **391: CSAT（顧客満足度）** - 顧客満足度調査
- **392: CES（顧客努力指標）** - サービスの使いやすさ測定
- **393: 顧客健康スコア** - 顧客の健全性をスコア化
- **394: チャーンリスクスコア** - 離反リスクの予測
- **395: アップセル可能性スコア** - アップセル機会の特定

---

## カテゴリ6: 高度な予約管理（396-405）

### 396-405: リソース管理・最適化
- **396: リソース管理（部屋・機器）** - 部屋や機器の予約管理
- **397: 複雑な予約ルール設定** - 高度な予約制約の設定
- **398: 予約最適化アルゴリズム** - AIによる最適なスケジューリング
- **399: 動的価格設定** - 需要に応じた価格変動
- **400: ピーク時料金** - 混雑時の料金上乗せ
- **401: 早期予約割引** - 早期予約の割引
- **402: 直前予約割引** - 空き枠埋めの割引
- **403: パッケージ予約** - 複数施術のパッケージ予約
- **404: サブスクリプション予約** - 月額制の予約プラン
- **405: 予約譲渡機能** - 予約の他者への譲渡

---

## カテゴリ7: 高度なコミュニケーション（406-415）

### 406-415: リッチコミュニケーション
- **406: ビデオメッセージ** - ビデオメッセージの送受信
- **407: 音声メッセージ** - ボイスメッセージ
- **408: 画面共有** - リモートサポート用の画面共有
- **409: 共同編集機能** - ドキュメントの共同編集
- **410: コメントスレッド** - スレッド形式のコメント
- **411: メンション機能** - @メンションで通知
- **412: リアクション機能** - 絵文字リアクション
- **413: ステータス表示** - オンライン/オフラインステータス
- **414: プレゼンスインジケーター** - リアルタイムのプレゼンス表示
- **415: 既読通知** - メッセージ既読の確認

---

## カテゴリ8: その他高度機能（416-425）

### 416-425: エンタープライズ機能
```typescript
// 多店舗管理
type Store = {
  id: string;
  code: string;
  name: string;
  type: 'flagship' | 'branch' | 'franchise';
  parentStoreId: string | null; // 本部店舗
  address: Address;
  settings: StoreSettings;
  staff: Staff[];
  inventory: StoreInventory[];
};

// 店舗間在庫移動
async function transferInventory(input: {
  fromStoreId: string;
  toStoreId: string;
  items: { productId: string; quantity: number }[];
}): Promise<InventoryTransfer> {
  const transfer = await db.transaction(async (tx) => {
    // 転送記録作成
    const transferRecord = await tx.inventoryTransfers.create({
      data: {
        fromStoreId: input.fromStoreId,
        toStoreId: input.toStoreId,
        items: input.items,
        status: 'pending',
        createdAt: new Date(),
      }
    });

    // 出庫処理（from店舗）
    for (const item of input.items) {
      await tx.storeInventory.update({
        where: {
          storeId_productId: {
            storeId: input.fromStoreId,
            productId: item.productId,
          }
        },
        data: {
          quantity: { decrement: item.quantity }
        }
      });
    }

    // 入庫処理（to店舗）
    for (const item of input.items) {
      await tx.storeInventory.upsert({
        where: {
          storeId_productId: {
            storeId: input.toStoreId,
            productId: item.productId,
          }
        },
        create: {
          storeId: input.toStoreId,
          productId: item.productId,
          quantity: item.quantity,
        },
        update: {
          quantity: { increment: item.quantity }
        }
      });
    }

    return transferRecord;
  });

  return transfer;
}

// ホワイトラベル
type WhiteLabelConfig = {
  tenantId: string;
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  domain: string; // カスタムドメイン
  features: string[]; // 有効化する機能
};

async function applyWhiteLabel(config: WhiteLabelConfig) {
  // CSS変数を動的に設定
  document.documentElement.style.setProperty('--primary-color', config.branding.primaryColor);
  document.documentElement.style.setProperty('--secondary-color', config.branding.secondaryColor);

  // ロゴを差し替え
  const logoElements = document.querySelectorAll('.brand-logo');
  logoElements.forEach(el => {
    (el as HTMLImageElement).src = config.branding.logo;
  });
}
```

- **416: 多店舗管理** - 複数店舗の一元管理
- **417: フランチャイズ管理** - フランチャイズ本部と加盟店の管理
- **418: 本部・店舗連携** - 本部からの一括管理
- **419: 店舗間在庫移動** - 店舗間の在庫移動
- **420: 店舗間顧客共有** - 顧客情報の店舗間共有
- **421: グループ会社連携** - グループ企業間のデータ連携
- **422: 多通貨対応** - 複数通貨での会計処理
- **423: 多税率対応** - 軽減税率等への対応
- **424: ホワイトラベル対応** - ブランディングのカスタマイズ
- **425: API制限・クォータ管理** - API使用量の制限と管理

---

## 全425機能完結！

### 機能の総括

#### P0（最優先）: 50機能
システムの基盤となる必須機能。これらがないとビジネスが成立しない。

#### P1（高優先度）: 100機能
業務効率化と顧客満足度向上に直結する機能。競争力の源泉。

#### P2（中優先度）: 150機能
利便性を向上させ、差別化を図る機能。ビジネスの成長に貢献。

#### P3（低優先度）: 125機能
あると便利だが、必須ではない機能。将来の拡張性を確保。

### 実装の推奨アプローチ

1. **フェーズ1（3-6ヶ月）**: P0の50機能を実装
   - MVP（最小実行可能製品）として市場投入
   - 基本的な顧客カルテシステムとして機能

2. **フェーズ2（6-12ヶ月）**: P1の100機能を順次追加
   - 顧客からのフィードバックを元に優先順位を調整
   - 競合との差別化を図る

3. **フェーズ3（12-24ヶ月）**: P2の150機能を選択的に実装
   - ビジネス戦略に応じて必要な機能を追加
   - エンタープライズ顧客への対応

4. **フェーズ4（24ヶ月以降）**: P3の125機能を必要に応じて実装
   - 市場の成熟に合わせて高度な機能を追加
   - イノベーションの継続

### 成功のための重要ポイント

1. **ユーザーフィードバック**: 実際のユーザーからのフィードバックを重視
2. **アジャイル開発**: 短いイテレーションで継続的に改善
3. **データドリブン**: 利用データを分析して機能の優先順位を決定
4. **スケーラビリティ**: 将来の成長を見据えた設計
5. **セキュリティファースト**: セキュリティを最優先事項として扱う
6. **ユーザビリティ**: 使いやすさを常に意識
7. **パフォーマンス**: 快適な操作性を維持
8. **保守性**: 長期的なメンテナンスを考慮した設計

これで、顧客カルテシステムに必要な **425機能すべての詳細設計** が完成しました！
