import { Button } from "@/components/ui/button"
import { 
  Download, 
  ArrowLeft, 
  Moon, 
  Sun, 
  FileSpreadsheet, 
  BarChart, 
  FileText, 
  Trophy 
} from "lucide-react"
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../store/themeSlice'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ExcelPreview from '@/components/ExcelPreview'

export default function AnalysisResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const generatedFiles = useSelector((state) => state.files.generatedFiles)
  const dispatch = useDispatch()
  const { mode } = useSelector((state) => state.theme)
  const [previewFile, setPreviewFile] = useState(null)

  // File categories with icons and descriptions
  const fileCategories = {
    'Analysis Report': {
      icon: FileText,
      description: 'Complete analysis with detailed statistics',
      color: 'text-blue-500'
    },
    'Subject Averages': {
      icon: BarChart,
      description: 'Subject-wise performance breakdown',
      color: 'text-green-500'
    },
    'Top Performers': {
      icon: Trophy,
      description: 'List of high-performing students',
      color: 'text-yellow-500'
    },
    'Total Marks': {
      icon: FileSpreadsheet,
      description: 'Comprehensive marks sheet',
      color: 'text-purple-500'
    }
  }

  // Function to get original file name from URL
  const getOriginalFileName = (url) => {
    const fileName = decodeURIComponent(url.split('/').pop())
    return fileName.replace(/\.[^/.]+$/, '') // Remove file extension
  }

  // Function to get file category based on URL
  const getFileCategory = (url) => {
    const path = url.toLowerCase()
    if (path.includes('analysis_report')) return 'Analysis Report'
    if (path.includes('averages')) return 'Subject Averages'
    if (path.includes('top_five')) return 'Top Performers'
    if (path.includes('total_marks')) return 'Total Marks'
    return 'Other'
  }

  // Group files by category
  const groupedFiles = generatedFiles.reduce((acc, url) => {
    const category = getFileCategory(url)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(url)
    return acc
  }, {})

  const handleDownload = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const filename = fileUrl.split('/').pop()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('File downloaded successfully')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download file')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container max-w-6xl py-4 px-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Analysis Results</h2>
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

      <div className="container max-w-6xl py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Generated Files Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold">Generated Reports</h2>
          
          {Object.entries(groupedFiles).map(([category, files]) => {
            const CategoryIcon = fileCategories[category]?.icon || FileSpreadsheet
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CategoryIcon className={`h-6 w-6 ${fileCategories[category]?.color}`} />
                  <h3 className="text-xl font-medium">{category}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {fileCategories[category]?.description}
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {files.map((fileUrl, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start space-x-3 mb-4">
                        <div className={`p-2 rounded-lg bg-accent/10 ${fileCategories[category]?.color}`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium break-words">
                            {getOriginalFileName(fileUrl)}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Excel Spreadsheet
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Button 
                          onClick={() => setPreviewFile({ 
                            url: fileUrl, 
                            name: getOriginalFileName(fileUrl)
                          })}
                          className="flex-1"
                          variant="secondary"
                        >
                          Preview
                        </Button>
                        <Button 
                          onClick={() => handleDownload(fileUrl)}
                          className="flex-1"
                          variant="outline"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Preview Dialog */}
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-[900px] w-[90vw]">
            <DialogHeader>
              <DialogTitle>
                {previewFile?.name}
              </DialogTitle>
            </DialogHeader>
            {previewFile && (
              <ExcelPreview fileUrl={previewFile.url} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 