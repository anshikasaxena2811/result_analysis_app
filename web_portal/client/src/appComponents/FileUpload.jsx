import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Upload, X, Loader2, Moon, Sun } from "lucide-react"
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setGeneratedFiles } from '../store/filesSlice'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'

export default function FileUpload() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [reportDetails, setReportDetails] = useState({
    collegeName: 'COLLEGE OF COMPUTING SCIENCES & INFORMATION TECHNOLOGY',
    program: 'BACHELOR OF COMPUTER APPLICATIONS',
    batch: '',
    semester: '',
    session: '',
    date: ''
  })

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  })

  const removeFile = () => {
    setFile(null)
  }

  const handleProcessFile = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    // Validate report details
    if (!Object.values(reportDetails).every(value => value)) {
      toast.error('Please fill in all report details')
      return
    }

    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      // First upload the file
      const uploadResponse = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      if (uploadResponse.data.filePath) {
        // Then analyze the file
        const analysisResponse = await axios.post('http://localhost:5000/analyze', {
          file_path: uploadResponse.data.filePath,
          report_details: reportDetails
        })

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
      }
    } catch (error) {
      console.error('Process failed:', error)
      toast.error(error.response?.data?.error || 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload Result File</CardTitle>
          <CardDescription>
            Upload your Excel file containing student results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Report Details Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Report Details</h3>
              <div className="space-y-4">
                {/* College Name and Program (Editable) */}
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
                      placeholder="Third Semester"
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

            {/* File Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                hover:border-primary hover:bg-primary/5`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : (
                  <>
                    <p className="font-medium">Drag & drop file here or click to select</p>
                    <p className="text-sm text-muted-foreground">Supports Excel files (.xlsx, .xls)</p>
                  </>
                )}
              </div>
            </div>

            {/* Selected File Display */}
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

            {/* Process Button */}
            <Button 
              className="w-full"
              onClick={handleProcessFile} 
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          {/* Keep all your existing footer content */}
          {/* Remove only the ThemeToggle component if it exists */}
        </CardFooter>
      </Card>
    </div>
  )
} 