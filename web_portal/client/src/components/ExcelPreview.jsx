import { useState, useEffect } from 'react'
import { HotTable } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/dist/handsontable.full.min.css'
import * as XLSX from 'xlsx'

registerAllModules()

export default function ExcelPreview({ fileUrl }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cellStyles, setCellStyles] = useState([])
  const [mergedCells, setMergedCells] = useState([])

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const response = await fetch(fileUrl)
        const blob = await response.blob()
        const reader = new FileReader()

        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array', cellStyles: true, cellHTML: true })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          
          // Get the range of cells in the sheet
          const range = XLSX.utils.decode_range(firstSheet['!ref'])
          
          // Extract merged cells
          const merges = firstSheet['!merges'] || []
          setMergedCells(merges.map(merge => ({
            row: merge.s.r,
            col: merge.s.c,
            rowspan: merge.e.r - merge.s.r + 1,
            colspan: merge.e.c - merge.s.c + 1
          })))

          // Extract cell styles and formatting
          const styles = []
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const rowStyles = []
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cell = firstSheet[XLSX.utils.encode_cell({ r: R, c: C })]
              const style = {
                backgroundColor: cell?.s?.fill?.fgColor?.rgb || null,
                color: cell?.s?.font?.color?.rgb || null,
                fontWeight: cell?.s?.font?.bold ? 'bold' : 'normal',
                fontStyle: cell?.s?.font?.italic ? 'italic' : 'normal',
                textDecoration: cell?.s?.font?.underline ? 'underline' : 'none',
                border: {
                  top: cell?.s?.border?.top?.style ? '1px solid' : 'none',
                  right: cell?.s?.border?.right?.style ? '1px solid' : 'none',
                  bottom: cell?.s?.border?.bottom?.style ? '1px solid' : 'none',
                  left: cell?.s?.border?.left?.style ? '1px solid' : 'none',
                }
              }
              rowStyles.push(style)
            }
            styles.push(rowStyles)
          }
          setCellStyles(styles)

          // Convert to JSON with formatting
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
            header: 1,
            raw: false,
            defval: '',
          })

          setData(jsonData)
          setLoading(false)
        }

        reader.readAsArrayBuffer(blob)
      } catch (err) {
        console.error('Excel preview error:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchExcelData()
  }, [fileUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading preview: {error}
      </div>
    )
  }

  return (
    <div className="h-[600px] overflow-auto">
      <HotTable
        data={data}
        readOnly={true}
        rowHeaders={true}
        colHeaders={true}
        height="100%"
        width="100%"
        licenseKey="non-commercial-and-evaluation"
        mergeCells={mergedCells}
        cell={cellStyles.flat().map((style, index) => ({
          row: Math.floor(index / data[0]?.length || 1),
          col: index % (data[0]?.length || 1),
          className: `custom-cell-${index}`,
          readOnly: true
        }))}
        beforeRenderer={(TD, row, col) => {
          const style = cellStyles[row]?.[col]
          if (style) {
            Object.assign(TD.style, {
              backgroundColor: style.backgroundColor ? '#' + style.backgroundColor : null,
              color: style.color ? '#' + style.color : null,
              fontWeight: style.fontWeight,
              fontStyle: style.fontStyle,
              textDecoration: style.textDecoration,
              borderTop: style.border.top,
              borderRight: style.border.right,
              borderBottom: style.border.bottom,
              borderLeft: style.border.left
            })
          }
        }}
        settings={{
          stretchH: 'all',
          autoWrapRow: true,
          manualRowResize: true,
          manualColumnResize: true,
          wordWrap: true,
          className: 'htMiddle',
          renderer: 'html', // Enable HTML rendering for images
          trimWhitespace: false,
          allowInvalid: false,
        }}
      />
    </div>
  )
}