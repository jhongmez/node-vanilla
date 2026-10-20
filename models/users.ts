import { email, maxLength, minLength, object, pipe, string, type InferInput } from "valibot";
import { hash } from "bcrypt";

const emailSchema = pipe( string(), email() );
const passwordSchema = pipe( string(), minLength(6), maxLength(15) );

// Creamos el Schema de autenticación
export const authSchema = object({
    email: emailSchema,
    password: passwordSchema
});

export enum Role {
    "ADMIN" = "admin",
    "CUSTOMER" = "customer"
}

export type User = InferInput<typeof authSchema> & {
    id: number;
    role: Role;
    refreshToken?: string;
};

const users: Map<string, User> = new Map();

/**
* Create a new user tih the given email and password
* The password is hashed before saved
* 
* @param {string} email - The email of the user
* @param {string} password - The password of the user
* @returns {Promise<User>} - The created user
*/

export const createUser = async(
    email: string,
    password: string
): Promise<User> => {
    const hashedPassword = await hash(password, 10);
    const newUser: User = {
        id: Date.now(),
        email,
        password: hashedPassword,
        role: Role.CUSTOMER,
    };
    users.set(email, newUser);
    return newUser;
}