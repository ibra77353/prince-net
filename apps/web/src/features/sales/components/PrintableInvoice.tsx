import type { SaleDetails } from '@prince-net/types';
import type { Settings } from '@prince-net/types';
import { formatMoney } from '../../../lib/currency';
import { formatDate, formatDateTime } from '../../../lib/format';

interface PrintableInvoiceProps {
  sale: SaleDetails;
  settings?: Settings;
}

/**
 * PrintableInvoice — مخفي على الشاشة، يظهر فقط عند الطباعة.
 * يستخدم CSS @media print في globals.css.
 */
export function PrintableInvoice({ sale, settings }: PrintableInvoiceProps) {
  const networkName = settings?.networkName ?? 'Prince Net';
  const currencySymbol = settings?.currencySymbol ?? 'ر.ي';
  const adminEmail = settings?.adminEmail ?? '';
  const isCancelled = sale.status === 'CANCELLED';

  return (
    <div id="printable-invoice" className="print-only invoice-print-area">
      <div className="invoice-header">
        <h1 className="invoice-network-name">{networkName}</h1>
        {adminEmail && <p className="invoice-admin-email">{adminEmail}</p>}
        <h2 className="invoice-title">فاتورة مبيعات</h2>
      </div>

      <div className="invoice-meta">
        <div className="invoice-meta-row">
          <span className="invoice-meta-label">رقم الفاتورة:</span>
          <span className="invoice-meta-value">{sale.invoiceNumber}</span>
        </div>
        <div className="invoice-meta-row">
          <span className="invoice-meta-label">التاريخ:</span>
          <span className="invoice-meta-value">{formatDateTime(sale.saleDate)}</span>
        </div>
        <div className="invoice-meta-row">
          <span className="invoice-meta-label">الحالة:</span>
          <span className="invoice-meta-value">
            {isCancelled ? 'ملغاة' : 'نشطة'}
          </span>
        </div>
      </div>

      {isCancelled && sale.cancellationReason && (
        <div className="invoice-cancelled-note">
          <strong>سبب الإلغاء: </strong>
          {sale.cancellationReason}
        </div>
      )}

      <table className="invoice-items-table">
        <thead>
          <tr>
            <th>الباقة</th>
            <th>الكمية</th>
            <th>سعر الوحدة</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td>{item.packageNameSnapshot}</td>
              <td className="num">{item.quantity}</td>
              <td className="num">{formatMoney(item.unitPrice)} {currencySymbol}</td>
              <td className="num">{formatMoney(item.totalPrice)} {currencySymbol}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals">
        <div className="invoice-total-row">
          <span>الإجمالي:</span>
          <span className="num">{formatMoney(sale.totalAmount)} {currencySymbol}</span>
        </div>
        <div className="invoice-total-row">
          <span>المدفوع:</span>
          <span className="num">{formatMoney(sale.paidAmount)} {currencySymbol}</span>
        </div>
        <div className="invoice-total-row invoice-total-remaining">
          <span>المتبقي:</span>
          <span className="num">{formatMoney(sale.remainingAmount)} {currencySymbol}</span>
        </div>
      </div>

      {sale.notes && (
        <div className="invoice-notes">
          <strong>ملاحظات: </strong>
          {sale.notes}
        </div>
      )}

      <div className="invoice-footer">
        <p>تم إنشاء هذه الفاتورة بواسطة نظام {networkName}</p>
        <p>{formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  );
}
