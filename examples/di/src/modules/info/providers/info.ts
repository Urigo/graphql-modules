import { injectable, inject, ModuleConfig } from '@graphql-modules/core';

@injectable()
export class Info {
    constructor(@inject(ModuleConfig) private config: any) {}

    getVersion() {
        return this.config.version;
    }
}
