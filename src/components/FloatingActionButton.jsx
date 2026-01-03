import React from 'react';

const FloatingActionButton = ({ icon, label, onClick, count = 0, color = '#E23744' }) => {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.fab,
        backgroundColor: color,
      }}
      className="fab-button"
    >
      <span style={styles.icon}>{icon}</span>
      {label && <span style={styles.label}>{label}</span>}
      {count > 0 && (
        <span style={styles.badge} className="animate-bounce">
          {count}
        </span>
      )}
    </button>
  );
};

const styles = {
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    boxShadow: '0 10px 25px rgba(226, 55, 68, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1000,
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '24px',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    bottom: '-30px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#1C1C1C',
    whiteSpace: 'nowrap',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#27AE60',
    color: '#FFFFFF',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(39, 174, 96, 0.4)',
  },
};

// Add hover effect via CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .fab-button:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 35px rgba(226, 55, 68, 0.4);
  }
  
  .fab-button:active {
    transform: scale(0.95);
  }
`;
document.head.appendChild(styleSheet);

export default FloatingActionButton;

