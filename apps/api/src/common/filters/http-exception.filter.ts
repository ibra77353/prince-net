import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import type { ApiErrorResponse } from '@prince-net/types';
import { BusinessException } from '../exceptions/business.exception';

/**
 * HttpExceptionFilter — يحوّل كل الأخطاء إلى شكل موحّد:
 *   { success: false, message, code, details? }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{
      status: (code: number) => { json: (body: ApiErrorResponse) => void };
    }>();
    const request = ctx.getRequest<{
      method?: string;
      url?: string;
    }>();

    const payload = this.buildPayload(exception);

    // 4xx = client errors (auth, validation, not found) → warn without stack trace.
    // 5xx = server errors → error with full stack trace for debugging.
    if (payload.statusCode >= 500) {
      this.logger.error(
        `${request.method ?? '-'} ${request.url ?? '-'} → ${payload.statusCode} ${payload.body.code}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method ?? '-'} ${request.url ?? '-'} → ${payload.statusCode} ${payload.body.code}`,
      );
    }

    response.status(payload.statusCode).json(payload.body);
  }

  private buildPayload(exception: unknown): {
    statusCode: number;
    body: ApiErrorResponse;
  } {
    // 1. BusinessException
    if (exception instanceof BusinessException) {
      return {
        statusCode: exception.getStatus(),
        body: {
          success: false,
          message: exception.message,
          code: exception.code,
        },
      };
    }

    // 2. HttpException (Nest)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();

      let message = 'Request failed';
      let code = this.codeFromStatus(status);
      let details: Record<string, unknown> | undefined;

      if (typeof raw === 'string') {
        message = raw;
      } else if (raw !== null && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        if (typeof obj.message === 'string') message = obj.message;
        else if (Array.isArray(obj.message)) message = obj.message.join('; ');
        if (typeof obj.code === 'string') code = obj.code;
        if (obj.details && typeof obj.details === 'object') {
          details = obj.details as Record<string, unknown>;
        }
      }

      return {
        statusCode: status,
        body: {
          success: false,
          message,
          code,
          ...(details ? { details } : {}),
        },
      };
    }

    // 3. Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }

    // 4. Errors with a statusCode property (e.g. csrf-csrf ForbiddenError)
    if (
      exception !== null &&
      typeof exception === 'object' &&
      'statusCode' in exception &&
      typeof (exception as { statusCode: unknown }).statusCode === 'number'
    ) {
      const err = exception as {
        statusCode: number;
        message: string;
        code?: string;
      };
      return {
        statusCode: err.statusCode,
        body: {
          success: false,
          message: err.message,
          code: err.code ?? this.codeFromStatus(err.statusCode),
        },
      };
    }

    // 5. Unknown
    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        success: false,
        message,
        code: 'INTERNAL_ERROR',
      },
    };
  }

  private fromPrismaError(
    err: Prisma.PrismaClientKnownRequestError,
  ): { statusCode: number; body: ApiErrorResponse } {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? '';
        return {
          statusCode: HttpStatus.CONFLICT,
          body: {
            success: false,
            message: `قيمة مكررة${target ? `: ${target}` : ''}`,
            code: 'UNIQUE_VIOLATION',
          },
        };
      }
      case 'P2003':
        return {
          statusCode: HttpStatus.CONFLICT,
          body: {
            success: false,
            message: 'انتهاك علاقة (Foreign key)',
            code: 'FOREIGN_KEY_VIOLATION',
          },
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          body: {
            success: false,
            message: 'العنصر غير موجود',
            code: 'NOT_FOUND',
          },
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          body: {
            success: false,
            message: `Prisma error: ${err.code}`,
            code: `PRISMA_${err.code}`,
          },
        };
    }
  }

  private codeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'HTTP_ERROR';
    }
  }
}
