import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SemesterService } from './semester.service';

@Controller('courses/:courseId/semesters')
export class SemesterController {
  constructor(private semesterService: SemesterService) {}

  @Get()
  findByCourse(@Param('courseId') courseId: string) {
    return this.semesterService.findByCourse(+courseId);
  }

  @Post('bulk')
  createBulk(
    @Param('courseId') courseId: string,
    @Body() dto: { semesters: { name: string }[] }
  ) {
    return this.semesterService.createBulk(+courseId, dto.semesters);
  }
} 