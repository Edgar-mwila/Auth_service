import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateToken(userId: number, expiresIn = "7d"): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
}