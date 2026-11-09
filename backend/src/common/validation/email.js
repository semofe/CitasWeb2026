const isValidEmail = (value) => {
  if (typeof value !== "string") return false;

  const email = value.trim();
  if (!email || email.length > 254) return false;

  const atIndex = email.indexOf("@");
  const lastAtIndex = email.lastIndexOf("@");
  const dotIndex = email.lastIndexOf(".");
  const hasWhitespace = Array.from(email).some((character) => character.trim() === "");

  return !hasWhitespace
    && atIndex > 0
    && atIndex === lastAtIndex
    && dotIndex > atIndex + 1
    && dotIndex < email.length - 2;
};

module.exports = { isValidEmail };
