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
import { subscriptionService, CustomerInfo } from '../src/services/subscription';
import { useSubscription } from '../src/components/SubscriptionProvider';

export default function SettingsScreen() {
  const { authResult, refreshAuth } = useSubscription();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerInfo();
  }, []);

  const loadCustomerInfo = async () => {
    try {
      const info = await subscriptionService.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('მომხმარებლის ინფორმაციის ჩატვირთვის შეცდომა:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = authResult?.isAuthorized || false;
  const isInTrial = authResult?.isInTrial || false;

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

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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
      <Text style={styles.title}>პარამეტრები</Text>

      {/* Premium Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>პრემიუმ სტატუსი</Text>
        
        {isSubscribed ? (
          <View style={styles.activeStatus}>
            <Text style={styles.activeStatusText}>
              {isInTrial ? '🆓 საცდელი აქტიურია' : '✅ პრემიუმ აქტიურია'}
            </Text>
            <Text style={styles.activeStatusSubtext}>
              {isInTrial 
                ? 'გამოიყენეთ პრემიუმ ფუნქციები საცდელის პერიოდში!'
                : 'გმადლობთ პრემიუმ ფუნქციებზე წვდომისთვის!'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.inactiveStatus}>
            <Text style={styles.inactiveStatusText}>� გამოწერა საჭიროა</Text>
            <Text style={styles.inactiveStatusSubtext}>
              გააქტიურეთ წვდომა აპის ყველა ფუნქციისთვის
            </Text>
          </View>
        )}
      </View>

      {/* Subscription Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>გამოწერის მართვა</Text>
        
        {isSubscribed && (
          <Pressable style={styles.actionButton} onPress={handleManageSubscription}>
            <Text style={styles.actionButtonText}>გამოწერის მართვა</Text>
            <Text style={styles.actionButtonSubtext}>Google Play Store-ში</Text>
          </Pressable>
        )}

        <Pressable 
          style={[styles.actionButton, styles.secondaryButton]} 
          onPress={handleRestorePurchases}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>
            {loading ? 'იტვირთება...' : 'შესყიდვების აღდგენა'}
          </Text>
        </Pressable>

        {!isSubscribed && (
          <Pressable 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={() => router.push('/membership')}
          >
            <Text style={styles.primaryButtonText}>პრემიუმზე გადასვლა</Text>
          </Pressable>
        )}
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>აპლიკაციის შესახებ</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ვერსია</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>სტატუსი</Text>
          <Text style={styles.infoValue}>{isSubscribed ? 'პრემიუმ' : 'უფასო'}</Text>
        </View>
      </View>

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
    marginBottom: 30,
    color: '#333',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  activeStatus: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  activeStatusText: {
    fontSize: 16,
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
  inactiveStatus: {
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  inactiveStatusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#721c24',
    textAlign: 'center',
    marginBottom: 4,
  },
  inactiveStatusSubtext: {
    fontSize: 14,
    color: '#721c24',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#2F80ED',
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  actionButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F80ED',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#666',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
