import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { NotEnoughScopes } from './social.abstract';
import { HttpStatusCode } from 'axios';

@Catch(NotEnoughScopes)
export class NotEnoughScopesFilter implements ExceptionFilter {
  catch(exception: NotEnoughScopes, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatusCode.NotAcceptable).json({ invalid: true });
  }
}
