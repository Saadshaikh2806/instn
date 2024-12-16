const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export async function generateWebsite(description, onUpdate) {
  try {
    console.log('Sending request to:', `${BACKEND_URL}/api/generate-website`);
    const response = await fetch(`${BACKEND_URL}/api/generate-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    onUpdate(data);
  } catch (error) {
    console.error('Error calling backend API:', error);
    throw new Error('Failed to generate website: ' + error.message);
  }
}

export async function modifyWebsite(modificationDescription, currentHtml, currentCss, onUpdate) {
  try {
    console.log('Sending request to:', `${BACKEND_URL}/api/modify-website`);
    const response = await fetch(`${BACKEND_URL}/api/modify-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modificationDescription, currentHtml, currentCss }),
    });

    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    onUpdate(data);
  } catch (error) {
    console.error('Error calling backend API:', error);
    throw new Error('Failed to modify website: ' + error.message);
  }
}