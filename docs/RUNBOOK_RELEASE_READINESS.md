# SCHOOLOS — PRODUCTION BUILD & RELEASE READINESS RUNBOOK

---

## 1. Overview
This runbook defines the production build, signing, and release artifact generation procedures for:
- Android App Bundle (AAB) & APK (`apps/mobile`)
- iOS App Archive (IPA) & App Store Connect Submission (`apps/mobile`)
- Next.js Web Command Center (`apps/web`)

---

## 2. Versioning & Release Identity
Application versioning is synchronized across mobile and web targets:
- **Version Name:** `1.0.0`
- **Build Number / Version Code:** `1`
- **Configured in:** `apps/mobile/pubspec.yaml` (`version: 1.0.0+1`).

---

## 3. Android Production Release Procedure
### A. Release Keystore Signing Setup
Set the following environment variables or Gradle properties (`~/.gradle/gradle.properties`) before building production release binaries:
```bash
export ANDROID_KEYSTORE_PATH="/path/to/schoolos_release.jks"
export ANDROID_KEYSTORE_PASSWORD="release_keystore_password"
export ANDROID_KEY_ALIAS="schoolos_alias"
export ANDROID_KEY_PASSWORD="release_key_password"
```

### B. Generate Google Play App Bundle (AAB)
```bash
cd apps/mobile
flutter build appbundle --release --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://api.schoolos.com/api/v1
```
- **Output Artifact:** `apps/mobile/build/app/outputs/bundle/release/app-release.aab`

### C. Generate Android Release APK
```bash
cd apps/mobile
flutter build apk --release --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://api.schoolos.com/api/v1
```
- **Output Artifact:** `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`

---

## 4. iOS Production Release Procedure
### A. Prerequisites
- Active Apple Developer Program Membership
- Provisioning Profiles & Distribution Certificate installed in Xcode

### B. Generate iOS Archive / IPA
```bash
cd apps/mobile
flutter build ipa --release --dart-define=ENVIRONMENT=production --dart-define=API_URL=https://api.schoolos.com/api/v1
```
- **Output Directory:** `apps/mobile/build/ios/archive/Runner.xcarchive` & `apps/mobile/build/ios/ipa/`

---

## 5. Next.js Web Production Build
```bash
cd apps/web
npm run build
```
- **Output Directory:** `apps/web/.next`

---

## 6. Pre-Release Security Checklist
- [ ] No hardcoded development endpoints or `localhost` URLs in production bundles.
- [ ] No private keys, JWT secrets, or database credentials embedded in client binaries.
- [ ] Android `debuggable` set to `false` in release builds.
- [ ] ProGuard / R8 code shrinking enabled where applicable.
