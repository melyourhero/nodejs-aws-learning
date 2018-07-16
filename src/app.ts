import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';

import createApplicationBucket from './setup/Storage';

import Media from './controllers/Media';

createApplicationBucket();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(bodyParser.json());

app.use(Media);

app.use('/', (request: Request, response: Response) => {
  response.status(404).send({
    errors: [
      {
        status: 404,
        details: 'Endpoint not found',
      },
    ],
  });
});

export default app;
