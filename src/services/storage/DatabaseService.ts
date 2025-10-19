export class DatabaseService {
  static async initialize(): Promise<void> {
    // Placeholder for react-native-quick-sqlite setup
  }

  static async execute(query: string, params: unknown[] = []): Promise<void> {
    // Execute SQL query (stub)
    console.log('Executing query', query, params);
  }
}
