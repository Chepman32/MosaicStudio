export interface CacheEntry {
  id: string;
  uri: string;
  updatedAt: number;
}

export class AssetCache {
  private cache: Record<string, CacheEntry> = {};

  get(id: string): CacheEntry | undefined {
    return this.cache[id];
  }

  set(entry: CacheEntry): void {
    this.cache[entry.id] = entry;
  }

  remove(id: string): void {
    delete this.cache[id];
  }

  clear(): void {
    this.cache = {};
  }
}
