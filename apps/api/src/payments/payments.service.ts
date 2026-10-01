import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma';
import type {
  Payment,
  PaginatedResponse,
  PaginationMeta,
} from '@prince-net/types';
import type {
  CreatePaymentInput,
  ReversePaymentInput,
} from '@prince-net/validation';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { toMoneyStringRequired } from '../common/utils/money.util';
import {
  normalizePagination,
  buildPaginationMeta,
  type PaginationInput,
} from '../common/utils/pagination.util';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ───────────────────────────────────────────────────────────
  // List payments for a sale
  // ───────────────────────────────────────────────────────────
  async listBySale(
    saleId: string,
    query: PaginationInput,
  ): Promise<PaginatedResponse<Payment>> {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      select: { id: true },
    });
    if (!sale) {
      throw new NotFoundException({
        message: 'الفاتورة غير موجودة',
        code: 'SALE_NOT_FOUND',
      });
    }

    const { page, limit, skip, take, order } = normalizePagination(query);
    const where = { saleId };

    const [rows, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { paymentDate: order },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const data: Payment[] = rows.map((row) => this.toPayment(row));
    const meta: PaginationMeta = buildPaginationMeta(total, page, limit);

    return { success: true, data, meta };
  }

  // ───────────────────────────────────────────────────────────
  // Create payment — Transaction + overpayment prevention
  // ───────────────────────────────────────────────────────────
  async create(
    saleId: string,
    input: CreatePaymentInput,
    userId: string,
    req: { ip?: string; userAgent?: string },
  ): Promise<Payment> {
    return this.prisma.$transaction(
      async (tx) => {
        // ─── 1. Lock Sale ───
        const locked = await tx.$queryRaw<
          {
            id: string;
            status: string;
            total_amount: Prisma.Decimal;
            invoice_number: string;
          }[]
        >`
          SELECT id, status, total_amount, invoice_number
          FROM sales
          WHERE id = ${saleId}::uuid
          FOR UPDATE
        `;

        if (locked.length === 0) {
          throw new NotFoundException({
            message: 'الفاتورة غير موجودة',
            code: 'SALE_NOT_FOUND',
          });
        }

        const sale = locked[0]!;

        if (sale.status !== 'ACTIVE') {
          throw new BusinessException(
            'SALE_NOT_ACTIVE',
            'لا يمكن إضافة دفعة لفاتورة غير مفعّلة',
            400,
          );
        }

        // ─── 2. Compute paid + remaining ───
        const paidAgg = await tx.payment.aggregate({
          where: { saleId, status: 'ACTIVE' },
          _sum: { amount: true },
        });

        const paidAmount = paidAgg._sum.amount ?? new Prisma.Decimal(0);
        const remaining = sale.total_amount.minus(paidAmount);

        const newAmount = new Prisma.Decimal(input.amount);

        // ─── 3. Prevent overpayment ───
        if (newAmount.gt(remaining)) {
          throw new BusinessException(
            'OVERPAYMENT',
            `المبلغ المتبقي ${remaining.toString()}، لا يمكن دفع ${input.amount}`,
            400,
          );
        }

        // ─── 4. Create Payment ───
        const payment = await tx.payment.create({
          data: {
            saleId,
            amount: newAmount,
            status: 'ACTIVE',
            paymentDate: new Date(),
            notes: input.notes ?? null,
            createdBy: userId,
          },
        });

        // ─── 5. Create CashMovement(IN) ───
        await tx.cashMovement.create({
          data: {
            direction: 'IN',
            amount: newAmount,
            sourceType: 'SALE_PAYMENT',
            sourceId: payment.id,
            description: `دفعة لفاتورة ${sale.invoice_number}`,
            createdBy: userId,
          },
        });

        // ─── 6. Audit ───
        await this.auditService.logTx(tx, {
          userId,
          action: 'PAYMENT_CREATED',
          entityType: 'Payment',
          entityId: payment.id,
          newValues: {
            saleId,
            invoiceNumber: sale.invoice_number,
            amount: input.amount,
            remainingBefore: remaining.toString(),
          },
          ipAddress: req.ip ?? null,
          userAgent: req.userAgent ?? null,
        });

        return payment;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 8000,
      },
    ).then((row) => this.toPayment(row));
  }

  // ───────────────────────────────────────────────────────────
  // Reverse payment — Transaction
  // ───────────────────────────────────────────────────────────
  async reverse(
    paymentId: string,
    input: ReversePaymentInput,
    userId: string,
    req: { ip?: string; userAgent?: string },
  ): Promise<Payment> {
    return this.prisma.$transaction(async (tx) => {
      // ─── 1. Lock Payment ───
      const locked = await tx.$queryRaw<
        { id: string; status: string; sale_id: string; amount: Prisma.Decimal }[]
      >`
        SELECT id, status, sale_id, amount
        FROM payments
        WHERE id = ${paymentId}::uuid
        FOR UPDATE
      `;

      if (locked.length === 0) {
        throw new NotFoundException({
          message: 'الدفعة غير موجودة',
          code: 'PAYMENT_NOT_FOUND',
        });
      }

      const payment = locked[0]!;

      // ─── 2. Verify ACTIVE ───
      if (payment.status !== 'ACTIVE') {
        throw new BusinessException(
          'PAYMENT_ALREADY_REVERSED',
          'الدفعة معكوسة بالفعل',
          400,
        );
      }

      // ─── 3. Mark Payment as REVERSED ───
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REVERSED',
          reversedAt: new Date(),
          reversedBy: userId,
          reversalReason: input.reason,
        },
      });

      // ─── 4. Create CashMovement(OUT) ───
      await tx.cashMovement.create({
        data: {
          direction: 'OUT',
          amount: payment.amount,
          sourceType: 'SALE_PAYMENT_REVERSAL',
          sourceId: paymentId,
          description: `عكس دفعة`,
          createdBy: userId,
        },
      });

      // ─── 5. Audit ───
      await this.auditService.logTx(tx, {
        userId,
        action: 'PAYMENT_REVERSED',
        entityType: 'Payment',
        entityId: paymentId,
        oldValues: { status: 'ACTIVE' },
        newValues: {
          status: 'REVERSED',
          reason: input.reason,
          amount: payment.amount.toString(),
        },
        ipAddress: req.ip ?? null,
        userAgent: req.userAgent ?? null,
      });

      return updated;
    }).then((row) => this.toPayment(row));
  }

  // ───────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────
  private toPayment(row: {
    id: string;
    saleId: string;
    amount: Prisma.Decimal;
    status: 'ACTIVE' | 'REVERSED';
    paymentDate: Date;
    notes: string | null;
    createdBy: string;
    createdAt: Date;
    reversedAt: Date | null;
    reversedBy: string | null;
    reversalReason: string | null;
  }): Payment {
    return {
      id: row.id,
      saleId: row.saleId,
      amount: toMoneyStringRequired(row.amount),
      status: row.status,
      paymentDate: row.paymentDate.toISOString(),
      notes: row.notes,
      createdBy: row.createdBy,
      createdAt: row.createdAt.toISOString(),
      reversedAt: row.reversedAt ? row.reversedAt.toISOString() : null,
      reversedBy: row.reversedBy,
      reversalReason: row.reversalReason,
    };
  }
}