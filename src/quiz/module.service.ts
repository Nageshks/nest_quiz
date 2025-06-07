import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  findBySubject(subjectId: number) {
    return this.prisma.module.findMany({ where: { subjectId } });
  }

  findOne(id: number) {
    if (typeof id !== 'number' || isNaN(id)) {
      throw new BadRequestException('A valid module id is required');
    }
    return this.prisma.module.findUnique({
      where: { id }
    });
  }

  async createBulk(subjectId: number, modules: { name: string }[]) {
    return this.prisma.module.createMany({
      data: modules.map(m => ({ ...m, subjectId })),
    });
  }
} 