# EmailJS Setup Guide for Kinetic Creations OTP

## Step 1 — Create EmailJS Account
1. Go to: https://www.emailjs.com
2. Click "Sign Up Free"
3. Register with your Gmail (arjunkarki's email or any Gmail)
4. Verify your email

---

## Step 2 — Connect Gmail Service
1. In EmailJS dashboard, click "Email Services" on the left
2. Click "Add New Service"
3. Choose "Gmail"
4. Click "Connect Account" → sign in with your Gmail
5. Give it a name like: **kinetic_gmail**
6. Click "Create Service"
7. ✅ Copy the **Service ID** (looks like: service_xxxxxxx)

---

## Step 3 — Create Email Template
1. Click "Email Templates" on the left
2. Click "Create New Template"
3. Set these fields:

**Subject:**
```
Your Kinetic Creations OTP Code: {{otp_code}}
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f0f2fa;padding:30px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(26,60,200,.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <h2 style="color:#1a3cc8;margin:0;">Kinetic Creations</h2>
      <p style="color:#6b7280;font-size:14px;margin:4px 0 0;">Password Reset</p>
    </div>
    <p style="color:#0d1333;font-size:15px;">Hi <strong>{{user_name}}</strong>,</p>
    <p style="color:#0d1333;font-size:15px;">You requested a password reset. Use the OTP code below:</p>
    <div style="background:#e8eeff;border:2px solid #1a3cc8;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
      <p style="margin:0;font-size:13px;color:#6b7280;">Your OTP Code</p>
      <h1 style="margin:8px 0 0;font-size:42px;letter-spacing:10px;color:#1a3cc8;font-family:monospace;">{{otp_code}}</h1>
    </div>
    <p style="color:#6b7280;font-size:13px;">⏱️ This code expires in <strong>5 minutes</strong>.</p>
    <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can ignore this email.</p>
    <hr style="border:none;border-top:1px solid #d1d5e8;margin:24px 0;">
    <p style="color:#b0b8c8;font-size:12px;text-align:center;">© 2026 Kinetic Creations · Nepal</p>
  </div>
</body>
</html>
```

**To Email field:** `{{to_email}}`

4. Click "Save"
5. ✅ Copy the **Template ID** (looks like: template_xxxxxxx)

---

## Step 4 — Get Your Public Key
1. Click your profile icon (top right) → "Account"
2. Go to "General" tab
3. Under "API Keys" section
4. ✅ Copy the **Public Key** (looks like: aBcDeFgHiJkLmNoPq)

---

## Step 5 — Paste Into login.html
Open `login.html` and find these 3 lines (around line 199):

```javascript
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
```

Replace with your actual values:

```javascript
const EMAILJS_PUBLIC_KEY  = 'aBcDeFgHiJkLmNoPq';   // your public key
const EMAILJS_SERVICE_ID  = 'service_abc1234';        // your service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz5678';       // your template ID
```

**Save the file. Done! ✅**

---

## Step 6 — Test It
1. Open your website → Login page → "Forgot password?"
2. Enter a registered email
3. The OTP should arrive in Gmail within a few seconds
4. If it lands in spam, open the email and click "Not spam"

---

## Free Plan Limits
- ✅ 200 emails/month free
- ✅ No credit card needed
- ✅ Works with Gmail, Outlook, Yahoo

---

## Template Variables Used
| Variable | Value |
|----------|-------|
| `{{to_email}}` | Customer's email address |
| `{{otp_code}}` | 6-digit OTP number |
| `{{user_name}}` | Customer's first name or username |

