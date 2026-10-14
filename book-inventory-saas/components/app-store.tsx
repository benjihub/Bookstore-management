'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoState } from '@/lib/demo-data';
import { AppState, Book, Customer, Expense, Purchase, Sale, Staff, Supplier, Transfer } from '@/lib/types';
import { uid } from '@/lib/utils';

type StoreContextValue = {
  state: AppState;
  selectedBranch: string;
  setSelectedBranch: (id: string) => void;
  addBook: (book: Omit<Book, 'id'>, openingQty?: number, branchId?: string) => void;
  adjustStock: (bookId: string, branchId: string, delta: number, reason: string) => void;
  completeSale: (sale: Omit<Sale, 'id'|'date'|'cashier'>) => string;
  reverseSale: (saleId: string) => void;
  receivePurchase: (purchase: Omit<Purchase, 'id'|'date'|'status'>) => string;
  addSupplier: (supplier: Omit<Supplier, 'id'|'balance'>) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'|'date'>) => void;
  createTransfer: (transfer: Omit<Transfer, 'id'|'date'|'status'>) => string;
  receiveTransfer: (transferId: string) => void;
  addStaff: (staff: Omit<Staff, 'id'|'active'>) => void;
  updateSettings: (patch: Partial<AppState['settings']>) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const STORAGE_KEY = 'bookstock-demo-state-v1';

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(demoState);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const log = (message: string, detail: string, kind: AppState['activities'][number]['kind']) => ({
    id: uid('a'), message, detail, kind, date: new Date().toISOString()
  });

  const addBook: StoreContextValue['addBook'] = (book, openingQty = 0, branchId = 'br-main') => {
    const id = uid('book');
    setState(s => ({
      ...s,
      books: [{ ...book, id }, ...s.books],
      inventory: openingQty > 0 ? [{ bookId: id, branchId, quantity: openingQty, reserved: 0, damaged: 0 }, ...s.inventory] : s.inventory,
      stockMovements: openingQty > 0 ? [{ id: uid('m'), bookId: id, branchId, quantity: openingQty, type: 'OPENING_STOCK', reference: 'Book setup', date: new Date().toISOString(), user: 'Owner' }, ...s.stockMovements] : s.stockMovements,
      activities: [log(`Book added: ${book.title}`, openingQty ? `Opening stock: ${openingQty}` : 'No opening stock', 'stock'), ...s.activities]
    }));
  };

  const adjustStock: StoreContextValue['adjustStock'] = (bookId, branchId, delta, reason) => {
    if (!delta) return;
    setState(s => {
      const current = s.inventory.find(i => i.bookId === bookId && i.branchId === branchId)?.quantity ?? 0;
      if (current + delta < 0) return s;
      const exists = s.inventory.some(i => i.bookId === bookId && i.branchId === branchId);
      const inventory = exists
        ? s.inventory.map(i => i.bookId === bookId && i.branchId === branchId ? { ...i, quantity: i.quantity + delta } : i)
        : [{ bookId, branchId, quantity: delta, reserved: 0, damaged: 0 }, ...s.inventory];
      const book = s.books.find(b => b.id === bookId);
      return {
        ...s,
        inventory,
        stockMovements: [{ id: uid('m'), bookId, branchId, quantity: delta, type: delta > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT', reference: 'Manual adjustment', reason, date: new Date().toISOString(), user: 'Owner' }, ...s.stockMovements],
        activities: [log('Stock adjusted', `${book?.title ?? 'Book'} ${delta > 0 ? '+' : ''}${delta} · ${reason}`, 'stock'), ...s.activities]
      };
    });
  };

  const completeSale: StoreContextValue['completeSale'] = sale => {
    const id = `SAL-${String(Date.now()).slice(-6)}`;
    setState(s => {
      for (const item of sale.items) {
        const q = s.inventory.find(i => i.bookId === item.bookId && i.branchId === sale.branchId)?.quantity ?? 0;
        if (q < item.quantity) return s;
      }
      let inventory = s.inventory;
      const movements = [...s.stockMovements];
      for (const item of sale.items) {
        inventory = inventory.map(i => i.bookId === item.bookId && i.branchId === sale.branchId ? { ...i, quantity: i.quantity - item.quantity } : i);
        movements.unshift({ id: uid('m'), bookId: item.bookId, branchId: sale.branchId, quantity: -item.quantity, type: 'SALE', reference: id, date: new Date().toISOString(), user: 'Current cashier' });
      }
      return {
        ...s,
        inventory,
        stockMovements: movements,
        sales: [{ ...sale, id, date: new Date().toISOString(), cashier: 'Current cashier' }, ...s.sales],
        activities: [log(`Sale ${id} completed`, `${s.settings.currency} ${sale.total.toLocaleString()} · ${sale.paymentMethod}`, 'sale'), ...s.activities]
      };
    });
    return id;
  };

  const reverseSale: StoreContextValue['reverseSale'] = saleId => {
    setState(s => {
      const sale = s.sales.find(x => x.id === saleId);
      if (!sale || sale.reversed) return s;
      let inventory = s.inventory;
      const movements = [...s.stockMovements];
      for (const item of sale.items) {
        const exists = inventory.some(i => i.bookId === item.bookId && i.branchId === sale.branchId);
        inventory = exists
          ? inventory.map(i => i.bookId === item.bookId && i.branchId === sale.branchId ? { ...i, quantity: i.quantity + item.quantity } : i)
          : [{ bookId: item.bookId, branchId: sale.branchId, quantity: item.quantity, reserved: 0, damaged: 0 }, ...inventory];
        movements.unshift({ id: uid('m'), bookId: item.bookId, branchId: sale.branchId, quantity: item.quantity, type: 'SALE_RETURN', reference: saleId, reason: 'Sale reversed', date: new Date().toISOString(), user: 'Owner' });
      }
      return {
        ...s,
        inventory,
        stockMovements: movements,
        sales: s.sales.map(x => x.id === saleId ? { ...x, reversed: true } : x),
        activities: [log(`Sale ${saleId} reversed`, 'Stock restored with audit trail', 'sale'), ...s.activities]
      };
    });
  };

  const receivePurchase: StoreContextValue['receivePurchase'] = purchase => {
    const id = `PO-${String(Date.now()).slice(-5)}`;
    setState(s => {
      let inventory = s.inventory;
      const movements = [...s.stockMovements];
      for (const item of purchase.items) {
        const exists = inventory.some(i => i.bookId === item.bookId && i.branchId === purchase.branchId);
        inventory = exists
          ? inventory.map(i => i.bookId === item.bookId && i.branchId === purchase.branchId ? { ...i, quantity: i.quantity + item.quantity } : i)
          : [{ bookId: item.bookId, branchId: purchase.branchId, quantity: item.quantity, reserved: 0, damaged: 0 }, ...inventory];
        movements.unshift({ id: uid('m'), bookId: item.bookId, branchId: purchase.branchId, quantity: item.quantity, type: 'PURCHASE', reference: id, date: new Date().toISOString(), user: 'Owner' });
      }
      const due = Math.max(0, purchase.total - purchase.paid);
      return {
        ...s,
        inventory,
        stockMovements: movements,
        purchases: [{ ...purchase, id, date: new Date().toISOString(), status: 'Received' }, ...s.purchases],
        suppliers: s.suppliers.map(x => x.id === purchase.supplierId ? { ...x, balance: x.balance + due } : x),
        activities: [log(`Purchase ${id} received`, `${purchase.items.reduce((a,b)=>a+b.quantity,0)} copies added to stock`, 'purchase'), ...s.activities]
      };
    });
    return id;
  };

  const addSupplier: StoreContextValue['addSupplier'] = supplier => setState(s => ({ ...s, suppliers: [{ ...supplier, id: uid('sup'), balance: 0 }, ...s.suppliers], activities: [log(`Supplier added: ${supplier.name}`, supplier.phone || supplier.email, 'purchase'), ...s.activities] }));
  const addCustomer: StoreContextValue['addCustomer'] = customer => setState(s => ({ ...s, customers: [{ ...customer, id: uid('cus') }, ...s.customers], activities: [log(`Customer added: ${customer.name}`, customer.organization || customer.phone, 'user'), ...s.activities] }));
  const addExpense: StoreContextValue['addExpense'] = expense => setState(s => ({ ...s, expenses: [{ ...expense, id: uid('exp'), date: new Date().toISOString() }, ...s.expenses], activities: [log(`Expense recorded: ${expense.category}`, `${s.settings.currency} ${expense.amount.toLocaleString()} · ${expense.description}`, 'expense'), ...s.activities] }));

  const createTransfer: StoreContextValue['createTransfer'] = transfer => {
    const id = `TR-${String(Date.now()).slice(-5)}`;
    setState(s => {
      const q = s.inventory.find(i => i.bookId === transfer.bookId && i.branchId === transfer.fromBranchId)?.quantity ?? 0;
      if (q < transfer.quantity || transfer.quantity <= 0 || transfer.fromBranchId === transfer.toBranchId) return s;
      return {
        ...s,
        transfers: [{ ...transfer, id, status: 'Dispatched', date: new Date().toISOString() }, ...s.transfers],
        inventory: s.inventory.map(i => i.bookId === transfer.bookId && i.branchId === transfer.fromBranchId ? { ...i, quantity: i.quantity - transfer.quantity } : i),
        stockMovements: [{ id: uid('m'), bookId: transfer.bookId, branchId: transfer.fromBranchId, quantity: -transfer.quantity, type: 'TRANSFER_OUT', reference: id, date: new Date().toISOString(), user: 'Owner' }, ...s.stockMovements],
        activities: [log(`Transfer ${id} dispatched`, `${transfer.quantity} copies awaiting receipt`, 'stock'), ...s.activities]
      };
    });
    return id;
  };

  const receiveTransfer: StoreContextValue['receiveTransfer'] = transferId => setState(s => {
    const transfer = s.transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status === 'Received' || transfer.status === 'Cancelled') return s;
    const exists = s.inventory.some(i => i.bookId === transfer.bookId && i.branchId === transfer.toBranchId);
    const inventory = exists
      ? s.inventory.map(i => i.bookId === transfer.bookId && i.branchId === transfer.toBranchId ? { ...i, quantity: i.quantity + transfer.quantity } : i)
      : [{ bookId: transfer.bookId, branchId: transfer.toBranchId, quantity: transfer.quantity, reserved: 0, damaged: 0 }, ...s.inventory];
    return {
      ...s,
      inventory,
      transfers: s.transfers.map(t => t.id === transferId ? { ...t, status: 'Received' } : t),
      stockMovements: [{ id: uid('m'), bookId: transfer.bookId, branchId: transfer.toBranchId, quantity: transfer.quantity, type: 'TRANSFER_IN', reference: transferId, date: new Date().toISOString(), user: 'Owner' }, ...s.stockMovements],
      activities: [log(`Transfer ${transferId} received`, `${transfer.quantity} copies added to destination branch`, 'stock'), ...s.activities]
    };
  });

  const addStaff: StoreContextValue['addStaff'] = staff => setState(s => ({ ...s, staff: [{ ...staff, id: uid('usr'), active: true }, ...s.staff], activities: [log(`Staff invited: ${staff.name}`, `${staff.role} · ${staff.email}`, 'user'), ...s.activities] }));
  const updateSettings: StoreContextValue['updateSettings'] = patch => setState(s => ({ ...s, settings: { ...s.settings, ...patch }, activities: [log('Store settings updated', 'Business profile changed', 'settings'), ...s.activities] }));
  const resetDemo = () => { setState(demoState); setSelectedBranch('all'); window.localStorage.removeItem(STORAGE_KEY); };

  const value = useMemo(() => ({ state, selectedBranch, setSelectedBranch, addBook, adjustStock, completeSale, reverseSale, receivePurchase, addSupplier, addCustomer, addExpense, createTransfer, receiveTransfer, addStaff, updateSettings, resetDemo }), [state, selectedBranch]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}
