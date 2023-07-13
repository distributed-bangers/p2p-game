import User from "../model/userModel";
import {createHash, generateJWT} from "../auth";
import {IUser} from "../index";


export async function loginUserAsync(body:any) {

    let { username, password } = body;
    if (!username || !password){
        throw(new Error("Bad request"))
    }
    let existingUser;
    try {
        existingUser = <IUser>await User.findOne({ username: username });
    } catch(error) {
        throw(error)
    }
    if (!existingUser) {
        throw(new Error("User doesn't exists!1"))
    }
    else if (existingUser.password != createHash(password)) {
        throw(new Error("Password doesn't match"))
    }
    else{
        try{
             const token = generateJWT(username)
            return token!
        }
        catch (error){
            throw(error)
        }
    }
}

export  async function createUserAsync(body:any ):Promise<string>{
    try {
        const user = new User({
            username: body.username,
            password: createHash(body.password),
            createdDate: new Date()
        })
        await user.save();
        const token = generateJWT(user.username)
        return token!
    } catch(error) {
        throw(error)
    }
}

export async function getOneUserAsync(username:string) :Promise<object>{
    if (!username){
        throw(new Error("Bad request"))
    }
    let existingUser
    try {
        existingUser = await User.findOne({ username: username });
    } catch(error) {
        throw(error)
    }
    if (!existingUser) {
        throw(new Error("User doesn't exists!"))
    }
    else {
        return existingUser
    }
}