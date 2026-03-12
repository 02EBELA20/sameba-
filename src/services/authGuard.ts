import { subscriptionService } from './subscription';

export interface AuthResult {
  isAuthorized: boolean;
  isInTrial: boolean;
  isExpired: boolean;
  canAccessApp: boolean;
}

export class AuthGuard {
  private static instance: AuthGuard;
  private cachedResult: AuthResult | null = null;
  private lastCheck: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 წამი

  static getInstance(): AuthGuard {
    if (!AuthGuard.instance) {
      AuthGuard.instance = new AuthGuard();
    }
    return AuthGuard.instance;
  }

  async checkEntitlement(): Promise<AuthResult> {
    const now = Date.now();
    
    // Cache-ის გამოყენება ხშირი შემოწმებებისთვის
    if (this.cachedResult && (now - this.lastCheck) < this.CACHE_DURATION) {
      return this.cachedResult;
    }

    try {
      const customerInfo = await subscriptionService.getCustomerInfo();
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      
      const hasActiveSubscription = activeEntitlements.length > 0;
      const allEntitlements = Object.keys(customerInfo.entitlements.all);
      
      // შევამოწმოთ ტრიალის სტატუსი
      const isInTrial = this.checkIfInTrial(customerInfo);
      const isExpired = allEntitlements.length > 0 && !hasActiveSubscription;
      
      const result: AuthResult = {
        isAuthorized: hasActiveSubscription || isInTrial,
        isInTrial,
        isExpired,
        canAccessApp: hasActiveSubscription || isInTrial
      };

      this.cachedResult = result;
      this.lastCheck = now;

      console.log('🔐 AuthGuard Check Result:', {
        hasActiveSubscription,
        isInTrial,
        isExpired,
        canAccessApp: result.canAccessApp
      });

      return result;
    } catch (error) {
      console.error('🔐 AuthGuard Error:', error);
      
      // შეცდომის შემთხვევაში ვერ გავცდეთ წვდომას
      const errorResult: AuthResult = {
        isAuthorized: false,
        isInTrial: false,
        isExpired: false,
        canAccessApp: false
      };

      this.cachedResult = errorResult;
      this.lastCheck = now;
      
      return errorResult;
    }
  }

  private checkIfInTrial(customerInfo: any): boolean {
    try {
      const activeEntitlements = customerInfo.entitlements.active;
      const entitlementKeys = Object.keys(activeEntitlements);
      
      if (entitlementKeys.length === 0) return false;
      
      const firstEntitlement = activeEntitlements[entitlementKeys[0]];
      
      // ტრიალის შემოწმება
      if (firstEntitlement.periodType === 'trial' || 
          firstEntitlement.productIdentifier?.includes('trial') ||
          (firstEntitlement.expirationDate && this.isWithinTrialPeriod(firstEntitlement.expirationDate))) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Trial check error:', error);
      return false;
    }
  }

  private isWithinTrialPeriod(expirationDate: string): boolean {
    try {
      const expiration = new Date(expirationDate);
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      
      return expiration <= threeDaysFromNow;
    } catch (error) {
      console.error('Date parsing error:', error);
      return false;
    }
  }

  // Cache-ის გასუფთავება (გამოწერის შემდეგ)
  clearCache(): void {
    this.cachedResult = null;
    this.lastCheck = 0;
  }

  // სწრაფი შემოწმება UI-სთვის
  async canAccessApp(): Promise<boolean> {
    const result = await this.checkEntitlement();
    return result.canAccessApp;
  }
}

export const authGuard = AuthGuard.getInstance();
