import express from 'express';
import { WhatsAppLog, WhatsAppTemplate, User } from '../models/index.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import whatsappService from '../services/whatsappService.js';

const router = express.Router();

// Get all WhatsApp dispatch logs (Admin only)
router.get('/logs', verifyToken, isAdmin, async (req, res) => {
  try {
    const logs = await WhatsAppLog.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving WhatsApp logs', error: error.message });
  }
});

// Get WhatsApp statistics (Admin only)
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalCount = await WhatsAppLog.count();
    const successCount = await WhatsAppLog.count({ where: { status: 'Delivered' } });
    const failedCount = await WhatsAppLog.count({ where: { status: 'Failed' } });
    const sentCount = await WhatsAppLog.count({ where: { status: 'Sent' } });

    // Count by Type
    const confirmationCount = await WhatsAppLog.count({ where: { messageType: 'Booking Confirmation' } });
    const statusUpdateCount = await WhatsAppLog.count({ where: { messageType: 'Status Update' } });
    const leadGreetingCount = await WhatsAppLog.count({ where: { messageType: 'Lead Greeting' } });
    const manualCount = await WhatsAppLog.count({ where: { messageType: 'Manual' } });

    res.status(200).json({
      totalCount,
      successCount,
      failedCount,
      sentCount,
      byType: {
        confirmationCount,
        statusUpdateCount,
        leadGreetingCount,
        manualCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving WhatsApp stats', error: error.message });
  }
});

// Get all customizable templates (Admin only)
router.get('/templates', verifyToken, isAdmin, async (req, res) => {
  try {
    const templates = await WhatsAppTemplate.findAll();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving templates', error: error.message });
  }
});

// Update a template (Admin only)
router.put('/templates/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { body } = req.body;
    const template = await WhatsAppTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.update({ body });
    res.status(200).json({ message: 'Template updated successfully', template });
  } catch (error) {
    res.status(500).json({ message: 'Error updating template', error: error.message });
  }
});

// Manually send a custom/templated message to a customer (Admin only)
router.post('/send', verifyToken, isAdmin, async (req, res) => {
  try {
    const { recipientName, recipientPhone, messageText, messageType } = req.body;

    if (!recipientName || !recipientPhone || !messageText) {
      return res.status(400).json({ message: 'Please provide recipient details and message text.' });
    }

    const log = await whatsappService.sendMessage({
      recipientName,
      recipientPhone,
      messageText,
      messageType: messageType || 'Manual'
    });

    res.status(201).json({ message: 'Message dispatch processed', log });
  } catch (error) {
    res.status(500).json({ message: 'Error processing manual dispatch', error: error.message });
  }
});

// Retry sending a failed message (Admin only)
router.post('/retry/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const logEntry = await WhatsAppLog.findByPk(req.params.id);
    if (!logEntry) {
      return res.status(404).json({ message: 'Log entry not found.' });
    }

    console.log(`[WhatsApp API Router] Retrying dispatch for log #${logEntry.id}...`);
    
    // Simulate/resend message
    const resultLog = await whatsappService.sendMessage({
      recipientName: logEntry.recipientName,
      recipientPhone: logEntry.recipientPhone,
      messageText: logEntry.messageText,
      messageType: logEntry.messageType
    });

    if (resultLog && resultLog.status === 'Delivered') {
      // Delete the old failed log or mark it as updated/resolved.
      // To keep a clean timeline, let's delete the old failed log.
      await logEntry.destroy();
      res.status(200).json({ message: 'Message sent successfully on retry!', log: resultLog });
    } else {
      res.status(500).json({ 
        message: 'Retry dispatch failed again.', 
        error: resultLog ? resultLog.error : 'Unknown gateway error' 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing retry request', error: error.message });
  }
});

export default router;
