import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  addInventorySchema,
  adjustInventorySchema,
  returnInventorySchema,
  paginationSchema,
  type AddInventoryInput,
  type AdjustInventoryInput,
  type ReturnInventoryInput,
  type PaginationInput,
} from '@prince-net/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';

type AuthUser = { userId: string; email: string };

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async listOverview() {
    return this.inventoryService.listOverview();
  }

  @Get(':packageId')
  async findByPackage(@Param('packageId') packageId: string) {
    return this.inventoryService.findByPackage(packageId);
  }

  @Get(':packageId/movements')
  async listMovements(
    @Param('packageId') packageId: string,
    @Query(new ZodValidationPipe(paginationSchema)) query: PaginationInput,
  ) {
    return this.inventoryService.listMovements(packageId, query);
  }

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body(new ZodValidationPipe(addInventorySchema)) body: AddInventoryInput,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.inventoryService.add(body, user.userId, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  @Post('adjust')
  @HttpCode(HttpStatus.CREATED)
  async adjust(
    @Body(new ZodValidationPipe(adjustInventorySchema))
    body: AdjustInventoryInput,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.inventoryService.adjust(body, user.userId, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  @Post('return')
  @HttpCode(HttpStatus.CREATED)
  async return(
    @Body(new ZodValidationPipe(returnInventorySchema))
    body: ReturnInventoryInput,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.inventoryService.return(body, user.userId, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
}