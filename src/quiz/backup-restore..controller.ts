import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { BackupService } from './backup.service';
import { RestoreService } from './restore.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('backup-restore')
export class BackupRestoreController {
  constructor(
    private readonly backupService: BackupService,
    private readonly restoreService: RestoreService,
  ) {}

  /**
   * Download the backup of a course and its nested data as a JSON file
   */
  @Get('course/:id')
  async backupCourse(@Param('id') id: string, @Res() res: Response) {
    const courseId = Number(id);
    if (isNaN(courseId)) {
      throw new BadRequestException('Invalid course id');
    }

    try {
      const backupData = await this.backupService.backupCourseById(courseId);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename=course-${courseId}-backup.json`,
      );
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(backupData, null, 2));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to backup course');
    }
  }

  /**
   * Restore a course (and all nested data) from a backup JSON file upload
   */
  @Post('course/upload')
  @UseInterceptors(FileInterceptor('file'))
  async restoreCourseFromFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    let backup;
    try {
      backup = JSON.parse(file.buffer.toString());
    } catch {
      throw new BadRequestException('Invalid JSON file');
    }
    try {
      return await this.restoreService.restoreCourseFromBackup(backup);
    } catch (error) {
      throw new InternalServerErrorException('Failed to restore course');
    }
  }
}