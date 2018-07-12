import { injectable, inject, ModuleConfig, CommunicationBridge } from '@graphql-modules/core';

@injectable()
export class Info {
    constructor(
        @inject(ModuleConfig) private config: any,
        @inject(CommunicationBridge) private communicationBridge: CommunicationBridge,
    ) {}

    getVersion() {
        this.communicationBridge.publish('ASKED_FOR_VERSION', null);
        return this.config.version;
    }
}
