import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateTaskStatusUseCase } from '../../core/use-cases/projects/update-task-status.use-case';
import { UploadTaskAttachmentUseCase } from '../../core/use-cases/projects/upload-task-attachment.use-case';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { UpdateTaskStatusSchema } from '@kan-todo/types';
import { TaskResponseDto, UpdateTaskStatusDto } from '../projects/dto/project-swagger.dto';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TaskController {
  constructor(
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    private readonly uploadAttachmentUseCase: UploadTaskAttachmentUseCase,
  ) {}

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') taskId: string,
    @Body(new ZodValidationPipe(UpdateTaskStatusSchema)) dto: UpdateTaskStatusDto,
  ): Promise<TaskResponseDto> {
    return this.updateTaskStatusUseCase.execute({
      userId: user.id,
      taskId,
      newStatus: dto.status,
    });
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment to a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  async uploadAttachment(
    @CurrentUser() user: any,
    @Param('id') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadAttachmentUseCase.execute({
      taskId,
      userId: user.id,
      fileBuffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });
  }
}
