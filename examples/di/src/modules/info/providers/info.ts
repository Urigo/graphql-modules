import { injectable } from '@graphql-modules/core';

@injectable()
export class Info {
    getVersion() {
        return 'v1.0.0';
    }
}
