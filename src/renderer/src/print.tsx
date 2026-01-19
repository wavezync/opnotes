import './styles/reset.css'
import './styles/screen.css'
import './styles/print.css'
import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { renderTemplate } from './lib/template-renderer'
import { PrintDialogArgs } from '../../preload/interfaces'

const Print = () => {
  const [printData, setPrintData] = useState<PrintDialogArgs | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    const handlePrintData = (data: PrintDialogArgs) => {
      setPrintData(data)
    }

    window.electronApi.onPrintData(handlePrintData)
  }, [])

  const printHtml = useMemo(() => {
    if (!printData) {
      return ''
    }

    // Use new template renderer
    if (printData.templateStructure && printData.templateContext) {
      return renderTemplate(printData.templateStructure, printData.templateContext)
    }

    return '<div class="document"><p style="color: #999; text-align: center; padding: 40px;">No template data available</p></div>'
  }, [printData])

  const handlePrint = () => {
    setIsPrinting(true)
    // Small delay to ensure state updates before print dialog
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  useEffect(() => {
    const keyboardListener = (e: KeyboardEvent) => {
      if ((e.key === 'p' && (e.ctrlKey || e.metaKey)) || e.key === 'Enter') {
        e.preventDefault()
        handlePrint()
      }
    }

    window.addEventListener('keydown', keyboardListener)

    return () => {
      window.removeEventListener('keydown', keyboardListener)
    }
  }, [])

  return (
    <div className="print-page">
      {/* Print Controls - Hidden when printing */}
      <div className="print-controls print-hidden">
        <div className="print-controls-inner">
          <div className="print-title">
            <svg
              className="print-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>{printData?.title || 'Print Preview'}</span>
          </div>
          <div className="print-actions">
            <span className="print-hint">Press Enter or Ctrl+P to print</span>
            <button
              className="print-btn"
              onClick={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? 'Preparing...' : 'Print'}
            </button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      {printData ? (
        <div
          className="print-content"
          dangerouslySetInnerHTML={{ __html: printHtml }}
        />
      ) : (
        <div className="print-loading print-hidden">
          <div className="print-loading-spinner" />
          <p>Loading print data...</p>
        </div>
      )}

      {/* Inline styles for print dialog UI */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: #f0f0f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .print-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .print-controls {
          position: sticky;
          top: 0;
          z-index: 100;
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          padding: 12px 20px;
        }

        .print-controls-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .print-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 15px;
          font-weight: 500;
        }

        .print-icon {
          width: 20px;
          height: 20px;
          opacity: 0.9;
        }

        .print-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .print-hint {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }

        .print-btn {
          padding: 8px 20px;
          background: white;
          color: #1e3a5f;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .print-btn:hover:not(:disabled) {
          background: #f0f4f8;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .print-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .print-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .print-content {
          flex: 1;
          padding: 24px;
          display: flex;
          justify-content: center;
        }

        .print-content .document {
          background: white;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
          max-width: 800px;
          width: 100%;
          min-height: calc(100vh - 120px);
        }

        .print-loading {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #666;
          gap: 16px;
        }

        .print-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e0e0e0;
          border-top-color: #1e3a5f;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Print-specific overrides */
        @media print {
          body {
            background: white;
          }

          .print-page {
            min-height: auto;
          }

          .print-hidden {
            display: none !important;
          }

          .print-content {
            padding: 0;
          }

          .print-content .document {
            box-shadow: none;
            max-width: none;
            min-height: auto;
          }
        }
      `}</style>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Print />
  </React.StrictMode>
)
