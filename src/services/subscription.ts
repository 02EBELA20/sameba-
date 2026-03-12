import { Platform } from 'react-native';
import Purchases, { CustomerInfo as RevenueCatCustomerInfo } from 'react-native-purchases';

// RevenueCat API Keys - ეს უნდა შეცვალოთ RevenueCat Dashboard-დან
const REVENUECAT_API_KEYS = {
  ios: 'your_ios_api_key_here', // Apple App Store
  android: 'goog_coBmgTFjtJBruDAzfvtYHKVoKWc', // Google Play API Key
};

export interface PackageInfo {
  identifier: string;
  packageType: string;
  price: string;
  title: string;
  description: string;
  offeringIdentifier: string;
}

export interface CustomerInfo {
  entitlements: {
    active: Record<string, any>;
    all: Record<string, any>;
  };
  allPurchaseDates: Record<string, string | null>;
  firstSeen: string;
  requestDate: string;
  originalAppUserId: string;
  managementURL: string | null;
}

class SubscriptionService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const apiKey = Platform.OS === 'ios' 
        ? REVENUECAT_API_KEYS.ios 
        : REVENUECAT_API_KEYS.android;

      if (!apiKey || apiKey.includes('your_')) {
        throw new Error('RevenueCat API key არ არის კონფიგურირებული');
      }

      await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      await Purchases.configure({ apiKey });
      
      this.isInitialized = true;
      console.log('RevenueCat წარმატებით ინიციალიზირდა');
    } catch (error) {
      console.error('RevenueCat ინიციალიზაციის შეცდომა:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<{ packages: PackageInfo[] }> {
    try {
      await this.initialize();
      
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      
      if (!current) {
        throw new Error('შეთავაზებები ვერ მოიძებნა');
      }

      const packages = current.availablePackages.map((pkg: any) => ({
        identifier: pkg.identifier,
        packageType: pkg.packageType,
        price: pkg.product.priceString,
        title: pkg.product.title,
        description: pkg.product.description,
        offeringIdentifier: pkg.offeringIdentifier,
      }));

      // Debug info კონფიგურაციისთვის
      console.log('🔍 RevenueCat Offerings:', {
        currentOffering: current.identifier,
        availablePackages: packages.map(p => ({
          id: p.identifier,
          title: p.title,
          price: p.price,
          offeringId: p.offeringIdentifier
        }))
      });

      return { packages };
    } catch (error) {
      console.error('getOfferings შეცდომა:', error);
      throw error;
    }
  }

  async purchasePackage(packageIdentifier: string): Promise<CustomerInfo> {
    try {
      await this.initialize();
      
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      
      if (!current) {
        throw new Error('შეთავაზებები ვერ მოიძებნა');
      }

      let packageToPurchase = current.availablePackages.find((pkg: any) => pkg.identifier === packageIdentifier);
      
      if (!packageToPurchase) {
        console.error('🔍 Available packages:', current.availablePackages.map((p: any) => ({ id: p.identifier, title: p.title })));
        // ავტომატურად ვეძებნთ monthly_premium ID-ს, თუ ის არსებობს
        const fallbackPackage = current.availablePackages.find((p: any) => 
          p.identifier === 'monthly_premium' || 
          p.identifier.includes('monthly') || 
          p.identifier.includes('premium')
        );
        
        if (fallbackPackage) {
          console.log('🔄 Using fallback package:', fallbackPackage.identifier);
          packageToPurchase = fallbackPackage;
        } else {
          throw new Error(`პაკეტი "${packageIdentifier}" ვერ მოიძებნა`);
        }
      }

      console.log('🔍 Purchasing package:', {
        id: packageToPurchase.identifier,
        title: packageToPurchase.product.title,
        price: packageToPurchase.product.priceString
      });

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // AuthGuard cache-ის გასუფთავება შესყიდვის შემდეგ
      const { authGuard } = await import('./authGuard');
      authGuard.clearCache();
      
      return customerInfo;
    } catch (error) {
      console.error('purchasePackage შეცდომა:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      await this.initialize();
      
      await Purchases.syncPurchases();
      const customerInfo = await Purchases.getCustomerInfo();
      
      // AuthGuard cache-ის გასუფთავება აღდგენის შემდეგ
      const { authGuard } = await import('./authGuard');
      authGuard.clearCache();
      
      return customerInfo as CustomerInfo;
    } catch (error) {
      console.error('restorePurchases შეცდომა:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      await this.initialize();
      
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo as CustomerInfo;
    } catch (error) {
      console.error('getCustomerInfo შეცდომა:', error);
      throw error;
    }
  }

  async isPremiumActive(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (error) {
      console.error('isPremiumActive შეცდომა:', error);
      return false;
    }
  }

  // შემოწმება, არის თუ არა მომხმარებელი premium-ზე
  async checkPremiumStatus(): Promise<{ isActive: boolean; expiryDate?: Date }> {
    try {
      const customerInfo = await this.getCustomerInfo();
      const activeEntitlements = customerInfo.entitlements.active;
      
      if (Object.keys(activeEntitlements).length === 0) {
        return { isActive: false };
      }

      // პირველი active entitlement-ის აღება
      const entitlementKey = Object.keys(activeEntitlements)[0];
      const entitlement = activeEntitlements[entitlementKey];
      
      return {
        isActive: true,
        expiryDate: entitlement.expirationDate
      };
    } catch (error) {
      console.error('checkPremiumStatus შეცდომა:', error);
      return { isActive: false };
    }
  }
}

// Singleton ინსტანსი
export const subscriptionService = new SubscriptionService();

// ექსპორტი უფრო მარტივი გამოყენებისთვის
export const {
  initialize,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  isPremiumActive,
  checkPremiumStatus
} = subscriptionService;
