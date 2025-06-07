import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubjectService } from './subject.service';

@Controller('semesters/:semesterId/subjects')
export class SubjectController {
  constructor(private subjectService: SubjectService) {}

  @Get()
  findBySemester(@Param('semesterId') semesterId: string) {
    return this.subjectService.findBySemester(+semesterId);
  }
}

@Controller('subjects')
export class SubjectIdController {
  constructor(private subjectService: SubjectService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectService.findOne(+id);
  }

  @Post('bulk')
  createBulk(
    @Body() dto: { semesterId: number; subjects: { name: string }[] }
  ) {
    return this.subjectService.createBulk(dto.semesterId, dto.subjects);
  }
} 