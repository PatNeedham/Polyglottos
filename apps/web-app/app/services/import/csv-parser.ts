// CSV parsing and field mapping utilities

import { ImportData, CSVFieldMapping, ImportError } from './types';
import { UserData, ProgressData, SettingsData } from '../storage/types';

export class CSVParser {
  private errors: ImportError[] = [];

  parse(csvContent: string, dataType: 'users' | 'progress' | 'settings'): { data?: ImportData; errors: ImportError[] } {
    this.errors = [];
    
    try {
      const lines = this.parseCSVLines(csvContent);
      
      if (lines.length === 0) {
        this.addError('Invalid CSV: no data found');
        return { errors: this.errors };
      }

      const headers = lines[0];
      const rows = lines.slice(1);
      
      // Auto-detect field mapping
      const mapping = this.autoDetectMapping(headers, dataType);
      
      // Parse data based on type
      const parsedData = this.parseRows(rows, headers, mapping, dataType);
      
      const importData: ImportData = {};
      if (dataType === 'users') {
        importData.users = parsedData as UserData[];
      } else if (dataType === 'progress') {
        importData.progress = parsedData as ProgressData[];
      } else if (dataType === 'settings') {
        importData.settings = parsedData as SettingsData[];
      }
      
      return { data: importData, errors: this.errors };
    } catch (error) {
      this.addError(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { errors: this.errors };
    }
  }

  private parseCSVLines(csvContent: string): string[][] {
    const lines: string[][] = [];
    const rows = csvContent.split('\n');
    
    for (const row of rows) {
      const trimmedRow = row.trim();
      if (!trimmedRow) continue;
      
      // Simple CSV parsing (handles quoted fields)
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let i = 0; i < trimmedRow.length; i++) {
        const char = trimmedRow[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());
      lines.push(fields);
    }
    
    return lines;
  }

  private autoDetectMapping(headers: string[], dataType: string): CSVFieldMapping {
    const mapping: CSVFieldMapping = {};
    
    // Common field name variations
    const fieldVariations: { [key: string]: string[] } = {
      id: ['id', 'user_id', 'userid', 'user id'],
      userId: ['user_id', 'userid', 'user id', 'uid'],
      username: ['username', 'user_name', 'user name', 'name'],
      email: ['email', 'e-mail', 'mail', 'email address'],
      questionsAnswered: ['questions_answered', 'questionsanswered', 'questions answered', 'total_questions'],
      correctAnswers: ['correct_answers', 'correctanswers', 'correct answers', 'correct'],
      quizzesTaken: ['quizzes_taken', 'quizzestaken', 'quizzes taken', 'total_quizzes'],
      language: ['language', 'lang', 'locale'],
      theme: ['theme', 'ui_theme', 'appearance'],
      notificationFrequency: ['notification_frequency', 'notifications', 'notify'],
      isPrivate: ['is_private', 'private', 'visibility'],
      goals: ['goals', 'user_goals', 'learning_goals'],
      cumulativeStats: ['cumulative_stats', 'stats', 'statistics'],
      lastUpdated: ['last_updated', 'updated_at', 'modified', 'last_modified'],
      createdAt: ['created_at', 'created', 'created_date']
    };
    
    for (const header of headers) {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Try to match with known field variations
      for (const [field, variations] of Object.entries(fieldVariations)) {
        // Use exact match first, then check if header contains the variation
        if (variations.some(v => v === normalizedHeader)) {
          mapping[header] = field;
          break;
        }
      }
      
      // If no match found, use the header as-is
      if (!mapping[header]) {
        mapping[header] = header;
      }
    }
    
    return mapping;
  }

  private parseRows(rows: string[][], headers: string[], mapping: CSVFieldMapping, dataType: string): (UserData | ProgressData | SettingsData)[] {
    const result: (UserData | ProgressData | SettingsData)[] = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || row.every(field => !field)) continue; // Skip empty rows
      
      const obj: Record<string, unknown> = {};
      
      for (let j = 0; j < headers.length && j < row.length; j++) {
        const header = headers[j];
        const fieldName = mapping[header];
        const value = row[j];
        
        // Parse value based on field type
        obj[fieldName] = this.parseValue(value, fieldName);
      }
      
      // Ensure required fields exist
      if (this.hasRequiredFields(obj, dataType)) {
        result.push(obj as UserData | ProgressData | SettingsData);
      } else {
        this.addError(`Row ${i + 2}: Missing required fields for ${dataType}`);
      }
    }
    
    return result;
  }

  private parseValue(value: string, fieldName: string): string | number | boolean | undefined {
    if (!value || value === '') return undefined;
    
    // Boolean fields
    if (fieldName === 'isPrivate') {
      return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
    }
    
    // Number fields
    if (['questionsAnswered', 'correctAnswers', 'quizzesTaken'].includes(fieldName)) {
      const num = parseInt(value, 10);
      return isNaN(num) ? 0 : num;
    }
    
    // String fields (default)
    return value.trim();
  }

  private hasRequiredFields(obj: Record<string, unknown>, dataType: string): boolean {
    switch (dataType) {
      case 'users':
        return !!(obj.id && obj.username && obj.email);
      case 'progress':
        return !!(obj.id && obj.userId);
      case 'settings':
        return !!obj.userId;
      default:
        return false;
    }
  }

  private addError(message: string): void {
    this.errors.push({
      type: 'validation',
      message,
      recoverable: true
    });
  }
}

export function parseCSV(csvContent: string, dataType: 'users' | 'progress' | 'settings'): { data?: ImportData; errors: ImportError[] } {
  const parser = new CSVParser();
  return parser.parse(csvContent, dataType);
}
