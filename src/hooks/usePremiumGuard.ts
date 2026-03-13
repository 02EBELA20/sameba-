import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useSubscription } from '../components/SubscriptionProvider';

export function usePremiumGuard() {
  const { authResult, loading } = useSubscription();

  const canAccessPremium = authResult?.isAuthorized || false;
  const isInTrial = authResult?.isInTrial || false;

  const requirePremium = (action?: string) => {
    if (loading) {
      return false; // ჯერ არ მოვქმნოთ რაიმე, სანამ სტატუსი იტვირთება
    }

    if (canAccessPremium) {
      return true; // მომხმარებელს აქვს წვდომა
    }

    // გამოვიყენოთ paywall მოდალი
    router.push({
      pathname: '/membership',
      params: {
        returnTo: router.canGoBack() ? 'back' : 'home',
        action: action || 'premium_feature'
      }
    });

    return false;
  };

  const showPaywall = (action?: string) => {
    router.push({
      pathname: '/membership',
      params: {
        returnTo: router.canGoBack() ? 'back' : 'home',
        action: action || 'premium_feature'
      }
    });
  };

  return {
    canAccessPremium,
    isInTrial,
    isLoading: loading,
    requirePremium,
    showPaywall,
    isAuthorized: canAccessPremium
  };
}
