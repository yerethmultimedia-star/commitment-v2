import { InMemoryOfflineStorage } from '../storage';

describe('InMemoryOfflineStorage', () => {
  it('returns null for a key that was never set', async () => {
    const storage = new InMemoryOfflineStorage<string>();
    expect(await storage.get('missing')).toBeNull();
  });

  it('stores and retrieves a value', async () => {
    const storage = new InMemoryOfflineStorage<string>();
    await storage.set('k', 'v');
    expect(await storage.get('k')).toBe('v');
  });

  it('overwrites a value stored under the same key', async () => {
    const storage = new InMemoryOfflineStorage<string>();
    await storage.set('k', 'v1');
    await storage.set('k', 'v2');
    expect(await storage.get('k')).toBe('v2');
  });

  it('removes a stored value', async () => {
    const storage = new InMemoryOfflineStorage<string>();
    await storage.set('k', 'v');
    await storage.remove('k');
    expect(await storage.get('k')).toBeNull();
  });

  it('removing an unknown key is a no-op', async () => {
    const storage = new InMemoryOfflineStorage<string>();
    await expect(storage.remove('missing')).resolves.toBeUndefined();
  });
});
