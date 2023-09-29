import * as jose from 'jose';
import type { Payload } from '../models/api';

// Function to check if the token is valid
export const authenticateJWT = async (token: string) => {
  if (!token) {
    return null;
  } else {
    const key = import.meta.env.VITE_TOKEN_SECRET;
    const accessTokenSecret = new TextEncoder().encode(key);
    try {
      const { payload, protectedHeader } = await jose.jwtVerify(
        token,
        accessTokenSecret,
        {
          algorithms: ['HS256'],
        },
      );
      if (payload) {
        return payload as Payload;
      } else {
        return null;
      }
    } catch (e) {
      console.log(e.message);
    }
  }
};
