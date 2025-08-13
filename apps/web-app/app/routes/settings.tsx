import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { getSession } from '~/utils/session';

export default function Settings() {
  const [user, setUser] = useState({ id: '1', username: 'demo_user', email: 'demo@example.com' }); // Mock data for testing
  const [loading, setLoading] = useState(false); // Start as not loading for testing
  const [exportLoading, setExportLoading] = useState(false);
  const [lastExportDate, setLastExportDate] = useState(null);

  useEffect(() => {
    // Commented out for testing - enable this later
    // const loadUserData = async () => {
    //   try {
    //     const session = await getSession();
    //     const userId = session.get('userId');
        
    //     if (userId) {
    //       setUser({
    //         id: userId,
    //         username: 'demo_user',
    //         email: 'demo@example.com'
    //       });
          
    //       // Load last export date from localStorage
    //       const lastExport = localStorage.getItem(`lastExport_${userId}`);
    //       if (lastExport) {
    //         setLastExportDate(new Date(lastExport));
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error loading user data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // loadUserData();
  }, []);

  const handleExport = async (format: 'json' | 'csv', incremental: boolean = false) => {
    if (!user) return;
    
    setExportLoading(true);
    
    try {
      // Build export URL
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (incremental && lastExportDate) {
        params.append('since', lastExportDate.toISOString());
      }
      
      const exportUrl = `http://localhost:8787/users/${user.id}/export?${params.toString()}`;
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `user-${user.id}-export-${new Date().toISOString().split('T')[0]}.${format}`;
      
      // Add link to DOM, click it, then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update last export date
      const now = new Date();
      setLastExportDate(now);
      localStorage.setItem(`lastExport_${user.id}`, now.toISOString());
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return <div className="container">User not found</div>;
  }

  return (
    <div className="container">
      <h1>Account Settings</h1>
      
      <div className="settings-section">
        <h2>Data Export</h2>
        <p>Download your complete learning data in different formats.</p>
        
        {lastExportDate && (
          <p className="last-export">
            <strong>Last export:</strong> {lastExportDate.toLocaleString()}
          </p>
        )}
        
        <div className="export-options">
          <div className="export-format">
            <h3>JSON Format</h3>
            <p>Complete data with referential integrity, ideal for backups and data analysis.</p>
            <div className="export-buttons">
              <button 
                onClick={() => handleExport('json', false)}
                disabled={exportLoading}
                className="button primary"
              >
                {exportLoading ? 'Exporting...' : 'Export Complete JSON'}
              </button>
              {lastExportDate && (
                <button 
                  onClick={() => handleExport('json', true)}
                  disabled={exportLoading}
                  className="button secondary"
                >
                  Export Changes Since Last Export
                </button>
              )}
            </div>
          </div>
          
          <div className="export-format">
            <h3>CSV Format</h3>
            <p>Spreadsheet-friendly format, optimized for data analysis and reporting.</p>
            <div className="export-buttons">
              <button 
                onClick={() => handleExport('csv', false)}
                disabled={exportLoading}
                className="button primary"
              >
                {exportLoading ? 'Exporting...' : 'Export Complete CSV'}
              </button>
              {lastExportDate && (
                <button 
                  onClick={() => handleExport('csv', true)}
                  disabled={exportLoading}
                  className="button secondary"
                >
                  Export Changes Since Last Export
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="export-info">
          <h4>What's included in your export:</h4>
          <ul>
            <li>Your account information and profile settings</li>
            <li>Complete learning progress and statistics</li>
            <li>Language learning data and accuracy metrics</li>
            <li>Your goals and notifications settings</li>
            <li>Topic completion status</li>
            <li>Export metadata with date and format information</li>
          </ul>
        </div>
      </div>
      
      <div className="settings-section">
        <h2>Other Settings</h2>
        <p>Additional account settings will be available here.</p>
      </div>

      <div className="settings-actions">
        <Link to="/profile" className="button">Back to Profile</Link>
        <Link to="/" className="button">Back to Dashboard</Link>
      </div>
    </div>
  );
}