import {
  GraphQLApp,
  EventEmitterCommunicationBridge,
} from '@graphql-modules/core';
import { userModule } from './modules/user';
import { blogModule } from './modules/blog';
import { infoModule } from './modules/info';
import { InfoMock } from './modules/info/providers/info-mock';
import { Info } from './modules/info/providers/info';

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
  providers: [
    {
      provide: Info,
      useClass: InfoMock,
      overwrite: true,
    },
  ],
});

communicationBridge.subscribe('ASKED_FOR_VERSION', url => {
  console.log('someone asked for version number at', url);
});

communicationBridge.subscribe('ASKED_FOR_POST', () => {
  console.log('someone asked for post');
});

communicationBridge.subscribe('ASKED_FOR_USER', () => {
  console.log('someone asked for post');
});
