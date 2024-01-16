import * as http from "http";

export function isErrorFromBrevo(error: unknown): error is { response: http.IncomingMessage } {
    return typeof error === "object" && error !== null && "response" in error && error.response instanceof http.IncomingMessage;
}
