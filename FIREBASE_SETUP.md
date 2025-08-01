# Firebase Setup Guide

This guide will help you set up Firebase authentication for your Parlad Boutique Management application.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "Parlad Boutique")
4. Follow the setup wizard (you can disable Google Analytics if not needed)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## 3. Set Up Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

### No Indexes Required

The application is designed to work without any Firestore indexes. All sorting is done in memory after fetching the data, which eliminates the need for complex index setup.

**Benefits of this approach:**
- ✅ **No setup required** - Works immediately
- ✅ **No waiting** - No index building time
- ✅ **Simpler configuration** - Just basic Firestore setup
- ✅ **Cost effective** - No additional index storage costs

### Firestore Security Rules (Optional but Recommended)

After setting up Firestore, go to the "Rules" tab and update the security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read/write factories
    match /factories/{factoryId} {
      allow read, write: if request.auth != null;
    }
    
    // Authenticated users can read/write production records
    match /production/{recordId} {
      allow read, write: if request.auth != null;
    }
    
    // Users can read/write their own ledgers
    match /ledgers/{ledgerId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
    
    // Users can read/write transactions for ledgers they own
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
  }
}
```

## 4. Get Your Firebase Configuration

1. In your Firebase project, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "Parlad Boutique Web")
5. Copy the configuration object

## 5. Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

## 6. Test the Authentication

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3003`
3. Try creating a new account or signing in
4. You should be redirected to the dashboard after successful authentication

## 7. Additional Features (Optional)

### Email Verification
To enable email verification:
1. Go to Firebase Console > Authentication > Sign-in method
2. Under "Email/Password", enable "Email link (passwordless sign-in)"
3. Configure email templates in "Templates" tab

### Password Reset
The forgot password functionality is already implemented and will work once you set up Firebase.

### User Profile Management
You can extend the dashboard to include user profile management features.

## 8. Security Rules (Firestore - Optional)

If you plan to use Firestore for data storage, set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 9. Deployment

When deploying to production:
1. Update your environment variables with production Firebase project credentials
2. Ensure your domain is added to authorized domains in Firebase Console
3. Configure any additional security settings as needed

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually happens in development with hot reloading
   - The current setup handles this automatically

2. **Authentication not working**
   - Check that your environment variables are correct
   - Ensure Email/Password authentication is enabled in Firebase Console
   - Check browser console for any errors

3. **Environment variables not loading**
   - Make sure your `.env.local` file is in the project root
   - Restart your development server after adding environment variables

## Support

If you encounter any issues, check the Firebase documentation or create an issue in your project repository. 