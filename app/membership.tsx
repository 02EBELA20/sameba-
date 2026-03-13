import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { subscriptionService, PackageInfo, CustomerInfo } from '../src/services/subscription';
import { useSubscription } from '../src/components/SubscriptionProvider';

export default function MembershipScreen() {
  const { authResult, refreshAuth } = useSubscription();
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const isSubscribed = authResult?.isAuthorized || false;
  const isInTrial = authResult?.isInTrial || false;

  const loadData = async () => {
    try {
      setLoading(true);
      
      // პაკეტების ჩატვირთვა
      const { packages: fetchedPackages } = await subscriptionService.getOfferings();
      setPackages(fetchedPackages);
      
      // აქტიური პროდუქტის დეტექცია
      const activeProductData = await subscriptionService.getActiveProduct();
      setActiveProduct(activeProductData.identifier);
      
      // მომხმარებლის ინფორმაციის ჩატვირთვა
      const customer = await subscriptionService.getCustomerInfo();
      setCustomerInfo(customer);
      
      console.log('🔍 Membership Screen Data:', {
        activeProduct: activeProductData.identifier,
        isSubscribed: activeProductData.isActive,
        packages: fetchedPackages.map(p => ({ id: p.identifier, title: p.title }))
      });
      
    } catch (error) {
      console.error('მონაცემების ჩატვირთვის შეცდომა:', error);
      Alert.alert('შეცდომა', 'მონაცემების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageIdentifier: string) => {
    try {
      setPurchasing(packageIdentifier);
      
      const newCustomerInfo = await subscriptionService.purchasePackage(packageIdentifier);
      setCustomerInfo(newCustomerInfo);
      
      // აქტიური პროდუქტის განახლება
      const activeProductData = await subscriptionService.getActiveProduct();
      setActiveProduct(activeProductData.identifier);
      
      await refreshAuth();
      
      Alert.alert('წარმატება', 'გამოწერა წარმატებით დასრულდა!');
    } catch (error) {
      console.error('შესყიდვის შეცდომა:', error);
      Alert.alert('შეცდომა', 'გამოწერის დროს შეცდომა მოხდა');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing('restore');
      
      const restoredCustomerInfo = await subscriptionService.restorePurchases();
      setCustomerInfo(restoredCustomerInfo);
      
      // აქტიური პროდუქტის განახლება
      const activeProductData = await subscriptionService.getActiveProduct();
      setActiveProduct(activeProductData.identifier);
      
      await refreshAuth();
      
      Alert.alert('წარმატება', 'შესყიდვები წარმატებით აღდგა!');
    } catch (error) {
      console.error('აღდგენის შეცდომა:', error);
      Alert.alert(
        'შეცდომა',
        'გამოწერის აღდგენა ვერ მოხერხდა. გთხოვთ ცადოთ მოგვიანებით.'
      );
    } finally {
      setPurchasing(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!customerInfo?.managementURL) {
      Alert.alert('ინფორმაცია', 'გამოწერის მართვა შესაძლებელია Google Play Store-დან.');
      return;
    }

    try {
      await Linking.openURL(customerInfo.managementURL);
    } catch (error) {
      console.error('ბმულის გახსნის შეცდომა:', error);
      Alert.alert('შეცდომა', 'ვერ მოხერხდა გამოწერის მართვის გვერდის გახსნა.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>იტვირთება...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>პრემიუმ წევრობა</Text>
      
      
      
      <View style={styles.charityBadge}>
        <Text style={styles.charityBadgeText}>
          ❤️ შემოსავლის 30% მოხმარდება გაჭირვებულებს საქართველოში.
        </Text>
      </View>
      
      {isSubscribed && (
        <View style={styles.activeStatus}>
          <Text style={styles.activeStatusText}>
            {isInTrial ? '🆓 საცდელი აქტიურია' : '✅ აქტიური გამოწერა'}
          </Text>
        </View>
      )}
      
      <View style={styles.packagesContainer}>
        {packages.map((pkg) => {
          // მხოლოდ სწორის პაკეტების ჩვენება
          if (pkg.identifier !== '$rc_monthly' && pkg.identifier !== '$rc_annual') {
            return null;
          }

          const isMonthly = pkg.identifier === '$rc_monthly';
          const isAnnual = pkg.identifier === '$rc_annual';
          
          // აქტიური პროდუქტის შემოწმება
          const isActiveProduct = activeProduct === pkg.identifier;
          
          // წლიური მომხმარებლისთვის თვიურის დაბლოკვა
          const isYearlyUser = activeProduct === '$rc_annual';
          const shouldDisableMonthly = isYearlyUser && isMonthly;
          
          return (
            <View key={pkg.identifier} style={styles.packageCard}>
              <Text style={styles.packageTitle}>
                {isMonthly ? 'ყოველთვიური გეგმა' : isAnnual ? 'ყოველწლიური გეგმა' : pkg.title}
              </Text>
              
              <Text style={styles.packagePrice}>{pkg.price}</Text>
              
              <Pressable
                style={[
                  styles.purchaseButton,
                  isActiveProduct && styles.disabledButton,
                  shouldDisableMonthly && styles.disabledButton,
                  purchasing === pkg.identifier && styles.loadingButton,
                  isAnnual && styles.annualButton,
                ]}
                onPress={() => handlePurchase(pkg.identifier)}
                disabled={isActiveProduct || shouldDisableMonthly || purchasing !== null}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {purchasing === pkg.identifier ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.purchaseButtonText}>
                    {isActiveProduct ? 'უკვე გამოწერილია' : 'გამოწერა'}
                  </Text>
                )}
              </Pressable>
              {isMonthly && (
                <Text style={styles.trialText}>🕊 3 დღე უფასოდ</Text> 
              )}
              
              <View style={styles.buttonSpacing} />
              
            </View>
          );
        })}
      </View>

      <Pressable
        style={[
          styles.restoreButton,
          purchasing === 'restore' && styles.loadingButton,
        ]}
        onPress={handleRestore}
        disabled={purchasing !== null}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {purchasing === 'restore' ? (
          <ActivityIndicator color="#666" size="small" />
        ) : (
          <Text style={styles.restoreButtonText}>შესყიდვების აღდგენა</Text>
        )}
      </Pressable>

      {isSubscribed && (
        <View style={styles.managementSection}>
          <Pressable style={styles.manageButton} onPress={handleManageSubscription} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.manageButtonText}>📱 Google Play Store-ში მართვა</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f2ec',
    paddingTop: 0,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
    lineHeight: 22,
  },
  charityBadge: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  charityBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cc0000',
    textAlign: 'center',
    lineHeight: 20,
  },
  packagesContainer: {
    gap: 20,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e7e2d8',
    alignItems: 'center',
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2F80ED',
    marginBottom: 20,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0066cc',
    textAlign: 'center',
    marginTop: 8,
  },
  bestValueBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  bestValueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonSpacing: {
    height: 8,
  },
  purchaseButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  annualButton: {
    backgroundColor: '#28a745',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loadingButton: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  restoreButton: {
    marginTop: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  activeStatus: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  activeStatusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#155724',
    textAlign: 'center',
  },
  managementSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  manageButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
