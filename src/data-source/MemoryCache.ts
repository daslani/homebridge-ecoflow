export class MemoryCache {
  private readonly ttl: number;
  private readonly cache = {};

  constructor({ttl}) {
    this.ttl = ttl;
    this.cache = {};
  }

  get(key) {
    const cachedValue = this.cache[key];

    if (cachedValue) {
      return cachedValue.value;
    }

    return undefined;
  }

  remove(key) {
    const cache = this.cache[key];

    if (cache === undefined) {
      return;
    }

    clearTimeout(cache.expiryHandler);
    delete this.cache[key];
  }

  async set(key: string, value: unknown) {
    const expiryHandler = setTimeout(() => {
      this.remove(key);
    }, this.ttl * 1000);

    this.cache[key] = { value, expiryHandler };

    return this.get(key);
  }
}
