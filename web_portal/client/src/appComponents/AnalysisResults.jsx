import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, Moon, Sun } from "lucide-react"
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../store/themeSlice'

export default function AnalysisResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const generatedFiles = useSelector((state) => state.files.generatedFiles)
  const { result } = location.state || { result: [] }
  const dispatch = useDispatch()
  const { mode } = useSelector((state) => state.theme)
  
  console.log('Location state:', location.state)
  
  console.log('Result:', result)
  console.log('Generated files:', generatedFiles)

  if (!result.length && !generatedFiles.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl py-8 px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4">No Analysis Results Available</h1>
            <p className="text-muted-foreground">Please try analyzing your file again.</p>
          </div>
        </div>
      </div>
    )
  }

  const getFileCategory = (filePath) => {
    const path = filePath.toLowerCase()
    if (path.includes('total_students_marks')) return 'Total Marks'
    if (path.includes('marks_distribution')) return 'Marks Distribution'
    if (path.includes('top_five')) return 'Top Five Students'
    if (path.includes('subject_toppers')) return 'Subject Toppers'
    if (path.includes('averages')) return 'Average Marks'
    if (path.includes('analysis_report')) return 'Analysis Report'
    return 'Other'
  }

  const handleDownload = async (fileUrl) => {
    try {
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const filename = fileUrl.split('/').pop();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('File downloaded successfully');
    } catch (error) {
        console.error('Download failed:', error);
        toast.error('Failed to download file');
    }
  };

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

        <h1 className="text-3xl font-bold mb-8">Analysis Results</h1>

        {/* Analysis Summary Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Course Averages</h2>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Course Code</th>
                    <th className="p-3 text-left">Internal Average</th>
                    <th className="p-3 text-left">External Average</th>
                    <th className="p-3 text-left">Total Average</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="p-3">{row.Course_Code}</td>
                      <td className="p-3">{row.I_Average.toFixed(2)}</td>
                      <td className="p-3">{row.E_Average.toFixed(2)}</td>
                      <td className="p-3">{row.T_Average.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Generated Files Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Generated Reports</h2>
          <div className="grid gap-4">
            {generatedFiles.map((filePath, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50">
                <div className="space-y-1">
                  <span className="font-medium">{filePath.split('/').pop()}</span>
                  <p className="text-sm text-muted-foreground">{getFileCategory(filePath)}</p>
                </div>
                <Button onClick={() => handleDownload(filePath)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 