import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Download, ChevronDown, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export default function AnalysisResults() {
  const [result, setResult] = useState([])
  const [generatedFiles, setGeneratedFiles] = useState([])
  const [downloading, setDownloading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});

  const handleDownload = async (fileKey) => {
    try {
      setDownloading(true);
      const response = await axios.get(
        `http://localhost:8000/api/files/download/${encodeURIComponent(fileKey)}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileKey.split('/').pop()); // Get the filename from the path
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/files/get-files`,
      );

      console.log("response => ", response)
      setGeneratedFiles(response.data.files.map(file => file.key));
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
    }
  };

  console.log("generatedFiles => ", generatedFiles)

useEffect(() => {
  fetchFiles()
}, [])

  // 2021-2025/BACHELOR OF COMPUTER APPLICATIONS/Third Semester/top_five_students.xlsx
  const organizeFiles = (files) => {
    return files.reduce((acc, filePath) => {
      // Split the path into components
      const parts = filePath.split('/');
      
      // Extract components
      const session = parts[0];  // e.g., "2021-2025"
      const program = parts[1];  // e.g., "BACHELOR OF COMPUTER APPLICATIONS" 
      const semesterFull = parts[2];  // e.g., "Third Semester"
      const fileName = parts[3];  // e.g., "top_five_students.xlsx"
      
      // Extract semester number
      const semester = semesterFull.split(' ')[0]; // e.g., "Third"

      // Initialize nested structure if it doesn't exist
      if (!acc[session]) acc[session] = {};
      if (!acc[session][program]) acc[session][program] = {};
      if (!acc[session][program][semester]) acc[session][program][semester] = [];

      // Add file info to the structure
      acc[session][program][semester].push({
        session,
        program,
        semester: semesterFull,
        file_name: fileName,
        key: filePath
      });

      return acc;
    }, {});
  };

  const toggleSession = (session) => {
    setExpandedSessions(prev => ({
      ...prev,
      [session]: !prev[session]
    }));
  };

  const toggleProgram = (sessionProgram) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [sessionProgram]: !prev[sessionProgram]
    }));
  };

  const toggleSemester = (sessionProgramSemester) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [sessionProgramSemester]: !prev[sessionProgramSemester]
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Generated Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                {Object.entries(organizeFiles(generatedFiles)).map(([session, programs]) => (
                  <div key={session} className="mb-4">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 hover:text-blue-600 transition-colors p-2 rounded group"
                      onClick={() => toggleSession(session)}
                    >
                      {expandedSessions[session] ? 
                        <ChevronDown className="h-4 w-4 group-hover:text-blue-600" /> : 
                        <ChevronRight className="h-4 w-4 group-hover:text-blue-600" />
                      }
                      <h3 className="text-lg font-semibold">{session}</h3>
                    </div>

                    {expandedSessions[session] && Object.entries(programs).map(([program, semesters]) => (
                      <div key={program} className="ml-4 mb-2">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 hover:text-blue-600 transition-colors p-2 rounded group"
                          onClick={() => toggleProgram(`${session}-${program}`)}
                        >
                          {expandedPrograms[`${session}-${program}`] ? 
                            <ChevronDown className="h-4 w-4 group-hover:text-blue-600" /> : 
                            <ChevronRight className="h-4 w-4 group-hover:text-blue-600" />
                          }
                          <h4 className="text-md font-medium">{program}</h4>
                        </div>

                        {expandedPrograms[`${session}-${program}`] && Object.entries(semesters).map(([semester, files]) => (
                          <div key={semester} className="ml-4 mb-2">
                            <div 
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 hover:text-blue-600 transition-colors p-2 rounded group"
                              onClick={() => toggleSemester(`${session}-${program}-${semester}`)}
                            >
                              {expandedSemesters[`${session}-${program}-${semester}`] ? 
                                <ChevronDown className="h-4 w-4 group-hover:text-blue-600" /> : 
                                <ChevronRight className="h-4 w-4 group-hover:text-blue-600" />
                              }
                              <h5 className="text-sm font-medium">Semester {semester}</h5>
                            </div>

                            {expandedSemesters[`${session}-${program}-${semester}`] && (
                              <div className="ml-8">
                                {files.map((file, index) => (
                                  <div 
                                    key={index}
                                    className="flex items-center gap-2 mb-1 hover:bg-gray-100 hover:text-blue-600 transition-colors p-1 rounded cursor-pointer text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFile(file);
                                    }}
                                  >
                                    {file.file_name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {selectedFile && (
                <div className="flex flex-col gap-2 p-4 border rounded">
                  <div><strong>Session:</strong> {selectedFile.session}</div>
                  <div><strong>Program:</strong> {selectedFile.program}</div>
                  <div><strong>Semester:</strong> {selectedFile.semester}</div>
                  <div><strong>File:</strong> {selectedFile.file_name}</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(selectedFile.key)}
                    disabled={downloading}
                    className="mt-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
       
      </div>
    </div>
  )
} 