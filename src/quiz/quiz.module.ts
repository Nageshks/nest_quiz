import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';
import { SubjectController, SubjectIdController } from './subject.controller';
import { SubjectService } from './subject.service';
import { ModuleController, ModuleIdController, ModulesQuestionsController } from './module.controller';
import { ModuleService } from './module.service';
import { QuestionController, QuestionIdController } from './question.controller';
import { QuestionService } from './question.service';
import { PrismaService } from '../prisma/prisma.service';
import { BackupService } from './backup.service';
import { RestoreService } from './restore.service';
import { BackupRestoreController } from './backup-restore..controller';
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CheckAdminMiddleware } from 'src/common/check-admin.middleware';

@Module({
  controllers: [
    CourseController,
    SemesterController,
    SubjectController,
    SubjectIdController,
    ModuleController,
    ModuleIdController,
    QuestionController,
    QuestionIdController,
    ModulesQuestionsController,
    BackupRestoreController
  ],
  providers: [
    CourseService,
    SemesterService,
    SubjectService,
    ModuleService,
    QuestionService,
    PrismaService,
    BackupService,
    RestoreService
  ],
})
export class QuizModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckAdminMiddleware)
      .forRoutes(
        { path: 'courses/:id', method: RequestMethod.DELETE },

        // Bulk endpoints
        { path: 'modules/:moduleId/questions/bulk', method: RequestMethod.POST },
        { path: 'modules/:moduleId/questions/bulk-import-format', method: RequestMethod.GET },
        
        { path: 'questions/:id', method: RequestMethod.DELETE },

        // Backup & Restore endpoints
        { path: 'backup-restore/course/:id', method: RequestMethod.GET },   
        { path: 'backup-restore/course/upload', method: RequestMethod.POST }, 
      );
  }
}