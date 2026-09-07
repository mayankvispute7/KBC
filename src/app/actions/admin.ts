'use server';

import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import type { Question } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function verifyAdminPin(pin: string): Promise<boolean> {
  try {
    const settings = await prisma.gameSettings.findFirst();
    if (!settings) return false;
    return bcrypt.compare(pin, settings.adminPinHash);
  } catch (error) {
    console.error("Prisma Error in verifyAdminPin:", error);
    throw new Error("Database error. If on Vercel, ensure you are using Postgres.");
  }
}

export async function getQuestions() {
  const questions = await prisma.question.findMany({
    orderBy: { questionNumber: 'asc' },
  });
  return questions.map(q => ({
    ...q,
    correctOptions: q.correctOptions as string[],
    fiftyFiftyRemove: q.fiftyFiftyRemove as string[] | null,
  })) as Question[];
}

export async function saveQuestion(data: Question) {
  // Server-side validation per ARCHITECTURE.md §11 & requirements
  if (!data.questionText || !data.optionA || !data.optionB || !data.optionC || !data.optionD) {
    throw new Error('Question text and all four options are required.');
  }
  if (!data.correctOptions || data.correctOptions.length === 0) {
    throw new Error('At least one correct option must be selected.');
  }

  // 50-50 validation
  if (data.fiftyFiftyRemove && data.fiftyFiftyRemove.length > 0) {
    if (data.fiftyFiftyRemove.length !== 2) {
      throw new Error('50-50 removal must have exactly 2 options or be empty.');
    }
    const intersect = data.fiftyFiftyRemove.some(opt => data.correctOptions.includes(opt));
    if (intersect) {
      throw new Error('50-50 removal cannot contain correct options.');
    }
  }

  // Audience poll validation
  const polls = [data.audiencePollA, data.audiencePollB, data.audiencePollC, data.audiencePollD];
  const hasPolls = polls.some(p => p !== null && p !== undefined);
  if (hasPolls) {
    const sum = polls.reduce<number>((acc, val) => acc + (val || 0), 0);
    if (sum !== 100) {
      throw new Error(`Audience poll values must sum to 100 (current sum: ${sum}).`);
    }
  }

  // Ensure questionNumber is correct or auto-incremented
  const isNew = data.id.startsWith('new_');
  let qNum = data.questionNumber;
  if (isNew) {
    const maxQ = await prisma.question.aggregate({ _max: { questionNumber: true } });
    qNum = (maxQ._max.questionNumber || 0) + 1;
  }

  const payload: Prisma.QuestionCreateInput | Prisma.QuestionUpdateInput = {
    questionNumber: qNum,
    questionText: data.questionText,
    optionA: data.optionA,
    optionB: data.optionB,
    optionC: data.optionC,
    optionD: data.optionD,
    correctOptions: data.correctOptions as Prisma.InputJsonValue,
    fiftyFiftyRemove: data.fiftyFiftyRemove ? (data.fiftyFiftyRemove as Prisma.InputJsonValue) : Prisma.DbNull,
    fiftyFiftyEligible: data.fiftyFiftyEligible,
    timerDuration: data.timerDuration,
    audiencePollA: data.audiencePollA,
    audiencePollB: data.audiencePollB,
    audiencePollC: data.audiencePollC,
    audiencePollD: data.audiencePollD,
    correctMessage: data.correctMessage,
    wrongMessage: data.wrongMessage,
    enabled: data.enabled,
  };

  if (isNew) {
    const newQ = await prisma.question.create({ data: payload as Prisma.QuestionCreateInput });
    return {
      ...newQ,
      correctOptions: newQ.correctOptions as string[],
      fiftyFiftyRemove: newQ.fiftyFiftyRemove as string[] | null,
    } as Question;
  } else {
    const updatedQ = await prisma.question.update({
      where: { id: data.id },
      data: payload as Prisma.QuestionUpdateInput,
    });
    return {
      ...updatedQ,
      correctOptions: updatedQ.correctOptions as string[],
      fiftyFiftyRemove: updatedQ.fiftyFiftyRemove as string[] | null,
    } as Question;
  }
}

export async function deleteQuestion(id: string) {
  if (id.startsWith('new_')) return;
  await prisma.question.delete({ where: { id } });
  
  // Renumber remaining questions to ensure continuous sequence for the ladder
  const remaining = await prisma.question.findMany({ orderBy: { questionNumber: 'asc' } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].questionNumber !== i + 1) {
      await prisma.question.update({
        where: { id: remaining[i].id },
        data: { questionNumber: i + 1 },
      });
    }
  }
}

export async function reorderQuestions(orderedIds: string[]) {
  // Reorder and renumber directly per ARCHITECTURE.md
  // Using a transaction to ensure atomicity
  await prisma.$transaction(
    orderedIds.map((id, index) => 
      prisma.question.update({
        where: { id },
        data: { questionNumber: index + 1 },
      })
    )
  );
}

export async function getGameSettings() {
  const settings = await prisma.gameSettings.findFirst();
  return {
    soundEnabled: settings?.soundEnabled ?? true,
    soundUrls: (settings?.soundUrls as Record<string, string>) ?? null,
  };
}

export async function saveSoundUrls(urls: Record<string, string>) {
  const settings = await prisma.gameSettings.findFirst();
  if (settings) {
    await prisma.gameSettings.update({
      where: { id: settings.id },
      data: { soundUrls: urls },
    });
  }
}

export async function toggleSoundSetting(enabled: boolean) {
  const settings = await prisma.gameSettings.findFirst();
  if (settings) {
    await prisma.gameSettings.update({
      where: { id: settings.id },
      data: { soundEnabled: enabled },
    });
  }
}
