import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Target, Users, MapPin, Clock, CheckCircle, AlertCircle, Search, Plus } from 'lucide-react';
import { calculateReadinessScore } from './utils/dataParser';

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

interface Mission {
  id: string;
  name: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  startDate: string;
  duration: number;
  requiredPersonnel: number;
  requiredSpecializations: string[];
  status: 'Planning' | 'Active' | 'Completed';
  assignedPersonnel: string[];
  location: string;
  description: string;
}

interface MissionDeploymentProps {
  data: PersonnelData[];
}

export const MissionDeployment: React.FC<MissionDeploymentProps> = ({ data }) => {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'M001',
      name: 'Operation Thunder Strike',
      type: 'Combat',
      priority: 'High',
      startDate: '2024-02-15',
      duration: 90,
      requiredPersonnel: 25,
      requiredSpecializations: ['Pilot', 'Engineer', 'Communications'],
      status: 'Planning',
      assignedPersonnel: [],
      location: 'Northern Sector',
      description: 'Strategic air operations in northern territory'
    },
    {
      id: 'M002',
      name: 'Humanitarian Relief Alpha',
      type: 'Humanitarian',
      priority: 'Medium',
      startDate: '2024-03-01',
      duration: 45,
      requiredPersonnel: 15,
      requiredSpecializations: ['Logistics', 'Medical', 'Transport'],
      status: 'Planning',
      assignedPersonnel: [],
      location: 'Eastern Region',
      description: 'Disaster relief and humanitarian assistance operations'
    }
  ]);

  const [selectedMission, setSelectedMission] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [showPersonnelDialog, setShowPersonnelDialog] = useState(false);
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [newMission, setNewMission] = useState<Partial<Mission>>({
    name: '',
    type: '',
    priority: 'Medium',
    startDate: '',
    duration: 30,
    requiredPersonnel: 10,
    requiredSpecializations: [],
    location: '',
    description: ''
  });

  // Calculate personnel readiness scores
  const personnelWithReadiness = useMemo(() => {
    return data.map(person => ({
      ...person,
      readinessScore: calculateReadinessScore(person),
      availabilityStatus: getAvailabilityStatus(person),
      lastDeploymentDays: Math.floor((new Date().getTime() - new Date(person.lastDeployment).getTime()) / (1000 * 60 * 60 * 24))
    }));
  }, [data]);

  function getAvailabilityStatus(person: PersonnelData): 'Available' | 'Deployed' | 'Training' | 'Medical' {
    if (person.medicalStatus?.toLowerCase() !== 'fit') return 'Medical';
    if (person.missionReadiness?.toLowerCase() === 'training') return 'Training';
    // Check if already deployed
    const isDeployed = missions.some(mission => 
      mission.status === 'Active' && mission.assignedPersonnel.includes(person.id)
    );
    return isDeployed ? 'Deployed' : 'Available';
  }

  const specializations = [...new Set(data.map(p => p.specialization))].sort();

  // Get suitable personnel for a mission
  const getSuitablePersonnel = (mission: Mission) => {
    return personnelWithReadiness
      .filter(person => {
        const matchesSpecialization = mission.requiredSpecializations.length === 0 || 
          mission.requiredSpecializations.includes(person.specialization);
        const isAvailable = person.availabilityStatus === 'Available';
        const hasMinReadiness = person.readinessScore >= 70;
        const searchMatch = searchTerm === '' || 
          person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const specFilter = filterSpecialization === 'all' || person.specialization === filterSpecialization;
        
        return matchesSpecialization && isAvailable && hasMinReadiness && searchMatch && specFilter;
      })
      .sort((a, b) => b.readinessScore - a.readinessScore);
  };

  const assignPersonnelToMission = (missionId: string, personnelId: string) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === missionId) {
        return {
          ...mission,
          assignedPersonnel: [...mission.assignedPersonnel, personnelId]
        };
      }
      return mission;
    }));
  };

  const removePersonnelFromMission = (missionId: string, personnelId: string) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === missionId) {
        return {
          ...mission,
          assignedPersonnel: mission.assignedPersonnel.filter(id => id !== personnelId)
        };
      }
      return mission;
    }));
  };

  const createMission = () => {
    if (!newMission.name || !newMission.type || !newMission.startDate) return;

    const mission: Mission = {
      id: `M${String(missions.length + 1).padStart(3, '0')}`,
      name: newMission.name!,
      type: newMission.type!,
      priority: newMission.priority as 'High' | 'Medium' | 'Low',
      startDate: newMission.startDate!,
      duration: newMission.duration || 30,
      requiredPersonnel: newMission.requiredPersonnel || 10,
      requiredSpecializations: newMission.requiredSpecializations || [],
      status: 'Planning',
      assignedPersonnel: [],
      location: newMission.location || '',
      description: newMission.description || ''
    };

    setMissions(prev => [...prev, mission]);
    setNewMission({
      name: '',
      type: '',
      priority: 'Medium',
      startDate: '',
      duration: 30,
      requiredPersonnel: 10,
      requiredSpecializations: [],
      location: '',
      description: ''
    });
    setShowMissionDialog(false);
  };

  const getStatusBadge = (status: Mission['status']) => {
    const colors = {
      Planning: 'bg-yellow-700 text-yellow-100',
      Active: 'bg-green-700 text-green-100',
      Completed: 'bg-blue-700 text-blue-100'
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: Mission['priority']) => {
    const colors = {
      High: 'bg-red-700 text-red-100',
      Medium: 'bg-yellow-700 text-yellow-100',
      Low: 'bg-green-700 text-green-100'
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const getAvailabilityBadge = (status: string) => {
    const colors = {
      Available: 'bg-green-700 text-green-100',
      Deployed: 'bg-red-700 text-red-100',
      Training: 'bg-yellow-700 text-yellow-100',
      Medical: 'bg-orange-700 text-orange-100'
    };
    return <Badge className={colors[status] || 'bg-slate-700 text-slate-100'}>{status}</Badge>;
  };

  const currentMission = missions.find(m => m.id === selectedMission);
  const suitablePersonnel = currentMission ? getSuitablePersonnel(currentMission) : [];

  // Summary statistics
  const totalMissions = missions.length;
  const activeMissions = missions.filter(m => m.status === 'Active').length;
  const availablePersonnel = personnelWithReadiness.filter(p => p.availabilityStatus === 'Available').length;
  const deployedPersonnel = personnelWithReadiness.filter(p => p.availabilityStatus === 'Deployed').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Total Missions</CardTitle>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-amber-100">{totalMissions}</div>
            <p className="text-xs text-slate-400">{activeMissions} active</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Available Personnel</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-100">{availablePersonnel}</div>
            <p className="text-xs text-slate-400">Ready for deployment</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Currently Deployed</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-100">{deployedPersonnel}</div>
            <p className="text-xs text-slate-400">On active missions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Mission Readiness</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-100">
              {((availablePersonnel / data.length) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-slate-400">Personnel availability</p>
          </CardContent>
        </Card>
      </div>

      {/* Mission Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-100">Active Missions</CardTitle>
            <Dialog open={showMissionDialog} onOpenChange={setShowMissionDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-amber-600 text-amber-50 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Mission
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-slate-200">
                <DialogHeader>
                  <DialogTitle className="text-amber-100">Create New Mission</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Fill out the details below to create a new mission assignment.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300">Mission Name</label>
                      <Input
                        value={newMission.name}
                        onChange={(e) => setNewMission(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Type</label>
                      <Select value={newMission.type} onValueChange={(value) => setNewMission(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="Combat" className="text-slate-200">Combat</SelectItem>
                          <SelectItem value="Training" className="text-slate-200">Training</SelectItem>
                          <SelectItem value="Humanitarian" className="text-slate-200">Humanitarian</SelectItem>
                          <SelectItem value="Reconnaissance" className="text-slate-200">Reconnaissance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-slate-300">Priority</label>
                      <Select value={newMission.priority} onValueChange={(value) => setNewMission(prev => ({ ...prev, priority: value as any }))}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="High" className="text-slate-200">High</SelectItem>
                          <SelectItem value="Medium" className="text-slate-200">Medium</SelectItem>
                          <SelectItem value="Low" className="text-slate-200">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Start Date</label>
                      <Input
                        type="date"
                        value={newMission.startDate}
                        onChange={(e) => setNewMission(prev => ({ ...prev, startDate: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Duration (days)</label>
                      <Input
                        type="number"
                        value={newMission.duration}
                        onChange={(e) => setNewMission(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300">Required Personnel</label>
                      <Input
                        type="number"
                        value={newMission.requiredPersonnel}
                        onChange={(e) => setNewMission(prev => ({ ...prev, requiredPersonnel: parseInt(e.target.value) }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Location</label>
                      <Input
                        value={newMission.location}
                        onChange={(e) => setNewMission(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Description</label>
                    <Textarea
                      value={newMission.description}
                      onChange={(e) => setNewMission(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600 text-slate-200"
                      rows={3}
                    />
                  </div>
                  <Button onClick={createMission} className="w-full bg-amber-600 text-amber-50 hover:bg-amber-700">
                    Create Mission
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {missions.map((mission) => (
              <div 
                key={mission.id} 
                className={`p-4 border border-slate-700 rounded-lg cursor-pointer transition-colors ${
                  selectedMission === mission.id ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-700/30 hover:bg-slate-700/50'
                }`}
                onClick={() => setSelectedMission(mission.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-slate-200">{mission.name}</h3>
                    <p className="text-sm text-slate-400">{mission.type} • {mission.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusBadge(mission.status)}
                    {getPriorityBadge(mission.priority)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-slate-400">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {mission.assignedPersonnel.length}/{mission.requiredPersonnel}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {mission.duration}d
                    </span>
                  </div>
                  <Progress 
                    value={(mission.assignedPersonnel.length / mission.requiredPersonnel) * 100} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Personnel Assignment */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-100">
              {currentMission ? `${currentMission.name} - Personnel` : 'Select a Mission'}
            </CardTitle>
            {currentMission && (
              <Dialog open={showPersonnelDialog} onOpenChange={setShowPersonnelDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 text-green-50 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Personnel
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-amber-100">Assign Personnel to {currentMission.name}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Select personnel to assign to this mission based on their skills and readiness.
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
                      {suitablePersonnel.map((person) => (
                        <div key={person.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex-1">
                            <div className="text-slate-200">{person.name}</div>
                            <div className="text-sm text-slate-400">{person.rank} • {person.specialization}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right mr-2">
                              <div className="text-sm text-slate-300">{person.readinessScore}/100</div>
                              <Progress value={person.readinessScore} className="w-16 h-2" />
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                assignPersonnelToMission(currentMission.id, person.id);
                                setShowPersonnelDialog(false);
                              }}
                              className="bg-green-600 text-green-50 hover:bg-green-700"
                            >
                              Assign
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
            {!currentMission ? (
              <div className="text-center text-slate-400 py-8">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a mission to view and manage personnel assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mission Details */}
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h3 className="text-slate-200 mb-2">Mission Requirements</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Required Personnel:</span>
                      <span className="text-slate-200 ml-2">{currentMission.requiredPersonnel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-slate-200 ml-2">{currentMission.duration} days</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Required Specializations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentMission.requiredSpecializations.map(spec => (
                          <Badge key={spec} variant="outline" className="text-amber-200 border-amber-500">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Personnel */}
                <div>
                  <h3 className="text-slate-200 mb-3">Assigned Personnel ({currentMission.assignedPersonnel.length})</h3>
                  {currentMission.assignedPersonnel.length === 0 ? (
                    <div className="text-center text-slate-400 py-4">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No personnel assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentMission.assignedPersonnel.map(personnelId => {
                        const person = personnelWithReadiness.find(p => p.id === personnelId);
                        if (!person) return null;
                        
                        return (
                          <div key={person.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex-1">
                              <div className="text-slate-200">{person.name}</div>
                              <div className="text-sm text-slate-400">{person.rank} • {person.specialization}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right mr-2">
                                <div className="text-sm text-slate-300">{person.readinessScore}/100</div>
                                <Progress value={person.readinessScore} className="w-16 h-2" />
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePersonnelFromMission(currentMission.id, person.id)}
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

                {/* Mission Status Alert */}
                {currentMission.assignedPersonnel.length >= currentMission.requiredPersonnel ? (
                  <Alert className="bg-green-900/50 border-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-200">
                      Mission is fully staffed and ready for deployment.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-yellow-900/50 border-yellow-700">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-yellow-200">
                      Mission needs {currentMission.requiredPersonnel - currentMission.assignedPersonnel.length} more personnel.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};