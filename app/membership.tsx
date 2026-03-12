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

  useEffect(() => {
    loadData();
  }, []);

  const isSubscribed = authResult?.isAuthorized || false;
  const isInTrial = authResult?.isInTrial || false;

  const loadData = async () => {
    try {
      setLoading(true);
      
      // შეთავაზებების ჩატვირთვა
      const offerings = await subscriptionService.getOfferings();
      setPackages(offerings.packages);

      // მომხმარებლის ინფორმაციის ჩატვირთვა
      const info = await subscriptionService.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error: any) {
      console.error('მონაცემების ჩატვირთვის შეცდომა:', error);
      
      let errorMessage = 'გამოწერის ინფორმაციის ჩატვირთვა ვერ მოხერხდა. გთხოვთ ცადოთ მოგვიანებით.';
      
      if (error?.message?.includes('credentials')) {
        errorMessage = 'ავტორიზაციის შეცდომა: RevenueCat API გასაღები არარის კონფიგურირებული. გთხოვთ დააყენით რეალური API key.';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'RevenueCat API key არარის კონფიგურირებული. გთხოვთ დააყენით რეალური API key.';
      } else if (error?.message?.includes('offerings')) {
        errorMessage = 'გამოწერის პაკეტები ვერ მოიძებნა. შეამოწმეთ პროდუქტები RevenueCat Dashboard-ში.';
      } else if (error?.message?.includes('cancelled')) {
        errorMessage = 'შესყიდვა გაუქმდა.';
      } else if (error?.message?.includes('network')) {
        errorMessage = 'ქსელის შეცდომა. გთხოვთ შეამოწმოთ ინტერნეტთან კავშირდ.';
      }
      
      Alert.alert('შეცდომა', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageIdentifier: string) => {
    try {
      setPurchasing(packageIdentifier);
      
      const newCustomerInfo = await subscriptionService.purchasePackage(packageIdentifier);
      setCustomerInfo(newCustomerInfo);
      
      // Auth სტატუსის განახლება
      await refreshAuth();
      
      Alert.alert(
        'გამოწერა წარმატებულია ✅',
        'გმადლობთ გამოწერისთვის! ახლა გაქვთ პრემიუმ ფუნქციებზე წვდომა.'
      );
    } catch (error: any) {
      console.error('შესყიდვის შეცდომა:', error);
      
      let errorMessage = 'შესყიდვის დროს შეცდომა მოხდა. გთხოვთ ცადოთ მოგვიანებით.';
      
      if (error?.message?.includes('credentials')) {
        errorMessage = 'ავტორიზაციის პრობლემა. გთხოვთ დაელოდოთ და ცადოთ ხელახლა.';
      } else if (error?.message?.includes('cancelled')) {
        errorMessage = 'შესყიდვა გაუქმდა.';
      }
      
      Alert.alert('შეცდომა', errorMessage);
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing('restore');
      
      const restoredCustomerInfo = await subscriptionService.restorePurchases();
      setCustomerInfo(restoredCustomerInfo);
      
      // Auth სტატუსის განახლება
      await refreshAuth();
      
      const hasActiveSubscription = Object.keys(restoredCustomerInfo.entitlements.active).length > 0;
      
      Alert.alert(
        'აღდგენა დასრულდა',
        hasActiveSubscription 
          ? 'თქვენი გამოწერა წარმატებით აღდგა. ✅'
          : 'აქტიური გამოწერა არ მოიძებნა.'
      );
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>პრემიუმ წევრობა</Text>
      
      <Text style={styles.priceInfo}>💰 მხოლოდ $0.99/თვე</Text>
      
      {/* Charity Section */}
      <View style={styles.charitySection}>
        <View style={styles.charityBadge}>
          <Text style={styles.charityBadgeText}>❤️ 30% for charity</Text>
        </View>
        
        <Text style={styles.charityTitle}>
          ეს აპლიკაცია შეიქმნა იმისთვის, რომ ადამიანებს დაეხმაროს სულიერი სიმშვიდის პოვნაში ახალი აღთქმის მეშვეობით.
        </Text>
        
        <Text style={styles.charityText}>
          თქვენი წევრობის მხარდაჭერა გვეხმარება გავაგრძელოთ ეს საქმე.
        </Text>
        
        <Text style={styles.charityHighlight}>
          თქვენი წევრობის საფასურის 30% მოხმარდება გაჭირველი ადამიანების დახმარებას საქართველოში.
        </Text>
      </View>
      
      {isSubscribed && (
        <View style={styles.activeStatus}>
          <Text style={styles.activeStatusText}>
            {isInTrial ? '🆓 საცდელი აქტიურია' : '✅ აქტიური გამოწერა'}
          </Text>
          <Text style={styles.activeStatusSubtext}>
            {isInTrial 
              ? 'გამოიყენეთ პრემიუმ ფუნქციები საცდელის პერიოდში!'
              : 'გმადლობთ პრემიუმ ფუნქციებზე წვდომისთვის!'
            }
          </Text>
        </View>
      )}

      <View style={styles.packagesContainer}>
        {packages.map((pkg) => (
          <View key={pkg.identifier} style={styles.packageCard}>
            <Text style={styles.packageTitle}>{pkg.title}</Text>
            <Text style={styles.packagePrice}>{pkg.price}</Text>
            <Text style={styles.packageDescription}>{pkg.description}</Text>
            
            <Pressable
              style={[
                styles.purchaseButton,
                isSubscribed && styles.disabledButton,
                purchasing === pkg.identifier && styles.loadingButton,
              ]}
              onPress={() => handlePurchase(pkg.identifier)}
              disabled={isSubscribed || purchasing !== null}
            >
              {purchasing === pkg.identifier ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  {isSubscribed ? 'უკვე გამოწერილია' : 'გამოწერა'}
                </Text>
              )}
            </Pressable>
            
            {/* Debug info */}
            <Text style={styles.debugInfo}>
              📦 Package ID: {pkg.identifier}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[
          styles.restoreButton,
          purchasing === 'restore' && styles.loadingButton,
        ]}
        onPress={handleRestore}
        disabled={purchasing !== null}
      >
        {purchasing === 'restore' ? (
          <ActivityIndicator color="#2F80ED" size="small" />
        ) : (
          <Text style={styles.restoreButtonText}>შესყიდვების აღდგენა</Text>
        )}
      </Pressable>

      {/* Subscription Management Section */}
      {isSubscribed && (
        <View style={styles.managementSection}>
          <Text style={styles.sectionTitle}>გამოწერის მართვა</Text>
          
          <Pressable style={styles.manageButton} onPress={handleManageSubscription}>
            <Text style={styles.manageButtonText}>📱 Google Play Store-ში მართვა</Text>
          </Pressable>
          
          <Text style={styles.manageHint}>
            გამოწერის გასაუქმებლად ან შესაცვლელად გადადით Play Store-ში
          </Text>
        </View>
      )}

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>უკან</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f2ec',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  priceInfo: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2F80ED',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b3d9ff',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#155724',
    textAlign: 'center',
    marginBottom: 4,
  },
  activeStatusSubtext: {
    fontSize: 14,
    color: '#155724',
    textAlign: 'center',
  },
  packagesContainer: {
    marginBottom: 20,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2F80ED',
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  purchaseButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
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
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreButtonText: {
    color: '#2F80ED',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#666',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  debugInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
  },
  managementSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  manageButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  manageHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  charitySection: {
    backgroundColor: '#fef8f7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde8e3',
  },
  charityBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  charityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  charityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  charityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  charityHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6b6b',
    textAlign: 'center',
  },
});
