import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Download } from 'lucide-react'
import axios from 'axios'

export default function AnalysisResults() {
  const location = useLocation()
  const { user } = useSelector((state) => state.user)
  const [result, setResult] = useState([])
  const [generatedFiles, setGeneratedFiles] = useState([])
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result)
    }
    if (location.state?.generated_files) {
      setGeneratedFiles(location.state.generated_files)
    }
  }, [location])

  const handleDownload = async (fileUrl) => {
    try {
      setDownloading(true)
      const response = await axios.post('http://localhost:8000/api/files/download', 
        { fileUrl },
        {
          withCredentials: true,
          responseType: 'blob'
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileUrl.split('/').pop())
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('File downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4">
        {/* Generated Files Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {generatedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="truncate">{file.split('/').pop()}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={downloading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {result.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 