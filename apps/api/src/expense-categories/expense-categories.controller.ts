import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
  type CreateExpenseCategoryInput,
  type UpdateExpenseCategoryInput,
} from '@prince-net/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ExpenseCategoriesService } from './expense-categories.service';

@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(
    private readonly expenseCategoriesService: ExpenseCategoriesService,
  ) {}

  @Get()
  async list() {
    return this.expenseCategoriesService.list();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.expenseCategoriesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createExpenseCategorySchema))
    body: CreateExpenseCategoryInput,
  ) {
    return this.expenseCategoriesService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExpenseCategorySchema))
    body: UpdateExpenseCategoryInput,
  ) {
    return this.expenseCategoriesService.update(id, body);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id') id: string) {
    return this.expenseCategoriesService.activate(id);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string) {
    return this.expenseCategoriesService.deactivate(id);
  }
}