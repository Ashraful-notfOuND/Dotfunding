import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service for generating transaction receipt PDFs
 */
class TransactionPDFService {
  constructor() {
    // Ensure receipts directory exists
    this.receiptsDir = path.join(__dirname, '../../receipts');
    if (!fs.existsSync(this.receiptsDir)) {
      fs.mkdirSync(this.receiptsDir, { recursive: true });
    }
  }

  /**
   * Generate a PDF receipt for a transaction
   * @param {Object} transactionData - Transaction details
   * @returns {Promise<string>} - Path to generated PDF file
   */
  async generateReceipt(transactionData) {
    const {
      tran_id,
      val_id,
      project_id,
      project_title,
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      reward_title,
      amount,
      currency = 'BDT',
      status,
      transaction_date,
      card_type,
      card_brand,
      card_issuer,
      gateway_type = 'SSLCommerz',
    } = transactionData;

    return new Promise((resolve, reject) => {
      try {
        const filename = `receipt_${tran_id}_${Date.now()}.pdf`;
        const filepath = path.join(this.receiptsDir, filename);
        
        // Create a document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Transaction Receipt - ${tran_id}`,
            Author: 'Dotfunding Platform',
            Subject: 'Payment Receipt',
          }
        });

        // Pipe the PDF to a file
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header with background
        doc.rect(0, 0, 595.28, 100)
          .fillAndStroke('#0891b2', '#0891b2');
        
        doc.fontSize(28)
          .font('Helvetica-Bold')
          .fillColor('#ffffff')
          .text('DOTFUNDING', 50, 30, { align: 'center' })
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#e0f2fe')
          .text('Crowdfunding Platform - Transaction Receipt', 50, 65, { align: 'center' })
          .fillColor('#000000'); // Reset color

        // Move below header
        doc.y = 120;
        
        // Title with icon
        doc.fontSize(20)
          .font('Helvetica-Bold')
          .fillColor('#0891b2')
          .text('Payment Receipt', { align: 'center' })
          .moveDown(1.5);

        // Status Badge
        const statusColor = status === 'success' ? '#10b981' : status === 'failed' ? '#ef4444' : '#f59e0b';
        doc.fontSize(12)
          .fillColor(statusColor)
          .text(`Status: ${status.toUpperCase()}`, { align: 'center' })
          .fillColor('#000000')
          .moveDown(2);

        // Transaction Information Section
        this._addSection(doc, 'Transaction Information', [
          { label: 'Transaction ID', value: tran_id },
          { label: 'Validation ID', value: val_id || 'N/A' },
          { label: 'Transaction Date', value: new Date(transaction_date).toLocaleString('en-US', { 
            dateStyle: 'full', 
            timeStyle: 'long',
            timeZone: 'Asia/Dhaka'
          })},
          { label: 'Payment Gateway', value: gateway_type },
        ]);

        // Project Information Section
        this._addSection(doc, 'Project Information', [
          { label: 'Project Title', value: project_title || 'N/A' },
          { label: 'Project ID', value: project_id || 'N/A' },
          { label: 'Reward', value: reward_title || 'General Pledge' },
        ]);

        // Customer Information Section
        this._addSection(doc, 'Customer Information', [
          { label: 'Name', value: customer_name || 'N/A' },
          { label: 'Email', value: customer_email || 'N/A' },
          { label: 'Phone', value: customer_phone || 'N/A' },
          { label: 'Address', value: customer_address || 'N/A' },
        ]);

        // Payment Details Section
        const paymentDetails = [
          { label: 'Amount', value: `BDT ${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, bold: true },
        ];

        if (card_type || card_brand) {
          paymentDetails.push({ label: 'Payment Method', value: `${card_brand || ''} ${card_type || ''}`.trim() || 'N/A' });
        }
        if (card_issuer) {
          paymentDetails.push({ label: 'Card Issuer', value: card_issuer });
        }

        this._addSection(doc, 'Payment Details', paymentDetails);

        // Total Amount Box - Improved Design
        doc.moveDown(1.5);
        const boxY = doc.y;
        const boxHeight = 70;
        const boxWidth = 495;
        
        // Draw gradient-like box with border
        doc.rect(50, boxY, boxWidth, boxHeight)
          .fillAndStroke('#e0f2fe', '#0891b2');
        
        // Add decorative line
        doc.moveTo(50, boxY + 35)
          .lineTo(545, boxY + 35)
          .strokeColor('#cbd5e1')
          .lineWidth(1)
          .stroke();
        
        // Add text inside the box with proper positioning
        doc.fontSize(11)
          .fillColor('#0f172a')
          .font('Helvetica')
          .text('TOTAL AMOUNT PAID', 70, boxY + 12, { continued: false, width: 455, align: 'left' });
          
        doc.fontSize(28)
          .fillColor('#0891b2')
          .font('Helvetica-Bold')
          .text(`BDT ${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 70, boxY + 38, { continued: false, width: 455, align: 'left' });

        // Footer
        doc.moveDown(4);
        
        // Add a separator line
        doc.moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .strokeColor('#e5e7eb')
          .lineWidth(1)
          .stroke();
        
        doc.moveDown(1);
        doc.fontSize(8)
          .fillColor('#6b7280')
          .font('Helvetica')
          .text('This is a computer-generated receipt and does not require a signature.', { align: 'center' })
          .moveDown(0.5)
          .text('For any queries, please contact support@dotfunding.com', { align: 'center' })
          .moveDown(0.5)
          .text(`Generated on: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}`, { align: 'center' });

        // Finalize the PDF
        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (err) => {
          reject(err);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Helper method to add a section to the PDF
   * @private
   */
  _addSection(doc, title, items) {
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text(title)
      .moveDown(0.5);

    items.forEach((item) => {
      const y = doc.y;
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(`${item.label}:`, 50, y, { width: 150, continued: false });
      
      doc.font(item.bold ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor('#000000')
        .text(item.value || 'N/A', 220, y, { width: 325 });
      
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
  }

  /**
   * Get the URL for a receipt file
   * @param {string} filename - Receipt filename
   * @returns {string} - URL to access the receipt
   */
  getReceiptUrl(filename) {
    // This should be your backend URL in production
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${baseUrl}/api/receipts/${path.basename(filename)}`;
  }

  /**
   * Delete old receipt files (optional cleanup)
   * @param {number} daysOld - Delete files older than this many days
   */
  async cleanupOldReceipts(daysOld = 90) {
    try {
      const files = fs.readdirSync(this.receiptsDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filepath = path.join(this.receiptsDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          fs.unlinkSync(filepath);
          console.log(`Deleted old receipt: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error cleaning up old receipts:', error);
    }
  }

  /**
   * Check if a receipt file exists
   * @param {string} filename - Receipt filename
   * @returns {boolean}
   */
  receiptExists(filename) {
    const filepath = path.join(this.receiptsDir, filename);
    return fs.existsSync(filepath);
  }

  /**
   * Get receipt file path
   * @param {string} filename - Receipt filename
   * @returns {string}
   */
  getReceiptPath(filename) {
    return path.join(this.receiptsDir, filename);
  }
}

export default new TransactionPDFService();
