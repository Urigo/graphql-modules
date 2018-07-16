import { injectable, inject, CommunicationBridge } from '@graphql-modules/core';

const users = [{
    _id: 0,
    username: 'Sample User',
}];

@injectable()
export class Users {
    constructor(@inject(CommunicationBridge) private communicationBridge: CommunicationBridge) {}

    getUser(id: number) {
        this.notify();
        return users.find(({_id}) => _id === id);
    }

    allUsers() {
        this.notify();
        return users;
    }

    notify() {
        this.communicationBridge.publish('ASKED_FOR_USER', null);
    }
}
