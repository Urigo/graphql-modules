export interface ExecutionContextPicker {
  getModuleContext(moduleId: string): GraphQLModules.ModuleContext;
  getApplicationContext(): GraphQLModules.AppContext;
}
