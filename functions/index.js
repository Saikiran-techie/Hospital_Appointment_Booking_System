const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Define setCustomClaims function
exports.setCustomClaims = functions.https.onCall(async (data, context) => {
    const { uid, role } = data;

    // Only authenticated users can call this function
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can assign roles.');
    }

    // Optionally: check if caller has 'admin' role
    const callerClaims = (await admin.auth().getUser(context.auth.uid)).customClaims;
    if (!callerClaims || callerClaims.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can assign roles.');
    }

    if (!uid || !role) {
        throw new functions.https.HttpsError('invalid-argument', 'UID and role are required.');
    }

    try {
        await admin.auth().setCustomUserClaims(uid, { role });
        return { message: `Role ${role} assigned successfully to user ${uid}.` };
    } catch (error) {
        console.error("Error setting claims:", error);
        throw new functions.https.HttpsError('internal', 'Error setting custom claims.');
    }
});
