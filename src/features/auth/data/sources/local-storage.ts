
export interface ILocalStorage {
  write(key: string, value: string): Promise<void>;

  read(key: string): Promise<string | null>;

  delete(key: string): Promise<void>;

  deleteAll(): Promise<void>;
}

export class LocalStorage implements ILocalStorage {
  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async deleteAll(): Promise<void> {
    localStorage.clear();
  }

  async read(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async write(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }
}

