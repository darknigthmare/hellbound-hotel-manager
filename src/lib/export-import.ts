import { DatabaseState } from '../types';

export class ExportImport {
  /**
   * Stringifies the local database state into a formatted JSON string for export.
   */
  public static exportToJson(state: DatabaseState): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * Validates if a loaded text string is a structurally sound database backup file.
   */
  public static validateBackup(jsonText: string): { isValid: boolean; parsedState?: DatabaseState; error?: string } {
    try {
      const parsed = JSON.parse(jsonText);
      
      if (!parsed || typeof parsed !== 'object') {
        return { isValid: false, error: 'Invalid JSON backup: root element must be an object.' };
      }

      // Assert critical arrays and objects are present
      const requiredArrays: (keyof DatabaseState)[] = ['characters', 'rooms', 'rehabilitationPlans', 'loreCodex', 'factions', 'relationships'];
      for (const key of requiredArrays) {
        if (!Array.isArray(parsed[key])) {
          return { isValid: false, error: `Invalid backup: missing list field '${key}'.` };
        }
      }

      const requiredObjects: (keyof DatabaseState)[] = ['reputation', 'timeline', 'settings'];
      for (const key of requiredObjects) {
        if (!parsed[key] || typeof parsed[key] !== 'object') {
          return { isValid: false, error: `Invalid backup: missing structure field '${key}'.` };
        }
      }

      return { isValid: true, parsedState: parsed as DatabaseState };
    } catch (err) {
      return { isValid: false, error: 'Failed to parse file as JSON. Please ensure it is a valid plaintext JSON backup file.' };
    }
  }
}
