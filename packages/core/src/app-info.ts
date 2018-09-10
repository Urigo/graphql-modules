import { IGraphQLContext } from './graphql-module';
import { GraphQLApp } from './graphql-app';

/** Current application info, includes information such as the current network request, the current execution context and the GraphQLApp */
export class AppInfo {
  private request: any;
  private context: IGraphQLContext;
  private app: GraphQLApp;

  initialize({ request, context, app }: { request: any; context: IGraphQLContext, app: GraphQLApp }) {
    this.request = request;
    this.context = context;
    this.app = app;
  }

  public getRequest(): any {
    return this.request;
  }

  public getContext(): IGraphQLContext {
    return this.context;
  }

  public getApp(): GraphQLApp {
    return this.app;
  }
}
