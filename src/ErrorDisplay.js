import React from 'react';

const ErrorDisplay = ({ errors, onDismiss }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#ffebee',
        border: '1px solid #f44336',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '16px',
        position: 'relative',
      }}
    >
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#f44336',
          }}
        >
          ×
        </button>
      )}
      <div style={{ color: '#c62828', fontWeight: 'bold', marginBottom: '8px' }}>
        Validation Errors:
      </div>
      <ul style={{ margin: '0', paddingLeft: '20px', color: '#d32f2f' }}>
        {errors.map((error, index) => (
          <li key={index} style={{ marginBottom: '4px' }}>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorDisplay;
