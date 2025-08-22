import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Account } from '../graphql/types';
import type { AuthContextType } from '../contexts/AuthContext';

interface AccountContextType {
  currentAccountId: string | null;
  currentAccount: Account | null;
  accounts: Account[];
  setAccountContext: (accountId: string) => void;
  clearAccountContext: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: any;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccountContext must be used within an AccountProvider');
  }
  return context;
};

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const auth: AuthContextType = useAuth();
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Sync with AuthContext state - improved dependencies and logic
  useEffect(() => {
    console.log('🔄 AccountContext: Syncing with AuthContext');
    console.log('  - auth.currentAccount:', auth.currentAccount);
    console.log('  - auth.accounts:', auth.accounts);
    console.log('  - auth.isAuthenticated:', auth.isAuthenticated);
    console.log('  - auth.isLoading:', auth.isLoading);
    console.log('  - Current local state - currentAccountId:', currentAccountId);
    console.log('  - Current local state - currentAccount:', currentAccount);

    // Only sync if auth is not loading and we have data
    if (!auth.isLoading) {
      if (auth.currentAccount && auth.accounts.length > 0) {
        console.log(
          '✅ AccountContext: Setting current account:',
          auth.currentAccount.name,
          auth.currentAccount.id
        );
        setCurrentAccount(auth.currentAccount);
        setCurrentAccountId(auth.currentAccount.id);
        setError(null);
      } else if (auth.isAuthenticated && auth.accounts.length === 0) {
        console.log('⚠️ AccountContext: User authenticated but no accounts available');
        console.log('🔍 AccountContext: Debug - why no accounts?');
        console.log('  - auth.isLoading:', auth.isLoading);
        console.log('  - auth.currentAccount:', auth.currentAccount);
        console.log('  - auth.accounts.length:', auth.accounts.length);
        console.log('  - auth.accounts:', auth.accounts);
        setCurrentAccount(null);
        setCurrentAccountId(null);
        setError(new Error('No accounts available for this user'));
      } else if (!auth.isAuthenticated) {
        console.log('🚪 AccountContext: User not authenticated, clearing context');
        setCurrentAccount(null);
        setCurrentAccountId(null);
        setError(null);
      } else {
        console.log(
          '🤔 AccountContext: Unexpected state - auth.isLoading:',
          auth.isLoading,
          'auth.currentAccount:',
          !!auth.currentAccount,
          'auth.accounts.length:',
          auth.accounts.length
        );
      }
    } else {
      console.log('⏳ AccountContext: Auth is still loading, waiting...');
    }
  }, [
    auth.currentAccount,
    auth.accounts,
    auth.isAuthenticated,
    auth.isLoading,
    currentAccountId,
    currentAccount,
  ]);

  const setAccountContext = (accountId: string) => {
    const account = auth.accounts.find(acc => acc.id === accountId);
    if (account) {
      auth.setCurrentAccount(account);
    } else {
      setError(new Error(`Account with ID ${accountId} not found`));
    }
  };

  const clearAccountContext = () => {
    setCurrentAccount(null);
    setCurrentAccountId(null);
    setError(null);
  };

  const value: AccountContextType = {
    currentAccountId,
    currentAccount,
    accounts: auth.accounts,
    setAccountContext,
    clearAccountContext,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.isLoading || loading,
    error,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};
