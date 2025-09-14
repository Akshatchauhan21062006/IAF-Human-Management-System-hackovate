import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileSpreadsheet, Database, LogOut, User } from 'lucide-react';
import { parseCSVData } from './utils/dataParser';
import { authService, User as AuthUser } from './utils/authService';

interface FileUploadPageProps {
  user: AuthUser;
  onDataUploaded: (data: any[]) => void;
  onLogout: () => void;
}

export function FileUploadPage({ user, onDataUploaded, onLogout }: FileUploadPageProps) {
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|xlsx?)$/i)) {
      setUploadError('Please upload a CSV or Excel file');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const data = await parseCSVData(file);
      
      // Save data for the current user
      authService.saveUserData(user.id, data);
      
      setUploadSuccess(true);
      setUploadError('');
      
      // Wait a moment for user to see success message, then proceed
      setTimeout(() => {
        onDataUploaded(data);
      }, 1000);
      
    } catch (error) {
      setUploadError('Error parsing file. Please ensure it contains valid personnel data.');
      console.error('File parsing error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const loadExistingData = () => {
    const userData = authService.getUserData(user.id);
    if (userData && userData.personnelData.length > 0) {
      onDataUploaded(userData.personnelData);
    }
  };

  const existingData = authService.getUserData(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Database className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-xl text-stone-800 font-semibold">IAF Human Management System</h1>
              <p className="text-sm text-stone-600">Data Management Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-violet-50 rounded-lg">
              <User className="h-4 w-4 text-violet-600" />
              <div className="text-right text-sm">
                <p className="text-stone-800 font-medium">{user.fullName}</p>
                <p className="text-stone-600">{user.rank || 'Personnel'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="border-stone-300 text-stone-600 hover:bg-stone-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Upload Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-violet-100 rounded-full">
                  <FileSpreadsheet className="h-12 w-12 text-violet-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl text-stone-800 font-semibold">Upload Personnel Data</CardTitle>
                <p className="text-stone-600 mt-2">
                  Upload a CSV or Excel file containing personnel information to begin analysis
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="bg-white border-stone-300 focus:border-violet-500 focus:ring-violet-500 file:bg-violet-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:cursor-pointer cursor-pointer"
                  />
                  <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
                
                {isUploading && (
                  <div className="flex items-center justify-center space-x-2 py-4">
                    <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-stone-600">Processing file...</span>
                  </div>
                )}
                
                {uploadError && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700">{uploadError}</AlertDescription>
                  </Alert>
                )}
                
                {uploadSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">
                      File uploaded successfully! Loading dashboard...
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* File Format Info */}
              <div className="bg-violet-50 rounded-lg p-4">
                <h4 className="font-medium text-stone-800 mb-2">Required File Format:</h4>
                <div className="text-sm text-stone-600 space-y-1">
                  <p>• CSV or Excel file (.csv, .xlsx, .xls)</p>
                  <p>• Columns: id, name, rank, branch, specialization, experience, age, medicalStatus, trainingScore, missionReadiness, lastDeployment, skillLevel, leadershipPotential</p>
                  <p>• First row should contain column headers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Data Section */}
          {existingData && existingData.personnelData.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-stone-800 font-semibold">Previous Data</CardTitle>
                <p className="text-stone-600">You have previously uploaded personnel data</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                  <div>
                    <p className="font-medium text-stone-800">
                      {existingData.personnelData.length} personnel records
                    </p>
                    <p className="text-sm text-stone-600">
                      Uploaded: {new Date(existingData.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    onClick={loadExistingData}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Load Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}