import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  findBySemester(semesterId: number) {
    return this.prisma.subject.findMany({ where: { semesterId } });
  }

  findOne(id: number) {
    return this.prisma.subject.findUnique({ where: { id } });
  }

  async createBulk(semesterId: number, subjects: { name: string }[]) {
    return this.prisma.subject.createMany({
      data: subjects.map(s => ({ ...s, semesterId })),
    });
  }
} 