import { Body, Controller, Get, Param, Post, Delete, Headers, NotFoundException } from '@nestjs/common';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Post()
  create(@Body() dto: { name: string }) {
    return this.courseService.create(dto);
  }

  @Delete(':id')
  async deleteCourse(
    @Param('id') id: string,
  ) {
    const deleted = await this.courseService.deleteCourseAndRelatedData(+id);
    if (!deleted) throw new NotFoundException('Course not found');
    return { message: 'Course and all related data deleted.' };
  }
}