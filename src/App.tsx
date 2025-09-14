import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Users, TrendingUp, Target, BookOpen, Heart, Shield, BarChart3, Database, LogOut, User } from 'lucide-react';
import { PersonnelOverview } from './components/PersonnelOverview';
import { WorkforceAnalytics } from './components/WorkforceAnalytics';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { MissionDeployment } from './components/MissionDeployment';
import { TrainingManagement } from './components/TrainingManagement';
import { MedicalReadiness } from './components/MedicalReadiness';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { FileUploadPage } from './components/FileUploadPage';
import { authService, User as AuthUser } from './components/utils/authService';

interface PersonnelData {
  id: string;
  name: string;
  rank: string;
  branch: string;
  specialization: string;
  experience: number;
  age: number;
  medicalStatus: string;
  trainingScore: number;
  missionReadiness: string;
  lastDeployment: string;
  skillLevel: string;
  leadershipPotential: string;
  [key: string]: any;
}

type AuthView = 'login' | 'register';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [personnelData, setPersonnelData] = useState<PersonnelData[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Check for existing session on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Load existing data if available
      const userData = authService.getUserData(user.id);
      if (userData && userData.personnelData.length > 0) {
        setPersonnelData(userData.personnelData);
        setIsDataLoaded(true);
      }
    }
  }, []);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    // Load existing data if available
    const userData = authService.getUserData(user.id);
    if (userData && userData.personnelData.length > 0) {
      setPersonnelData(userData.personnelData);
      setIsDataLoaded(true);
    }
  };

  const handleRegister = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setPersonnelData([]);
    setIsDataLoaded(false);
    setActiveTab('overview');
  };

  const handleDataUploaded = (data: PersonnelData[]) => {
    setPersonnelData(data);
    setIsDataLoaded(true);
  };

  // Authentication flow
  if (!currentUser) {
    if (authView === 'login') {
      return (
        <LoginForm 
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthView('register')}
        />
      );
    } else {
      return (
        <RegisterForm 
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  // Data upload flow
  if (!isDataLoaded) {
    return (
      <FileUploadPage 
        user={currentUser}
        onDataUploaded={handleDataUploaded}
        onLogout={handleLogout}
      />
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Shield className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-xl text-stone-800 font-semibold">IAF Human Management System</h1>
              <p className="text-sm text-stone-600">Personnel Records: {personnelData.length}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-violet-50 rounded-lg">
              <User className="h-4 w-4 text-violet-600" />
              <div className="text-right text-sm">
                <p className="text-stone-800 font-medium">{currentUser.fullName}</p>
                <p className="text-stone-600">{currentUser.rank || 'Personnel'}</p>
              </div>
            </div>
            <div className="text-right text-sm px-3 py-2 bg-emerald-50 rounded-lg">
              <p className="text-stone-700 font-medium">System Status</p>
              <p className="text-emerald-600 font-medium">Operational</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {setPersonnelData([]); setIsDataLoaded(false);}}
              className="border-stone-300 text-stone-600 hover:bg-stone-50"
            >
              <Database className="h-4 w-4 mr-2" />
              Upload New Data
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-stone-300 text-stone-600 hover:bg-stone-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border border-stone-200 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-stone-600 hover:text-stone-800 font-medium">
              <Users className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-stone-600 hover:text-stone-800 font-medium">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="predictive" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-stone-600 hover:text-stone-800 font-medium">
              <TrendingUp className="h-4 w-4 mr-2" />
              Predictive
            </TabsTrigger>
            <TabsTrigger value="missions" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-stone-600 hover:text-stone-800 font-medium">
              <Target className="h-4 w-4 mr-2" />
              Missions
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-stone-600 hover:text-stone-800 font-medium">
              <BookOpen className="h-4 w-4 mr-2" />
              Training
            </TabsTrigger>
            <TabsTrigger value="medical" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-stone-600 hover:text-stone-800 font-medium">
              <Heart className="h-4 w-4 mr-2" />
              Medical
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PersonnelOverview data={personnelData} />
          </TabsContent>

          <TabsContent value="analytics">
            <WorkforceAnalytics data={personnelData} />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveAnalytics data={personnelData} />
          </TabsContent>

          <TabsContent value="missions">
            <MissionDeployment data={personnelData} />
          </TabsContent>

          <TabsContent value="training">
            <TrainingManagement data={personnelData} />
          </TabsContent>

          <TabsContent value="medical">
            <MedicalReadiness data={personnelData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}