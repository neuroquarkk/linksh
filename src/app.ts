import { config } from '@config';
import { errorHandler } from '@middlewares';
import { logStream } from '@utils';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    morgan(config.MorganFormat, {
        stream: config.IsProd ? logStream : undefined,
    })
);

app.get('/', (_req, res) => {
    return res.send('Hello from the server');
});

app.use(errorHandler);
export default app;
