/**
 * Database seed script
 * 
 * This script creates seed data for development and testing:
 * - Super user (can access all wallets)
 * - Multiple wallets
 * - Transactions with payers and shares
 * - Custom tags
 * - System tags (using existing repository logic)
 * 
 * Run with: npm run seed
 */

import { PrismaClient } from "@prisma/client";
import { SYSTEM_USER_ID, DEFAULT_SYSTEM_TAGS } from "../config/constants";
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

  // Create super user
  const superUser = await prisma.user.upsert({
    where: { userID: "superuser" },
    update: {},
    create: {
      userID: "superuser",
      name: "Super User",
      email: "superuser@example.com",
      isDeleted: false,
    },
  });
  console.log("✅ Super user created:", superUser.id);

  // Create regular users
  const user1 = await prisma.user.upsert({
    where: { userID: "user1" },
    update: {},
    create: {
      userID: "user1",
      name: "User One",
      email: "user1@example.com",
      isDeleted: false,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { userID: "user2" },
    update: {},
    create: {
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
      createdBy: superUser.id,
    },
  });

  const customTag2 = await prisma.tag.upsert({
    where: { name: "custom-tag-2" },
    update: {},
    create: {
      name: "custom-tag-2",
      createdBy: superUser.id,
    },
  });
  console.log("✅ Custom tags created");

  // Create wallets
  const wallet1 = await prisma.wallet.create({
    data: {
      name: "Personal Wallet",
      defaultCurrency: "TWD",
      members: {
        create: [
          {
            userId: superUser.id,
            role: "OWNER",
          },
          {
            userId: user1.id,
            role: "MEMBER",
          },
        ],
      },
    } as any,
  });

  const wallet2 = await prisma.wallet.create({
    data: {
      name: "Shared Wallet",
      defaultCurrency: "USD",
      members: {
        create: [
          {
            userId: superUser.id,
            role: "OWNER",
          },
          {
            userId: user1.id,
            role: "MEMBER",
          },
          {
            userId: user2.id,
            role: "MEMBER",
          },
        ],
      },
    } as any,
  });

  const wallet3 = await prisma.wallet.create({
    data: {
      name: "Business Wallet",
      defaultCurrency: "TWD",
      members: {
        create: [
          {
            userId: superUser.id,
            role: "OWNER",
          },
        ],
      },
    } as any,
  });
  console.log("✅ Wallets created");

  // Create transactions with payers and shares
  const transaction1 = await prisma.transaction.create({
    data: {
      walletId: wallet1.id,
      createdById: superUser.id,
      date: new Date("2024-11-15T10:00:00Z"),
      amount: 5000,
      currency: "TWD",
      rateToNTD: null,
      name: "Lunch with team",
      note: "Team lunch at restaurant",
      type: "EXPENSE",
      tagId: systemTags[0]!.id, // food
      payers: {
        create: [
          {
            payerId: superUser.id,
            paidAmount: 5000,
          },
        ],
      },
      shares: {
        create: [
          {
            userId: superUser.id,
            shareAmount: 2500,
          },
          {
            userId: user1.id,
            shareAmount: 2500,
          },
        ],
      },
    } as any,
  });

  const transaction2 = await prisma.transaction.create({
    data: {
      walletId: wallet2.id,
      createdById: user1.id,
      date: new Date("2024-11-20T14:30:00Z"),
      amount: 100,
      currency: "USD",
      rateToNTD: 32.5,
      name: "Coffee",
      note: "Starbucks coffee",
      type: "EXPENSE" as any,
      tagId: systemTags[1]!.id, // drinks
      payers: {
        create: [
          {
            payerId: user1.id,
            paidAmount: 100,
          },
        ],
      },
      shares: {
        create: [
          {
            userId: superUser.id,
            shareAmount: 50,
          },
          {
            userId: user1.id,
            shareAmount: 30,
          },
          {
            userId: user2.id,
            shareAmount: 20,
          },
        ],
      },
    } as any,
  });

  const transaction3 = await prisma.transaction.create({
    data: {
      walletId: wallet1.id,
      createdById: superUser.id,
      date: new Date("2024-11-25T09:00:00Z"),
      amount: 50000,
      currency: "TWD",
      rateToNTD: null,
      name: "Salary",
      note: "Monthly salary",
      type: "INCOME" as any,
      tagId: customTag1.id,
      payers: {
        create: [
          {
            payerId: superUser.id,
            paidAmount: 50000,
          },
        ],
      },
      shares: {
        create: [
          {
            userId: superUser.id,
            shareAmount: 50000,
          },
        ],
      },
    } as any,
  });

  const transaction4 = await prisma.transaction.create({
    data: {
      walletId: wallet3.id,
      createdById: superUser.id,
      date: new Date("2024-11-28T16:00:00Z"),
      amount: 2000,
      currency: "TWD",
      rateToNTD: null,
      name: "Movie tickets",
      note: "Cinema tickets for entertainment",
      type: "EXPENSE" as any,
      tagId: systemTags[2]!.id, // entertainment
      payers: {
        create: [
          {
            payerId: superUser.id,
            paidAmount: 2000,
          },
        ],
      },
      shares: {
        create: [
          {
            userId: superUser.id,
            shareAmount: 2000,
          },
        ],
      },
    } as any,
  });

  const transaction5 = await prisma.transaction.create({
    data: {
      walletId: wallet2.id,
      createdById: user2.id,
      date: new Date("2024-11-30T12:00:00Z"),
      amount: 150,
      currency: "USD",
      rateToNTD: 32.5,
      name: "Dinner",
      note: "Group dinner",
      type: "EXPENSE",
      tagId: customTag2.id,
      payers: {
        create: [
          {
            payerId: user2.id,
            paidAmount: 150,
          },
        ],
      },
      shares: {
        create: [
          {
            userId: superUser.id,
            shareAmount: 50,
          },
          {
            userId: user1.id,
            shareAmount: 50,
          },
          {
            userId: user2.id,
            shareAmount: 50,
          },
        ],
      },
    } as any,
  });
  console.log("✅ Transactions created with payers and shares");

  // Count all tags
  const tagCount = await prisma.tag.count({
    where: { isDeleted: false },
  });

  console.log("\n📊 Seed Summary:");
  console.log(`- Super User: ${superUser.userID} (${superUser.id})`);
  console.log(`- Regular Users: ${user1.userID}, ${user2.userID}`);
  console.log(`- Wallets: ${wallet1.name}, ${wallet2.name}, ${wallet3.name}`);
  console.log(`- Transactions: 5 transactions created`);
  console.log(`- Tags: ${tagCount} total tags (${DEFAULT_SYSTEM_TAGS.length} system tags + 2 custom tags)`);
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

