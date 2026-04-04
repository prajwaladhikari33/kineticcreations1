# Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules tab
Replace everything with this and click Publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
