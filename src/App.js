import React, { useState, useEffect } from 'react';
import LiveRenderer from './components/LiveRenderer';
import './styles/LiveRenderer.css';
import './styles/GlobalStyles.css';

function App() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light-mode', isLightMode);
  }, [isLightMode]);

  const toggleMode = () => {
    setIsLightMode(!isLightMode);
  };

  return (
    <div className="App" style={{ 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: 'var(--background-color)',
      color: 'var(--text-color)'
    }}>
      <h1 style={{ 
        margin: '15px 0',
        padding: '0 20px', 
        color: 'var(--heading-color)',
        fontSize: '28px',
        fontWeight: '600',
        letterSpacing: '0.5px'
      }}>
        InstantCraft
      </h1>
      <button 
        onClick={toggleMode}
        style={{
          backgroundColor: 'var(--button-background)',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {isLightMode ? 'Dark Mode' : 'Light Mode'}
      </button>
      <LiveRenderer />
    </div>
  );
}

export default App;