import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ConfigStateService } from '../app-state/config-state.service';
import { Router } from '@angular/router';

@Injectable()
export class customHttpInterceptor implements HttpInterceptor {
  baseUrl : string = '';
  constructor(private configService : ConfigStateService, private router : Router){
    configService.subscribe((m) => {
      this.baseUrl = m.beUrl
    })
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiUrl : boolean = req.url.includes(this.baseUrl);
    return next.handle(req).pipe(
      map((res: HttpEvent<any>) => {
        console.log("Hello from interceptor!");
        return res;
      }),
      catchError((error : HttpErrorResponse) => {
        console.log("Error response from interceptor");
        if (isApiUrl && error.status == 403 || error.status == 401) {
          this.router.navigate(['']);
        }
        return throwError(() => error);
      }));
  }
};
