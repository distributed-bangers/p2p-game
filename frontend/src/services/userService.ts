import type { SignInUser } from '../models/user';
import { jrestStatus } from '../shared/constants';

const userAPI =
  import.meta.env.VITE_USER_API + import.meta.env.VITE_API_VERSION + '/users';

export async function signUp(User: SignInUser, PasswordRepeat: string) {
  try {
    const { username, password } = User;
    console.log(User);

    if (!username || !password || !PasswordRepeat) {
      throw new Error('Please enter a username and password!');
    }

    if (password !== PasswordRepeat) {
      throw new Error('Passwords do not match!');
    }

    const response = await fetch(userAPI, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(User),
    });

    const result = await response.json();

    if (result.status != jrestStatus.success) throw new Error(result.message);

    return result;
  } catch (error) {
    throw error;
  }
}

export async function signIn(User: SignInUser) {
  try {
    const { username, password } = User;

    if (!username || !password) {
      throw new Error('Please enter a username and password!');
    }
    const response = await fetch(userAPI + '/login', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(User),
    });

    const result = await response.json();

    if (result.status != jrestStatus.success) throw new Error(result.message);

    return result;
  } catch (error) {
    throw error;
  }
}
