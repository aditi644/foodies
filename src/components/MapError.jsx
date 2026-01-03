import React from 'react';

const MapError = ({ error, message }) => {
  return (
    <div style={styles.container}>
      <div style={styles.errorBox}>
        <h3 style={styles.title}>⚠️ Map Not Available</h3>
        {message && (
          <p style={styles.message}>{message}</p>
        )}
        {error === 'API_KEY_MISSING' && (
          <div>
            <p style={styles.message}>
              Google Maps API key is not configured.
            </p>
            <ol style={styles.instructions}>
              <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Enable "Maps JavaScript API" and "Directions API"</li>
              <li>Add the key to your <code>.env</code> file as <code>VITE_GOOGLE_MAPS_API_KEY</code></li>
              <li>Restart your development server</li>
            </ol>
          </div>
        )}
        {error === 'API_KEY_INVALID' && (
          <div>
            <p style={styles.message}>
              Google Maps API key is invalid or restricted.
            </p>
            <ol style={styles.instructions}>
              <li>Check that your API key is correct in <code>.env</code></li>
              <li>Ensure billing is enabled on your Google Cloud project</li>
              <li>Check API key restrictions in Google Cloud Console</li>
              <li>Make sure "Maps JavaScript API" is enabled</li>
            </ol>
          </div>
        )}
        {error === 'LOAD_ERROR' && (
          <div>
            <p style={styles.message}>
              Failed to load Google Maps. This could be due to:
            </p>
            <ul style={styles.instructions}>
              <li>Invalid or missing API key</li>
              <li>Billing not enabled on Google Cloud project</li>
              <li>Maps JavaScript API not enabled</li>
              <li>API key restrictions blocking your domain</li>
              <li>Internet connection issues</li>
            </ul>
            <p style={styles.debug}>
              <strong>Debug:</strong> Open browser console (F12) to see detailed error messages.
            </p>
          </div>
        )}
        {error === 'INVALID_CENTER' && (
          <div>
            <p style={styles.message}>
              {message || 'Invalid map center coordinates. Location data is missing or invalid.'}
            </p>
          </div>
        )}
        <p style={styles.note}>
          Note: The "For development purposes only" watermark appears when:
          <br />
          • API key is missing or invalid
          <br />
          • Billing is not enabled on your Google Cloud project
          <br />
          • API restrictions are too strict
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    border: '2px dashed #ccc',
    borderRadius: '8px',
  },
  errorBox: {
    padding: '30px',
    maxWidth: '500px',
    textAlign: 'center',
  },
  title: {
    color: '#ff4757',
    marginBottom: '15px',
  },
  message: {
    color: '#666',
    marginBottom: '20px',
    fontSize: '16px',
  },
  instructions: {
    textAlign: 'left',
    color: '#333',
    lineHeight: '1.8',
    marginBottom: '20px',
  },
  note: {
    fontSize: '12px',
    color: '#999',
    marginTop: '20px',
    fontStyle: 'italic',
  },
  debug: {
    fontSize: '12px',
    color: '#666',
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px',
  },
};

export default MapError;

