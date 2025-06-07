import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SemesterService {
  constructor(private prisma: PrismaService) {}

  findByCourse(courseId: number) {
    return this.prisma.semester.findMany({ where: { courseId } });
  }

  async createBulk(courseId: number, semesters: { name: string }[]) {
    return this.prisma.semester.createMany({
      data: semesters.map(s => ({ ...s, courseId })),
    });
  }
  
} 