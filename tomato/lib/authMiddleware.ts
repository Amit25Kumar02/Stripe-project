// lib/auth.ts
import jwt from "jsonwebtoken";

export function verifyToken(authHeader?: string) {
  if (!authHeader) throw new Error("No token provided");
  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) throw new Error("Invalid token format");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
