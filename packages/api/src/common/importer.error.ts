export class ImporterError extends Error {
    readonly error?: string;
    readonly data?: unknown;

    constructor(message?: string, error?: string, data?: unknown) {
        super(message);
        this.error = error;
        this.data = data;
    }
}
