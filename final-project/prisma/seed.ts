/**
 * Database seed script
 * 
 * This script creates seed data for development and testing:
 * - System user (for system tags)
 * - Multiple wallets
 * - Transactions with payers and shares
 * - Custom tags
 * - System tags (using existing repository logic)
 * 
 * Run with: npm run seed
 */

import { PrismaClient } from "@prisma/client";
import { SYSTEM_USER_ID, DEFAULT_SYSTEM_TAGS, DEFAULT_SYSTEM_INCOME_TAGS } from "../config/constants";
import { tagRepository } from "../modules/tag/repositories/tag.repository";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Ensure system user exists
  const systemUser = await prisma.user.upsert({
    where: { id: SYSTEM_USER_ID },
    update: {},
    create: {
      id: SYSTEM_USER_ID,
      name: "System",
      isDeleted: false,
    },
  });
  console.log("✅ System user created/verified");

  // Create regular users with simple IDs
  const user1 = await prisma.user.upsert({
    where: { id: "user-1" },
    update: {},
    create: {
      id: "user-1",
      userID: "user1",
      name: "User One",
      email: "user1@example.com",
      isDeleted: false,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { id: "user-2" },
    update: {},
    create: {
      id: "user-2",
      userID: "user2",
      name: "User Two",
      email: "user2@example.com",
      isDeleted: false,
    },
  });
  console.log("✅ Regular users created");

  // Ensure all system tags exist using repository logic
  await tagRepository.ensureSystemTagsExist();
  console.log("✅ System tags created/verified");

  // Get system tags for use in transactions
  const systemTags = await Promise.all(
    DEFAULT_SYSTEM_TAGS.slice(0, 3).map(async (tagName) => {
      const tag = await prisma.tag.findUnique({
        where: { name: tagName },
      });
      if (!tag) {
        throw new Error(`System tag ${tagName} not found after creation`);
      }
      return tag;
    })
  );

  // Create custom tags
  const customTag1 = await prisma.tag.upsert({
    where: { name: "custom-tag-1" },
    update: {},
    create: {
      name: "custom-tag-1",
      createdBy: user1.id,
    },
  });

  const customTag2 = await prisma.tag.upsert({
    where: { name: "custom-tag-2" },
    update: {},
    create: {
      name: "custom-tag-2",
      createdBy: user1.id,
    },
  });

  // Create custom income tags
  const customIncomeTag1 = await prisma.tag.upsert({
    where: { name: "custom-income-tag-1" },
    update: {},
    create: {
      name: "custom-income-tag-1",
      createdBy: user1.id,
    },
  });

  const customIncomeTag2 = await prisma.tag.upsert({
    where: { name: "custom-income-tag-2" },
    update: {},
    create: {
      name: "custom-income-tag-2",
      createdBy: user1.id,
    },
  });

  // Update custom tags to have correct types
  await prisma.$executeRaw`UPDATE "Tag" SET type = 'EXPENSE' WHERE name IN ('custom-tag-1', 'custom-tag-2')`;
  await prisma.$executeRaw`UPDATE "Tag" SET type = 'INCOME' WHERE name IN ('custom-income-tag-1', 'custom-income-tag-2')`;
  console.log("✅ Custom tags created");

  // Create wallets with simple IDs
  const wallet1 = await prisma.wallet.upsert({
    where: { id: "wallet-1" },
    update: {},
    create: {
      id: "wallet-1",
      name: "Personal Wallet",
      defaultCurrency: "TWD",
    },
  });

  const wallet2 = await prisma.wallet.upsert({
    where: { id: "wallet-2" },
    update: {},
    create: {
      id: "wallet-2",
      name: "Shared Wallet",
      defaultCurrency: "USD",
    },
  });

  const wallet3 = await prisma.wallet.upsert({
    where: { id: "wallet-3" },
    update: {},
    create: {
      id: "wallet-3",
      name: "Business Wallet",
      defaultCurrency: "TWD",
    },
  });

  // Create wallet members with fixed IDs
  await prisma.walletUser.upsert({
    where: { id: "wallet-user-1" },
    update: {},
    create: {
      id: "wallet-user-1",
      walletId: wallet1.id,
      userId: user1.id,
      role: "OWNER",
    },
  });

  await prisma.walletUser.upsert({
    where: { id: "wallet-user-2" },
    update: {},
    create: {
      id: "wallet-user-2",
      walletId: wallet2.id,
      userId: user1.id,
      role: "OWNER",
    },
  });

  await prisma.walletUser.upsert({
    where: { id: "wallet-user-3" },
    update: {},
    create: {
      id: "wallet-user-3",
      walletId: wallet2.id,
      userId: user2.id,
      role: "MEMBER",
    },
  });

  await prisma.walletUser.upsert({
    where: { id: "wallet-user-4" },
    update: {},
    create: {
      id: "wallet-user-4",
      walletId: wallet3.id,
      userId: user2.id,
      role: "OWNER",
    },
  });
  console.log("✅ Wallets and wallet members created");

  // Create device carriers for users
  // Check if carriers already exist, if not create them
  let carrier1 = await prisma.deviceCarrier.findFirst({
    where: { userId: user1.id, isDeleted: false },
  });
  
  if (!carrier1) {
    carrier1 = await prisma.deviceCarrier.create({
      data: {
        id: "carrier-1",
        userId: user1.id,
        carrierCode: "/ABCDEF1",
        isDeleted: false,
      },
    });
  }

  let carrier2 = await prisma.deviceCarrier.findFirst({
    where: { userId: user2.id, isDeleted: false },
  });
  
  if (!carrier2) {
    carrier2 = await prisma.deviceCarrier.create({
      data: {
        id: "carrier-2",
        userId: user2.id,
        carrierCode: "/GHIJKL2",
        isDeleted: false,
      },
    });
  }
  console.log("✅ Device carriers created");

  // Create transactions with fixed IDs
  const transaction1 = await prisma.transaction.upsert({
    where: { id: "transaction-1" },
    update: {},
    create: {
      id: "transaction-1",
      walletId: wallet1.id,
      createdById: user1.id,
      date: new Date("2025-12-15T10:00:00Z"),
      amount: 5000,
      currency: "TWD",
      rateToNTD: null,
      name: "Lunch with team",
      note: "Team lunch at restaurant",
      type: "EXPENSE",
      tagId: systemTags[0]!.id, // food
    } as any,
  });

  const transaction2 = await prisma.transaction.upsert({
    where: { id: "transaction-2" },
    update: {},
    create: {
      id: "transaction-2",
      walletId: wallet2.id,
      createdById: user1.id,
      date: new Date("2025-12-20T14:30:00Z"),
      amount: 100,
      currency: "USD",
      rateToNTD: 32.5,
      name: "Coffee",
      note: "Starbucks coffee",
      type: "EXPENSE" as any,
      tagId: systemTags[1]!.id, // drinks
    } as any,
  });

  const transaction3 = await prisma.transaction.upsert({
    where: { id: "transaction-3" },
    update: {},
    create: {
      id: "transaction-3",
      walletId: wallet1.id,
      createdById: user1.id,
      date: new Date("2025-12-25T09:00:00Z"),
      amount: 50000,
      currency: "TWD",
      rateToNTD: null,
      name: "Salary",
      note: "Monthly salary",
      type: "INCOME" as any,
      tagId: customTag1.id,
    } as any,
  });

  const transaction4 = await prisma.transaction.upsert({
    where: { id: "transaction-4" },
    update: {},
    create: {
      id: "transaction-4",
      walletId: wallet3.id,
      createdById: user2.id,
      date: new Date("2025-12-28T16:00:00Z"),
      amount: 2000,
      currency: "TWD",
      rateToNTD: null,
      name: "Movie tickets",
      note: "Cinema tickets for entertainment",
      type: "EXPENSE" as any,
      tagId: systemTags[2]!.id, // entertainment
    } as any,
  });

  const transaction5 = await prisma.transaction.upsert({
    where: { id: "transaction-5" },
    update: {},
    create: {
      id: "transaction-5",
      walletId: wallet2.id,
      createdById: user2.id,
      date: new Date("2025-12-30T12:00:00Z"),
      amount: 150,
      currency: "USD",
      rateToNTD: 32.5,
      name: "Dinner",
      note: "Group dinner",
      type: "EXPENSE",
      tagId: customTag2.id,
    } as any,
  });

  // Create transaction payers with fixed IDs
  await prisma.transactionPayer.upsert({
    where: { id: "payer-1" },
    update: {},
    create: {
      id: "payer-1",
      transactionId: transaction1.id,
      payerId: user1.id,
      paidAmount: 5000,
    },
  });

  await prisma.transactionPayer.upsert({
    where: { id: "payer-2" },
    update: {},
    create: {
      id: "payer-2",
      transactionId: transaction2.id,
      payerId: user1.id,
      paidAmount: 100,
    },
  });

  await prisma.transactionPayer.upsert({
    where: { id: "payer-3" },
    update: {},
    create: {
      id: "payer-3",
      transactionId: transaction3.id,
      payerId: user1.id,
      paidAmount: 50000,
    },
  });

  await prisma.transactionPayer.upsert({
    where: { id: "payer-4" },
    update: {},
    create: {
      id: "payer-4",
      transactionId: transaction4.id,
      payerId: user2.id,
      paidAmount: 2000,
    },
  });

  await prisma.transactionPayer.upsert({
    where: { id: "payer-5" },
    update: {},
    create: {
      id: "payer-5",
      transactionId: transaction5.id,
      payerId: user2.id,
      paidAmount: 150,
    },
  });

  // Create transaction shares with fixed IDs
  await prisma.transactionShare.upsert({
    where: { id: "share-1" },
    update: {},
    create: {
      id: "share-1",
      transactionId: transaction1.id,
      userId: user1.id,
      shareAmount: 5000,
    },
  });

  await prisma.transactionShare.upsert({
    where: { id: "share-2" },
    update: {},
    create: {
      id: "share-2",
      transactionId: transaction2.id,
      userId: user1.id,
      shareAmount: 50,
    },
  });

  await prisma.transactionShare.upsert({
    where: { id: "share-3" },
    update: {},
    create: {
      id: "share-3",
      transactionId: transaction2.id,
      userId: user2.id,
      shareAmount: 50,
    },
  });

  await prisma.transactionShare.upsert({
    where: { id: "share-4" },
    update: {},
    create: {
      id: "share-4",
      transactionId: transaction3.id,
      userId: user1.id,
      shareAmount: 50000,
    },
  });

  await prisma.transactionShare.upsert({
    where: { id: "share-5" },
    update: {},
    create: {
      id: "share-5",
      transactionId: transaction4.id,
      userId: user2.id,
      shareAmount: 2000,
    },
  });

  await prisma.transactionShare.upsert({
    where: { id: "share-6" },
    update: {},
    create: {
      id: "share-6",
      transactionId: transaction5.id,
      userId: user1.id,
      shareAmount: 50,
    },
  });

  await prisma.transactionShare.upsert({
    where: { id: "share-7" },
    update: {},
    create: {
      id: "share-7",
      transactionId: transaction5.id,
      userId: user2.id,
      shareAmount: 100,
    },
  });
  console.log("✅ Transactions, payers, and shares created");

  // Count all tags
  const expenseTagCount = await prisma.tag.count({
    where: { isDeleted: false, type: "EXPENSE" },
  });

  const incomeTagCount = await prisma.tag.count({
    where: { isDeleted: false, type: "INCOME" },
  });

  console.log("\n📊 Seed Summary:");
  console.log(`- Regular Users: ${user1.userID}, ${user2.userID}`);
  console.log(`- Wallets: ${wallet1.name}, ${wallet2.name}, ${wallet3.name}`);
  console.log(`- Carriers: ${carrier1.carrierCode} (${user1.userID}), ${carrier2.carrierCode} (${user2.userID})`);
  console.log(`- Transactions: 5 transactions created`);
  console.log(`- Tags: ${expenseTagCount + incomeTagCount} total tags`);
  console.log(`  - Expense tags: ${expenseTagCount} (${DEFAULT_SYSTEM_TAGS.length} system + custom)`);
  console.log(`  - Income tags: ${incomeTagCount} (${DEFAULT_SYSTEM_INCOME_TAGS.length} system + custom)`);
  console.log("\n✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

