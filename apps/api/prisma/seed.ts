import { PrismaClient, PromptRole } from '@prisma/client';
import { defaultPabloMemory } from '../src/pablo-memory/data/pablo-memory.default';
import { defaultPromptTemplates } from '../src/prompts/data/default-prompt-templates';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Idempotent seed: safe to re-run. Creates the initial owner account, the
 * first version of Pablo's memory, and version 1 of every agent prompt.
 */
async function main() {
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? 'owner@pablo.ai';
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? 'ChangeMe123!';

  const existingOwner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!existingOwner) {
    const passwordHash = await bcrypt.hash(ownerPassword, 12);
    await prisma.user.create({
      data: {
        email: ownerEmail,
        passwordHash,
        name: 'Pablo Admin',
        role: 'OWNER',
      },
    });
    console.log(`Created owner account: ${ownerEmail}`);
  }

  const existingMemory = await prisma.pabloMemoryVersion.findFirst({ where: { version: 1 } });
  if (!existingMemory) {
    await prisma.pabloMemoryVersion.create({
      data: {
        version: 1,
        data: defaultPabloMemory as any,
        isActive: true,
        changelog: 'Version initiale de la mémoire de Pablo.',
      },
    });
    console.log('Seeded Pablo memory v1');
  }

  for (const template of defaultPromptTemplates) {
    const exists = await prisma.promptTemplate.findUnique({
      where: { role_version: { role: template.role as PromptRole, version: 1 } },
    });
    if (!exists) {
      await prisma.promptTemplate.create({
        data: {
          role: template.role as PromptRole,
          version: 1,
          title: template.title,
          content: template.content,
          isActive: true,
          changelog: 'Version initiale.',
        },
      });
      console.log(`Seeded prompt template: ${template.role}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
