import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Line,
  PaginatedResponse,
  PaginationMeta,
} from '@prince-net/types';
import type {
  CreateLineInput,
  UpdateLineInput,
} from '@prince-net/validation';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  normalizePagination,
  buildPaginationMeta,
  type PaginationInput,
} from '../common/utils/pagination.util';

interface LineListQuery extends PaginationInput {
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable()
export class LinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: LineListQuery): Promise<PaginatedResponse<Line>> {
    const { page, limit, skip, take, search, order } =
      normalizePagination(query);

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { provider: { contains: search, mode: 'insensitive' as const } },
              { identifier: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.line.findMany({
        where,
        skip,
        take,
        orderBy: { name: order },
      }),
      this.prisma.line.count({ where }),
    ]);

    const data: Line[] = rows.map((row) => this.toLine(row));
    const meta: PaginationMeta = buildPaginationMeta(total, page, limit);

    return { success: true, data, meta };
  }

  async findById(id: string): Promise<Line> {
    const row = await this.prisma.line.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({
        message: 'الخط غير موجود',
        code: 'LINE_NOT_FOUND',
      });
    }
    return this.toLine(row);
  }

  async create(
    input: CreateLineInput,
    userId: string,
    req: { ip?: string; userAgent?: string },
  ): Promise<Line> {
    const row = await this.prisma.line.create({
      data: {
        name: input.name,
        provider: input.provider,
        identifier: input.identifier,
        speed: input.speed ?? null,
        cost: input.cost,
        status: 'ACTIVE',
        subscriptionDate: input.subscriptionDate,
        notes: input.notes ?? null,
      },
    });

    await this.auditService.log({
      userId,
      action: 'LINE_CREATED',
      entityType: 'Line',
      entityId: row.id,
      newValues: {
        name: row.name,
        provider: row.provider,
        identifier: row.identifier,
        cost: row.cost.toString(),
      },
      ipAddress: req.ip ?? null,
      userAgent: req.userAgent ?? null,
    });

    return this.toLine(row);
  }

  async update(
    id: string,
    input: UpdateLineInput,
    userId: string,
    req: { ip?: string; userAgent?: string },
  ): Promise<Line> {
    const existing = await this.prisma.line.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        message: 'الخط غير موجود',
        code: 'LINE_NOT_FOUND',
      });
    }

    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    if (input.name !== undefined && input.name !== existing.name) {
      oldValues.name = existing.name;
      newValues.name = input.name;
    }
    if (input.provider !== undefined && input.provider !== existing.provider) {
      oldValues.provider = existing.provider;
      newValues.provider = input.provider;
    }
    if (
      input.identifier !== undefined &&
      input.identifier !== existing.identifier
    ) {
      oldValues.identifier = existing.identifier;
      newValues.identifier = input.identifier;
    }
    if (input.speed !== undefined && input.speed !== existing.speed) {
      oldValues.speed = existing.speed;
      newValues.speed = input.speed;
    }
    if (input.cost !== undefined && input.cost !== existing.cost.toString()) {
      oldValues.cost = existing.cost.toString();
      newValues.cost = input.cost;
    }
    if (
      input.subscriptionDate !== undefined &&
      input.subscriptionDate.getTime() !== existing.subscriptionDate.getTime()
    ) {
      oldValues.subscriptionDate = existing.subscriptionDate.toISOString();
      newValues.subscriptionDate = input.subscriptionDate.toISOString();
    }
    if (input.notes !== undefined && input.notes !== existing.notes) {
      oldValues.notes = existing.notes;
      newValues.notes = input.notes;
    }

    const row = await this.prisma.line.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.provider !== undefined ? { provider: input.provider } : {}),
        ...(input.identifier !== undefined
          ? { identifier: input.identifier }
          : {}),
        ...(input.speed !== undefined ? { speed: input.speed } : {}),
        ...(input.cost !== undefined ? { cost: input.cost } : {}),
        ...(input.subscriptionDate !== undefined
          ? { subscriptionDate: input.subscriptionDate }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
    });

    await this.auditService.log({
      userId,
      action: 'LINE_UPDATED',
      entityType: 'Line',
      entityId: id,
      oldValues: Object.keys(oldValues).length > 0 ? oldValues : null,
      newValues: Object.keys(newValues).length > 0 ? newValues : null,
      ipAddress: req.ip ?? null,
      userAgent: req.userAgent ?? null,
    });

    return this.toLine(row);
  }

  private toLine(row: {
    id: string;
    name: string;
    provider: string;
    identifier: string;
    speed: string | null;
    cost: { toString(): string };
    status: 'ACTIVE' | 'INACTIVE';
    subscriptionDate: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Line {
    return {
      id: row.id,
      name: row.name,
      provider: row.provider,
      identifier: row.identifier,
      speed: row.speed,
      cost: row.cost.toString(),
      status: row.status,
      subscriptionDate: row.subscriptionDate.toISOString(),
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}