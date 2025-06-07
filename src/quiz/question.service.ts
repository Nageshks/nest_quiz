import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

type QuestionOptions = {
  [key: string]: string;
};

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(QuestionService.name);

  findByModule(moduleId: number) {
    try {
      return this.prisma.question.findMany({ where: { id: moduleId } });
    } catch (error) {
      this.logger.error('Error fetching questions by module:', error);
      throw new InternalServerErrorException('Failed to fetch questions by module');
    }
  }

  async deleteQuestionById(id: number): Promise<boolean> {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) return false;
    await this.prisma.question.delete({ where: { id } });
    return true;
  }

  /**
   * Fetches up to `limit` questions from the given modules, shuffling order within modules,
   * and balancing the number of questions per module as evenly as possible.
   * Questions from the same module are grouped together, but shuffled inside the module.
   * Covers as many different modules as possible, distributing questions as evenly as possible.
   */
  async findByModulesWithLimit(moduleIds: number[], limit: number) {
    this.logger.log(`findByModulesWithLimit called with: ${JSON.stringify(moduleIds)}, limit: ${limit}`);

    try {
      // Fetch all questions for given modules
      const questions = await this.prisma.question.findMany({
        where: { moduleId: { in: moduleIds } },
        include: {
          module: {
            select: {
              name: true,
              subject: {
                select: {
                  name: true,
                  semester: {
                    select: {
                      name: true,
                      course: {
                        select: { name: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Group questions by moduleId, maintaining the order of moduleIds
      const moduleMap: Record<number, typeof questions> = {};
      for (const id of moduleIds) moduleMap[id] = [];
      questions.forEach(q => {
        if (!moduleMap[q.moduleId]) moduleMap[q.moduleId] = [];
        moduleMap[q.moduleId].push(q);
      });

      // Shuffle questions in each module
      for (const id of moduleIds) {
        if (moduleMap[id]) {
          moduleMap[id] = shuffleArray(moduleMap[id]);
        }
      }

      // Distribute limit as evenly as possible
      const result: typeof questions = [];
      const totalModules = moduleIds.length;
      let quotas = Array(totalModules).fill(0);
      // Initial quota: distribute "limit" as evenly as possible across modules
      for (let i = 0; i < limit; i++) {
        quotas[i % totalModules]++;
      }

      // Pick up to quota or as many as available from each module, in moduleIds order
      let actualUsed = 0;
      const leftovers: { moduleIndex: number, remaining: number }[] = [];
      for (let i = 0; i < totalModules; i++) {
        const id = moduleIds[i];
        const available = moduleMap[id]?.length ?? 0;
        const take = Math.min(quotas[i], available);
        result.push(...(moduleMap[id]?.slice(0, take) ?? []));
        actualUsed += take;
        // Store how much quota left for modules that couldn't fulfill their share
        if (take < quotas[i]) {
          leftovers.push({ moduleIndex: i, remaining: quotas[i] - take });
        }
        quotas[i] -= take;
      }

      // If there are leftover slots, distribute them to modules with questions left
      let leftoverSlots = limit - actualUsed;
      if (leftoverSlots > 0) {
        for (let i = 0; i < totalModules && leftoverSlots > 0; i++) {
          const id = moduleIds[i];
          const alreadyTaken = result.filter(q => q.moduleId === id).length;
          const available = (moduleMap[id]?.length ?? 0) - alreadyTaken;
          if (available > 0) {
            const take = Math.min(available, leftoverSlots);
            result.push(...moduleMap[id].slice(alreadyTaken, alreadyTaken + take));
            leftoverSlots -= take;
          }
        }
      }

      // Trim to the limit (in case extra added in leftovers)
      const limited = result.slice(0, limit);

      // Map options to array format as in your original code
      return limited.map(q => ({
        ...q,
        options: (q.options && typeof q.options === 'object' && !Array.isArray(q.options))
          ? Object.entries(q.options).map(([key, value]) => ({ key, value }))
          : []
      }));

    } catch (error) {
      this.logger.error('Error fetching questions by modules:', error);
      throw new InternalServerErrorException('Failed to fetch questions by modules');
    }
  }

  async findByModules(moduleIds: number[]) {
    this.logger.log(`findByModules called with: ${JSON.stringify(moduleIds)}`);
    try {
      const questions = await this.prisma.question.findMany({
        where: { moduleId: { in: moduleIds } },
        include: {
          module: {
            select: {
              name: true,
              subject: {
                select: {
                  name: true,
                  semester: {
                    select: {
                      name: true,
                      course: {
                        select: {
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      return questions.map(q => ({
        ...q,
        options: (q.options && typeof q.options === 'object' && !Array.isArray(q.options))
        ? Object.entries(q.options).map(([key, value]) => ({ key, value }))
        : []
      }));
    } catch (error) {
      this.logger.error('Error fetching questions by modules:', error);
      throw new InternalServerErrorException('Failed to fetch questions by modules');
    }
  }

  findOne(id: number) {
    return this.prisma.question.findUnique({ where: { id } });
  }

  // Bulk create (expects array of questions in data)
  async bulkCreate(moduleId: number, questions: { question: string; options: QuestionOptions; answer: string; explanation?: string }[]) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestException('Questions array is required and cannot be empty');
    }

    // Validate each question
    questions.forEach((q, index) => {
      if (!q.question || !q.options || !q.answer) {
        throw new BadRequestException(`Question at index ${index} is missing required fields (question, options, answer)`);
      }
    });

    return this.prisma.question.createMany({
      data: questions.map(q => ({
        ...q,
        moduleId,
      })),
    });
  }

  // Bulk import with format data
  async bulkImportWithFormat(moduleId: number, data: { format: string, questions: { question: string; options: QuestionOptions; answer: string; explanation?: string }[] }) {
    if (!data.format || !Array.isArray(data.questions)) {
      throw new BadRequestException('Both format and questions fields are required');
    }

    // Validate each question
    data.questions.forEach((q, index) => {
      if (!q.question || !q.options || !q.answer) {
        throw new BadRequestException(`Question at index ${index} is missing required fields (question, options, answer)`);
      }
    });

    return this.prisma.question.createMany({
      data: data.questions.map(q => ({
        ...q,
        moduleId,
      })),
    });
  }
}

// Fisher-Yates shuffle utility
function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}