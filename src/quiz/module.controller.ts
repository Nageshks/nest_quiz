import { ModuleService } from './module.service';
import { Controller, Get, Query, BadRequestException, InternalServerErrorException, Param, Post, Body } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Logger } from '@nestjs/common';



@Controller('subjects/:subjectId/modules')
export class ModuleController {
  constructor(private moduleService: ModuleService) {}

  @Get()
  findBySubject(@Param('subjectId') subjectId: string) {
    return this.moduleService.findBySubject(+subjectId);
  }
}

@Controller('module-questions')
export class ModulesQuestionsController {
  constructor(private questionService: QuestionService) {}
  private readonly logger = new Logger(ModulesQuestionsController.name);

  @Get()
  async findAll(@Query('moduleIds') moduleIds: string, @Query('limit') limit?: string) {
    if (!moduleIds) {
      throw new BadRequestException('moduleIds query parameter is required');
    }

    const ids = moduleIds.split(',').map(id => {
      const numId = Number(id);
      if (isNaN(numId)) {
        throw new BadRequestException(`Invalid module ID: ${id}`);
      }
      return numId;
    });

    if (ids.length === 0) {
      throw new BadRequestException('At least one module ID is required');
    }

    let limitNumber = 20;
    if (limit !== undefined) {
      const parsedLimit = Number(limit);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        throw new BadRequestException('limit must be a positive number');
      }
      limitNumber = parsedLimit;
    }

    try {
      return await this.questionService.findByModulesWithLimit(ids, limitNumber);
    } catch (error) {
      this.logger.error('Error in findByModules:', error.stack || error.message || error);
      throw new InternalServerErrorException('Failed to fetch questions by modules');
    }
  }
}

@Controller('modules')
export class ModuleIdController {
  constructor(private moduleService: ModuleService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @Post('bulk')
  createBulk(
    @Body() dto: { subjectId: number; modules: { name: string }[] }
  ) {
    return this.moduleService.createBulk(dto.subjectId, dto.modules);
  }
} 

