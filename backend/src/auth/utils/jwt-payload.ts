export interface JwtPayload {
  sub: string; // userId
  username: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}
