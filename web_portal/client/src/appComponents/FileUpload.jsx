import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Upload, X, Loader2 } from "lucide-react"
import { toast } from 'sonner'
import axios from 'axios'

export default function FileUpload() {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [filePath, setFilePath] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile)
        setFilePath(null) // Reset file path when new file is selected
      } else {
        toast.error('Please upload only Excel files')
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      console.log("response => ", response)

      console.log("response => ", response.data.filePath)
      setFilePath(response.data.filePath)
      toast.success('File uploaded successfully')
    } catch (error) {
      toast.error(`Upload failed: ${error.response?.data?.error || error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!filePath) {
      toast.error('Please upload the file first')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await axios.post('http://localhost:5000/analyze', {
        file_path: filePath
      })

      toast.success('Analysis completed successfully!')
      console.log('Analysis results:', response.data)
      
    } catch (error) {
      toast.error(`Analysis failed: ${error.response?.data?.error || error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePath(null)
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center space-y-6">
        <h2 className="text-2xl font-bold text-center">Upload Excel File for Analysis</h2>
        
        <div 
          {...getRootProps()} 
          className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the Excel file here</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg">Drag & drop an Excel file here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports .xlsx and .xls files</p>
              </div>
            )}
          </div>
        </div>

        {file && (
          <div className="flex items-center justify-between w-full p-4 border rounded-lg bg-secondary/50">
            <div className="flex items-center space-x-4">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <span className="font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="flex gap-4 w-full max-w-xs">
          <Button 
            className="flex-1" 
            onClick={handleUpload} 
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>

          <Button 
            className="flex-1" 
            onClick={handleAnalyze} 
            disabled={!filePath || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {filePath && (
          <div className="w-full p-4 border rounded-lg bg-secondary/20">
            <p className="text-sm text-muted-foreground break-all">
              File path: {filePath}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 