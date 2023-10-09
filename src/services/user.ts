import { User, UserModel } from "../schemas";

export default class UserService {

    public getById(email: string): Promise<User> {
        return UserModel.findOne({ 'email': email })
    }
}