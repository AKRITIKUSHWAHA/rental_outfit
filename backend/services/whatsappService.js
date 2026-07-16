import { WhatsAppLog, WhatsAppTemplate } from '../models/index.js';

class WhatsAppService {
  /**
   * Replace placeholders in template text with actual booking/customer data.
   */
  renderTemplate(text, data) {
    let rendered = text;
    for (const key in data) {
      const placeholder = `{${key}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), data[key]);
    }
    return rendered;
  }

  /**
   * Core dispatch method. Sends the message via Simulated/Mock Gateway
   * or a real Cloud API if credentials are provided in env, and saves to WhatsAppLog.
   */
  async sendMessage({ recipientName, recipientPhone, messageText, messageType }) {
    console.log(`\n--- [WhatsApp API Gateway] New Dispatch Triggered ---`);
    console.log(`Recipient: ${recipientName} (${recipientPhone})`);
    console.log(`Type: ${messageType}`);
    console.log(`Content: "${messageText.replace(/\n/g, ' ')}"`);

    let status = 'Delivered';
    let errorMessage = null;

    // Check for configured live Meta Cloud API details in env (optional placeholder)
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneId = process.env.META_PHONE_NUMBER_ID;

    if (token && phoneId) {
      try {
        console.log(`[WhatsApp API Gateway] Attempting to contact Meta Cloud API...`);
        // Meta WhatsApp Cloud API endpoint
        const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: recipientPhone.startsWith('+') ? recipientPhone : `+91${recipientPhone}`,
            type: "text",
            text: { body: messageText }
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          status = 'Failed';
          errorMessage = resData.error?.message || 'Meta API returned an error';
          console.error(`[WhatsApp API Gateway] Meta API Failed:`, errorMessage);
        } else {
          status = 'Delivered';
          console.log(`[WhatsApp API Gateway] Successfully sent via Meta Cloud API.`);
        }
      } catch (err) {
        status = 'Failed';
        errorMessage = err.message || 'Network error reaching Meta API';
        console.error(`[WhatsApp API Gateway] Connection Error:`, err);
      }
    } else {
      // Mock simulation mode
      console.log(`[WhatsApp API Gateway] MOCK MODE: Message successfully routed to virtual carrier.`);
      status = 'Delivered';
    }

    // Save to Database Logs
    try {
      const log = await WhatsAppLog.create({
        recipientName,
        recipientPhone,
        messageType,
        messageText,
        status,
        error: errorMessage
      });
      console.log(`[WhatsApp API Gateway] Logged to DB (ID: #${log.id}, Status: ${status})`);
      console.log(`----------------------------------------------------\n`);
      return log;
    } catch (dbErr) {
      console.error('[WhatsApp API Gateway] Database logging failed:', dbErr);
      return null;
    }
  }

  /**
   * Helper: Send new booking confirmation
   */
  async sendBookingConfirmation(booking, user, outfit) {
    try {
      const template = await WhatsAppTemplate.findByPk('booking_confirmation');
      if (!template) {
        console.warn('[WhatsApp Service] booking_confirmation template not found.');
        return;
      }

      const data = {
        name: user.name,
        outfit: outfit.name,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
        bookingId: booking.id
      };

      const messageText = this.renderTemplate(template.body, data);
      await this.sendMessage({
        recipientName: user.name,
        recipientPhone: user.phone || '',
        messageText,
        messageType: 'Booking Confirmation'
      });
    } catch (err) {
      console.error('[WhatsApp Service] Error sending booking confirmation:', err);
    }
  }

  /**
   * Helper: Send status update alert
   */
  async sendBookingStatusUpdate(booking, user, outfit) {
    try {
      const template = await WhatsAppTemplate.findByPk('status_update');
      if (!template) {
        console.warn('[WhatsApp Service] status_update template not found.');
        return;
      }

      const data = {
        name: user.name,
        bookingId: booking.id,
        outfit: outfit?.name || `Lehenga Outfit #${booking.outfitId}`,
        status: booking.status
      };

      const messageText = this.renderTemplate(template.body, data);
      await this.sendMessage({
        recipientName: user.name,
        recipientPhone: user.phone || '',
        messageText,
        messageType: 'Status Update'
      });
    } catch (err) {
      console.error('[WhatsApp Service] Error sending booking status update:', err);
    }
  }

  /**
   * Helper: Send lead greeting welcome message
   */
  async sendLeadGreeting(customer) {
    try {
      const template = await WhatsAppTemplate.findByPk('lead_greeting');
      if (!template) {
        console.warn('[WhatsApp Service] lead_greeting template not found.');
        return;
      }

      const data = {
        name: customer.name
      };

      const messageText = this.renderTemplate(template.body, data);
      await this.sendMessage({
        recipientName: customer.name,
        recipientPhone: customer.phone || '',
        messageText,
        messageType: 'Lead Greeting'
      });
    } catch (err) {
      console.error('[WhatsApp Service] Error sending lead greeting:', err);
    }
  }
}

export default new WhatsAppService();
