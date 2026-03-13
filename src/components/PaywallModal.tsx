import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { subscriptionService, PackageInfo } from '../services/subscription';
import { useSubscription } from './SubscriptionProvider';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

export function PaywallModal({ visible, onClose, onPurchaseComplete }: PaywallModalProps) {
  const { authResult, refreshAuth } = useSubscription();
  const [packages, setPackages] = React.useState<PackageInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [purchasing, setPurchasing] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const offerings = await subscriptionService.getOfferings();
      setPackages(offerings.packages);
    } catch (error) {
      console.error('Packages loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageIdentifier: string) => {
    try {
      setPurchasing(packageIdentifier);
      
      await subscriptionService.purchasePackage(packageIdentifier);
      
      // Auth სტატუსის განახლება
      await refreshAuth();
      
      onPurchaseComplete();
      onClose();
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      let errorMessage = 'შესყიდვის დროს შეცდომა მოხდა. გთხოვთ ცადოთ მოგვიანებით.';
      
      if (error?.message?.includes('cancelled')) {
        errorMessage = 'შესყიდვა გაუქმდა.';
      }
      
      // აქ შეგიძლიათ დაამატოთ ერრორის ჩვენება, თუ გინდა
    } finally {
      setPurchasing(null);
    }
  };

  const getMonthlyPackage = () => packages.find(pkg => pkg.identifier === '$rc_monthly');
  const getAnnualPackage = () => packages.find(pkg => pkg.identifier === '$rc_annual');

  const monthlyPackage = getMonthlyPackage();
  const annualPackage = getAnnualPackage();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Purpose Section */}
        <View style={styles.purposeSection}>
          <Text style={styles.purposeTitle}>
            ეს აპლიკაცია შეიქმნა იმისთვის, რომ ადამიანებს დაეხმაროს ღვთის სიტყვის ყოველდღიური დამახსოვრებასა და სულიერ კავშირს.
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>პრემიუმის უპირატესები:</Text>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📖</Text>
            <Text style={styles.benefitText}>ყოველდღიური სულიერი შთაგონებები</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⏰</Text>
            <Text style={styles.benefitText}>სკრიპტურაზე დაფუძნებული შეხსენებები</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⭐</Text>
            <Text style={styles.benefitText}>სასურვებელი მუხლების შენახვა</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💝</Text>
            <Text style={styles.benefitText}>სრული სულიერი გამოცდილება</Text>
          </View>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2F80ED" />
            <Text style={styles.loadingText}>იტვირთება...</Text>
          </View>
        ) : (
          /* Subscription Plans */
          <View style={styles.plansSection}>
            {/* Monthly Plan */}
            {monthlyPackage && (
              <View style={[styles.planCard, styles.monthlyPlan]}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>თვიური გეგმა</Text>
                  <View style={styles.trialBadge}>
                    <Text style={styles.trialBadgeText}>3 დღე უფასო</Text>
                  </View>
                </View>
                
                <Text style={styles.planPrice}>{monthlyPackage.price}</Text>
                <Text style={styles.planDescription}>შემდეგ {monthlyPackage.price}/თვე</Text>
                <Text style={styles.cancelText}>ნებისმიერად გაუქმება</Text>
                
                <Pressable
                  style={[
                    styles.purchaseButton,
                    purchasing === monthlyPackage.identifier && styles.buttonLoading
                  ]}
                  onPress={() => handlePurchase(monthlyPackage.identifier)}
                  disabled={purchasing !== null}
                >
                  {purchasing === monthlyPackage.identifier ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.purchaseButtonText}>დაწყება უფასო პერიოდით</Text>
                  )}
                </Pressable>
              </View>
            )}

            {/* Annual Plan */}
            {annualPackage && (
              <View style={[styles.planCard, styles.annualPlan]}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>წლიური გეგმა</Text>
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>საუკეთესო ფასი</Text>
                  </View>
                </View>
                
                <Text style={styles.planPrice}>{annualPackage.price}</Text>
                <Text style={styles.planDescription}>ერთი წლის განმავლობით</Text>
                
                <Pressable
                  style={[
                    styles.purchaseButton,
                    styles.annualButton,
                    purchasing === annualPackage.identifier && styles.buttonLoading
                  ]}
                  onPress={() => handlePurchase(annualPackage.identifier)}
                  disabled={purchasing !== null}
                >
                  {purchasing === annualPackage.identifier ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.purchaseButtonText}>გამოწერა</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Restore Button */}
        <View style={styles.restoreSection}>
          <Pressable style={styles.restoreButton} onPress={onClose}>
            <Text style={styles.restoreButtonText}>შემდეგში</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  purposeSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e7e2d8',
  },
  purposeTitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  benefitsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e7e2d8',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  plansSection: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e7e2d8',
  },
  monthlyPlan: {
    borderColor: '#2F80ED',
    borderWidth: 2,
  },
  annualPlan: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  trialBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trialBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  bestValueBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2F80ED',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cancelText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  purchaseButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  annualButton: {
    backgroundColor: '#28a745',
  },
  buttonLoading: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  restoreSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  restoreButton: {
    paddingVertical: 12,
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
});
