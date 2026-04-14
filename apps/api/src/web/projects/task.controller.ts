import {
  Body,
  Controller,
  Param,
  Patch,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UpdateTaskStatusUseCase } from '../../core/use-cases/projects/update-task-status.use-case';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { UpdateTaskStatusSchema } from '@kan-todo/types';
import { TaskResponseDto, UpdateTaskStatusDto } from '../projects/dto/project-swagger.dto';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TaskController {
  constructor(private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase) {}

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
}
