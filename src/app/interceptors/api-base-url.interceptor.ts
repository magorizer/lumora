import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = request.url.startsWith('/api') || request.url.startsWith('api');
  if (!isApiRequest) {
    return next(request);
  }

  const requestPath = request.url.replace(/^\/?api/, '').replace(/^\/+/, '');
  const apiUrl = environment.apiUrl.replace(/\/+$/, '');
  return next(request.clone({ url: `${apiUrl}/${requestPath}` }));
};
