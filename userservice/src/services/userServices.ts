import User from '../model/userModel.js';
import { createHash, generateJWT } from '../auth.js';
import { IUser } from '../index.js';
import crypto from "crypto";

export async function loginUserAsync(body: any) {
  let { username, password } = body;
  if (!username || !password) {
    throw new Error('Bad request');
  }
  const user = await checkUserExistence(username)
  if (!user) {
    throw new Error("User doesn't exists!");
  } else if (user.password == createHash(user.salt,password)) {
    try {
      const token = generateJWT(user);
      return token!;
    } catch (error) {
      throw error;
    }
  } else {
    throw new Error("Password doesn't match");
  }
}

export async function createUserAsync(body: any): Promise<string> {
  let { username, password } = body;
  console.log(body)
  if (!username || !password) {
    throw new Error('Bad request');
  }
  const userExistence = await checkUserExistence(username)
  if (userExistence) {
    throw new Error("User with this username already exists}");
  }
  else{
    try {
      let salt = crypto.randomUUID()
      const user = new User({
        username: username,
        salt: salt,
        password: createHash(salt,password),
        createdDate: new Date(),
      });
      await user.save();
      const token = generateJWT(user);
      return token!;
    } catch (error) {
      throw error;
    }
  }
}

export async function getOneUserAsync(username: string): Promise<object> {
  if (!username) {
    throw new Error('Bad request');
  }
  const user = await checkUserExistence(username)
  if (!user) {
    throw new Error("User doesn't exists!");
  } else {
    return user;
  }
}

async function checkUserExistence(username: string):Promise<null|IUser>{
  let existingUser;
  try {
    existingUser = <IUser>await User.findOne({ username: username });
  } catch (error) {
    throw error;
  }
  if (!existingUser) {
    return null;
  } else {
    return existingUser;
  }
}
