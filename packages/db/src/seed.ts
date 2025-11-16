import { db } from "./client.js";
import { customersTable } from "./schema/customer.js";
import {
	customerNoteImagesTable,
	customerNotesTable,
} from "./schema/customer-note";
import { staffsTable } from "./schema/staff";

const customerSeeds = [
	{
		customerId: "00000000-0000-0000-0000-000000000001",
		email: "test1@example.com",
		name: "テスト太郎",
		phone: "090-1234-5678",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000002",
		email: "test2@example.com",
		name: "山田花子",
		phone: "080-9876-5432",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000003",
		email: "test3@example.com",
		name: "佐藤次郎",
		phone: null,
	},
	{
		customerId: "00000000-0000-0000-0000-000000000004",
		email: "admin@example.com",
		name: "管理者",
		phone: "070-1111-2222",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000005",
		email: "tanaka@example.com",
		name: "田中一郎",
		phone: "090-5555-6666",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000006",
		email: "suzuki@example.com",
		name: "鈴木三郎",
		phone: "080-7777-8888",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000007",
		email: "watanabe@example.com",
		name: "渡辺美咲",
		phone: "090-9999-0000",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000008",
		email: "kobayashi@example.com",
		name: "小林健太",
		phone: null,
	},
	{
		customerId: "00000000-0000-0000-0000-000000000009",
		email: "kato@example.com",
		name: "加藤さくら",
		phone: "070-2222-3333",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000010",
		email: "yoshida@example.com",
		name: "吉田大輔",
		phone: "090-4444-5555",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000011",
		email: "nakamura@example.com",
		name: "中村美香",
		phone: "080-6666-7777",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000012",
		email: "yamamoto@example.com",
		name: "山本太一",
		phone: null,
	},
	{
		customerId: "00000000-0000-0000-0000-000000000013",
		email: "inoue@example.com",
		name: "井上陽子",
		phone: "090-8888-9999",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000014",
		email: "kimura@example.com",
		name: "木村健一",
		phone: "070-3333-4444",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000015",
		email: "hayashi@example.com",
		name: "林優子",
		phone: "080-1111-2222",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000016",
		email: "saito@example.com",
		name: "斉藤翔太",
		phone: "090-3333-4444",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000017",
		email: "matsumoto@example.com",
		name: "松本あゆみ",
		phone: null,
	},
	{
		customerId: "00000000-0000-0000-0000-000000000018",
		email: "fujita@example.com",
		name: "藤田誠",
		phone: "070-5555-6666",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000019",
		email: "okada@example.com",
		name: "岡田真理子",
		phone: "080-7777-8888",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000020",
		email: "hasegawa@example.com",
		name: "長谷川修平",
		phone: "090-9999-0000",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000021",
		email: "murakami@example.com",
		name: "村上明美",
		phone: "070-1111-2222",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000022",
		email: "endo@example.com",
		name: "遠藤亮介",
		phone: null,
	},
	{
		customerId: "00000000-0000-0000-0000-000000000023",
		email: "ishikawa@example.com",
		name: "石川由美",
		phone: "080-2222-3333",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000024",
		email: "maeda@example.com",
		name: "前田和也",
		phone: "090-4444-5555",
	},
	{
		customerId: "00000000-0000-0000-0000-000000000025",
		email: "fujii@example.com",
		name: "藤井彩",
		phone: "070-6666-7777",
	},
];

// スタッフのseedデータ
const staffSeeds = [
	{
		id: "00000000-0000-0000-0000-000000000001",
		name: "田中 太郎",
	},
	{
		id: "00000000-0000-0000-0000-000000000002",
		name: "山田 花子",
	},
	{
		id: "00000000-0000-0000-0000-000000000003",
		name: "佐藤 次郎",
	},
];

// 顧客ノートのseedデータ（ページネーション検証用：顧客ID 00000000-0000-0000-0000-000000000001 に30件集中）
const customerNoteSeeds = [
	{
		content:
			"初回来店時のカウンセリング。髪質は硬めで癖が強い。希望はナチュラルなストレートヘア。",
		createdAt: new Date("2024-01-15T10:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000001",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"2回目来店。ストレートパーマ施術。仕上がりに満足いただけた様子。次回は3ヶ月後を希望。",
		createdAt: new Date("2024-02-01T14:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000002",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"カラーリング希望。明るめのブラウン系を提案。パッチテスト実施済み。アレルギー反応なし。",
		createdAt: new Date("2024-02-15T11:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000003",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"定期メンテナンスカット。長さはそのままで軽さを出す。レイヤーを入れて動きを出した。",
		createdAt: new Date("2024-03-01T15:45:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000004",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"ショートボブへのスタイルチェンジ希望。前髪は眉上で軽めに。襟足はすっきりと短めにカット。",
		createdAt: new Date("2024-03-15T13:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000005",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"ヘッドスパとトリートメント施術。頭皮の乾燥が気になるとのこと。保湿重視のケアを提案。",
		createdAt: new Date("2024-04-01T16:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000006",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"ブリーチ2回+ハイトーンカラー施術。アッシュグレー系の色味で仕上げ。ダメージケア商品を購入いただいた。",
		createdAt: new Date("2024-04-15T10:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000007",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"前髪カットのみ。眉にかかる長さで自然な流れを作る。次回は全体カット希望。",
		createdAt: new Date("2024-05-01T12:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000008",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"結婚式のためのアップスタイルセット。華やかさと上品さを両立。ヘアアクセサリーとの相性も良好。",
		createdAt: new Date("2024-05-15T09:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000009",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"縮毛矯正リタッチ。根元3cmのみ施術。自然な仕上がりで満足いただけた。",
		createdAt: new Date("2024-06-01T14:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000010",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"グラデーションカラー希望。毛先に向かって明るくなるデザイン。ピンク系の色味をプラス。",
		createdAt: new Date("2024-06-15T11:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000011",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"メンズカット。ビジネスシーンに対応できる清潔感のあるスタイル。サイドは刈り上げ、トップは長めに残す。",
		createdAt: new Date("2024-07-01T15:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000012",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"白髪染め施術。自然な黒髪に近い色味で。生え際までしっかり染まるように丁寧に塗布。",
		createdAt: new Date("2024-07-15T10:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000013",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"パーマスタイル希望。ゆるふわな巻き髪風に。デジタルパーマで長持ちするスタイルを提案。",
		createdAt: new Date("2024-08-01T13:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000014",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"夏に向けて軽めのスタイルにチェンジ。レイヤーをたっぷり入れて動きのあるミディアムヘアに。",
		createdAt: new Date("2024-08-15T16:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000015",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"インナーカラー施術。耳にかけたときに見える程度の控えめなデザイン。ブルー系の色味。",
		createdAt: new Date("2024-09-01T11:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000016",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"就職活動のため黒染め施術。落ち着いた印象になるように調整。トリートメントも併用。",
		createdAt: new Date("2024-09-15T14:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000017",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"ボリュームアップパーマ希望。根元からふんわりと立ち上がるスタイル。スタイリングが楽になったと好評。",
		createdAt: new Date("2024-10-01T10:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000018",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"ハイライト+ローライトのミックスカラー。立体感のある仕上がりに。ブラウン系でまとめて自然な印象。",
		createdAt: new Date("2024-10-15T13:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000019",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"ロングからミディアムへバッサリカット。毛量調整もしっかり行い、軽やかな仕上がりに。",
		createdAt: new Date("2024-11-01T15:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000020",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"酸熱トリートメント施術。ダメージ毛のケアと髪質改善を目的に。ツヤとまとまりが大幅に改善。",
		createdAt: new Date("2024-11-15T11:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000021",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"成人式のヘアセット予約。振袖の色に合わせて華やかなアップスタイルを提案予定。",
		createdAt: new Date("2024-12-01T16:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000022",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"メンズパーマ施術。ナチュラルな動きを出すためのゆるめのパーマ。ビジネスでも使えるスタイル。",
		createdAt: new Date("2024-12-15T12:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000023",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"前髪パーマ施術。流れやすい前髪のクセを活かしつつ、スタイリングしやすい形に。",
		createdAt: new Date("2025-01-05T14:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000024",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"カット+カラー+トリートメントのフルコース。秋冬に向けて落ち着いた暖色系のカラーに。",
		createdAt: new Date("2025-01-20T10:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000025",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"イメージチェンジでベリーショートに。顔の形に合わせて小顔効果のあるスタイルを提案。大満足の様子。",
		createdAt: new Date("2025-02-01T15:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000026",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"カウンセリングのみ。次回の施術に向けて髪質チェックとスタイル相談。パーマかストレートで検討中。",
		createdAt: new Date("2025-02-15T13:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000027",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
	{
		content:
			"リタッチカラー施術。根元の伸びた部分のみ染める。色ムラなく綺麗に仕上がった。",
		createdAt: new Date("2025-03-01T11:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000028",
		staffId: "00000000-0000-0000-0000-000000000002",
	},
	{
		content:
			"年末に向けてのメンテナンスカット。形を整えつつ、毛先の傷んだ部分をカット。トリートメントも実施。",
		createdAt: new Date("2025-03-15T16:00:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000029",
		staffId: "00000000-0000-0000-0000-000000000003",
	},
	{
		content:
			"パーティー用のヘアセット。編み込みとカールを組み合わせた華やかなハーフアップスタイル。",
		createdAt: new Date("2025-04-01T09:30:00"),
		customerId: "00000000-0000-0000-0000-000000000001",
		id: "10000000-0000-0000-0000-000000000030",
		staffId: "00000000-0000-0000-0000-000000000001",
	},
];

const customerNoteImageSeeds = [
	{
		alternativeText: "施術前の髪の状態",
		customerNoteId: "10000000-0000-0000-0000-000000000001",
		displayOrder: 1,
		fileName: "before_photo_001.jpg",
		fileSize: 245678,
		imageUrl: "https://placehold.co/600x800/EEE/31343C.png",
	},
	{
		alternativeText: "施術後のストレートヘア",
		customerNoteId: "10000000-0000-0000-0000-000000000001",
		displayOrder: 2,
		fileName: "after_photo_001.jpg",
		fileSize: 234567,
		imageUrl: "https://placehold.co/600x400/31343C/EEE.png",
	},
	{
		alternativeText: "ストレートパーマ施術の仕上がり",
		customerNoteId: "10000000-0000-0000-0000-000000000002",
		displayOrder: 1,
		fileName: "straight_result_001.jpg",
		fileSize: 312456,
		imageUrl: "https://placehold.co/600x400/FF6B6B/FFF.png",
	},
	{
		alternativeText: "カラーリング前の髪色",
		customerNoteId: "10000000-0000-0000-0000-000000000003",
		displayOrder: 1,
		fileName: "color_before.jpg",
		fileSize: 198765,
		imageUrl: "https://placehold.co/600x400/4ECDC4/FFF.png",
	},
	{
		alternativeText: "明るめブラウンのカラーリング後",
		customerNoteId: "10000000-0000-0000-0000-000000000003",
		displayOrder: 2,
		fileName: "color_after.jpg",
		fileSize: 203456,
		imageUrl: "https://placehold.co/600x400/FFE66D/000.png",
	},
	{
		alternativeText: "ショートボブスタイル",
		customerNoteId: "10000000-0000-0000-0000-000000000005",
		displayOrder: 1,
		fileName: "bob_style.jpg",
		fileSize: 287654,
		imageUrl: "https://placehold.co/600x400/A8E6CF/000.png",
	},
	{
		alternativeText: "ブリーチ1回目の状態",
		customerNoteId: "10000000-0000-0000-0000-000000000007",
		displayOrder: 1,
		fileName: "bleach_process_1.jpg",
		fileSize: 345678,
		imageUrl: "https://placehold.co/600x400/FFD3B6/000.png",
	},
	{
		alternativeText: "ブリーチ2回目の状態",
		customerNoteId: "10000000-0000-0000-0000-000000000007",
		displayOrder: 2,
		fileName: "bleach_process_2.jpg",
		fileSize: 356789,
		imageUrl: "https://placehold.co/600x400/FFAAA5/FFF.png",
	},
	{
		alternativeText: "アッシュグレーの仕上がり",
		customerNoteId: "10000000-0000-0000-0000-000000000007",
		displayOrder: 3,
		fileName: "ash_grey_result.jpg",
		fileSize: 298765,
		imageUrl: "https://placehold.co/600x400/FF8B94/FFF.png",
	},
	{
		alternativeText: "結婚式用アップスタイル 正面",
		customerNoteId: "10000000-0000-0000-0000-000000000009",
		displayOrder: 1,
		fileName: "wedding_upstyle_front.jpg",
		fileSize: 412345,
		imageUrl: "https://placehold.co/600x400/C7CEEA/000.png",
	},
	{
		alternativeText: "結婚式用アップスタイル 側面",
		customerNoteId: "10000000-0000-0000-0000-000000000009",
		displayOrder: 2,
		fileName: "wedding_upstyle_side.jpg",
		fileSize: 423456,
		imageUrl: "https://placehold.co/600x400/B5EAD7/000.png",
	},
	{
		alternativeText: "ピンク系グラデーションカラー",
		customerNoteId: "10000000-0000-0000-0000-000000000011",
		displayOrder: 1,
		fileName: "gradation_color.jpg",
		fileSize: 276543,
		imageUrl: "https://placehold.co/600x400/FFC7C7/000.png",
	},
	{
		alternativeText: "デジタルパーマの仕上がり",
		customerNoteId: "10000000-0000-0000-0000-000000000014",
		displayOrder: 1,
		fileName: "digital_perm_result.jpg",
		fileSize: 298765,
		imageUrl: "https://placehold.co/600x400/E2F0CB/000.png",
	},
	{
		alternativeText: "ブルー系インナーカラー",
		customerNoteId: "10000000-0000-0000-0000-000000000016",
		displayOrder: 1,
		fileName: "inner_color_blue.jpg",
		fileSize: 234567,
		imageUrl: "https://placehold.co/600x400/B4A7D6/FFF.png",
	},
	{
		alternativeText: "ハイライト・ローライトミックスカラー",
		customerNoteId: "10000000-0000-0000-0000-000000000019",
		displayOrder: 1,
		fileName: "highlight_lowlight_mix.jpg",
		fileSize: 312456,
		imageUrl: "https://placehold.co/600x400/D5AAFF/000.png",
	},
	{
		alternativeText: "成人式ヘアスタイルサンプル",
		customerNoteId: "10000000-0000-0000-0000-000000000022",
		displayOrder: 1,
		fileName: "seijinshiki_sample.jpg",
		fileSize: 456789,
		imageUrl: "https://placehold.co/600x400/FFB7B2/000.png",
	},
	{
		alternativeText: "ベリーショートスタイル",
		customerNoteId: "10000000-0000-0000-0000-000000000026",
		displayOrder: 1,
		fileName: "very_short_style.jpg",
		fileSize: 267890,
		imageUrl: "https://placehold.co/600x400/FFDAC1/000.png",
	},
	{
		alternativeText: "パーティー用ハーフアップスタイル 正面",
		customerNoteId: "10000000-0000-0000-0000-000000000030",
		displayOrder: 1,
		fileName: "party_halfup_front.jpg",
		fileSize: 389012,
		imageUrl: "https://placehold.co/600x400/E2ECE9/000.png",
	},
	{
		alternativeText: "パーティー用ハーフアップスタイル 背面",
		customerNoteId: "10000000-0000-0000-0000-000000000030",
		displayOrder: 2,
		fileName: "party_halfup_back.jpg",
		fileSize: 398123,
		imageUrl: "https://placehold.co/600x400/BEE1E6/000.png",
	},
];

async function seed() {
	console.log("Seeding database...");

	// スタッフデータを投入
	await db.insert(staffsTable).values(staffSeeds);
	console.log(`Inserted ${staffSeeds.length} staffs`);

	// 顧客データを投入
	await db.insert(customersTable).values(customerSeeds);
	console.log(`Inserted ${customerSeeds.length} customers`);

	// 顧客ノートデータを投入
	await db.insert(customerNotesTable).values(customerNoteSeeds);
	console.log(`Inserted ${customerNoteSeeds.length} customer notes`);

	// 顧客ノート画像データを投入
	await db.insert(customerNoteImagesTable).values(customerNoteImageSeeds);
	console.log(`Inserted ${customerNoteImageSeeds.length} customer note images`);

	console.log("Seeding completed!");
	process.exit(0);
}

seed().catch((error) => {
	console.error("Seeding failed:", error);
	process.exit(1);
});
