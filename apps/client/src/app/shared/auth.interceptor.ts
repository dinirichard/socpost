import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = localStorage.getItem("accessToken");
  console.log( accessToken, 'accessToken');

        if (accessToken) {
            const authReq = req.clone({
                headers: req.headers.set("Authorization",
                    "Bearer " + accessToken)
            });
            console.log( authReq, 'authReq');
            return next(authReq);
        }
        else {
            return next(req);
        }
};



// export const mediaInterceptor: HttpInterceptorFn = (req, next) => {
//   const authToken = localStorage.getItem("orgId");
//   const reqUrl = req.urlWithParams;
//   // reqUrl

//         if (authToken && reqUrl.includes('http://localhost:3000/api/media')) {
//             const authReq  = req.clone({
//               setHeaders: {
//                 Authorization: `Bearer ${authToken}`
//               }
//             });

//             return next(authReq);
//         }
//         else {
//             return next(req);
//         }
// };

// Server Response Time Interceptor
export const responseTimeInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  return next(req).pipe(
    finalize(() => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      console.log(`Request to ${req.url} took ${responseTime}ms`);      
    })
  );
}
