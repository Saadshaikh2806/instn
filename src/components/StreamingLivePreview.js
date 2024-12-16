import React, { useState, useEffect, useRef } from 'react';

const StreamingLivePreview = ({ htmlCode, cssCode }) => {
  const iframeRef = useRef(null);
  const [popupWindow, setPopupWindow] = useState(null);

  const openInNewWindow = () => {
    // Close existing popup if any
    if (popupWindow) {
      popupWindow.close();
    }

    // Open new window in fullscreen
    const width = window.screen.width;
    const height = window.screen.height;
    const newWindow = window.open('', 'Preview', 
      `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,titlebar=no,fullscreen=yes`
    );
    
    // Move window to top-left corner and maximize
    newWindow.moveTo(0, 0);
    newWindow.resizeTo(width, height);
    setPopupWindow(newWindow);

    // Extract HTML, CSS, and JavaScript from the response
    const htmlMatch = htmlCode.match(/<html[^>]*>[\s\S]*<\/html>/i);
    const cssMatch = htmlCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const jsMatch = htmlCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);

    const html = htmlMatch ? htmlMatch[0] : htmlCode;
    const css = cssMatch ? cssMatch[1] : cssCode;
    const js = jsMatch ? jsMatch[1] : '';

    // Write content to new window with proper structure
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            ${js}
          </script>
        </body>
      </html>
    `);
    
    // Add close window listener
    window.addEventListener('beforeunload', () => {
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
    });
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument;
      
      // Update HTML
      const bodyContent = htmlCode || '<h1 style="color: #ffffff; text-align: center; font-family: Arial, sans-serif;">Your website will appear here</h1>';
      if (doc.body.innerHTML !== bodyContent) {
        doc.body.innerHTML = bodyContent;
      }
      
      // Update CSS
      let style = doc.getElementById('dynamic-style');
      if (!style) {
        style = doc.createElement('style');
        style.id = 'dynamic-style';
        doc.head.appendChild(style);
      }
      const cssContent = `
        body {
          background-color: var(--background-color);
          color: var(--text-color);
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
          overflow: auto;
          height: 100%;
        }
        ${cssCode || ''}
      `;
      if (style.textContent !== cssContent) {
        style.textContent = cssContent;
      }
    }
  }, [htmlCode, cssCode]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument;
      doc.open();
      doc.write('<html><head><style id="dynamic-style"></style></head><body></body></html>');
      doc.close();
    }
  }, []);

  return (
    <div className="streaming-live-preview" style={{ 
      height: 'calc(100% - 40px)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <button 
        onClick={openInNewWindow}
        className="fullscreen-toggle"
        aria-label="Open in new window"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </button>
      <iframe 
        ref={iframeRef} 
        title="Streaming Live Preview"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--background-color)',
          border: '1px solid var(--text-color)',
          borderRadius: '4px',
          marginBottom: '0'
        }}
      />
    </div>
  );
};

export default StreamingLivePreview;