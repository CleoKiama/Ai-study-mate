/**
 * A global in-memory cache for remembering values across module reloads.
 *
 * Borrowed and adapted from Kent C. Dodds’ version:
 * https://github.com/epicweb-dev/remember/blob/main/index.js
 *
 */

declare global {
  // Augment the globalThis type so TypeScript knows about our cache
  // eslint-disable-next-line no-var
  var __remember_epic_web: Map<string, unknown> | undefined;
}

/**
 * Remembers and retrieves a value by a given name, or creates it via `getValue` if not cached.
 *
 * @template Value
 * @param name - The unique key under which to remember the value.
 * @param getValue - A factory function to generate the value if it's not yet remembered.
 * @returns The remembered (or newly created) value.
 */
export function remember<Value>(name: string, getValue: () => Value): Value {
  const thusly = globalThis as typeof globalThis & {
    __remember_epic_web?: Map<string, unknown>;
  };

  if (!thusly.__remember_epic_web) {
    thusly.__remember_epic_web = new Map<string, unknown>();
  }

  if (!thusly.__remember_epic_web.has(name)) {
    thusly.__remember_epic_web.set(name, getValue());
  }

  return thusly.__remember_epic_web.get(name) as Value;
}

/**
 * Forgets a remembered value by a given name.
 *
 * @param name - The key under which the value was remembered.
 * @returns True if a value existed and was deleted, false otherwise.
 */
export function forget(name: string): boolean {
  const thusly = globalThis as typeof globalThis & {
    __remember_epic_web?: Map<string, unknown>;
  };

  if (!thusly.__remember_epic_web) {
    thusly.__remember_epic_web = new Map<string, unknown>();
  }

  return thusly.__remember_epic_web.delete(name);
}
