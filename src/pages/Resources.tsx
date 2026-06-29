import React, { useState } from 'react';
import { Coins, Plus, AlertTriangle, TrendingDown, TrendingUp, ShoppingCart, Info, Wrench, ShieldAlert } from 'lucide-react';
import { db } from '../db/localDb';
import { ResourceLedger, ResourceCategory } from '../types';

interface ResourcesProps {
  state: any;
  onStateChange: () => void;
}

export const Resources: React.FC<ResourcesProps> = ({ state, onStateChange }) => {
  const { resourceLedger } = state;

  // Inventory simulation (persisted on component load/save or kept in localStorage)
  const [barStock, setBarStock] = useState<number>(() => {
    return parseInt(localStorage.getItem('h_inv_bar') || '12');
  });
  const [cleanStock, setCleanStock] = useState<number>(() => {
    return parseInt(localStorage.getItem('h_inv_clean') || '8');
  });
  const [foodStock, setFoodStock] = useState<number>(() => {
    return parseInt(localStorage.getItem('h_inv_food') || '15');
  });

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState<ResourceCategory>('repair');
  const [formAmount, setFormAmount] = useState(100);
  const [formDesc, setFormDesc] = useState('');

  // Calculations
  const totalIncome = resourceLedger
    .filter((l: ResourceLedger) => l.type === 'income')
    .reduce((sum: number, entry: ResourceLedger) => sum + entry.amount, 0);

  const totalExpense = resourceLedger
    .filter((l: ResourceLedger) => l.type === 'expense')
    .reduce((sum: number, entry: ResourceLedger) => sum + entry.amount, 0);

  const balance = totalIncome - totalExpense;

  // Handle Inventory Updates
  const handleUpdateInventory = (item: 'bar' | 'clean' | 'food', value: number) => {
    const val = Math.max(0, value);
    if (item === 'bar') {
      setBarStock(val);
      localStorage.setItem('h_inv_bar', val.toString());
    } else if (item === 'clean') {
      setCleanStock(val);
      localStorage.setItem('h_inv_clean', val.toString());
    } else if (item === 'food') {
      setFoodStock(val);
      localStorage.setItem('h_inv_food', val.toString());
    }
  };

  // Restock inventory via transaction expense
  const handleRestockSupply = (item: 'bar' | 'clean' | 'food') => {
    let cost = 100;
    let name = '';
    let category: ResourceCategory = 'food_beverage';

    if (item === 'bar') {
      cost = 180;
      name = 'whiskey and drink supplies';
      category = 'bar_stock';
    } else if (item === 'clean') {
      cost = 80;
      name = 'cleaning detergents and sprays';
      category = 'cleaning_supplies';
    } else if (item === 'food') {
      cost = 120;
      name = 'kitchen rations and ingredients';
      category = 'food_beverage';
    }

    if (balance < cost) {
      alert(`Ledger Alert: Insufficient hotel budget to buy supplies. Cost is ${cost} HN; available is ${balance} HN.`);
      return;
    }

    // Register expense
    db.saveResourceLedgerEntry({
      id: 'inv_buy_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category,
      amount: cost,
      description: `Purchased restock of ${name} for hotel facilities.`
    });

    // Update stock levels
    if (item === 'bar') handleUpdateInventory('bar', barStock + 10);
    if (item === 'clean') handleUpdateInventory('clean', cleanStock + 10);
    if (item === 'food') handleUpdateInventory('food', foodStock + 12);

    db.logAction('RESTOCK_SUPPLIES', `Purchased restock of ${name} for ${cost} HN.`);
    onStateChange();
  };

  // Save Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) {
      setValidationError('Transaction description details are required.');
      return;
    }
    if (formAmount <= 0) {
      setValidationError('Amount must be greater than zero.');
      return;
    }

    const entry: ResourceLedger = {
      id: 'txn_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: formType,
      category: formCategory,
      amount: formAmount,
      description: formDesc.trim()
    };

    db.saveResourceLedgerEntry(entry);
    setIsModalOpen(false);
    onStateChange();
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Ledger & Facility Supplies</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Inspect operational budgets, track transaction records, and manage physical cleaning supplies.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setFormType('expense');
          setFormCategory('repair');
          setFormAmount(100);
          setFormDesc('');
          setValidationError(null);
          setIsModalOpen(true);
        }} id="add-transaction-btn">
          <Plus size={16} />
          Log Transaction
        </button>
      </div>

      {/* Warning Box */}
      {(balance < 0 || cleanStock < 5 || barStock < 5 || foodStock < 5) && (
        <div className="glass-panel" style={{ padding: '16px', border: '1px solid rgba(220,53,69,0.3)', backgroundColor: 'rgba(114,28,36,0.15)', borderRadius: '6px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b7a', fontWeight: 'bold' }}>
            <ShieldAlert size={18} />
            <span>CRITICAL LOGISTICAL WARNINGS</span>
          </div>
          <ul style={{ paddingLeft: '24px', margin: 0, color: 'var(--color-text-main)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {balance < 0 && <li><strong>FINANCIAL DEFICIT:</strong> Total expenses exceed total income! Hotel runs on debt.</li>}
            {cleanStock < 5 && <li><strong>CLEANING STOCK CRITICAL:</strong> Brooms and spray levels running low ({cleanStock} remaining). Niffty\'s inspection schedule may suffer.</li>}
            {barStock < 5 && <li><strong>BAR STOCK CRITICAL:</strong> Whiskey count is low ({barStock} remaining). Husk reports increased resident irritability.</li>}
            {foodStock < 5 && <li><strong>KITCHEN STOCK LOW:</strong> Food supplies depleted ({foodStock} remaining).</li>}
          </ul>
        </div>
      )}

      {/* Grid: Financial & Supplies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left Card: Ledger Balance Sheet */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
              Financial Balance Sheet
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                  NET HOTEL BALANCE
                </span>
                <strong style={{ fontSize: '1.8rem', color: balance < 0 ? '#ff6b7a' : 'var(--color-gold)' }}>
                  {balance.toLocaleString()} HN
                </strong>
              </div>
              <Coins size={36} style={{ color: balance < 0 ? '#ff6b7a' : 'var(--color-gold)', opacity: 0.6 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ backgroundColor: 'rgba(40,167,69,0.05)', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #28a745' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Total Income Grants</span>
                <strong style={{ color: '#4ce06c', fontSize: '1.1rem' }}>+ {totalIncome.toLocaleString()} HN</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(220,53,69,0.05)', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #dc3545' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Total Expenses Charged</span>
                <strong style={{ color: '#ff6b7a', fontSize: '1.1rem' }}>- {totalExpense.toLocaleString()} HN</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Facility Inventory counts */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
            Facility Inventory Tracker
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { id: 'bar', label: 'Bar Alcohol stock (Husk)', val: barStock, color: barStock < 5 ? '#ff6b7a' : 'var(--color-gold)' },
              { id: 'clean', label: 'Cleaning supply count (Niffty)', val: cleanStock, color: cleanStock < 5 ? '#ff6b7a' : '#4ce06c' },
              { id: 'food', label: 'Kitchen Rations count', val: foodStock, color: foodStock < 5 ? '#ff6b7a' : 'var(--color-text-main)' }
            ].map((inv) => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '4px' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--color-text-main)' }}>{inv.label}</strong>
                  <span style={{ fontSize: '0.75rem', color: inv.color, fontWeight: 'bold' }}>
                    Level: {inv.val} {inv.val < 5 ? '(CRITICAL)' : 'Safe'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => handleUpdateInventory(inv.id as any, inv.val - 1)}
                    style={{ padding: '3px 8px', border: 'none', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-main)', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <button 
                    onClick={() => handleUpdateInventory(inv.id as any, inv.val + 1)}
                    style={{ padding: '3px 8px', border: 'none', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-main)', cursor: 'pointer' }}
                  >
                    +
                  </button>
                  <button 
                    className="btn btn-gold" 
                    style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                    onClick={() => handleRestockSupply(inv.id as any)}
                    id={`buy-${inv.id}-btn`}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transaction Log Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
          Historical Transaction Ledger
        </h3>

        {resourceLedger.length === 0 ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            <Info size={32} style={{ color: 'var(--color-gold-dark)', marginBottom: '8px' }} />
            <p>No transactions registered in this ledger session.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-primary-light)', color: 'var(--color-gold)' }}>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Description details</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {resourceLedger.map((item: ResourceLedger) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="ledger-table-row">
                    <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>{item.date}</td>
                    <td style={{ padding: '10px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>{item.category.replace('_', ' ')}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '1px 5px', 
                        borderRadius: '3px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        backgroundColor: item.type === 'income' ? 'rgba(40,167,69,0.12)' : 'rgba(220,53,69,0.12)',
                        color: item.type === 'income' ? '#4ce06c' : '#ff6b7a'
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--color-text-main)' }}>{item.description}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: item.type === 'income' ? '#4ce06c' : '#ff6b7a' }}>
                      {item.type === 'income' ? '+' : '-'} {item.amount} HN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel art-deco-border" style={{ width: '90%', maxWidth: '440px', padding: '24px' }}>
            <h2 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              Log Transaction
            </h2>

            {validationError && (
              <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.15)', border: '1px solid var(--status-high)', color: '#ff6b7a', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                {validationError}
              </div>
            )}

            <form onSubmit={handleSaveTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="txn-type">Transaction Type</label>
                  <select 
                    id="txn-type" 
                    value={formType} 
                    onChange={(e) => setFormType(e.target.value as 'income' | 'expense')}
                    style={{ width: '100%' }}
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="txn-category">Category</label>
                  <select 
                    id="txn-category" 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value as ResourceCategory)}
                    style={{ width: '100%' }}
                  >
                    <option value="repair">Facility Repair</option>
                    <option value="food_beverage">Food & Rations</option>
                    <option value="bar_stock">Husk\'s Bar Stock</option>
                    <option value="cleaning_supplies">Niffty Cleaning Supplies</option>
                    <option value="security">Perimeter Security</option>
                    <option value="donation">Royal Grant / Donation</option>
                    <option value="reconstruction">Hotel Reconstruction</option>
                    <option value="incident">Incident Containment Cost</option>
                    <option value="custom">Custom Transaction</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="txn-amount">Amount (HN) *</label>
                <input 
                  type="number" 
                  id="txn-amount" 
                  min="1"
                  value={formAmount} 
                  onChange={(e) => setFormAmount(parseInt(e.target.value) || 0)} 
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label htmlFor="txn-desc">Transaction Description *</label>
                <input 
                  type="text" 
                  id="txn-desc" 
                  value={formDesc} 
                  onChange={(e) => setFormDesc(e.target.value)} 
                  style={{ width: '100%' }}
                  placeholder="e.g. Purchased cleaning brooms for Niffty"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} id="cancel-txn-modal-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-txn-modal-btn">
                  Record Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
