// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  const [numSlides, setNumSlides] = useState(5);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [status, setStatus] = useState('');

  // Replace with your API Gateway endpoint
  const API_ENDPOINT = 'https://xj7q3k99c1.execute-api.us-west-2.amazonaws.com/prod';
  
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const uploadFile = async (file) => {
    // Get a presigned URL for file upload
    const response = await axios.get(`${API_ENDPOINT}/presigned`, {
      params: {
        fileName: file.name,
        contentType: file.type
      }
    });

    // Upload file using the presigned URL
    await axios.put(response.data.presignedUrl, file, {
      headers: { 'Content-Type': file.type }
    });

    return response.data.fileKey;
  };

  // Function to handle file download
  const downloadPresentation = (base64Data, filename) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { 
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
    });
    
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic && files.length === 0) {
      setError('Please provide either a topic or upload documents.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDownloadUrl(null);
      setStatus('Uploading files...');

      // Upload all files and collect their keys
      const fileKeys = [];
      for (const file of files) {
        const fileKey = await uploadFile(file);
        fileKeys.push(fileKey);
      }

      setStatus('Generating presentation...');

      // Call the generate presentation endpoint
      const generateResponse = await axios.post(`${API_ENDPOINT}/generate`, {
        topic,
        numSlides,
        documentKeys: fileKeys
      });

      // Handle the response
      const data = generateResponse.data;
      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      }
      
      // If there's base64 data, you can also handle it here
      if (data.fileData) {
        // You could store this in state if needed
        // Or use it directly with downloadPresentation
        // downloadPresentation(data.fileData, data.filename);
      }

      setStatus('Presentation generated successfully!');
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.message || 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Bedrock Presentation Generator</h1>
      <div className="card shadow">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="topic" className="form-label">Presentation Topic</label>
              <input
                type="text"
                className="form-control"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the topic for your presentation"
              />
              <div className="form-text">Provide a clear topic to generate focused content.</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="numSlides" className="form-label">Number of Slides</label>
              <input
                type="range"
                className="form-range"
                id="numSlides"
                value={numSlides}
                onChange={(e) => setNumSlides(parseInt(e.target.value))}
                min="3"
                max="15"
              />
              <div className="text-center">{numSlides} slides</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="documents" className="form-label">Upload Documents (optional)</label>
              <input
                type="file"
                className="form-control"
                id="documents"
                multiple
                onChange={handleFileChange}
              />
              <div className="form-text">Upload text files for reference material (TXT, DOC, PDF).</div>
            </div>
            
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Presentation'}
            </button>
          </form>
          
          {loading && (
            <div className="mt-4">
              <div className="progress">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="text-center mt-2">{status}</p>
            </div>
          )}
          
          {downloadUrl && (
            <div className="mt-4">
              <div className="alert alert-success">
                <h4 className="alert-heading">Presentation Ready!</h4>
                <p>Your presentation has been generated successfully.</p>
                <a
                  href={downloadUrl}
                  className="btn btn-success w-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Presentation
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
