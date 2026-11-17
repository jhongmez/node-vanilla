import type { IncomingMessage, ServerResponse } from "http";
import { HttpMethodEnum } from "../enums/api.enum";
import { parseBody } from "../utils/parseBody";
import { safeParse } from "valibot";
import { addRevokeToken, authSchema, createUser, findUserByEmail, revokeUserToken, validatePassword } from "../models";
import { sign } from "jsonwebtoken";
import config from "../config";
import type { AuthenticationRequest } from "../middleware/authentication";

export const authRouter = async( req: IncomingMessage, res: ServerResponse) => {
	const { method, url } = req;

	if ( url === "/auth/register" && method === HttpMethodEnum.POST ) {
		const body = await parseBody(req);
		const result = safeParse( authSchema, body );

		if ( result.issues ) {
			res.statusCode = 400;
			res.end( JSON.stringify({
				message: "Bad Request"
			}) );
			return
		}

		const { email, password } = body;
		try {
			const user = await createUser( email, password );
			res.statusCode = 201;
			res.end( JSON.stringify(user));
		} catch (_err) {
			if ( _err instanceof Error ) {
				res.end( JSON.stringify({
					message: _err.message
				}))
			}

			res.end( JSON.stringify({
				message: "Internal Server Error"
			}))
		}
	}

	if ( url === "auth/login" && method === HttpMethodEnum.POST ) {
		const body = await parseBody(req);
		const result = safeParse( authSchema, body );

		if ( result.issues ) {
			res.statusCode = 400;
			res.end( JSON.stringify({
				message: "Bad Request"
			}) );
			return
		}

		const { email, password } = body;
		const user = findUserByEmail( email );
		if ( !user || !(await validatePassword) ) {
			res.statusCode = 401;
			res.end( JSON.stringify({
				message: "Unauthorized: Invalid email or password"
			}) );
			return;
		}

		const accessToken = sign(
			{ id: user.id, email: user.email, role: user.role },
			config.jwtSecret,
			{ expiresIn: "1h" }
		);

		const refreshToken = sign(
			{ id: user.id },
			config.jwtSecret,
			{ expiresIn: "1d" }
		);

		user.refreshToken = refreshToken;

		res.end( JSON.stringify({
			accessToken, refreshToken
		}) );
		return;
	}

	if ( url === "auth/logut" && method === HttpMethodEnum.POST ) {
		const token = req.headers["authorization"]?.split(" ")[1];

		if ( token ) {
			addRevokeToken( token );
			const formattedReq = req as AuthenticationRequest;

			if ( 
				formattedReq.user && 
				typeof formattedReq.user === "object" && 
				"id" in formattedReq.user
			) {
				const result = revokeUserToken( formattedReq.user.email );
				if ( !result ) {
					res.statusCode = 403;
					res.end( JSON.stringify({
						message: "Forbidden"
					}))
					return
				}
			}

			res.end( JSON.stringify({
				message: "Logged out"
			}))
			return;
		}
	}

	res.statusCode = 404;
	res.end( JSON.stringify({
		message: "Endpoint not found"
	}))
}