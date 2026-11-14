const SENSITIVE_PATTERNS = [
  /password\s*[:=]\s*['"]?([^'"\s]+)['"]?/gi,
  /tenant_db_password\s*[:=]\s*['"]?([^'"\s]+)['"]?/gi,
  /tenant_admin_password\s*[:=]\s*['"]?([^'"\s]+)['"]?/gi,
  /tenant_jwt_secret\s*[:=]\s*['"]?([^'"\s]+)['"]?/gi,
  /AWS_SECRET_ACCESS_KEY\s*[:=]\s*['"]?([^'"\s]+)['"]?/gi,
  /ARM_CLIENT_SECRET\s*[:=]\s*['"]?([^'"\s]+)['"]?/gi,
  /-----BEGIN (RSA|OPENSSH|PRIVATE) KEY-----[\s\S]*?-----END \1 KEY-----/g,
  /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
];

export function sanitizeLog(rawMessage: string): string {
  if (!rawMessage) return "";
  let clean = rawMessage;
  for (const pattern of SENSITIVE_PATTERNS) {
    clean = clean.replace(pattern, (match) => {
      if (match.includes("BEGIN") && match.includes("KEY")) {
        return "[REDACTED_PRIVATE_KEY]";
      }
      if (match.startsWith("eyJ")) {
        return "[REDACTED_JWT_TOKEN]";
      }
      return match.replace(/[:=]\s*['"]?([^'"\s]+)['"]?/, '="[REDACTED_SECRET]"');
    });
  }
  return clean;
}
