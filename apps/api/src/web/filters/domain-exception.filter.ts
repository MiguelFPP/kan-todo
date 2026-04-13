import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
} from '../../core/domain/errors/auth.errors';
import {
  ProjectNotFoundError,
  TaskNotFoundError,
  PermissionDeniedError,
} from '../../core/domain/errors/project.errors';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    if (exception instanceof UserAlreadyExistsError) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof InvalidCredentialsError) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (
      exception instanceof ProjectNotFoundError ||
      exception instanceof TaskNotFoundError
    ) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof PermissionDeniedError) {
      status = HttpStatus.FORBIDDEN;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
