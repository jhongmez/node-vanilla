import type { IncomingMessage } from "http";
import { StringDecoder } from "string_decoder";

/**
 * Reads the incoming request stream, decodes it as UTF-8 and parses it as JSON.
 *
 * @param { IncomingMessage } req - The incoming HTTP request whose body will be parsed.
 * @returns { Promise<any> } - Resolves with the parsed JSON body.
 * @throws Rejects when the accumulated body is not valid JSON.
 */
export const parseBody = ( req: IncomingMessage ): Promise<any> => {
    return new Promise( (resolve, reject) => {
        const decoder = new StringDecoder("utf-8");
        let buffer = "";

        req.on("data", ( chunk ) => {
            buffer += decoder.write(chunk)
        });

        req.on("end", () => {
            buffer += decoder.end();

            try {
                resolve( JSON.parse(buffer) );
            } catch (_err) {
                reject(_err);
            }
        })
    })
}