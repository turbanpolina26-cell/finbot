import React, { useState } from 'react';
import { SavingsAccount } from '../types';
import { SavingsHeader } from './SavingsHeader';
import { AccountsList } from './AccountsList';
import { AddAccountModal } from './AddAccountModal';
import { ProjectionChart } from './ProjectionChart';

interface Props {
  accounts: SavingsAccount[];
  onAddAccount: (account: SavingsAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const SavingsView: React.FC<Props> = ({ accounts, onAddAccount, onDeleteAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  const handleRemoveClick = (id: string) => {
    if (removingIds.includes(id)) return;
    setRemovingIds((s) => [...s, id]);
    setTimeout(() => {
      try {
        onDeleteAccount(id);
      } finally {
        setRemovingIds((s) => s.filter(x => x !== id));
      }
    }, 350);
  };

  // Listen for global event from FAB to open savings modal (fallback)
  React.useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener('openSavingsModal', handler as EventListener);
    return () => window.removeEventListener('openSavingsModal', handler as EventListener);
  }, []);

  // Calculations
  const totalCapital = accounts.reduce((sum, acc) => {
    const amt = Number(acc.amount) || 0;
    return sum + amt;
  }, 0);

  const yearlyIncome = accounts.reduce((sum, acc) => {
    const amt = Number(acc.amount) || 0;
    const rate = Number(acc.apy) || 0;
    return sum + (amt * (rate / 100));
  }, 0);

  const monthlyIncome = yearlyIncome / 12;
  const dailyIncome = yearlyIncome / 365;

  // Generate Projection Data for Chart (Next 12 Months)
  const projectionData = Array.from({ length: 13 }, (_, i) => {
    const projectedValue = accounts.reduce((sum, acc) => {
      const r = acc.apy / 100;
      return sum + (acc.amount * Math.pow(1 + r / 12, i));
    }, 0);

    const d = new Date();
    d.setMonth(d.getMonth() + i);

    return {
      month: d.toLocaleDateString('ru-RU', { month: 'short' }),
      value: Math.round(projectedValue),
      income: Math.round(projectedValue - totalCapital),
    };
  });

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <SavingsHeader
        totalCapital={totalCapital}
        dailyIncome={dailyIncome}
        monthlyIncome={monthlyIncome}
        yearlyIncome={yearlyIncome}
        onAddClick={() => setIsModalOpen(true)}
      />

      <ProjectionChart data={projectionData} yearlyIncome={yearlyIncome} />

      <AccountsList accounts={accounts} removingIds={removingIds} onRemoveClick={handleRemoveClick} />

      <AddAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddAccount={onAddAccount}
        existingAccountsCount={accounts.length}
      />
    </div>
  );
};