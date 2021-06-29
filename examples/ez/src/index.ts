import 'reflect-metadata';

import Fastify from 'fastify';
import { createApplication } from 'graphql-modules';

import { useGraphQLModules } from '@envelop/graphql-modules';
import { CreateApp } from '@graphql-ez/fastify';
import { ezGraphiQLIDE } from '@graphql-ez/plugin-graphiql';

import { AuthModule } from './app/auth/auth.module';
import { SocialNetworkModule } from './app/social-network/social-network.module';
import { UserModule } from './app/user/user.module';

const server = Fastify({
  logger: true,
});
const modulesApp = createApplication({
  modules: [UserModule, AuthModule, SocialNetworkModule],
});

const EZApp = CreateApp({
  envelop: {
    plugins: [useGraphQLModules(modulesApp)],
  },
  ez: {
    plugins: [ezGraphiQLIDE()],
  },
});

const { fastifyPlugin } = EZApp.buildApp();

server.register(fastifyPlugin);

server.listen(4000);
