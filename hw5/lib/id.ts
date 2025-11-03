import { customAlphabet } from "nanoid";
import { prisma } from "./prisma";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
const nano = customAlphabet(alphabet, 6);

export async function generateUniqueUserId(maxRetries = 5): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidate = nano();
    const exists = await prisma.user.findFirst({ where: { userId: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  // If we somehow collided too many times, increase length and try once more
  const longer = customAlphabet(alphabet, 8)();
  return longer;
}


