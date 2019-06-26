import 'reflect-metadata';
import { AppModule } from './app/app.module';
import { ApolloServer } from 'apollo-server';

const server = new ApolloServer({
  modules: [AppModule],
  context: session => session
});

server.listen(4000);
