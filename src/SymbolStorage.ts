/* -*- indent-tabs-mode: nil; tab-width: 2; -*- */
/* vim: set ts=2 sw=2 et ai : */
/**
  Copyright (C) 2023 WebExtensions Experts Group

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  @license
*/

/**
 * We do not implement features that do not work when internal Maps are
 * converted to WeakMap.
 * @todo convert to WeakMap when it is possible.
 */
const storages = new WeakMap<SymbolStorage<unknown>, Map<symbol, unknown>>();

/**
 * An ephemeral storage that takes a symbol as key and returns a value.
 * It has the same interface as WeakMap.
 * It is usable when WeakMap is not yet available for symbols.
 */
export class SymbolStorage<T> {
  readonly #reassignable: boolean;

  public constructor(reassignable = true) {
    if (new.target != SymbolStorage) {
      throw new TypeError("Illegal constructor");
    }
    this.#reassignable = reassignable;
    storages.set(this, new Map<symbol, T>());
  }

  #checkThis(): void {
    if (!(this instanceof SymbolStorage) || !storages.has(this)) {
      throw new TypeError("Illegal invocation");
    }
  }

  public delete(key: symbol): boolean {
    this.#checkThis();
    return storages.get(this)?.delete(key) as boolean;
  }

  public get(key: symbol): T | undefined {
    this.#checkThis();
    return storages.get(this)?.get(key) as T | undefined;
  }

  public has(key: symbol): boolean {
    this.#checkThis();
    return storages.get(this)?.has(key) as boolean;
  }

  public set(key: symbol, value: T): this {
    this.#checkThis();
    if (!this.#reassignable && this.has(key)) {
      const oldValue = this.get(key) as T;
      if (oldValue === value) {
        return this;
      }
      throw new TypeError("Cannot reassign a value");
    }
    storages.get(this)?.set(key, value);
    return this;
  }

  public get [Symbol.toStringTag](): string {
    this.#checkThis();
    return "SymbolStorage";
  }

  public static [Symbol.hasInstance](instance: unknown): boolean {
    try {
      this.prototype.#checkThis.call(instance);
      return true;
    } catch (e) {
      return false;
    }
  }
}

Object.freeze(SymbolStorage.prototype);
Object.freeze(SymbolStorage);
