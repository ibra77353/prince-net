import { Injectable, NotFoundException } from '@nestjs/common';
import type { ExpenseCategory } from '@prince-net/types';
import type {
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
} from '@prince-net/validation';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ExpenseCategory[]> {
    const rows = await this.prisma.expenseCategory.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async findById(id: string): Promise<ExpenseCategory> {
    const row = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException({
        message: 'تصنيف المصروف غير موجود',
        code: 'EXPENSE_CATEGORY_NOT_FOUND',
      });
    }
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async create(
    input: CreateExpenseCategoryInput,
  ): Promise<ExpenseCategory> {
    const row = await this.prisma.expenseCategory.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        isActive: true,
      },
    });

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async update(
    id: string,
    input: UpdateExpenseCategoryInput,
  ): Promise<ExpenseCategory> {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        message: 'تصنيف المصروف غير موجود',
        code: 'EXPENSE_CATEGORY_NOT_FOUND',
      });
    }

    const row = await this.prisma.expenseCategory.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      },
    });

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async activate(id: string): Promise<ExpenseCategory> {
    return this.setActive(id, true);
  }

  async deactivate(id: string): Promise<ExpenseCategory> {
    return this.setActive(id, false);
  }

  private async setActive(
    id: string,
    isActive: boolean,
  ): Promise<ExpenseCategory> {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        message: 'تصنيف المصروف غير موجود',
        code: 'EXPENSE_CATEGORY_NOT_FOUND',
      });
    }

    if (existing.isActive === isActive) {
      return {
        id: existing.id,
        name: existing.name,
        description: existing.description,
        isActive: existing.isActive,
        createdAt: existing.createdAt.toISOString(),
        updatedAt: existing.updatedAt.toISOString(),
      };
    }

    const row = await this.prisma.expenseCategory.update({
      where: { id },
      data: { isActive },
    });

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}