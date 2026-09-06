/**
 * Kaun Banega College Pati — Database Seed Script
 *
 * Seeds all 12 questions from the master brief §10 and default GameSettings.
 * Run with: npm run db:seed (requires tsx)
 *
 * For questions without explicit audience poll values, auto-generates a set
 * where the correct option leads with 60–75% and the rest split the remainder.
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generatePollValues(correctOptions: string[]): { audiencePollA: number; audiencePollB: number; audiencePollC: number; audiencePollD: number } {
  const options = ['A', 'B', 'C', 'D'];
  const correctLead = Math.floor(Math.random() * 16) + 60; // 60–75%
  let remaining = 100 - correctLead;

  const values: Record<string, number> = {};
  const correctOption = correctOptions[0]; // Primary correct option

  // Distribute remaining among incorrect options
  const incorrectOptions = options.filter(o => !correctOptions.includes(o));
  incorrectOptions.forEach((opt, i) => {
    if (i === incorrectOptions.length - 1) {
      values[opt] = remaining;
    } else {
      const share = Math.floor(Math.random() * (remaining / (incorrectOptions.length - i))) + 3;
      values[opt] = Math.min(share, remaining - (incorrectOptions.length - i - 1) * 3);
      remaining -= values[opt];
    }
  });

  values[correctOption] = correctLead;

  return {
    audiencePollA: values['A'] ?? 0,
    audiencePollB: values['B'] ?? 0,
    audiencePollC: values['C'] ?? 0,
    audiencePollD: values['D'] ?? 0,
  };
}

const questions = [
  {
    questionNumber: 1,
    questionText: 'College mein sabse POWERFUL sentence kaunsa hai?',
    optionA: '"Assignment submit kar diya?"',
    optionB: '"Attendance short hai."',
    optionC: '"Principal sir bula rahe hain."',
    optionD: '"Beta, ek minute staffroom mein aana."',
    correctOptions: ['D'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    correctMessage: 'Ye sunte hi students ka Wi-Fi signal bhi chala jaata hai. 📶',
  },
  {
    questionNumber: 2,
    questionText: 'Faculty ka sabse DANGEROUS superpower kya hai?',
    optionA: '2x speed pe lecture complete karna',
    optionB: 'Backbenchers ko bina dekhe identify kar lena',
    optionC: 'Attendance sheet yaad rakhna',
    optionD: '10 saal purani mistake yaad rakhna',
    correctOptions: ['B'],
    fiftyFiftyRemove: ['A', 'D'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    audiencePollA: 11,
    audiencePollB: 64,
    audiencePollC: 18,
    audiencePollD: 7,
    correctMessage: 'Ye log CCTV se bhi aage hain. 🗿',
  },
  {
    questionNumber: 3,
    questionText: 'College mein "5 minutes mein aa raha hoon" ka ACTUAL meaning kya hota hai?',
    optionA: '5 minutes',
    optionB: '10 minutes',
    optionC: '15 minutes',
    optionD: 'Human civilization ke hisaab se — UNKNOWN',
    correctOptions: ['D'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    correctMessage: 'Scientists ispe abhi bhi research kar rahe hain. 🔬',
  },
  {
    questionNumber: 4,
    questionText: 'Student jab bolta hai "Sir/Ma\'am, ek GENUINE reason hai…" — toh usually kya hone wala hai?',
    optionA: 'Sach bolne wala hai',
    optionB: 'Medical emergency',
    optionC: 'Ek CINEMATIC backstory start hone wali hai',
    optionD: 'NASA ka mission explain karega',
    correctOptions: ['C'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    correctMessage: 'Oscar nomination pending hai is backstory ki. 🎬🏆',
  },
  {
    questionNumber: 5,
    questionText: 'Faculty ka favourite attendance percentage?',
    optionA: '50%',
    optionB: '65%',
    optionC: '75%',
    optionD: '100% — because dreams are free',
    correctOptions: ['D'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    correctMessage: 'Sapne dekhne ke paise nahi lagte. 😭✨',
  },
  {
    questionNumber: 6,
    questionText: 'Exam ke EK DIN pehle student ka sabse common dialogue?',
    optionA: '"Preparation complete hai."',
    optionB: '"Bas revision kar raha hoon."',
    optionC: '"Important questions bhej do please 😭"',
    optionD: '"Sir paper tough mat rakhna."',
    correctOptions: ['C'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    correctMessage: 'Ye message group mein exactly 11:58 PM pe aata hai. ⏰',
  },
  {
    questionNumber: 7,
    questionText: 'Staffroom mein sabse zyada kya milta hai?',
    optionA: 'Chai ☕',
    optionB: 'Attendance discussions',
    optionC: 'Student stories',
    optionD: 'Above all of the above',
    correctOptions: ['D'],
    fiftyFiftyRemove: ['B', 'C'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    correctMessage: 'Staffroom = college ka unofficial parliament. ☕🏛️',
  },
  {
    questionNumber: 8,
    questionText: 'Jab teacher bolte hain "This will NOT come in the exam"…',
    optionA: 'It definitely won\'t come',
    optionB: 'It will come for 1 mark',
    optionC: 'It will come for 10 marks',
    optionD: 'Students collectively lose trust in humanity',
    correctOptions: ['D'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    correctMessage: 'Ek sentence. Zindagi bhar ka trust issue. 💔',
  },
  {
    questionNumber: 9,
    questionText: 'College ka sabse MYSTERIOUS creature kaun hai?',
    optionA: 'Student who submits assignment EARLY',
    optionB: 'Student with 100% attendance',
    optionC: 'Student who actually reads the syllabus',
    optionD: 'All of the above — sightings are extremely rare',
    correctOptions: ['D'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 30,
    correctMessage: 'National Geographic bhi shoot nahi kar paaya. 🦕',
  },
  {
    questionNumber: 10,
    questionText: 'Teacher ke "I\'ll wait" ka ACTUAL meaning?',
    optionA: 'Take your time',
    optionB: 'I am patient',
    optionC: 'You have EXACTLY 3 seconds to fix your life',
    optionD: 'Class dismissed',
    correctOptions: ['C'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 60,
    correctMessage: '3 seconds. Timer already start ho chuka hai. ⏳🗿',
  },
  {
    questionNumber: 11,
    questionText: 'Faculty ko sabse zyada kis cheez ki zarurat hoti hai?',
    optionA: 'Coffee',
    optionB: 'Patience',
    optionC: 'Wi-Fi',
    optionD: 'All three + salary on time 😭',
    correctOptions: ['D'],
    fiftyFiftyRemove: ['A', 'C'],
    fiftyFiftyEligible: true,
    timerDuration: 60,
    correctMessage: 'Faculty bhi insaan hai. Legend insaan, but insaan. 🫡',
  },
  {
    questionNumber: 12,
    questionText: 'Ek teacher ko truly LEGENDARY kya banata hai?',
    optionA: 'Knowledge',
    optionB: 'Patience',
    optionC: 'Students ko motivate karna',
    optionD: 'Saalon baad bhi students ka unhe yaad rakhna ❤️',
    correctOptions: ['D'],
    fiftyFiftyRemove: ['A', 'B'],
    fiftyFiftyEligible: true,
    timerDuration: 60,
    correctMessage: 'Padhai bhool jaoge… par wo ek class yaad rahegi. ❤️',
  },
];

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await prisma.question.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.gameSettings.deleteMany();

  // Seed questions
  for (const q of questions) {
    const polls = q.audiencePollA !== undefined
      ? { audiencePollA: q.audiencePollA, audiencePollB: q.audiencePollB, audiencePollC: q.audiencePollC, audiencePollD: q.audiencePollD }
      : generatePollValues(q.correctOptions);

    await prisma.question.create({
      data: {
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOptions: q.correctOptions,
        fiftyFiftyRemove: q.fiftyFiftyRemove,
        fiftyFiftyEligible: q.fiftyFiftyEligible,
        timerDuration: q.timerDuration,
        correctMessage: q.correctMessage,
        ...polls,
      },
    });
    console.log(`  ✅ Q${q.questionNumber}: ${q.questionText.substring(0, 50)}...`);
  }

  // Seed default settings
  const hashedPin = await bcrypt.hash('1234', 10);
  await prisma.gameSettings.create({
    data: {
      soundEnabled: true,
      adminPinHash: hashedPin,
    },
  });
  console.log('\n  🔧 Default settings created (PIN: 1234)');

  console.log('\n✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
