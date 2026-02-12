import { validate } from '@middlewares';
import { Router } from 'express';
import {
    batchShortenBodySchema,
    redirectParam,
    shortenBodySchema,
} from './schema';
import { UrlController } from './controller';

export const urlRouter = Router();

urlRouter
    .route('/shorten')
    .post(validate(shortenBodySchema, 'body'), UrlController.shorten);

urlRouter
    .route('/shorten/batch')
    .post(validate(batchShortenBodySchema, 'body'), UrlController.batchShorten);

urlRouter
    .route('/:short/qr')
    .get(validate(redirectParam, 'params'), UrlController.getQr);

urlRouter
    .route('/:short/stats')
    .get(validate(redirectParam, 'params'), UrlController.getAnalytics);

urlRouter
    .route('/:short')
    .get(validate(redirectParam, 'params'), UrlController.redirect);
