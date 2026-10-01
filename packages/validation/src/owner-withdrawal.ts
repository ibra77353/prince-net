import { z } from "zod";
import { moneySchema } from "./common";

export const createOwnerWithdrawalSchema = z.object({
  amount: moneySchema,
  reason: z.string().trim().min(1, "السبب مطلوب").max(250),
  notes: z.string().trim().max(500).optional().nullable(),
  withdrawalDate: z.coerce.date().optional(),
});

export const reverseOwnerWithdrawalSchema = z.object({
  reason: z.string().trim().min(1, "سبب العكس مطلوب").max(500),
});

export type CreateOwnerWithdrawalInput = z.infer<
  typeof createOwnerWithdrawalSchema
>;
export type ReverseOwnerWithdrawalInput = z.infer<
  typeof reverseOwnerWithdrawalSchema
>;
