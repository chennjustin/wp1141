/**
 * Database reset script
 * 
 * This script resets the database by dropping all data.
 * WARNING: This will delete ALL data in the database!
 * 
 * Run with: npm run db:reset
 */

import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function main() {
  console.log("\n⚠️  WARNING: This will DELETE ALL DATA in the database!");
  console.log("⚠️  This action CANNOT be undone!\n");

  const firstConfirm = await askQuestion(
    "Type 'RESET' to confirm you want to reset the database: "
  );

  if (firstConfirm !== "RESET") {
    console.log("\n❌ Reset cancelled. Database was not modified.");
    process.exit(0);
  }

  console.log("\n⚠️  Final confirmation required!");
  const secondConfirm = await askQuestion(
    "Type 'YES' to proceed with database reset: "
  );

  if (secondConfirm !== "YES") {
    console.log("\n❌ Reset cancelled. Database was not modified.");
    process.exit(0);
  }

  console.log("\n🗑️  Resetting database...");

  try {
    // Delete in order to respect foreign key constraints
    await prisma.transactionShare.deleteMany({});
    await prisma.transactionPayer.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.subscriptionHistory.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.deviceCarrier.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.walletUser.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("✅ Database reset completed successfully!");
    console.log("\n💡 You can now run 'npm run seed' to populate the database with seed data.");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

