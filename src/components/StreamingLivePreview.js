import React, { useState, useEffect, useRef } from 'react';
import LoadingAnimation from './LoadingAnimation';

const StreamingLivePreview = ({ htmlCode, cssCode, jsCode, isLoading }) => {
  const iframeRef = useRef(null);
  const [popupWindow, setPopupWindow] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [htmlProgress, setHtmlProgress] = useState(0);
  const [cssProgress, setCssProgress] = useState(0);
  const [jsProgress, setJsProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const focusIframe = (e) => {
    if (iframeRef.current) {
      iframeRef.current.focus();
      setIsFocused(true);
    }
    e?.stopPropagation();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFocused) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  const openInNewWindow = (e) => {
    e.stopPropagation();
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }

    try {
      const width = window.screen.width;
      const height = window.screen.height;
      const newWindow = window.open('', 'Preview',
        `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no`
      );

      if (!newWindow) {
        console.error('Failed to open new window - popup might be blocked');
        return;
      }

      newWindow.moveTo(0, 0);
      newWindow.resizeTo(width, height);
      setPopupWindow(newWindow);

      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                min-height: 100vh;
                background-color: #000;
                color: #fff;
                padding: 20px;
                overflow-y: auto;
                overflow-x: hidden;
              }

              canvas {
                display: block;
                margin: auto;
                outline: none;
                image-rendering: pixelated;
              }

              ${cssCode || ''}
            </style>
          </head>
          <body>
            <div id="root">
              ${htmlCode || '<h1 style="text-align: center; margin-top: 20px;">Your website will appear here</h1>'}
            </div>
            <script>
              try {
                ${jsCode || ''}
              } catch (error) {
                console.error('Error executing JavaScript:', error);
              }
            </script>
          </body>
        </html>
      `;

      newWindow.document.write(content);
      newWindow.document.close();
      newWindow.focus();

      window.addEventListener('beforeunload', () => {
        if (newWindow && !newWindow.closed) {
          newWindow.close();
        }
      });
    } catch (error) {
      console.error('Error opening new window:', error);
    }
  };

  // Effect to update progress based on code generation
  useEffect(() => {
    if (isLoading) {
      // Calculate progress based on code length
      const calculateProgress = () => {
        // Estimate expected lengths (these are rough estimates)
        const expectedHtmlLength = 1500;
        const expectedCssLength = 800;
        const expectedJsLength = 400;

        // Calculate progress percentages
        const htmlPct = Math.min(100, Math.round((htmlCode?.length || 0) / expectedHtmlLength * 100));
        const cssPct = Math.min(100, Math.round((cssCode?.length || 0) / expectedCssLength * 100));
        const jsPct = Math.min(100, Math.round((jsCode?.length || 0) / expectedJsLength * 100));

        setHtmlProgress(htmlPct);
        setCssProgress(cssPct);
        setJsProgress(jsPct);

        // Overall progress is weighted average
        const overall = Math.round((htmlPct * 0.5) + (cssPct * 0.3) + (jsPct * 0.2));
        setOverallProgress(overall);
      };

      calculateProgress();

      // Simulate progress even when no updates are coming
      const interval = setInterval(() => {
        setHtmlProgress(prev => Math.min(prev + 1, 100));
        setCssProgress(prev => Math.min(prev + (Math.random() > 0.5 ? 1 : 0), 100));
        setJsProgress(prev => Math.min(prev + (Math.random() > 0.7 ? 1 : 0), 100));
      }, 300);

      return () => clearInterval(interval);
    } else {
      // Reset progress when loading is complete
      if (htmlCode || cssCode || jsCode) {
        setHtmlProgress(100);
        setCssProgress(100);
        setJsProgress(100);
        setOverallProgress(100);
      }
    }
  }, [isLoading, htmlCode, cssCode, jsCode]);

  useEffect(() => {
    const updateIframeContent = () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const doc = iframe.contentDocument;
        if (!doc) return;

        // Add chunk animation CSS
        const chunkAnimationCSS = `
          .chunk-animation {
            opacity: 0;
            transform: translateY(10px);
            animation: fadeInChunk 0.5s ease-out forwards;
          }
          @keyframes fadeInChunk {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .highlight-new {
            animation: highlightNew 2s ease-out;
          }
          @keyframes highlightNew {
            0% { background-color: rgba(100, 149, 237, 0.2); }
            100% { background-color: transparent; }
          }
        `;

        // Process HTML to add chunk animations
        let processedHtml = htmlCode || '<h1 style="text-align: center; margin-top: 20px;">Your website will appear here</h1>';

        // If we're loading and have some HTML, add animation classes
        if (isLoading && htmlCode) {
          // Split HTML into chunks (elements) and add animation classes
          const htmlLines = processedHtml.split('\n');
          let inElement = false;
          let elementCount = 0;

          for (let i = 0; i < htmlLines.length; i++) {
            const line = htmlLines[i].trim();

            // Check for element start
            if (line.startsWith('<') && !line.startsWith('</') && !line.includes('/>')) {
              inElement = true;
              elementCount++;

              // Add animation class to main elements (not to small inline elements)
              if (line.includes('<div') || line.includes('<section') ||
                  line.includes('<article') || line.includes('<header') ||
                  line.includes('<footer') || line.includes('<main') ||
                  line.includes('<aside') || line.includes('<nav')) {

                // Insert class attribute or add to existing class
                if (line.includes('class="')) {
                  htmlLines[i] = htmlLines[i].replace('class="', 'class="chunk-animation ');
                } else if (line.includes('<')) {
                  const tagEnd = line.indexOf('>');
                  if (tagEnd !== -1) {
                    htmlLines[i] = line.substring(0, tagEnd) + ' class="chunk-animation"' + line.substring(tagEnd);
                  }
                }
              }
            }

            // Check for element end
            if (inElement && line.includes('</')) {
              inElement = false;
            }
          }

          processedHtml = htmlLines.join('\n');
        }

        const content = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }

                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  min-height: 100vh;
                  background-color: #000;
                  color: #fff;
                  padding: 20px;
                  overflow-y: auto;
                  overflow-x: hidden;
                }

                canvas {
                  display: block;
                  margin: auto;
                  outline: none;
                  image-rendering: pixelated;
                }

                /* Animation styles */
                ${chunkAnimationCSS}

                /* Apply custom CSS */
                ${cssCode || ''}
              </style>
            </head>
            <body>
              <div id="root">
                ${processedHtml}
              </div>
              <script>
                try {
                  ${jsCode || ''}

                  // Add animation to dynamically added elements
                  document.addEventListener('DOMContentLoaded', function() {
                    const observer = new MutationObserver(function(mutations) {
                      mutations.forEach(function(mutation) {
                        if (mutation.addedNodes.length) {
                          mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                              node.classList.add('highlight-new');
                            }
                          });
                        }
                      });
                    });

                    observer.observe(document.body, { childList: true, subtree: true });
                  });
                } catch (error) {
                  console.error('Error executing JavaScript:', error);
                }
              </script>
            </body>
          </html>
        `;

        doc.open();
        doc.write(content);
        doc.close();

        iframe.focus();
        setIsFocused(true);

        setTimeout(() => {
          iframe.focus();
          setIsFocused(true);
        }, 100);
      } catch (error) {
        console.error('Error updating iframe content:', error);
      }
    };

    updateIframeContent();

    return () => {
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentDocument) {
          iframe.contentDocument.open();
          iframe.contentDocument.write('');
          iframe.contentDocument.close();
        }
        setIsFocused(false);
      } catch (error) {
        console.error('Error cleaning up iframe:', error);
      }
    };
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    iframe.addEventListener('focus', handleFocus);
    iframe.addEventListener('blur', handleBlur);

    return () => {
      iframe.removeEventListener('focus', handleFocus);
      iframe.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div
      className="streaming-live-preview"
      style={{
        height: 'calc(100% - 40px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onClick={focusIframe}
    >
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

      {/* Loading animation overlay */}
      {isLoading && (
        <LoadingAnimation
          progress={overallProgress}
          htmlProgress={htmlProgress}
          cssProgress={cssProgress}
          jsProgress={jsProgress}
        />
      )}

      <iframe
        ref={iframeRef}
        title="Streaming Live Preview"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          border: `1px solid ${isFocused ? 'var(--accent-color)' : 'var(--text-color)'}`,
          borderRadius: '4px',
          marginBottom: '0',
          outline: 'none'
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
        tabIndex="0"
        onMouseEnter={focusIframe}
      />
    </div>
  );
};

export default StreamingLivePreview;