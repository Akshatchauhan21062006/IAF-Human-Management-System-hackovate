import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BookOpen, TrendingUp, Users, Award, Calendar, Plus, Search, Target } from 'lucide-react';
import { generateTrainingRecommendations } from './utils/dataParser';

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

interface TrainingProgram {
  id: string;
  name: string;
  type: string;
  duration: number;
  capacity: number;
  startDate: string;
  endDate: string;
  instructor: string;
  description: string;
  prerequisites: string[];
  targetSkillLevel: string;
  enrolledPersonnel: string[];
  status: 'Planned' | 'Active' | 'Completed';
}

interface TrainingManagementProps {
  data: PersonnelData[];
}

export const TrainingManagement: React.FC<TrainingManagementProps> = ({ data }) => {
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([
    {
      id: 'T001',
      name: 'Advanced Flight Operations',
      type: 'Technical',
      duration: 14,
      capacity: 20,
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      instructor: 'Wing Commander Sharma',
      description: 'Advanced training in modern flight operations and navigation systems',
      prerequisites: ['Basic Flight Training', 'Navigation Certification'],
      targetSkillLevel: 'Advanced',
      enrolledPersonnel: [],
      status: 'Planned'
    },
    {
      id: 'T002',
      name: 'Leadership Development Program',
      type: 'Leadership',
      duration: 21,
      capacity: 15,
      startDate: '2024-02-20',
      endDate: '2024-03-13',
      instructor: 'Group Captain Patel',
      description: 'Comprehensive leadership training for future commanders',
      prerequisites: ['5+ years experience', 'Supervisory Role'],
      targetSkillLevel: 'Expert',
      enrolledPersonnel: [],
      status: 'Active'
    },
    {
      id: 'T003',
      name: 'Cyber Security Fundamentals',
      type: 'Technical',
      duration: 7,
      capacity: 25,
      startDate: '2024-03-10',
      endDate: '2024-03-17',
      instructor: 'Squadron Leader Kumar',
      description: 'Essential cybersecurity training for all personnel',
      prerequisites: ['Basic Computer Skills'],
      targetSkillLevel: 'Intermediate',
      enrolledPersonnel: [],
      status: 'Planned'
    }
  ]);

  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [showPersonnelDialog, setShowPersonnelDialog] = useState(false);
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [newProgram, setNewProgram] = useState<Partial<TrainingProgram>>({
    name: '',
    type: '',
    duration: 7,
    capacity: 20,
    startDate: '',
    instructor: '',
    description: '',
    targetSkillLevel: 'Intermediate'
  });

  // Calculate training analytics
  const trainingAnalytics = useMemo(() => {
    // Get training recommendations for all personnel
    const allRecommendations = data.flatMap(person => 
      generateTrainingRecommendations(person).map(rec => ({
        personnelId: person.id,
        recommendation: rec,
        priority: getPriorityScore(person, rec)
      }))
    );

    // Count recommendation frequency
    const recommendationCounts = allRecommendations.reduce((acc, item) => {
      acc[item.recommendation] = (acc[item.recommendation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRecommendations = Object.entries(recommendationCounts)
      .map(([rec, count]) => ({ recommendation: rec, count, percentage: (count / data.length * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Skill level distribution
    const skillDistribution = data.reduce((acc, person) => {
      acc[person.skillLevel] = (acc[person.skillLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Training score analysis
    const trainingScoreRanges = data.reduce((acc, person) => {
      const range = person.trainingScore >= 90 ? '90-100' :
                   person.trainingScore >= 80 ? '80-89' :
                   person.trainingScore >= 70 ? '70-79' :
                   person.trainingScore >= 60 ? '60-69' : '<60';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Personnel needing urgent training
    const urgentTraining = data.filter(person => 
      person.trainingScore < 70 || 
      person.skillLevel?.toLowerCase() === 'beginner' ||
      person.missionReadiness?.toLowerCase() === 'training'
    );

    return {
      topRecommendations,
      skillDistribution,
      trainingScoreRanges,
      urgentTraining,
      averageScore: data.reduce((sum, p) => sum + p.trainingScore, 0) / data.length
    };
  }, [data]);

  function getPriorityScore(person: PersonnelData, recommendation: string): number {
    let score = 0;
    if (person.trainingScore < 70) score += 3;
    if (person.missionReadiness?.toLowerCase() === 'training') score += 2;
    if (person.skillLevel?.toLowerCase() === 'beginner') score += 2;
    if (recommendation.includes('Leadership') && person.leadershipPotential?.toLowerCase() === 'high') score += 2;
    return score;
  }

  const specializations = [...new Set(data.map(p => p.specialization))].sort();

  // Get suitable personnel for a training program
  const getSuitablePersonnel = (program: TrainingProgram) => {
    return data.filter(person => {
      // Check if already enrolled
      if (program.enrolledPersonnel.includes(person.id)) return false;
      
      // Check medical fitness
      if (person.medicalStatus?.toLowerCase() !== 'fit') return false;
      
      // Check search filter
      const searchMatch = searchTerm === '' || 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check specialization filter
      const specMatch = filterSpecialization === 'all' || person.specialization === filterSpecialization;
      
      // Check if training is recommended
      const recommendations = generateTrainingRecommendations(person);
      const isRecommended = recommendations.some(rec => 
        rec.toLowerCase().includes(program.name.toLowerCase().split(' ')[0]) ||
        program.name.toLowerCase().includes(rec.toLowerCase().split(' ')[0])
      );
      
      return searchMatch && specMatch && (isRecommended || person.trainingScore < 80);
    }).sort((a, b) => {
      // Sort by training need (lower scores first)
      return a.trainingScore - b.trainingScore;
    });
  };

  const enrollPersonnel = (programId: string, personnelId: string) => {
    setTrainingPrograms(prev => prev.map(program => {
      if (program.id === programId && program.enrolledPersonnel.length < program.capacity) {
        return {
          ...program,
          enrolledPersonnel: [...program.enrolledPersonnel, personnelId]
        };
      }
      return program;
    }));
  };

  const unenrollPersonnel = (programId: string, personnelId: string) => {
    setTrainingPrograms(prev => prev.map(program => {
      if (program.id === programId) {
        return {
          ...program,
          enrolledPersonnel: program.enrolledPersonnel.filter(id => id !== personnelId)
        };
      }
      return program;
    }));
  };

  const createTrainingProgram = () => {
    if (!newProgram.name || !newProgram.type || !newProgram.startDate) return;

    const endDate = new Date(newProgram.startDate!);
    endDate.setDate(endDate.getDate() + (newProgram.duration || 7));

    const program: TrainingProgram = {
      id: `T${String(trainingPrograms.length + 1).padStart(3, '0')}`,
      name: newProgram.name!,
      type: newProgram.type!,
      duration: newProgram.duration || 7,
      capacity: newProgram.capacity || 20,
      startDate: newProgram.startDate!,
      endDate: endDate.toISOString().split('T')[0],
      instructor: newProgram.instructor || 'TBD',
      description: newProgram.description || '',
      prerequisites: [],
      targetSkillLevel: newProgram.targetSkillLevel || 'Intermediate',
      enrolledPersonnel: [],
      status: 'Planned'
    };

    setTrainingPrograms(prev => [...prev, program]);
    setNewProgram({
      name: '',
      type: '',
      duration: 7,
      capacity: 20,
      startDate: '',
      instructor: '',
      description: '',
      targetSkillLevel: 'Intermediate'
    });
    setShowProgramDialog(false);
  };

  const getStatusBadge = (status: TrainingProgram['status']) => {
    const colors = {
      Planned: 'bg-yellow-700 text-yellow-100',
      Active: 'bg-green-700 text-green-100',
      Completed: 'bg-blue-700 text-blue-100'
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      Technical: 'bg-blue-700 text-blue-100',
      Leadership: 'bg-purple-700 text-purple-100',
      Medical: 'bg-red-700 text-red-100',
      Physical: 'bg-green-700 text-green-100'
    };
    return <Badge className={colors[type] || 'bg-slate-700 text-slate-100'}>{type}</Badge>;
  };

  const currentProgram = trainingPrograms.find(p => p.id === selectedProgram);
  const suitablePersonnel = currentProgram ? getSuitablePersonnel(currentProgram) : [];

  // Summary statistics
  const totalPrograms = trainingPrograms.length;
  const activePrograms = trainingPrograms.filter(p => p.status === 'Active').length;
  const totalEnrolled = trainingPrograms.reduce((sum, p) => sum + p.enrolledPersonnel.length, 0);
  const needsTraining = trainingAnalytics.urgentTraining.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Active Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-amber-100">{activePrograms}</div>
            <p className="text-xs text-slate-400">of {totalPrograms} total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Enrolled Personnel</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-100">{totalEnrolled}</div>
            <p className="text-xs text-slate-400">Currently in training</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Avg Training Score</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-100">{trainingAnalytics.averageScore.toFixed(1)}</div>
            <Progress value={trainingAnalytics.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Needs Training</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-100">{needsTraining}</div>
            <p className="text-xs text-slate-400">Priority personnel</p>
          </CardContent>
        </Card>
      </div>

      {/* Training Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Training Recommendations */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Top Training Needs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainingAnalytics.topRecommendations.map((item, index) => (
                <div key={item.recommendation} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-amber-400 w-6">#{index + 1}</div>
                    <div>
                      <div className="text-slate-200">{item.recommendation}</div>
                      <div className="text-xs text-slate-400">{item.count} personnel</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-amber-200 border-amber-500">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Training Score Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Training Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(trainingAnalytics.trainingScoreRanges).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-slate-300">{range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full">
                      <div 
                        className="h-2 bg-amber-500 rounded-full" 
                        style={{width: `${(count / data.length) * 100}%`}}
                      />
                    </div>
                    <span className="text-sm text-slate-400 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Programs Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programs List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-100">Training Programs</CardTitle>
            <Dialog open={showProgramDialog} onOpenChange={setShowProgramDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-amber-600 text-amber-50 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Program
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-slate-200">
                <DialogHeader>
                  <DialogTitle className="text-amber-100">Create Training Program</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Set up a new training program with schedule and requirements.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300">Program Name</label>
                      <Input
                        value={newProgram.name}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Type</label>
                      <Select value={newProgram.type} onValueChange={(value) => setNewProgram(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="Technical" className="text-slate-200">Technical</SelectItem>
                          <SelectItem value="Leadership" className="text-slate-200">Leadership</SelectItem>
                          <SelectItem value="Medical" className="text-slate-200">Medical</SelectItem>
                          <SelectItem value="Physical" className="text-slate-200">Physical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-slate-300">Duration (days)</label>
                      <Input
                        type="number"
                        value={newProgram.duration}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Capacity</label>
                      <Input
                        type="number"
                        value={newProgram.capacity}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Start Date</label>
                      <Input
                        type="date"
                        value={newProgram.startDate}
                        onChange={(e) => setNewProgram(prev => ({ ...prev, startDate: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Instructor</label>
                    <Input
                      value={newProgram.instructor}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, instructor: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Description</label>
                    <Textarea
                      value={newProgram.description}
                      onChange={(e) => setNewProgram(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600 text-slate-200"
                      rows={3}
                    />
                  </div>
                  <Button onClick={createTrainingProgram} className="w-full bg-amber-600 text-amber-50 hover:bg-amber-700">
                    Create Program
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainingPrograms.map((program) => (
              <div 
                key={program.id} 
                className={`p-4 border border-slate-700 rounded-lg cursor-pointer transition-colors ${
                  selectedProgram === program.id ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-700/30 hover:bg-slate-700/50'
                }`}
                onClick={() => setSelectedProgram(program.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-slate-200">{program.name}</h3>
                    <p className="text-sm text-slate-400">{program.instructor}</p>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusBadge(program.status)}
                    {getTypeBadge(program.type)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-slate-400">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {program.enrolledPersonnel.length}/{program.capacity}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {program.duration}d
                    </span>
                  </div>
                  <Progress 
                    value={(program.enrolledPersonnel.length / program.capacity) * 100} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Program Management */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-100">
              {currentProgram ? `${currentProgram.name} - Enrollment` : 'Select a Program'}
            </CardTitle>
            {currentProgram && (
              <Dialog open={showPersonnelDialog} onOpenChange={setShowPersonnelDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 text-green-50 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll Personnel
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-amber-100">Enroll Personnel in {currentProgram.name}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Select personnel to enroll in this training program based on their needs and availability.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search personnel..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200"
                        />
                      </div>
                      <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
                        <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-slate-200">
                          <SelectValue placeholder="Filter by specialization" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="all" className="text-slate-200">All Specializations</SelectItem>
                          {specializations.map(spec => (
                            <SelectItem key={spec} value={spec} className="text-slate-200">{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {suitablePersonnel.slice(0, 20).map((person) => (
                        <div key={person.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex-1">
                            <div className="text-slate-200">{person.name}</div>
                            <div className="text-sm text-slate-400">{person.rank} • {person.specialization}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right mr-2">
                              <div className="text-sm text-slate-300">Score: {person.trainingScore}</div>
                              <Progress value={person.trainingScore} className="w-16 h-2" />
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                enrollPersonnel(currentProgram.id, person.id);
                                setShowPersonnelDialog(false);
                              }}
                              className="bg-green-600 text-green-50 hover:bg-green-700"
                              disabled={currentProgram.enrolledPersonnel.length >= currentProgram.capacity}
                            >
                              Enroll
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {!currentProgram ? (
              <div className="text-center text-slate-400 py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a training program to manage enrollment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Program Details */}
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h3 className="text-slate-200 mb-2">Program Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-slate-200 ml-2">{currentProgram.duration} days</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Capacity:</span>
                      <span className="text-slate-200 ml-2">{currentProgram.capacity} personnel</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Start Date:</span>
                      <span className="text-slate-200 ml-2">{new Date(currentProgram.startDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Target Level:</span>
                      <span className="text-slate-200 ml-2">{currentProgram.targetSkillLevel}</span>
                    </div>
                  </div>
                  {currentProgram.description && (
                    <div className="mt-2">
                      <span className="text-slate-400">Description:</span>
                      <p className="text-slate-200 mt-1">{currentProgram.description}</p>
                    </div>
                  )}
                </div>

                {/* Enrolled Personnel */}
                <div>
                  <h3 className="text-slate-200 mb-3">
                    Enrolled Personnel ({currentProgram.enrolledPersonnel.length}/{currentProgram.capacity})
                  </h3>
                  {currentProgram.enrolledPersonnel.length === 0 ? (
                    <div className="text-center text-slate-400 py-4">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No personnel enrolled yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentProgram.enrolledPersonnel.map(personnelId => {
                        const person = data.find(p => p.id === personnelId);
                        if (!person) return null;
                        
                        return (
                          <div key={person.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex-1">
                              <div className="text-slate-200">{person.name}</div>
                              <div className="text-sm text-slate-400">{person.rank} • {person.specialization}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right mr-2">
                                <div className="text-sm text-slate-300">Score: {person.trainingScore}</div>
                                <Progress value={person.trainingScore} className="w-16 h-2" />
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unenrollPersonnel(currentProgram.id, person.id)}
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-red-50"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Training List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-amber-100">Personnel Needing Urgent Training</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Personnel</TableHead>
                <TableHead className="text-slate-300">Current Score</TableHead>
                <TableHead className="text-slate-300">Skill Level</TableHead>
                <TableHead className="text-slate-300">Recommendations</TableHead>
                <TableHead className="text-slate-300">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingAnalytics.urgentTraining.slice(0, 10).map((person) => {
                const recommendations = generateTrainingRecommendations(person);
                return (
                  <TableRow key={person.id} className="border-slate-700">
                    <TableCell>
                      <div>
                        <div className="text-slate-200">{person.name}</div>
                        <div className="text-sm text-slate-400">{person.rank} • {person.specialization}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300">{person.trainingScore}</span>
                        <Progress value={person.trainingScore} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-slate-300 border-slate-500">
                        {person.skillLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {recommendations.slice(0, 2).map(rec => (
                          <Badge key={rec} variant="outline" className="text-amber-200 border-amber-500 text-xs">
                            {rec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        person.trainingScore < 60 ? 'bg-red-700 text-red-100' :
                        person.trainingScore < 70 ? 'bg-yellow-700 text-yellow-100' :
                        'bg-green-700 text-green-100'
                      }>
                        {person.trainingScore < 60 ? 'Critical' : person.trainingScore < 70 ? 'High' : 'Medium'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};