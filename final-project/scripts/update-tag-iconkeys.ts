/**
 * Script to update iconKey for existing system tags
 * 
 * This script updates the iconKey field for all system tags to match their name,
 * so they display the correct icons in the UI.
 * 
 * Run with: npx tsx scripts/update-tag-iconkeys.ts
 */

import { PrismaClient } from "@prisma/client";
import { SYSTEM_USER_ID, DEFAULT_SYSTEM_TAGS, DEFAULT_SYSTEM_INCOME_TAGS } from "../config/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating iconKeys for system tags...");

  // Update expense system tags
  for (const tagName of DEFAULT_SYSTEM_TAGS) {
    const result = await prisma.tag.updateMany({
      where: {
        name: tagName,
        createdBy: SYSTEM_USER_ID,
      },
      data: {
        iconKey: tagName, // Use tag name as iconKey (e.g., "food", "travel", "shopping")
      },
    });
    if (result.count > 0) {
      console.log(`  ✅ Updated ${tagName}: iconKey="${tagName}"`);
    }
  }

  // Update income system tags
  for (const tagName of DEFAULT_SYSTEM_INCOME_TAGS) {
    const result = await prisma.tag.updateMany({
      where: {
        name: tagName,
        createdBy: SYSTEM_USER_ID,
      },
      data: {
        iconKey: tagName, // Use tag name as iconKey
      },
    });
    if (result.count > 0) {
      console.log(`  ✅ Updated ${tagName}: iconKey="${tagName}"`);
    }
  }

  console.log("✅ All system tag iconKeys updated!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

