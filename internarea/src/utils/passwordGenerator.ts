export const generatePassword = (length: number = 10): string => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";

  const allChars = upper + lower;

  let password = "";

  // ✅ Ensure at least 1 uppercase
  password += upper.charAt(Math.floor(Math.random() * upper.length));

  // ✅ Ensure at least 1 lowercase
  password += lower.charAt(Math.floor(Math.random() * lower.length));

  // 🔁 Fill remaining characters
  for (let i = 2; i < length; i++) {
    password += allChars.charAt(
      Math.floor(Math.random() * allChars.length)
    );
  }

  // 🔀 Shuffle password to avoid fixed positions
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};
