import { AppState } from './types';

export const demoState: AppState = {
  branches: [
    { id: 'br-main', name: 'Kampala Main', location: 'Kampala', active: true },
    { id: 'br-ntinda', name: 'Ntinda Branch', location: 'Ntinda', active: true },
    { id: 'br-entebbe', name: 'Entebbe Branch', location: 'Entebbe', active: true }
  ],
  books: [
    { id: 'b1', title: 'Primary Mathematics P7', isbn: '9789970123451', sku: 'MATH-P7', author: 'A. Kato', publisher: 'MK Publishers', category: 'Education', costPrice: 18000, sellingPrice: 25000, reorderLevel: 8, active: true },
    { id: 'b2', title: 'English Grammar S2', isbn: '9789970123452', sku: 'ENG-S2', author: 'Jane Namusoke', publisher: 'Fountain', category: 'Education', costPrice: 15000, sellingPrice: 22000, reorderLevel: 10, active: true },
    { id: 'b3', title: 'Things Fall Apart', isbn: '9780385474542', sku: 'NOV-TFA', author: 'Chinua Achebe', publisher: 'Penguin', category: 'Fiction', costPrice: 24000, sellingPrice: 35000, reorderLevel: 5, active: true },
    { id: 'b4', title: 'Advanced Physics S5', isbn: '9789970123454', sku: 'PHY-S5', author: 'D. Okello', publisher: 'Longhorn', category: 'Science', costPrice: 32000, sellingPrice: 45000, reorderLevel: 6, active: true },
    { id: 'b5', title: 'The River Between', isbn: '9780435905484', sku: 'NOV-RB', author: 'Ngugi wa Thiong\'o', publisher: 'Heinemann', category: 'Fiction', costPrice: 20000, sellingPrice: 30000, reorderLevel: 5, active: true }
  ],
  inventory: [
    { bookId: 'b1', branchId: 'br-main', quantity: 42, reserved: 0, damaged: 1 },
    { bookId: 'b1', branchId: 'br-ntinda', quantity: 15, reserved: 0, damaged: 0 },
    { bookId: 'b1', branchId: 'br-entebbe', quantity: 7, reserved: 0, damaged: 0 },
    { bookId: 'b2', branchId: 'br-main', quantity: 20, reserved: 0, damaged: 0 },
    { bookId: 'b2', branchId: 'br-ntinda', quantity: 9, reserved: 0, damaged: 0 },
    { bookId: 'b3', branchId: 'br-main', quantity: 12, reserved: 0, damaged: 0 },
    { bookId: 'b3', branchId: 'br-entebbe', quantity: 3, reserved: 0, damaged: 0 },
    { bookId: 'b4', branchId: 'br-main', quantity: 4, reserved: 0, damaged: 0 },
    { bookId: 'b5', branchId: 'br-main', quantity: 8, reserved: 0, damaged: 0 }
  ],
  suppliers: [
    { id: 's1', name: 'MK Publishers', phone: '+256 700 111222', email: 'sales@mk.example', balance: 400000 },
    { id: 's2', name: 'Fountain Publishers', phone: '+256 700 333444', email: 'orders@fountain.example', balance: 0 }
  ],
  customers: [
    { id: 'c1', name: 'Greenhill Academy', phone: '+256 772 111111', email: 'procurement@greenhill.example', organization: 'School' },
    { id: 'c2', name: 'Sarah Nakato', phone: '+256 701 222222', email: 'sarah@example.com' }
  ],
  sales: [
    { id: 'SAL-001283', branchId: 'br-main', items: [{ bookId: 'b1', quantity: 2, unitPrice: 25000, unitCost: 18000 }, { bookId: 'b2', quantity: 1, unitPrice: 22000, unitCost: 15000 }], total: 72000, paymentMethod: 'Mobile Money', date: '2026-10-14T07:30:00.000Z', cashier: 'Sarah' },
    { id: 'SAL-001282', branchId: 'br-ntinda', customerId: 'c1', items: [{ bookId: 'b3', quantity: 3, unitPrice: 35000, unitCost: 24000 }], total: 105000, paymentMethod: 'Bank', date: '2026-10-13T11:00:00.000Z', cashier: 'James' }
  ],
  purchases: [
    { id: 'PO-00041', branchId: 'br-main', supplierId: 's1', items: [{ bookId: 'b1', quantity: 50, unitCost: 18000 }], total: 900000, paid: 500000, date: '2026-10-10T08:00:00.000Z', status: 'Received' }
  ],
  expenses: [
    { id: 'EXP-001', branchId: 'br-main', category: 'Transport', amount: 65000, description: 'Supplier collection', date: '2026-10-12T09:00:00.000Z' },
    { id: 'EXP-002', branchId: 'br-main', category: 'Internet', amount: 120000, description: 'Monthly internet', date: '2026-10-01T08:00:00.000Z' }
  ],
  stockMovements: [
    { id: 'm1', bookId: 'b1', branchId: 'br-main', quantity: 50, type: 'PURCHASE', reference: 'PO-00041', date: '2026-10-10T08:00:00.000Z', user: 'Benjamin' },
    { id: 'm2', bookId: 'b1', branchId: 'br-main', quantity: -2, type: 'SALE', reference: 'SAL-001283', date: '2026-10-14T07:30:00.000Z', user: 'Sarah' }
  ],
  transfers: [
    { id: 'TR-0045', fromBranchId: 'br-main', toBranchId: 'br-ntinda', bookId: 'b2', quantity: 5, status: 'Pending', date: '2026-10-14T06:30:00.000Z' }
  ],
  activities: [
    { id: 'a1', message: 'Sale SAL-001283 completed', detail: 'UGX 72,000 · Kampala Main', date: '2026-10-14T07:30:00.000Z', kind: 'sale' },
    { id: 'a2', message: 'Purchase PO-00041 received', detail: '50 copies · MK Publishers', date: '2026-10-10T08:00:00.000Z', kind: 'purchase' },
    { id: 'a3', message: 'Stock adjusted', detail: '1 damaged copy recorded for Primary Mathematics P7', date: '2026-10-09T15:12:00.000Z', kind: 'stock' }
  ],
  staff: [
    { id: 'u1', name: 'Benjamin W.', email: 'owner@bookstock.example', role: 'Owner', active: true },
    { id: 'u2', name: 'Sarah N.', email: 'sarah@bookstock.example', role: 'Cashier', branchId: 'br-main', active: true },
    { id: 'u3', name: 'James K.', email: 'james@bookstock.example', role: 'Manager', branchId: 'br-ntinda', active: true }
  ],
  settings: {
    name: 'BookStock Demo Store', country: 'Uganda', currency: 'UGX', phone: '+256 700 000000',
    email: 'hello@bookstock.example', address: 'Kampala, Uganda', taxId: '',
    receiptFooter: 'Thank you for shopping with us.', lowStockDefault: 5
  }
};
