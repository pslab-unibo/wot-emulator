//Creates a standard JSON response with a status code and a body.
function jsonResult(status: number, body: object) {
    return { status, body };
}

/**Generates an error response with a customizable error code and message.
 * Defaults to a 500 status code and a generic error message if not provided. */
export const error = (error: {code?: number, message?: string}) => 
    jsonResult(error.code || 500, {error: error.message || "Generic error"});

/**Generates a successful response with a customizable body.
 * Defaults to a success message if no body is provided. */
export const ok = (body: object = { message: "Request was successful" }) => 
    jsonResult(200, body);

/**Generates a "Not Found" response with a 404 status code and an error message.
 * Defaults to "Resource not found" if no message is provided. */
export const notFound = (error: string = "Resource not found") => 
    jsonResult(404, { error });

//Generates a "Not Implemented" response with a 501 status code and a standard error message.
export const notImplemented = () => 
    jsonResult(501, { error: 'Not implemented' });
