export interface User {
  userid: string;
  username: string;
}

export interface SignInUser {
  username: string;
  password: string;
}

export interface SignUpUser {
  username: string;
  password: string;
  passwordRepeat: string;
}
