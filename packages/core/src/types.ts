
import { Injector } from '@graphql-modules/di';
import { GraphQLModule } from './graphql-module';

export type ModuleContext<Context = { [key: string]: any }> = Context & { injector: Injector };

export interface OnRequest<Config = any, Request = any, Context = any> {
  onRequest(request: Request, context: Context, appModule: GraphQLModule<Config, Request, Context>): Promise<void> | void;
}
