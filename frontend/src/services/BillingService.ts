/**
 * 💰 BILLING SERVICE - REMOVED IN V130 PURGE
 * Servicio temporal vacío - migrar a GraphQL
 */

// ============================================================================
// BILLING SERVICE CLASS - PURGED
// ============================================================================

class BillingService {
  // REMOVED: All methods purged in V130 - migrate to GraphQL
  async getInvoices() { return []; }
  async getInvoice() { return {}; }
  async createInvoice() { return {}; }
  async updateInvoice() { return {}; }
  async deleteInvoice() { return {}; }
  async getPayments() { return []; }
  async getPayment() { return {}; }
  async createPayment() { return {}; }
  async updatePayment() { return {}; }
  async deletePayment() { return {}; }
  async getInvoiceItems() { return []; }
  async addInvoiceItem() { return {}; }
  async updateInvoiceItem() { return {}; }
  async deleteInvoiceItem() { return {}; }
  async generateInvoicePDF() { return new Blob(); }
  async generatePatientStatementPDF() { return new Blob(); }
  async getIncomeReport() { return {}; }
  async getOutstandingInvoices() { return {}; }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const billingService = new BillingService();
export default billingService;