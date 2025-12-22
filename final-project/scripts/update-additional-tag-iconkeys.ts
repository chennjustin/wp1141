/**
 * Script to update iconKey for additional income tags
 * (freelance, interest, refund, dividend)
 * 
 * Run with: npx tsx scripts/update-additional-tag-iconkeys.ts
 */

import { PrismaClient } from "@prisma/client";
import { SYSTEM_USER_ID } from "../config/constants";

const prisma = new PrismaClient();

const ADDITIONAL_INCOME_TAGS = ["freelance", "interest", "refund", "dividend"];

async function main() {
  console.log("🔄 Updating iconKeys for additional income tags...");

  for (const tagName of ADDITIONAL_INCOME_TAGS) {
    const result = await prisma.tag.updateMany({
      where: {
        name: tagName,
        createdBy: SYSTEM_USER_ID,
      },
      data: {
        iconKey: tagName,
      },
    });
    if (result.count > 0) {
      console.log(`  ✅ Updated ${tagName}: iconKey="${tagName}"`);
    } else {
      console.log(`  ⚠️  Tag "${tagName}" not found (may not exist in database)`);
    }
  }

  console.log("✅ Additional tag iconKeys update completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

