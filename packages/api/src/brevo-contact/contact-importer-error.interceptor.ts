import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable } from "rxjs";

import { ImporterError } from "../common/importer.error";

@Injectable()
export class ImporterErrorInterceptor implements NestInterceptor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // next.handle() is an Observable of the controller's result value
        return next.handle().pipe(
            catchError((e) => {
                if (e instanceof ImporterError) {
                    throw new BadRequestException({ error: e.error, data: e.data, message: e.message });
                } else {
                    throw e;
                }
            }),
        );
    }
}
