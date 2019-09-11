import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DefaultHeadersInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const newReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Request-With, Content-Type, Authorization, Accept',
        'Access-Control-Allow-Methods': 'POST,GET,PUT,DELETE,OPTIONS',
      }
    });

    return next.handle(newReq).pipe(
      catchError(err => {
        return throwError(err);
      })
    );
  }
}
