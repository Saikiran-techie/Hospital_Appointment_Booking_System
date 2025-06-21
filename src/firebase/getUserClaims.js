import { getAuth } from "firebase/auth";

export const getUserClaims = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        try {
            const idTokenResult = await user.getIdTokenResult(true); // force refresh to get latest claims
            return idTokenResult.claims;
        } catch (error) {
            console.error("Error fetching user claims:", error);
            return null;
        }
    } else {
        console.warn("No authenticated user found.");
        return null;
    }
};
