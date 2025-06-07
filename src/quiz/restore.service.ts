import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class RestoreService {
  constructor(private readonly prisma: PrismaService) {}

  async restoreCourseFromBackup(backup: any) {
    if (!backup || typeof backup !== 'object' || !backup.name) {
      throw new BadRequestException('Invalid backup data');
    }

    return this.prisma.$transaction(async (tx) => {
      // Try to find the course by name (not unique, so use findFirst)
      let course = await tx.course.findFirst({
        where: { name: backup.name },
      });

      if (!course) {
        // Create the course if it doesn't exist
        course = await tx.course.create({
          data: {
            name: backup.name,
            // add other fields from backup as needed
          },
        });
      }

      // Example: handle nested data such as semesters, quizzes, etc.
      // Make sure to adapt this section to your actual backup structure
      if (Array.isArray(backup.semesters)) {
        for (const semesterData of backup.semesters) {
          let semester = await tx.semester.findFirst({
            where: {
              name: semesterData.name,
              courseId: course.id,
            },
          });
          if (!semester) {
            semester = await tx.semester.create({
              data: {
                name: semesterData.name,
                courseId: course.id,
                // add other fields as needed
              },
            });
          }
          // Handle nested quizzes, etc. similarly if present in backup
        }
      }

      // Return the restored course (and optionally, nested data)
      return course;
    });
  }
}