# 🚀 Quick Deployment Guide — Firestore Rules

## ⚡ Fast Track Deployment (5 minutes)

### Method 1: Firebase Console (Easiest)

**Step 1:** Open Firebase Console
- Go to: https://console.firebase.google.com
- Login with your Google account
- Select project: **studio-7901025869-7fae8**

**Step 2:** Navigate to Firestore Rules
- Click **Firestore Database** in left sidebar
- Click **Rules** tab at the top

**Step 3:** Copy Your Rules
- Open `firestore.rules` file in your project
- Select all (Ctrl+A or Cmd+A)
- Copy (Ctrl+C or Cmd+C)

**Step 4:** Paste and Publish
- In Firebase Console editor, select all existing rules
- Paste your new rules (Ctrl+V or Cmd+V)
- Click **Publish** button (top right)
- Confirm if prompted

**Step 5:** Verify Deployment
- Check timestamp shows "Published X minutes ago"
- Rules editor shows your new rules

**Done!** Rules are now live (wait 1-2 minutes for propagation)

---

### Method 2: Firebase CLI (For Developers)

**Step 1:** Install Firebase CLI
```bash
npm install -g firebase-tools
```

**Step 2:** Login to Firebase
```bash
firebase login
```
Follow the browser login flow.

**Step 3:** Initialize Project (First Time Only)
```bash
cd "c:\Users\ashcr\Desktop\Major Project\project"
firebase init
```
- Select: **Firestore** (use spacebar to select)
- Choose: **Use an existing project**
- Select: **studio-7901025869-7fae8**
- Rules file: **firestore.rules** (press Enter to use default)
- Indexes file: **firestore.indexes.json** (press Enter)

**Step 4:** Deploy Rules
```bash
firebase deploy --only firestore:rules
```

**Expected Output:**
```
=== Deploying to 'studio-7901025869-7fae8'...

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✔  firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!
```

**Done!** Rules are now live.

---

## 🧪 Quick Verification

### Test 1: Check Console
1. Go to Firebase Console → Firestore → Rules
2. Timestamp should be recent
3. Rules should show your new rules

### Test 2: Test in Browser Console

**Open your app:** http://localhost:9002

**Login as Student**, then open browser console (F12) and run:

```javascript
// Try to delete an alert (should fail)
const alertRef = doc(db, 'alerts', 'test-alert-id')
await deleteDoc(alertRef)
// Expected: ❌ Error: Missing or insufficient permissions
```

**Login as Admin**, then:

```javascript
// Try to create an alert (should succeed)
const alertsRef = collection(db, 'alerts')
await addDoc(alertsRef, {
  title: "Test",
  message: "Testing rules",
  severity: "info",
  sentBy: auth.currentUser.uid,
  sentByName: "Admin",
  sentAt: serverTimestamp(),
  targetSchools: ["all"],
  targetTiers: ["primary", "secondary"],
  channels: { inApp: true, email: false, parentSms: false },
  readBy: []
})
// Expected: ✅ Document created successfully
```

---

## 🐛 Common Issues

### Issue: "firebase: command not found"

**Solution:**
```bash
npm install -g firebase-tools
# Then try again
```

---

### Issue: "Permission denied" when deploying

**Solution:**
```bash
firebase logout
firebase login
# Then try deploying again
```

---

### Issue: "No project active"

**Solution:**
```bash
firebase use studio-7901025869-7fae8
firebase deploy --only firestore:rules
```

---

### Issue: "Syntax error in rules"

**Solution:**
```bash
# Validate rules syntax
firebase deploy --only firestore:rules --dry-run
# Fix any errors shown, then deploy
```

---

### Issue: Rules deployed but still get "permission denied"

**Possible Causes:**
1. **Wait time**: Rules take 1-2 minutes to propagate
2. **User profile missing fields**: Check user has `role` and `schoolId`
3. **Role capitalization**: Must be "Administrator", not "admin"
4. **Cache**: Hard refresh browser (Ctrl+F5)

**Check User Profile:**
```javascript
// In browser console
const myProfile = await getDoc(doc(db, 'users', auth.currentUser.uid))
console.log(myProfile.data())
// Should show: { role: "Administrator", schoolId: "...", ... }
```

---

## 📋 Deployment Checklist

Before deploying:
- [ ] `firestore.rules` file exists in project root
- [ ] Reviewed rules for security issues
- [ ] No `allow read, write: if true` rules (except specific cases)
- [ ] Default deny rule is at the bottom

After deploying:
- [ ] Firebase Console shows new rules
- [ ] Timestamp is recent
- [ ] Test as Student (should be restricted)
- [ ] Test as Teacher (should access school data)
- [ ] Test as Admin (should have full access)
- [ ] Normal app usage works (no unexpected permission errors)

---

## 🔄 Rollback (If Needed)

If rules cause issues, you can rollback:

**Option 1: Firebase Console**
- Click **Revert** button in Rules tab
- Select previous version
- Click **Publish**

**Option 2: Temporary Open Rules** (EMERGENCY ONLY)
```javascript
// ⚠️ USE ONLY FOR TESTING - NOT PRODUCTION
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Then immediately fix the real rules and redeploy!**

---

## ✅ Deployment Complete

Once you see:
- ✅ Firebase Console shows new rules
- ✅ Timestamp is recent
- ✅ Test with Student account (restricted)
- ✅ Test with Admin account (full access)

**Reply with:**
```
Task 4 verified and complete. Ready for Task 5.
```

---

## 📞 Need Help?

**Resources:**
- Firestore Rules Docs: https://firebase.google.com/docs/firestore/security/get-started
- Firebase CLI Docs: https://firebase.google.com/docs/cli
- Rules Playground: Firebase Console → Rules → Playground

**Check Files:**
- `FIRESTORE_RULES_GUIDE.md` — Complete documentation
- `TASK_4_CHECKLIST.md` — Testing guide
- `TASK_4_SUMMARY.md` — Overview
