import { Controller, Get, Param, Post, Body, Delete, NotFoundException } from '@nestjs/common';
import { QuestionService } from './question.service';

type QuestionOptions = {
  [key: string]: string;
};

type QuestionInput = {
  question: string;
  options: QuestionOptions;
  answer: string;
  explanation?: string;
};

// Standard and bulk create endpoints
@Controller('modules/:moduleId/questions')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Get()
  findByModule(@Param('moduleId') moduleId: string) {
    return this.questionService.findByModule(+moduleId);
  }

  @Post('bulk')
  bulkCreate(
    @Param('moduleId') moduleId: string,
    @Body() body: { questions: QuestionInput[] }
  ) {
    return this.questionService.bulkCreate(+moduleId, body.questions);
  }

  // Bulk import with format data (format + questions array)
  @Post('bulk-import-format')
  bulkImportWithFormat(
    @Param('moduleId') moduleId: string,
    @Body() body: { format: string, questions: QuestionInput[] }
  ) {
    return this.questionService.bulkImportWithFormat(+moduleId, body);
  }
}

@Controller('questions')
export class QuestionIdController {
  constructor(private questionService: QuestionService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(+id);
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    const deleted = await this.questionService.deleteQuestionById(+id);
    if (!deleted) throw new NotFoundException('Question not found');
    return { message: 'Question deleted successfully.' };
  }
} 