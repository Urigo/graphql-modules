import 'reflect-metadata';
import { AppModule } from '@modules/app/app.module';
import * as express from 'express';
import * as graphQLHTTP from 'express-graphql';

const app = express();

app.use('/graphql', graphQLHTTP({
    schema: AppModule.schema,
    graphiql: true,
}));

app.listen(4000);
