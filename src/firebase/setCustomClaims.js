
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "./firebaseConfig";

const functions = getFunctions(app);

export const assignRoleToUser = async (uid, role) => {
    const setCustomClaims = httpsCallable(functions, "setCustomClaims");

    try {
        const result = await setCustomClaims({ uid, role });
        console.log(result.data.message);
        return result.data.message;
    } catch (error) {
        console.error("Error setting custom claims:", error);
        throw error;
    }
};
