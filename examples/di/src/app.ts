import { GraphQLApp, EventEmitterCommunicationBridge } from '@graphql-modules/core';
import { userModule } from './modules/user';
import { blogModule } from './modules/blog';
import { infoModule } from './modules/info';

const communicationBridge = new EventEmitterCommunicationBridge();

export const app = new GraphQLApp({
  modules: [
    infoModule.withConfig({
      version: 'v1.0.0',
    }),
    userModule,
    blogModule,
  ],
  communicationBridge,
});

communicationBridge.subscribe('ASKED_FOR_VERSION', () => {
  console.log('someone asked for version number');
});

communicationBridge.subscribe('ASKED_FOR_POST', () => {
  console.log('someone asked for post');
});

communicationBridge.subscribe('ASKED_FOR_USER', () => {
  console.log('someone asked for post');
});
