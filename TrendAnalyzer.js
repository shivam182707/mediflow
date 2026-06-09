import React, { useState, useMemo } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TrendAnalyzer = () => {
    const [files, setFiles] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [trendData, setTrendData] = useState(null);
    const [error, setError] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState(null);

    const UPLOAD_ENDPOINT = "http://localhost:8000/analyze_trends";

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) setFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        if (e.target.files) setFiles(Array.from(e.target.files));
    };

    const analyzeTrends = async () => {
        if (files.length === 0) return;
        setAnalyzing(true);
        setError(null);
        setTrendData(null);

        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        });

        try {
            const response = await axios.post(UPLOAD_ENDPOINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const results = response.data;
            if (results.error) throw new Error(results.error);

            // Process data for charts
            // 1. Collect all unique metrics
            const metricsMap = {}; // { "Hemoglobin": [{date: "2024-01", value: 13}, ...] }

            results.forEach(report => {
                if (report.date && report.metrics) {
                    report.metrics.forEach(m => {
                        if (!metricsMap[m.name]) metricsMap[m.name] = [];
                        metricsMap[m.name].push({
                            date: report.date,
                            value: m.value,
                            unit: m.unit,
                            filename: report.filename
                        });
                    });
                }
            });

            // Filter out metrics with only 1 data point (no trend)
            const validMetrics = Object.keys(metricsMap).filter(k => metricsMap[k].length > 1);

            if (validMetrics.length === 0 && results.length > 0) {
                // Fallback: Show even single points if that's all we have
                setTrendData(metricsMap);
                setSelectedMetric(Object.keys(metricsMap)[0]);
            } else {
                setTrendData(metricsMap);
                setSelectedMetric(validMetrics[0] || Object.keys(metricsMap)[0]);
            }

        } catch (err) {
            console.error(err);
            let msg = "Failed to analyze trends.";
            if (err.response) {
                // Server responded with a status code outside 2xx
                msg = `Server Error (${err.response.status}): ${err.response.data?.detail || err.response.statusText}`;
            } else if (err.request) {
                // Request made but no response
                msg = "Network Error: Could not reach the server. Is it running?";
            } else {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setAnalyzing(false);
        }
    };

    const chartData = useMemo(() => {
        if (!trendData || !selectedMetric) return [];
        // Sort by date (create copy first to avoid mutating state)
        return [...trendData[selectedMetric]].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [trendData, selectedMetric]);

    return (
        <main className="analyzer-container glass-panel">
            <div className="layout-grid">
                {/* Left Column: Upload */}
                <div className="upload-section">
                    <h2>Longitudinal Trend Analysis</h2>
                    <p className="subtitle">Upload multiple past reports to visualize your health trends over time.</p>

                    <div
                        className={`drop-zone ${files.length > 0 ? 'has-file' : ''}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('trend-input').click()}
                    >
                        <input
                            id="trend-input"
                            type="file"
                            hidden
                            multiple
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileSelect}
                        />

                        {files.length > 0 ? (
                            <div className="file-preview">
                                <FileText size={48} className="file-icon" />
                                <p className="file-name">{files.length} Files Selected</p>
                                <div className="file-list">
                                    {files.map((f, i) => <span key={i} className="badge">{f.name}</span>)}
                                </div>
                                <button
                                    className="analyze-btn"
                                    onClick={(e) => { e.stopPropagation(); analyzeTrends(); }}
                                    disabled={analyzing}
                                >
                                    {analyzing ? 'Analyzing Trends...' : 'Generate Graphs'}
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <UploadCloud size={64} className="upload-icon" />
                                <p>Drag & Drop Multiple Reports Here</p>
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

                {/* Right Column: Graphs */}
                <div className="results-section">
                    {trendData ? (
                        <div className="results-content">
                            <div className="result-header">
                                <TrendingUp size={24} color="#8b5cf6" />
                                <h3>Health Trends</h3>
                            </div>

                            {/* Metric Selector */}
                            <div className="metric-selector">
                                <label>Select Biomarker:</label>
                                <select
                                    value={selectedMetric}
                                    onChange={(e) => setSelectedMetric(e.target.value)}
                                    className="metric-dropdown"
                                >
                                    {Object.keys(trendData).map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Graph */}
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            activeDot={{ r: 8 }}
                                            name={`${selectedMetric} (${chartData[0]?.unit || ''})`}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Insight Card */}
                            <div className="insight-row">
                                <div className="stat-card">
                                    <h4>First Recorded</h4>
                                    <p>{chartData[0]?.value ?? '-'} {chartData[0]?.unit ?? ''}</p>
                                    <span>{chartData[0]?.date ?? '-'}</span>
                                </div>
                                <div className="stat-card">
                                    <h4>Latest</h4>
                                    <p>{chartData[chartData.length - 1]?.value ?? '-'} {chartData[chartData.length - 1]?.unit ?? ''}</p>
                                    <span>{chartData[chartData.length - 1]?.date ?? '-'}</span>
                                </div>
                                <div className="stat-card highlight">
                                    <h4>Trend</h4>
                                    <p>
                                        {(chartData.length > 1)
                                            ? (chartData[chartData.length - 1]?.value < chartData[0]?.value ? '⬇️ Decreasing' : '⬆️ Increasing')
                                            : 'Not enough data'}
                                    </p>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="empty-results">
                            <div className="illustration">
                                <TrendingUp size={80} color="#cbd5e1" />
                            </div>
                            <h3>Visualize Your Health</h3>
                            <p>Select multiple dates of reports to see how your vitals change over time.</p>
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

        h2 { color: var(--text-main); margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); margin-bottom: 2rem; font-size: 0.9rem; }

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
          max-height: 400px;
        }

        .drop-zone:hover, .drop-zone.has-file { background: white; border-color: #8b5cf6; }

        .file-preview { text-align: center; width: 100%; padding: 2rem; }
        .file-icon { color: #8b5cf6; margin-bottom: 1rem; }
        
        .file-list { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 0.5rem; 
            justify-content: center; 
            margin: 1rem 0 2rem 0; 
        }
        .badge { 
            background: #f3f4f6; 
            padding: 4px 8px; 
            border-radius: 6px; 
            font-size: 0.8rem; 
            color: #4b5563; 
        }

        .analyze-btn {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          width: 80%;
        }
        .analyze-btn:hover { background: #7c3aed; }
        .analyze-btn:disabled { background: #94a3b8; cursor: not-allowed; }

        .results-section { display: flex; flex-direction: column; overflow-y: auto; }
        
        .empty-results {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100%; color: var(--text-muted); text-align: center;
        }

        .result-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem; }

        .metric-selector { margin-bottom: 1.5rem; }
        .metric-dropdown {
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            font-size: 1rem;
            margin-left: 1rem;
            outline: none;
        }

        .chart-container {
            background: white;
            padding: 1.5rem;
            border-radius: 16px;
            border: 1px solid #f1f5f9;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
        }

        .insight-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
        }

        .stat-card {
            background: white;
            padding: 1rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #f1f5f9;
        }
        
        .stat-card h4 { font-size: 0.8rem; color: #64748b; margin-bottom: 0.2rem; }
        .stat-card p { font-size: 1.2rem; font-weight: 600; color: #1e293b; }
        .stat-card span { font-size: 0.75rem; color: #94a3b8; }
        .stat-card.highlight { background: #f5f3ff; border-color: #ddd6fe; }
        .stat-card.highlight p { color: #8b5cf6; }

        .error-banner {
          margin-top: 1rem; padding: 1rem; background: #fee2e2; color: #ef4444;
          border-radius: 12px; display: flex; align-items: center; gap: 0.5rem;
        }
      `}</style>
        </main>
    );
};

export default TrendAnalyzer;
