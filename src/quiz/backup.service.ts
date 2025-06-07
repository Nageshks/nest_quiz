import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns a deeply nested JSON object representing the course and all its related entities,
   * with all 'id' fields removed for safe restoration.
   */
  async backupCourseById(courseId: number): Promise<any> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        semesters: {
          include: {
            subjects: {
              include: {
                modules: {
                  include: {
                    questions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with id=${courseId} not found`);
    }

    // Recursively remove all "id" fields from the course data
    return this.stripIds(course);
  }

  private stripIds(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.stripIds(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'id') continue;
        result[key] = this.stripIds(value);
      }
      return result;
    }
    return obj;
  }
}