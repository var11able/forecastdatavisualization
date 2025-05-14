import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Plot from 'react-plotly.js';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

function App() {
  const [cells, setCells] = useState([]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/var11able/forecastdatavisualization/main/forecast.ipynb')
      .then((res) => res.json())
      .then((data) => {
        setCells(data.cells);
      })
      .catch((err) => {
        console.error('Error loading notebook:', err);
      });
  }, []);

  const renderOutput = (output, idx) => {
    if (output.output_type === 'stream') {
      const text = output.text.join('');
      const style = {
        backgroundColor: output.name === 'stderr' ? '#ffe6e6' : '#f0f0f0',
        color: output.name === 'stderr' ? '#a00' : '#000',
        padding: '1rem',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
      };
      return (
        <pre key={idx} style={style}>
          {text}
        </pre>
      );
    }

    if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
      const data = output.data;

      if (data['application/vnd.plotly.v1+json']) {
        const plotData = data['application/vnd.plotly.v1+json'];
        return (
          <Plot
            key={idx}
            data={plotData.data}
            layout={plotData.layout}
            style={{ width: '100%', height: '100%' }}
          />
        );
      }

      if (data['image/png']) {
        const imageSrc = `data:image/png;base64,${data['image/png']}`;
        return (
          <div key={idx} style={{ marginTop: '1rem' }}>
            <img src={imageSrc} alt="Output" style={{ maxWidth: '100%' }} />
          </div>
        );
      }

      if (data['text/plain']) {
        return (
          <pre key={idx} style={{ backgroundColor: '#f0f0f0', padding: '1rem' }}>
            {data['text/plain']}
          </pre>
        );
      }
    }

    if (output.output_type === 'error') {
      const traceback = output.traceback.join('\n');
      return (
        <pre key={idx} style={{ backgroundColor: '#ffe6e6', color: '#a00', padding: '1rem' }}>
          {traceback}
        </pre>
      );
    }

    return null;
  };

  return (
    <div className="App" style={{ padding: '1rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>📘 Notebook Viewer</h1>
      {cells.map((cell, index) => {
        if (cell.cell_type === 'markdown') {
          return (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <ReactMarkdown>{cell.source.join('')}</ReactMarkdown>
            </div>
          );
        }

        if (cell.cell_type === 'code') {
          return (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <SyntaxHighlighter language="python" style={atomDark}>
                {cell.source.join('')}
              </SyntaxHighlighter>
              {cell.outputs && cell.outputs.map((output, idx) => renderOutput(output, idx))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default App;
