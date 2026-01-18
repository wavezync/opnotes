/* eslint-disable @typescript-eslint/no-explicit-any */
import './styles/reset.css'
import './styles/screen.css'
import './styles/print.css'
import React, { useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import handlebars from 'handlebars'
import surgeryOpNoteTemplate from '../../../resources/templates/surgery-opnote.hbs?raw'
import followupTemplate from '../../../resources/templates/followup.hbs?raw'

const templates: Record<string, HandlebarsTemplateDelegate> = {
  surgery: handlebars.compile(surgeryOpNoteTemplate),
  followup: handlebars.compile(followupTemplate)
}

const Print = () => {
  const [printData, setPrintData] = React.useState<object | null>(null)
  useEffect(() => {
    const handlePrintData = (data) => {
      setPrintData(data)
    }

    window.electronApi.onPrintData(handlePrintData)
  }, [])

  const printHtml = useMemo(() => {
    if (!printData) {
      return ''
    }
    const data = (printData as any).data
    const templateName = data.template || 'surgery'
    const template = templates[templateName] || templates.surgery
    return template(data)
  }, [printData])

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    const keyboardListener = (e: KeyboardEvent) => {
      if (e.key === 'p' && e.ctrlKey) {
        handlePrint()
      }
    }

    window.addEventListener('keydown', keyboardListener)

    return () => {
      window.removeEventListener('keydown', keyboardListener)
    }
  }, [])

  return (
    <div className="w-full">
      <div className="flex justify-end print-hidden p-1" id="print-area">
        <button className="print-btn" onClick={handlePrint}>
          Print
        </button>
      </div>
      {printData && <div dangerouslySetInnerHTML={{ __html: printHtml }}></div>}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Print />
  </React.StrictMode>
)
