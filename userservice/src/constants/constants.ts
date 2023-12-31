export const apiURL = '/api/v1'

export enum responseStatus {
    /** Success: OK */
    OK = 200,

    /** Success: Created */
    Created = 201,

    /** Success: No Content */
    NoContent = 204,

    /** Bad Request */
    BadRequest = 400,

    /** Unauthorized */

    Unauthorized = 401,

    /** Not Found */
    NotFound = 404,

    /** Internal Server Error */
    InternalServerError = 500,
}

export enum jrestStatus {
    success = 'success',
    fail = 'fail',
    error = 'error',
}
