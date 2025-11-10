import { db } from "./client.js";
import { customersTable } from "./schema/customer.js";

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

async function seed() {
	console.log("Seeding database...");

	// 顧客データを投入
	await db.insert(customersTable).values(customerSeeds);
	console.log(`Inserted ${customerSeeds.length} customers`);

	console.log("Seeding completed!");
	process.exit(0);
}

seed().catch((error) => {
	console.error("Seeding failed:", error);
	process.exit(1);
});
