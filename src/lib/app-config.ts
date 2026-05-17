import "server-only";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const APP_CONFIG_ID = "global";
const APP_TIME_ZONE = "America/Sao_Paulo";

export type AppQuotaKind = "articleRewrite" | "imageGeneration";

export type AppConfigSnapshot = {
  id: string;
  usageMonth: string;
  articleRewriteUsage: number;
  articleRewriteLimit: number;
  imageGenerationUsage: number;
  imageGenerationLimit: number;
  articleRewriteModel: string;
  imageGenerationModel: string;
  imageGenerationSize: string;
  imageGenerationQuality: string;
};

type PrismaExecutor = typeof prisma | Prisma.TransactionClient;

function getCurrentUsageMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

function toSnapshot(config: {
  id: string;
  usageMonth: string;
  articleRewriteUsage: number;
  articleRewriteLimit: number;
  imageGenerationUsage: number;
  imageGenerationLimit: number;
  articleRewriteModel: string;
  imageGenerationModel: string;
  imageGenerationSize: string;
  imageGenerationQuality: string;
}): AppConfigSnapshot {
  return {
    id: config.id,
    usageMonth: config.usageMonth,
    articleRewriteUsage: config.articleRewriteUsage,
    articleRewriteLimit: config.articleRewriteLimit,
    imageGenerationUsage: config.imageGenerationUsage,
    imageGenerationLimit: config.imageGenerationLimit,
    articleRewriteModel: config.articleRewriteModel,
    imageGenerationModel: config.imageGenerationModel,
    imageGenerationSize: config.imageGenerationSize,
    imageGenerationQuality: config.imageGenerationQuality,
  };
}

async function ensureAppConfig(executor: PrismaExecutor = prisma) {
  const usageMonth = getCurrentUsageMonth();
  const existing = await executor.appConfig.findUnique({
    where: { id: APP_CONFIG_ID },
  });

  if (!existing) {
    return executor.appConfig.create({
      data: {
        id: APP_CONFIG_ID,
        usageMonth,
      },
    });
  }

  if (existing.usageMonth !== usageMonth) {
    return executor.appConfig.update({
      where: { id: APP_CONFIG_ID },
      data: {
        usageMonth,
        articleRewriteUsage: 0,
        imageGenerationUsage: 0,
      },
    });
  }

  return existing;
}

function getQuotaFields(kind: AppQuotaKind) {
  if (kind === "articleRewrite") {
    return {
      usageField: "articleRewriteUsage",
      limitField: "articleRewriteLimit",
      label: "reescrita de artigos",
    } as const;
  }

  return {
    usageField: "imageGenerationUsage",
    limitField: "imageGenerationLimit",
    label: "geracao de imagens",
  } as const;
}

export async function getAppConfigSnapshot() {
  const config = await ensureAppConfig();
  return toSnapshot(config);
}

export async function reserveAppQuota(kind: AppQuotaKind) {
  const fields = getQuotaFields(kind);

  return prisma.$transaction(async (tx) => {
    const config = await ensureAppConfig(tx);
    const usage = config[fields.usageField];
    const limit = config[fields.limitField];

    if (usage >= limit) {
      throw new Error(
        `Limite mensal de ${fields.label} atingido (${usage}/${limit}). A contagem sera reiniciada no proximo mes.`
      );
    }

    const result =
      kind === "articleRewrite"
        ? await tx.appConfig.updateMany({
            where: {
              id: APP_CONFIG_ID,
              usageMonth: config.usageMonth,
              articleRewriteUsage: { lt: limit },
            },
            data: { articleRewriteUsage: { increment: 1 } },
          })
        : await tx.appConfig.updateMany({
            where: {
              id: APP_CONFIG_ID,
              usageMonth: config.usageMonth,
              imageGenerationUsage: { lt: limit },
            },
            data: { imageGenerationUsage: { increment: 1 } },
          });

    if (result.count !== 1) {
      throw new Error(
        `Limite mensal de ${fields.label} atingido (${usage}/${limit}). A contagem sera reiniciada no proximo mes.`
      );
    }

    const updated = await tx.appConfig.findUniqueOrThrow({
      where: { id: APP_CONFIG_ID },
    });

    revalidatePath("/erp");
    return toSnapshot(updated);
  });
}

export async function releaseAppQuota(kind: AppQuotaKind) {
  await prisma.$transaction(async (tx) => {
    await ensureAppConfig(tx);

    const data =
      kind === "articleRewrite"
        ? { articleRewriteUsage: { decrement: 1 } }
        : { imageGenerationUsage: { decrement: 1 } };

    const where =
      kind === "articleRewrite"
        ? { id: APP_CONFIG_ID, articleRewriteUsage: { gt: 0 } }
        : { id: APP_CONFIG_ID, imageGenerationUsage: { gt: 0 } };

    await tx.appConfig.updateMany({
      where,
      data,
    });
  });

  revalidatePath("/erp");
}

export async function withAppQuota<T>(kind: AppQuotaKind, callback: () => Promise<T>) {
  await reserveAppQuota(kind);

  try {
    return await callback();
  } catch (error) {
    await releaseAppQuota(kind);
    throw error;
  }
}
