# RevenueCat კონფიგურაციის მიმარგებლება

## 📋 მიმდინდებული კონფიგურაცია:

### App Package Name:
`com.levani505.sameba`

### RevenueCat Android API Key:
`goog_coBmgTFjtJBruDAzfvtYHKVoKWc`

## 🎯 რა უნდა გაკეთოთ RevenueCat Dashboard-ში:

### 1. Google Play Console-ში:
1. **შექმენით პროდუქტი:**
   - Product ID: `premium_monthly_1`
   - ფასი: **$0.99**
   - აღწერა: პრემიუმ წვერობა
   - ავტომატური განახლება

2. **აპლიკაციის დეტალები:**
   - Internal Testing: ✅
   - Public Release: ✅

### 2. RevenueCat Dashboard-ში:
1. **შექმენით ახალი პროექტი** (თუ არსებობენ)
2. **დაამატეთ Google Play Console-ში:**
   - Settings → Stores → Google Play
   - შეიყვანეთ JSON ფაილის ანგარიშვით

3. **შექმენით Offering:**
   - Offering ID: `default`
   - დაამატეთ პროდუქტი: `premium_monthly_1`

4. **შექმენით Entitlement:**
   - Entitlement ID: `premium_access`
   - დაამატეთ offering-ზე: `default`

## 🔍 Debug ინფორმაცია:

აპლიკაციაში დამატებულია console-ში:
- `🔍 RevenueCat Offerings:` - ყველი ხელმიანი offering
- `🔍 Purchasing package:` - შესყიდვის დროს პროდუქტის დეტალები

## 📱 ტესტირების ნაბიჯი:

1. **გაუშვით აპლიკაცია**
2. **გახსნეთ Membership გვერდზე**
3. **შეამოწმეთ console-ში debug ინფორმაცია**
4. **შეამოწმეთ გამოწერა**
5. **შეამოწმეთ Restore Purchases**

## ✅ წარმატებული შედეგი:

- [x] Android API Key კონფიგურირებულია
- [x] ფასი შეცვლილია $0.99/თვე
- [x] Debug ლოგები დამატებულია
- [x] შეცდომების დამუშავება გაუმჯობელია
- [ ] Google Play პროდუქტი შექმნილია
- [ ] RevenueCat offering შექმნილია
