import { JwtPayload } from 'jsonwebtoken'
export interface Token extends JwtPayload {
    userid: string
    username: string
    iat: number
    exp: number
}
