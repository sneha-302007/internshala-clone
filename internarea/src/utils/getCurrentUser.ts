import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const getCurrentUser = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        reject("User not logged in");
      }
    });
  });
};
