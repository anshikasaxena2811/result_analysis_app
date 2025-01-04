import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Upload, X, Loader2, Moon, Sun } from "lucide-react"
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setGeneratedFiles } from '../store/filesSlice'
import { toggleTheme } from '../store/themeSlice'

export default function FileUpload() {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [filePath, setFilePath] = useState(null)
  const [reportDetails, setReportDetails] = useState({
    collegeName: 'COLLEGE OF COMPUTING SCIENCES & INFORMATION TECHNOLOGY',
    program: 'BACHELOR OF COMPUTER APPLICATIONS',
    batch: '',
    semester: '',
    session: '',
    date: ''
  });
  const navigate = useNavigate()

  const dispatch = useDispatch()
  const generatedFiles = useSelector((state) => state.files.generatedFiles)
  const { mode } = useSelector((state) => state.theme)

  console.log("generatedFiles => ", generatedFiles);
  

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setFile(selectedFile)
        setFilePath(null) // Reset file path when new file is selected
      } else {
        toast.error('Please upload only .xlsx Excel files')
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
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

  const handleAnalysis = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }
    
    // Validate report details
    if (!Object.values(reportDetails).every(value => value)) {
      toast.error('Please fill in all report details')
      return
    }

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      // First upload the file
      const uploadResponse = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log("Upload Response:", uploadResponse.data)

      if (uploadResponse.data.filePath) {
        const analysisData = {
          file_path: uploadResponse.data.filePath,
          report_details: reportDetails
        }

        console.log("=== Sending Analysis Request ===")
        console.log(analysisData)
        console.log("==============================")

        try {
          // Then send the file path and report details for analysis
          const analysisResponse = await axios.post('http://localhost:5000/analyze', analysisData)
          
          console.log('Analysis response:', analysisResponse.data)
          
          if (analysisResponse.data) {
            toast.success('Analysis completed successfully')
            dispatch(setGeneratedFiles(analysisResponse.data.generated_files || []))
            navigate('/results', { 
              state: { 
                result: analysisResponse.data.result || [],
                generated_files: analysisResponse.data.generated_files || []
              }
            })
          }
        } catch (analysisError) {
          console.error('Analysis Error:', analysisError)
          toast.error(`Analysis failed: ${analysisError.response?.data?.error || analysisError.message}`)
        }
      }
    } catch (uploadError) {
      console.error('Upload Error:', uploadError)
      toast.error(`Upload failed: ${uploadError.response?.data?.error || uploadError.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePath(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container max-w-6xl py-4 px-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">File Upload</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
          >
            {mode === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      <div className="container max-w-2xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-2xl font-bold text-center">Upload Excel File for Analysis</h2>
          
          <div className="w-full space-y-4 border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Report Details</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">College Name</label>
                <input
                  type="text"
                  value={reportDetails.collegeName}
                  onChange={(e) => setReportDetails(prev => ({
                    ...prev,
                    collegeName: e.target.value
                  }))}
                  className="w-full p-2 border rounded-md bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Program</label>
                <input
                  type="text"
                  value={reportDetails.program}
                  onChange={(e) => setReportDetails(prev => ({
                    ...prev,
                    program: e.target.value
                  }))}
                  className="w-full p-2 border rounded-md bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch</label>
                  <input
                    type="text"
                    placeholder="2021-22"
                    value={reportDetails.batch}
                    onChange={(e) => setReportDetails(prev => ({
                      ...prev,
                      batch: e.target.value
                    }))}
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <input
                    type="text"
                    placeholder="THIRD SEMESTER"
                    value={reportDetails.semester}
                    onChange={(e) => setReportDetails(prev => ({
                      ...prev,
                      semester: e.target.value
                    }))}
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session</label>
                  <input
                    type="text"
                    placeholder="2022-23"
                    value={reportDetails.session}
                    onChange={(e) => setReportDetails(prev => ({
                      ...prev,
                      session: e.target.value
                    }))}
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <input
                    type="date"
                    value={reportDetails.date}
                    onChange={(e) => setReportDetails(prev => ({
                      ...prev,
                      date: e.target.value
                    }))}
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

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
                  <p className="text-sm text-muted-foreground">Supports .xlsx files only</p>
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
              onClick={handleAnalysis} 
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
    </div>
  )
} 