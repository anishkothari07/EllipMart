import { NextResponse } from 'next/server';
import { orderService } from '@corecart/commerce';
import { formatPrice } from '@corecart/shared';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${order.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #FF5733; }
        .details { display: flex; justify-content: space-between; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background: #f9f9f9; }
        .totals { width: 50%; float: right; }
        .totals table th { text-align: right; }
        .totals table td { text-align: right; }
        .clear { clear: both; }
        @media print {
          .invoice-box { border: none; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <h1>SmartGO</h1>
            <p>Bengaluru, Karnataka, India</p>
          </div>
          <div style="text-align: right;">
            <h2>${order.isBusinessOrder ? 'TAX INVOICE' : 'RETAIL INVOICE'}</h2>
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
        </div>
        
        <div class="details">
          <div>
            <h3>Billed To:</h3>
            <p>${order.shippingName || ''}</p>
            <p>${order.billingAddr || ''}</p>
            <p>${order.shippingEmail || ''}</p>
            ${order.isBusinessOrder ? `<p><strong>GSTIN:</strong> ${order.gstin}</p><p><strong>Company:</strong> ${order.companyName}</p>` : ''}
          </div>
          <div>
            <h3>Shipped To:</h3>
            <p>${order.shippingName || ''}</p>
            <p>${order.shippingStreet || ''}</p>
            <p>${order.shippingCity || ''}, ${order.shippingState || ''} ${order.shippingPostalCode || ''}</p>
            <p>${order.shippingCountry || ''}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.sku}</td>
              <td>${item.quantity}</td>
              <td>${formatPrice(Number(item.unitPrice))}</td>
              <td>${formatPrice(Number(item.totalPrice))}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <th>Subtotal:</th>
              <td>${formatPrice(Number(order.subTotal))}</td>
            </tr>
            ${Number(order.discountTotal) > 0 ? `
            <tr>
              <th>Discount (${order.couponCode || 'Promo'}):</th>
              <td>-${formatPrice(Number(order.discountTotal))}</td>
            </tr>` : ''}
            ${order.cgstDecimal !== null && Number(order.cgstDecimal) > 0 ? `
            <tr>
              <th>CGST (9%):</th>
              <td>+${formatPrice(Number(order.cgstDecimal))}</td>
            </tr>
            <tr>
              <th>SGST (9%):</th>
              <td>+${formatPrice(Number(order.sgstDecimal))}</td>
            </tr>` : ''}
            ${order.igstDecimal !== null && Number(order.igstDecimal) > 0 ? `
            <tr>
              <th>IGST (18%):</th>
              <td>+${formatPrice(Number(order.igstDecimal))}</td>
            </tr>` : ''}
            ${(!order.cgstDecimal && !order.sgstDecimal && !order.igstDecimal) ? `
            <tr>
              <th>Tax:</th>
              <td>${formatPrice(Number(order.taxTotal))}</td>
            </tr>` : ''}
            <tr>
              <th>Shipping:</th>
              <td>${Number(order.shippingTotal) === 0 ? 'Free' : formatPrice(Number(order.shippingTotal))}</td>
            </tr>
            <tr>
              <th><strong>Grand Total:</strong></th>
              <td><strong>${formatPrice(Number(order.grandTotal))}</strong></td>
            </tr>
          </table>
        </div>
        <div class="clear"></div>
        
        <div style="margin-top: 40px; font-size: 12px; color: #777; text-align: center;">

          <p>Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error("Failed to generate invoice:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
