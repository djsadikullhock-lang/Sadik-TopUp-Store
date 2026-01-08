
import { Order } from './types';

export const EmailService = {
  /**
   * Generates the HTML for the Order Confirmation Email
   */
  getConfirmationTemplate(order: Order, customerName: string = "Customer"): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background-color: #fff;">
        <div style="background: #f15a24; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: -1px;">SADIK STORE</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Premium Gaming Top-Up</p>
        </div>
        <div style="padding: 40px; line-height: 1.6; color: #374151;">
          <h2 style="color: #111827; margin-top: 0;">Order Received!</h2>
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>Your order for <strong>${order.productName}</strong> has been received! We are currently verifying your Transaction ID.</p>
          
          <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; color: #7c2d12; font-size: 14px;">Transaction ID:</td>
                <td style="padding: 5px 0; text-align: right; color: #c2410c; font-weight: bold; font-family: monospace;">${order.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #7c2d12; font-size: 14px;">Status:</td>
                <td style="padding: 5px 0; text-align: right; color: #c2410c; font-weight: bold;">PENDING</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">Our team usually processes orders within 5-30 minutes. You will receive a digital invoice once the delivery is complete.</p>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 11px; color: #9ca3af; margin: 0; text-transform: uppercase; letter-spacing: 1px;">© 2025 Sadik Top-Up Store. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  /**
   * Generates the HTML for the Order Completion Email (Digital Invoice)
   */
  getInvoiceTemplate(order: Order): string {
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 20px auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="padding: 40px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px;">
            <div style="flex: 1;">
              <h1 style="color: #f15a24; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">SADIK STORE</h1>
              <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Digital Receipt</p>
            </div>
            <div style="text-align: right; flex: 1;">
              <div style="display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Paid</div>
              <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">ID: ${order.id}</p>
              <p style="color: #6b7280; font-size: 12px; margin: 2px 0 0;">${dateStr}</p>
            </div>
          </div>

          <div style="margin-bottom: 35px;">
            <h3 style="font-size: 12px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Customer Details</h3>
            <p style="font-size: 15px; color: #111827; margin: 4px 0;"><strong>Email:</strong> ${order.userEmail}</p>
            <p style="font-size: 15px; color: #111827; margin: 4px 0;"><strong>Player ID:</strong> <span style="color: #2563eb; font-family: monospace; font-weight: bold; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">${order.playerId}</span></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 35px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="text-align: left; padding: 12px; font-size: 11px; color: #6b7280; border-bottom: 1px solid #e5e7eb; text-transform: uppercase;">Product Description</th>
                <th style="text-align: right; padding: 12px; font-size: 11px; color: #6b7280; border-bottom: 1px solid #e5e7eb; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 20px 12px; font-size: 15px; color: #111827; border-bottom: 1px solid #f3f4f6;">
                  <div style="font-weight: 700;">${order.productName}</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Direct Top-up to ID</div>
                </td>
                <td style="padding: 20px 12px; text-align: right; font-size: 15px; font-weight: 800; color: #111827; border-bottom: 1px solid #f3f4f6;">৳${order.price}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 20px 12px; text-align: right; font-weight: bold; color: #6b7280; font-size: 13px;">GRAND TOTAL</td>
                <td style="padding: 20px 12px; text-align: right; font-size: 22px; font-weight: 900; color: #f15a24;">৳${order.price}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 40px;">
            <div style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">✓</div>
            <p style="margin: 0; color: #166534; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Successfully Delivered</p>
            <p style="margin: 4px 0 0; color: #16a34a; font-size: 13px;">Diamonds/Membership added to your account.</p>
          </div>

          <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 30px;">
            <p style="font-size: 14px; color: #4b5563; margin-bottom: 20px;">Thank you for shopping with Sadik Store!</p>
            <a href="https://wa.me/8801401788594" style="background: #25d366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.3);">
              Contact WhatsApp Support
            </a>
          </div>
        </div>
        <div style="background: #000; color: #6b7280; padding: 20px; text-align: center; font-size: 10px;">
          THIS IS A DIGITALLY GENERATED INVOICE. NO SIGNATURE REQUIRED.
        </div>
      </div>
    `;
  },

  /**
   * Mock function to simulate email delivery.
   * Integration with Nodemailer or Firebase Cloud Functions would happen here.
   */
  async sendEmail(to: string, subject: string, html: string) {
    console.log(`[Email Service] Triggering email...`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    
    // In a real implementation:
    // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to, subject, html }) });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
};
