import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ReportAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    const UPLOAD_ENDPOINT = "http://localhost:8000/analyze_report";

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const analyzeReport = async () => {
        if (!file) return;
        setAnalyzing(true);
        setError(null);
        setReportData(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(UPLOAD_ENDPOINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReportData(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze report. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <main className="analyzer-container glass-panel">
            <div className="layout-grid">
                {/* Left Column: Upload */}
                <div className="upload-section">
                    <h2>Upload Medical Report</h2>
                    <p className="subtitle">Supported formats: PDF, PNG, JPG, JPEG</p>

                    <div
                        className={`drop-zone ${file ? 'has-file' : ''}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('report-input').click()}
                    >
                        <input
                            id="report-input"
                            type="file"
                            hidden
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileSelect}
                        />

                        {file ? (
                            <div className="file-preview">
                                <FileText size={48} className="file-icon" />
                                <p className="file-name">{file.name}</p>
                                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    className="analyze-btn"
                                    onClick={(e) => { e.stopPropagation(); analyzeReport(); }}
                                    disabled={analyzing}
                                >
                                    {analyzing ? 'Analyzing...' : 'Analyze Document'}
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <UploadCloud size={64} className="upload-icon" />
                                <p>Drag & Drop or Click to Browse</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="error-banner">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className="results-section">
                    {reportData ? (
                        <div className="results-content">
                            <div className="result-header">
                                <CheckCircle size={24} color="#10b981" />
                                <h3>Analysis Complete</h3>
                            </div>

                            <div className="insight-card">
                                <div className="card-header">
                                    <Activity size={20} />
                                    <span>Medical Insights</span>
                                </div>
                                <div className="markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {reportData}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-results">
                            <div className="illustration">
                                <FileText size={80} color="#cbd5e1" />
                            </div>
                            <h3>No Analysis Yet</h3>
                            <p>Upload a document to see AI-generated insights here.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .analyzer-container {
          flex: 1;
          height: 96vh;
          margin: 2vh 2vh 2vh 0;
          border-radius: 24px;
          overflow: hidden;
          padding: 2rem;
        }

        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          height: 100%;
        }

        .upload-section {
          padding-right: 2rem;
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
        }

        h2 {
           color: var(--text-main);
           margin-bottom: 0.5rem;
        }

        .subtitle {
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .drop-zone {
          flex: 1;
          background: rgba(255, 255, 255, 0.5);
          border: 2px dashed #cbd5e1;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          max-height: 500px;
        }

        .drop-zone:hover, .drop-zone.has-file {
          background: white;
          border-color: var(--primary);
        }

        .upload-placeholder {
          text-align: center;
          color: var(--text-muted);
        }

        .upload-icon {
          margin-bottom: 1rem;
          color: var(--primary-light);
        }

        .file-preview {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 2rem;
        }

        .file-icon {
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .file-name {
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.2rem;
        }

        .file-size {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin-bottom: 2rem;
        }

        .analyze-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.1s;
          width: 80%;
        }

        .analyze-btn:hover {
          background: var(--primary-dark);
        }

        .analyze-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .error-banner {
          margin-top: 1rem;
          padding: 1rem;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .results-section {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          text-align: center;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }

        .insight-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--glass-border);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-weight: 600;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .markdown-body {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-main);
        }

        .markdown-body :global(h1), .markdown-body :global(h2), .markdown-body :global(h3) {
           margin-top: 1rem;
           margin-bottom: 0.5rem;
           color: var(--primary-dark);
        }

        .markdown-body :global(ul) {
           padding-left: 1.2rem;
           margin-bottom: 1rem;
        }

        .markdown-body :global(li) {
           margin-bottom: 0.3rem;
        }
      `}</style>
        </main>
    );
};

export default ReportAnalyzer;
