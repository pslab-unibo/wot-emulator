function jsonResult(status: number, body: object) {
    return { status, body };
}

export const error = (error: {code?: number, message?: string}) => 
    jsonResult(error.code || 500, {error: error.message || "Generic error"});

export const ok = (body: object = { message: "Request was successful" }) => 
    jsonResult(200, body);

export const notFound = (error: string = "Resource not found") => 
    jsonResult(404, { error });

export const notImplemented = () => 
    jsonResult(501, { error: 'Not implemented' });
