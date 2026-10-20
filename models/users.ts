import { email, maxLength, minLength, object, pipe, string, type InferInput } from "valibot";
import { compare, hash } from "bcrypt";
import { Role } from "../enums/role.enum";

const emailSchema = pipe( string(), email() );
const passwordSchema = pipe( string(), minLength(6), maxLength(15) );

/** Validation schema for the credentials used to authenticate or register a user. */
export const authSchema = object({
    email: emailSchema,
    password: passwordSchema
});

/** A user as stored in memory, including its generated id, role and optional refresh token. */
export type User = InferInput<typeof authSchema> & {
    id: number;
    role: Role;
    refreshToken?: string;
};

/** In-memory store of users, keyed by email. */
const users: Map<string, User> = new Map();

/**
* Create a new user with the given email and password
* The password is hashed before saved
* 
* @param { string } email - The email of the user.
* @param { string } password - The password of the user.
* @returns { Promise<User> } - The created user.
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

/**
 * Finds a user by their given email
 *
 * @param { string } email - The email of User to find.
 * @returns { User | undefined } - The user if found, otherwise undefined.
*/
export const findUserByEmail = ( email: string ): User | undefined => {
    return users.get( email );
}

/**
 * Validate a user's password
 * 
 * @param { User } user - The user whose password is to validated.
 * @param { string } password - The password to validate.
 * @returns { Promise<boolean> } - True if the password is valid, otherwise false.
*/
export const validatePassword = async(
    user: User,
    password: string
): Promise<boolean> => {
    return compare(password, user.password)
}

/**
 * Revoke token
 * @param { string } email - The email of the user to revoke the token.
 * @returns { boolean } - true if the token is revoked, otherwise false.
*/
export const revokeUserToken = ( email: string ): boolean => {
    const foundUser = users.get( email );

    if ( !foundUser ) return false;
    users.set( email, { ...foundUser, refreshToken: undefined } );
    return true;
}