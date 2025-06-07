import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.course.findMany();
  }

  findOne(id: number) {
    return this.prisma.course.findUnique({ where: { id } });
  }

  async create(dto: { name: string }) {
    return this.prisma.course.create({ data: dto });
  }

  async deleteCourseAndRelatedData(courseId: number): Promise<boolean> {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) return false;

    await this.prisma.$transaction(async (tx) => {
      // Delete questions (deepest level first)
      await tx.question.deleteMany({
        where: {
          module: {
            subject: {
              semester: {
                courseId: courseId,
              },
            },
          },
        },
      });

      // Delete modules
      await tx.module.deleteMany({
        where: {
          subject: {
            semester: {
              courseId: courseId,
            },
          },
        },
      });

      // Delete subjects
      await tx.subject.deleteMany({
        where: {
          semester: {
            courseId: courseId,
          },
        },
      });

      // Delete semesters
      await tx.semester.deleteMany({
        where: {
          courseId: courseId,
        },
      });

      // Delete course itself
      await tx.course.delete({
        where: { id: courseId },
      });
    });

    return true;
  }
} 