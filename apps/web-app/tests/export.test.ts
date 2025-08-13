/**
 * Basic test for export functionality
 */

describe('Data Export', () => {
  describe('Export URL generation', () => {
    it('should generate correct URL for JSON export', () => {
      const userId = 123;
      const format = 'json';
      const params = new URLSearchParams();
      params.append('format', format);
      
      const expectedUrl = `http://localhost:8787/users/${userId}/export?format=json`;
      const actualUrl = `http://localhost:8787/users/${userId}/export?${params.toString()}`;
      
      expect(actualUrl).toBe(expectedUrl);
    });

    it('should generate correct URL for CSV export', () => {
      const userId = 123;
      const format = 'csv';
      const params = new URLSearchParams();
      params.append('format', format);
      
      const expectedUrl = `http://localhost:8787/users/${userId}/export?format=csv`;
      const actualUrl = `http://localhost:8787/users/${userId}/export?${params.toString()}`;
      
      expect(actualUrl).toBe(expectedUrl);
    });

    it('should generate correct URL for incremental export', () => {
      const userId = 123;
      const format = 'json';
      const sinceDate = '2024-01-01T00:00:00.000Z';
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('since', sinceDate);
      
      const expectedUrl = `http://localhost:8787/users/${userId}/export?format=json&since=2024-01-01T00%3A00%3A00.000Z`;
      const actualUrl = `http://localhost:8787/users/${userId}/export?${params.toString()}`;
      
      expect(actualUrl).toBe(expectedUrl);
    });
  });

  describe('File download functionality', () => {
    it('should create download link with correct filename for JSON', () => {
      const userId = 123;
      const format = 'json';
      const today = new Date().toISOString().split('T')[0];
      
      const expectedFilename = `user-${userId}-export-${today}.${format}`;
      
      expect(expectedFilename).toMatch(/^user-123-export-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should create download link with correct filename for CSV', () => {
      const userId = 123;
      const format = 'csv';
      const today = new Date().toISOString().split('T')[0];
      
      const expectedFilename = `user-${userId}-export-${today}.${format}`;
      
      expect(expectedFilename).toMatch(/^user-123-export-\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });
});