import { validate } from '@middlewares';
import { Router } from 'express';
import { redirectParam, shortenBodySchema } from './schema';
import { UrlController } from './controller';

export const urlRouter = Router();

urlRouter
    .route('/shorten')
    .post(validate(shortenBodySchema, 'body'), UrlController.shorten);

urlRouter
    .route('/:short/qr')
    .get(validate(redirectParam, 'params'), UrlController.getQr);

urlRouter
    .route('/:short')
    .get(validate(redirectParam, 'params'), UrlController.redirect);
