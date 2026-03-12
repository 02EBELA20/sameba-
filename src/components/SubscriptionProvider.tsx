import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { authGuard, AuthResult } from '../services/authGuard';

interface SubscriptionContextType {
  authResult: AuthResult | null;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const result = await authGuard.checkEntitlement();
      setAuthResult(result);

      // თუ მომხმარებელს არ აქვს წვდომა, გადავამისამართოთ membership გვერდზე
      if (!result.canAccessApp && router.canGoBack()) {
        console.log('🔐 Redirecting to membership - no access');
        router.replace('/membership');
      }
    } catch (error) {
      console.error('🔐 Auth check failed:', error);
      setAuthResult({
        isAuthorized: false,
        isInTrial: false,
        isExpired: false,
        canAccessApp: false
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    authGuard.clearCache();
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: SubscriptionContextType = {
    authResult,
    loading,
    refreshAuth
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// HOC კომპონენტების დასაცავად
export function withSubscriptionProtection<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { authResult, loading } = useSubscription();

    if (loading) {
      return (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f5f2ec'
        }}>
          <Text>იტვირთება...</Text>
        </View>
      );
    }

    if (!authResult?.canAccessApp) {
      return null; // Router-ი ავტომატურად გადამისამართავს
    }

    return <Component {...props} />;
  };
}
