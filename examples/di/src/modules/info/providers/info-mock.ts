import {
  injectable,
  inject,
  ModuleConfig,
  CommunicationBridge,
  AppInfo,
} from '@graphql-modules/core';

@injectable()
export class InfoMock {
  constructor(
    @inject(CommunicationBridge)
    private communicationBridge: CommunicationBridge,
    @inject(AppInfo) private app: AppInfo,
  ) {}

  getVersion() {
    this.communicationBridge.publish(
      'ASKED_FOR_VERSION',
      `${this.app.getRequest().method}: ${this.app.getRequest().url}`,
    );
    return 'mocked';
  }
}
