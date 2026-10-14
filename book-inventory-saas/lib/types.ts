export type Branch = { id: string; name: string; location: string; active: boolean };
export type Book = {
  id: string; title: string; isbn: string; sku: string; author: string; publisher: string;
  category: string; costPrice: number; sellingPrice: number; reorderLevel: number; active: boolean;
};
export type InventoryRow = { bookId: string; branchId: string; quantity: number; reserved: number; damaged: number };
export type Supplier = { id: string; name: string; phone: string; email: string; balance: number };
export type Customer = { id: string; name: string; phone: string; email: string; organization?: string };
export type SaleItem = { bookId: string; quantity: number; unitPrice: number; unitCost: number };
export type Sale = { id: string; branchId: string; customerId?: string; items: SaleItem[]; total: number; paymentMethod: string; date: string; cashier: string; reversed?: boolean };
export type PurchaseItem = { bookId: string; quantity: number; unitCost: number };
export type Purchase = { id: string; branchId: string; supplierId: string; items: PurchaseItem[]; total: number; paid: number; date: string; status: 'Draft'|'Ordered'|'Partially Received'|'Received'|'Cancelled' };
export type Expense = { id: string; branchId: string; category: string; amount: number; description: string; date: string };
export type StockMovement = { id: string; bookId: string; branchId: string; quantity: number; type: string; reference: string; reason?: string; date: string; user: string };
export type Transfer = { id: string; fromBranchId: string; toBranchId: string; bookId: string; quantity: number; status: 'Pending'|'Dispatched'|'Received'|'Cancelled'; date: string };
export type Activity = { id: string; message: string; detail: string; date: string; kind: 'sale'|'stock'|'purchase'|'settings'|'user'|'expense' };
export type Staff = { id: string; name: string; email: string; role: 'Owner'|'Manager'|'Stock Manager'|'Cashier'|'Accountant'|'Viewer'; branchId?: string; active: boolean };
export type StoreSettings = { name: string; country: string; currency: string; phone: string; email: string; address: string; taxId: string; receiptFooter: string; lowStockDefault: number };
export type AppState = {
  branches: Branch[]; books: Book[]; inventory: InventoryRow[]; suppliers: Supplier[]; customers: Customer[];
  sales: Sale[]; purchases: Purchase[]; expenses: Expense[]; stockMovements: StockMovement[]; transfers: Transfer[];
  activities: Activity[]; staff: Staff[]; settings: StoreSettings;
};
