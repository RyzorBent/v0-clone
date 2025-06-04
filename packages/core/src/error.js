export class APIError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
    get retry() {
        return this.status >= 500;
    }
    static unauthorized(message = "Unauthorized") {
        return new APIError(message, 401);
    }
    static notFound(message = "Not Found") {
        return new APIError(message, 404);
    }
}
