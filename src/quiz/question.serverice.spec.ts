import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from './question.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QuestionService', () => {
  let service: QuestionService;
  let prisma: { question: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { question: { findMany: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it('should find questions by module', async () => {
    prisma.question.findMany.mockResolvedValue([{ id: 1, moduleId: 1 }]);
    const result = await service.findByModule(1);
    expect(result).toEqual([{ id: 1, moduleId: 1 }]);
    expect(prisma.question.findMany).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should find questions by modules', async () => {
    prisma.question.findMany.mockResolvedValue([
      { id: 1, moduleId: 1 },
      { id: 2, moduleId: 2 },
    ]);
    const result = await service.findByModules([1, 2]);
    expect(result).toEqual([
      { id: 1, moduleId: 1 },
      { id: 2, moduleId: 2 },
    ]);
    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: { moduleId: { in: [1, 2] } },
      include: expect.anything(),
    });
  });
});