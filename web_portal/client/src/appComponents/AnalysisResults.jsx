import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Download, ChevronDown, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setFiles, setLoading, setError } from '../store/filesSlice'

export default function AnalysisResults() {
  const dispatch = useDispatch();
  const { files: fileData, loading, generatedFiles } = useSelector((state) => state.files);
  const [downloading, setDownloading] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const { user } = useSelector((state) => state.user);

  const handleDownload = async (filePath, fileName) => {
    try {
      setDownloading(true);
      const key = filePath.split('.com/')[1];
      
      const response = await axios.get(
        `http://localhost:8000/api/files/download/${encodeURIComponent(key)}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      console.log("response => ", response)

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(
        `http://localhost:8000/api/files/get-files`,
      );
      dispatch(setFiles(response.data.files));
    } catch (error) {
      console.error('Error fetching files:', error);
      dispatch(setError(error.message));
      toast.error('Failed to fetch files');
    }
  };

  useEffect(() => {
    if (Object.keys(fileData).length === 0) {
      fetchFiles();
    }
  }, []);

  const handleRefresh = () => {
    fetchFiles();
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

  const handleDelete = async (filePath, fileName) => {
    try {
      const key = filePath.split('.com/')[1];
      console.log("key => ", key)
      const response = await axios.delete(
        `http://localhost:8000/api/files/delete/${encodeURIComponent(key)}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('File deleted successfully');
        // Refresh the file list
        fetchFiles();
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading files...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Reports</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            { fileData ? (<div className="grid gap-4">
              <div className="border rounded-lg p-4">
                {Object.entries(fileData).map(([session, programs]) => (
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

                        {expandedPrograms[`${session}-${program}`] && Object.entries(semesters).map(([semester, semesterData]) => (
                          <div key={semester} className="ml-4 mb-2">
                            <div 
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 hover:text-blue-600 transition-colors p-2 rounded group"
                              onClick={() => toggleSemester(`${session}-${program}-${semester}`)}
                            >
                              {expandedSemesters[`${session}-${program}-${semester}`] ? 
                                <ChevronDown className="h-4 w-4 group-hover:text-blue-600" /> : 
                                <ChevronRight className="h-4 w-4 group-hover:text-blue-600" />
                              }
                              <h5 className="text-sm font-medium">{semester}</h5>
                            </div>

                            {expandedSemesters[`${session}-${program}-${semester}`] && (
                              <div className="ml-8">
                                {semesterData[0].file.map((file, index) => (
                                  <div 
                                    key={index}
                                    className="flex items-center justify-between gap-2 mb-1 hover:bg-gray-100 hover:text-blue-600 transition-colors p-1 rounded cursor-pointer text-sm"
                                  >
                                    <span>{file.file_name}</span>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownload(file.file_path, file.file_name)}
                                        disabled={downloading}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      {user.role === 'admin' && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDelete(file.file_path, file.file_name)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
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
            </div>): (
              // show a message that no reports are available
              <div className="flex items-center justify-center p-4">
                <span className="text-sm text-gray-500">No reports are available</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show newly generated files if any */}
        {generatedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recently Generated Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-lg"
                  >
                    <span className="text-sm">{file.split('/').pop()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file, file.split('/').pop())}
                      disabled={downloading}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 