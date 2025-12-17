# Email Verification Implementation Guide

Ez a dokumentáció az email verifikációs rendszer működésének részleteit ismerteti.

## Overview

Az email verifikációs rendszer biztosítja, hogy a felhasználók csak valós, hozzáférhető e-mail címmel regisztrálhatnak. A folyamat a következő lépésekből áll:

1. **Regisztráció**: Felhasználó regisztrál e-mail és jelszóval
2. **Token generálás**: Egyedi, 24 órás verifikációs token jön létre
3. **Email küldés**: Verifikációs link küldése az e-mail címre
4. **Verifikáció**: Felhasználó kattint a linkre és megerősíti az e-mail címet
5. **Login**: Csak az email-t megerősített felhasználók léphetnek be

## Implementált módosítások

### 1. Database Schema (users.ts)

Az User modell kibővítésre kerül:

```typescript
emailVerified: Boolean; // Email hitelesítve-e
emailVerificationToken: String; // Verifikációs token
emailVerificationTokenExpires: Date; // Token lejárati ideje
```

### 2. Email Service (services/emailService.ts)

Nodemailer alapú email szolgáltatás:

- `sendVerificationEmail()`: Verifikációs email küldése
- `sendWelcomeEmail()`: Üdvözlő email verifikáció után

**Szükséges environment változók:**

- `EMAIL_HOST`: SMTP szerver (pl. smtp.gmail.com)
- `EMAIL_PORT`: SMTP port (587 vagy 465)
- `EMAIL_USER`: E-mail cím
- `EMAIL_PASSWORD`: Alkalmazás jelszó
- `EMAIL_FROM`: Feladó e-mail cím
- `CLIENT_URL`: Frontend URL (verifikációs linkhez)

### 3. API Endpoints

#### POST /api/register

**Módosított viselkedés:**

- Token generálása: `crypto.randomBytes(32).toString("hex")`
- 24 órás lejárati idő
- Verifikációs email küldése automatikusan
- Válasz: Üzenet és userId (token helyett!)

**Request:**

```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**

```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "userId": "user_id_here"
}
```

#### POST /api/verify-email

Új endpoint az email verifikációhoz

**Request:**

```json
{
  "token": "verification_token_from_email",
  "userId": "user_id_from_url"
}
```

**Response:**

```json
{
  "message": "Email verified successfully! You can now login.",
  "userId": "user_id_here"
}
```

#### POST /api/resend-verification-email

Újra elküldeni a verifikációs email-t

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Verification email resent. Please check your email.",
  "userId": "user_id_here"
}
```

#### POST /api/login

**Módosított viselkedés:**

- Ellenőrzi, hogy `emailVerified === true`
- Hiba: `"Please verify your email before logging in"`

## Szükséges csomag telepítés

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Environment Beállítás

1. Másold a `.env.example` fájlt `.env`-re
2. Kitöltsd az email konfigurációt:

### Gmail beállítás:

- Engedélyezd a "Less secure app access" vagy
- Használj "App Password" (2FA engedélyezése szükséges)
- EMAIL_USER: gmail_cím@gmail.com
- EMAIL_PASSWORD: app_jelszó_vagy_gmail_jelszó

### Egyéb e-mail szolga ltók:

Módosítsd az EMAIL_HOST értéket:

- Outlook: smtp-mail.outlook.com
- Yahoo: smtp.mail.yahoo.com
- Custom server: add meg a SMTP szervered

## Frontend Integráció

### 1. Register Komponens módosítása

Az auth service POST /api/register hívásánál:

- Nem kapunk JWT tokent azonnal
- Üzenet jelenik meg: "Check your email"

```typescript
// Helyett: localStorage.setItem('token', response.token)
// Bemutat üzenetet, hogy verifikálja az emailt
showMessage("Check your email for verification link");
```

### 2. Verification Komponens létrehozása

URL paramétert olvas: `?token=xxx&userId=xxx`

```typescript
// verify-email.component.ts
const token = this.route.snapshot.queryParams["token"];
const userId = this.route.snapshot.queryParams["userId"];

// POST /api/verify-email hívása
this.authService.verifyEmail(token, userId).subscribe((response) => {
  this.message = "Email verified! You can now login.";
  // Átirányítás login oldalra
});
```

### 3. Login Komponens módosítása

Kezel hibát: "Please verify your email before logging in"

```typescript
// Megjelenít üzenetet, link a re-send-hez
this.showResendEmailOption = true;
```

### 4. Re-send Email Form

```typescript
// Kuld POST /api/resend-verification-email
// Input: email cím
// Response: "Verification email resent"
```

## Tesztelés

### E2E flow:

1. Register: email@example.com / password
2. Nézd meg a console logokat (email küldve)
3. /verify-email?token=xxx&userId=xxx
4. Login: email@example.com / password → Success
5. Login: email@example.com / password (előbb) → Error "verify your email"

### Test felhasználó e-mail küldés nélkül:

MongoDB-ben manuálisan módosítsd:

```json
{
  "emailVerified": true,
  "emailVerificationToken": null,
  "emailVerificationTokenExpires": null
}
```

## Biztonsági megjegyzések

1. **Token lejárat**: 24 óra (módosítható szükség szerint)
2. **Token erőssége**: Crypto random 32 bytes = 256 bites
3. **Environment variables**: Soha ne commit-eld a `.env` fájlt
4. **Email jelszó**: Alkalmazás jelszót használj (nem valódi jelszó)
5. **HTTPS**: Élesben mindig HTTPS-t használj

## Lehetséges fejlesztések

- [ ] Email verifikáció után automatikus bejelentkezés
- [ ] Verifikáció nélküli felhasználók automatikus törlése N nap után
- [ ] Email küldés sorban (queue) kezelése
- [ ] SMS verifikáció alternatívája
- [ ] Bejelentkezés egy másik e-mailről való újrahitelesítés
- [ ] Verifikáció nélküli funkciók korlátozása (story olvasás rendben van, de írás nem)

## Troubleshooting

### Hiba: "Cannot find module 'nodemailer'"

```bash
npm install nodemailer @types/nodemailer
```

### Hiba: "Invalid EMAIL credentials"

- Ellenőrizd az EMAIL_USER és EMAIL_PASSWORD értékeket
- Gmail-nál használj App Password-ot
- Ellenőrizd, hogy az SMTP szerver engedélyezi-e a kapcsolódást

### Email nem érkezik meg

- Nézd meg a szerver console logját (error üzenet)
- Ellenőrizd a SPAM mappát
- Próbáld más email szolga ltóval (Gmail, Outlook)

### Token lejárt

- POST /api/resend-verification-email - újra elküldeni az emailt
- Token lejárat 24 óra
