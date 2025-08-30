const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

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


// EmailJS function to send emails
exports.sendEmail = functions.https.onCall(async (data, context) => {
    try {
        const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
            service_id: "your_service_id",
            template_id: "your_template_id",
            user_id: "your_public_key",
            template_params: {
                to_name: data.to_name,
                from_name: data.from_name,
                message: data.message,
                reply_to: data.reply_to
            }
        });

        return { success: true, data: response.data };
    } catch (error) {
        console.error("EmailJS Error:", error.response ? error.response.data : error.message);
        throw new functions.https.HttpsError("internal", "Email sending failed");
    }
});

