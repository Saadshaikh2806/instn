import React, { useState, useCallback } from 'react';
import UserInput from './UserInput';
import ModifyWebsiteInput from './ModifyWebsiteInput';
import StreamingLivePreview from './StreamingLivePreview';
import { generateWebsite, modifyWebsite } from '../services/geminiService';
import '../styles/LiveRenderer.css';

const LiveRenderer = () => {
  const [userInput, setUserInput] = useState('');
  const [modifyInput, setModifyInput] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateWebsite = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Please enter a website description');
      return;
    }
    setIsLoading(true);
    setError(null);
    setHtmlCode('');
    setCssCode('');

    try {
      await generateWebsite(userInput, ({ html, css }) => {
        if (html) setHtmlCode(prevHtml => prevHtml + html);
        if (css) setCssCode(prevCss => prevCss + css);
      });
    } catch (err) {
      setError('Failed to generate website: ' + err.message);
      console.error('Error generating website:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userInput]);

  const handleModifyWebsite = useCallback(async () => {
    if (!modifyInput.trim()) {
      setError('Please enter a modification description');
      return;
    }
    if (!htmlCode || !cssCode) {
      setError('Please generate a website first');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await modifyWebsite(modifyInput, htmlCode, cssCode, ({ html, css }) => {
        if (html) setHtmlCode(html);
        if (css) setCssCode(css);
      });
    } catch (err) {
      setError('Failed to modify website: ' + err.message);
      console.error('Error modifying website:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modifyInput, htmlCode, cssCode]);

  return (
    <div className="live-renderer">
      <div className="input-container">
        <h2>WEBSITE DESCRIPTION</h2>
        <div className="user-input-wrapper">
          <UserInput 
            value={userInput} 
            onChange={setUserInput} 
            isLoading={isLoading}
          />
          <button 
            onClick={handleGenerateWebsite} 
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Website'}
          </button>
        </div>
        
        <h2>MODIFY WEBSITE</h2>
        <div className="modify-input-wrapper">
          <ModifyWebsiteInput 
            value={modifyInput} 
            onChange={setModifyInput} 
            isLoading={isLoading}
          />
          <button 
            onClick={handleModifyWebsite} 
            disabled={isLoading || !htmlCode}
          >
            {isLoading ? 'Modifying...' : 'Modify Website'}
          </button>
        </div>
        
        {error && <p className="error">{error}</p>}
      </div>
      <div className="preview-container">
        <h2>LIVE PREVIEW</h2>
        <StreamingLivePreview htmlCode={htmlCode} cssCode={cssCode} />
      </div>
    </div>
  );
};

export default LiveRenderer;