import { stringify } from './utils.js';
import { resolveForwardRef } from './forward-ref.js';
import { Type } from './providers.js';

export class Key {
  constructor(
    public token: Type<any>,
    public id: number
  ) {
    if (!token) {
      throw new Error('Token must be defined!');
    }
  }

  /**
   * Returns a stringified token.
   */
  get displayName(): string {
    return stringify(this.token);
  }

  static get(token: Object): Key {
    return _globalKeyRegistry.get(resolveForwardRef(token));
  }
}

class GlobalKeyRegistry {
  private _allKeys = new Map<Object, Key>();

  get(token: Type<any>): Key {
    if (token instanceof Key) {
      return token;
    }

    if (this._allKeys.has(token)) {
      return this._allKeys.get(token)!;
    }

    const newKey = new Key(token, _globalKeyRegistry.numberOfKeys);
    this._allKeys.set(token, newKey);
    return newKey;
  }

  get numberOfKeys(): number {
    return this._allKeys.size;
  }
}

const _globalKeyRegistry = new GlobalKeyRegistry();
