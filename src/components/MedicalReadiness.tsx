import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Heart, AlertTriangle, CheckCircle, Calendar, Users, TrendingUp, Plus, Search } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

interface MedicalRecord {
  id: string;
  personnelId: string;
  date: string;
  type: 'Annual' | 'Deployment' | 'Incident' | 'Follow-up';
  status: 'Fit' | 'Limited Duty' | 'Under Review' | 'Unfit';
  officer: string;
  notes: string;
  nextDue: string;
  restrictions?: string[];
}

interface MedicalReadinessProps {
  data: PersonnelData[];
}

export const MedicalReadiness: React.FC<MedicalReadinessProps> = ({ data }) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      id: 'MR001',
      personnelId: data[0]?.id || 'IAF0001',
      date: '2024-01-15',
      type: 'Annual',
      status: 'Fit',
      officer: 'Wg Cdr Dr. Sharma',
      notes: 'All parameters normal. Cleared for all duties.',
      nextDue: '2025-01-15'
    },
    {
      id: 'MR002',
      personnelId: data[1]?.id || 'IAF0002',
      date: '2024-01-20',
      type: 'Deployment',
      status: 'Limited Duty',
      officer: 'Sqn Ldr Dr. Patel',
      notes: 'Minor injury to left shoulder. Limited to ground duties.',
      nextDue: '2024-03-20',
      restrictions: ['No flying duties', 'No heavy lifting']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    type: 'Annual',
    status: 'Fit',
    officer: '',
    notes: '',
    restrictions: []
  });

  // Calculate medical analytics
  const medicalAnalytics = useMemo(() => {
    // Medical status distribution
    const statusDistribution = data.reduce((acc, person) => {
      acc[person.medicalStatus] = (acc[person.medicalStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    // Age group health analysis
    const ageGroups = data.reduce((acc, person) => {
      const group = person.age < 30 ? '<30' : person.age < 40 ? '30-39' : person.age < 50 ? '40-49' : '50+';
      if (!acc[group]) acc[group] = { total: 0, fit: 0 };
      acc[group].total++;
      if (person.medicalStatus?.toLowerCase() === 'fit') acc[group].fit++;
      return acc;
    }, {} as Record<string, { total: number; fit: number }>);

    const ageHealthData = Object.entries(ageGroups).map(([group, data]) => ({
      group,
      total: data.total,
      fit: data.fit,
      fitnessRate: ((data.fit / data.total) * 100).toFixed(1)
    }));

    // Personnel needing medical attention
    const medicalConcerns = data.filter(person => 
      person.medicalStatus?.toLowerCase() !== 'fit' ||
      person.age > 50 ||
      person.missionReadiness?.toLowerCase() === 'not ready'
    );

    // Deployment readiness by medical status
    const deploymentFit = data.filter(p => 
      p.medicalStatus?.toLowerCase() === 'fit' && 
      p.missionReadiness?.toLowerCase() === 'ready'
    ).length;

    // Simulated medical trends (12 months)
    const medicalTrends = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - 11 + i);
      const fitRate = (statusDistribution['Fit'] || 0) / data.length * 100;
      const variation = (Math.sin(i * 0.5) * 5) + (Math.random() * 6 - 3);
      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        fitnessRate: Math.max(70, Math.min(100, fitRate + variation)),
        incidents: Math.floor(Math.random() * 5) + 1
      };
    });

    return {
      statusData,
      ageHealthData,
      medicalConcerns,
      deploymentFit,
      medicalTrends,
      fitnessRate: ((statusDistribution['Fit'] || 0) / data.length * 100).toFixed(1)
    };
  }, [data]);

  // Filter personnel based on search and status
  const filteredPersonnel = useMemo(() => {
    return data.filter(person => {
      const matchesSearch = searchTerm === '' || 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || person.medicalStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, filterStatus]);

  // Get medical records for a person
  const getPersonnelRecords = (personnelId: string) => {
    return medicalRecords.filter(record => record.personnelId === personnelId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const addMedicalRecord = () => {
    if (!selectedPersonnel || !newRecord.officer || !newRecord.notes) return;

    const record: MedicalRecord = {
      id: `MR${String(medicalRecords.length + 1).padStart(3, '0')}`,
      personnelId: selectedPersonnel,
      date: new Date().toISOString().split('T')[0],
      type: newRecord.type as 'Annual' | 'Deployment' | 'Incident' | 'Follow-up',
      status: newRecord.status as 'Fit' | 'Limited Duty' | 'Under Review' | 'Unfit',
      officer: newRecord.officer!,
      notes: newRecord.notes!,
      nextDue: getNextDueDate(newRecord.type as string),
      restrictions: newRecord.restrictions || []
    };

    setMedicalRecords(prev => [...prev, record]);
    setNewRecord({
      type: 'Annual',
      status: 'Fit',
      officer: '',
      notes: '',
      restrictions: []
    });
    setSelectedPersonnel('');
    setShowRecordDialog(false);
  };

  const getNextDueDate = (type: string): string => {
    const nextYear = new Date();
    if (type === 'Annual') {
      nextYear.setFullYear(nextYear.getFullYear() + 1);
    } else if (type === 'Follow-up') {
      nextYear.setMonth(nextYear.getMonth() + 3);
    } else {
      nextYear.setMonth(nextYear.getMonth() + 6);
    }
    return nextYear.toISOString().split('T')[0];
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Fit': 'bg-green-700 text-green-100',
      'Limited Duty': 'bg-yellow-700 text-yellow-100',
      'Under Review': 'bg-orange-700 text-orange-100',
      'Unfit': 'bg-red-700 text-red-100'
    };
    return <Badge className={colors[status] || 'bg-slate-700 text-slate-100'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Annual': 'bg-blue-700 text-blue-100',
      'Deployment': 'bg-purple-700 text-purple-100',
      'Incident': 'bg-red-700 text-red-100',
      'Follow-up': 'bg-yellow-700 text-yellow-100'
    };
    return <Badge className={colors[type] || 'bg-slate-700 text-slate-100'}>{type}</Badge>;
  };

  const isOverdue = (nextDue: string): boolean => {
    return new Date(nextDue) < new Date();
  };

  const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

  // Summary statistics
  const totalPersonnel = data.length;
  const fitPersonnel = data.filter(p => p.medicalStatus?.toLowerCase() === 'fit').length;
  const limitedDuty = data.filter(p => p.medicalStatus?.toLowerCase() === 'limited duty').length;
  const underReview = data.filter(p => p.medicalStatus?.toLowerCase() === 'under review').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Medical Fitness Rate</CardTitle>
            <Heart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-100">{medicalAnalytics.fitnessRate}%</div>
            <p className="text-xs text-slate-400">{fitPersonnel} of {totalPersonnel} personnel</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Limited Duty</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-100">{limitedDuty}</div>
            <p className="text-xs text-slate-400">Restricted personnel</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Under Review</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-100">{underReview}</div>
            <p className="text-xs text-slate-400">Pending evaluation</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Deployment Ready</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-100">{medicalAnalytics.deploymentFit}</div>
            <p className="text-xs text-slate-400">
              {((medicalAnalytics.deploymentFit / totalPersonnel) * 100).toFixed(1)}% available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medical Status Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Medical Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={medicalAnalytics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {medicalAnalytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fitness by Age Group */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Fitness Rate by Age Group</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={medicalAnalytics.ageHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="group" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="fit" fill="#10b981" name="Fit" />
                <Bar dataKey="total" fill="#64748b" name="Total" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Medical Trends */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-amber-100">Medical Fitness Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={medicalAnalytics.medicalTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line type="monotone" dataKey="fitnessRate" stroke="#10b981" strokeWidth={2} name="Fitness Rate %" />
              <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} name="Medical Incidents" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Personnel Medical Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-amber-100">Personnel Medical Status</CardTitle>
          <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-amber-600 text-amber-50 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-slate-200">
              <DialogHeader>
                <DialogTitle className="text-amber-100">Add Medical Record</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create a new medical record for personnel health tracking and assessment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300">Select Personnel</label>
                  <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Choose personnel" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {data.map(person => (
                        <SelectItem key={person.id} value={person.id} className="text-slate-200">
                          {person.name} - {person.rank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300">Record Type</label>
                    <Select value={newRecord.type} onValueChange={(value) => setNewRecord(prev => ({ ...prev, type: value as any }))}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Annual" className="text-slate-200">Annual</SelectItem>
                        <SelectItem value="Deployment" className="text-slate-200">Deployment</SelectItem>
                        <SelectItem value="Incident" className="text-slate-200">Incident</SelectItem>
                        <SelectItem value="Follow-up" className="text-slate-200">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Status</label>
                    <Select value={newRecord.status} onValueChange={(value) => setNewRecord(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Fit" className="text-slate-200">Fit</SelectItem>
                        <SelectItem value="Limited Duty" className="text-slate-200">Limited Duty</SelectItem>
                        <SelectItem value="Under Review" className="text-slate-200">Under Review</SelectItem>
                        <SelectItem value="Unfit" className="text-slate-200">Unfit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300">Medical Officer</label>
                  <Input
                    value={newRecord.officer}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, officer: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                    placeholder="e.g., Wg Cdr Dr. Sharma"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Notes</label>
                  <Textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                    rows={3}
                    placeholder="Medical examination notes and recommendations"
                  />
                </div>
                <Button onClick={addMedicalRecord} className="w-full bg-amber-600 text-amber-50 hover:bg-amber-700">
                  Add Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-slate-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-200">All Statuses</SelectItem>
                <SelectItem value="Fit" className="text-slate-200">Fit</SelectItem>
                <SelectItem value="Limited Duty" className="text-slate-200">Limited Duty</SelectItem>
                <SelectItem value="Under Review" className="text-slate-200">Under Review</SelectItem>
                <SelectItem value="Unfit" className="text-slate-200">Unfit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Personnel Table */}
          <div className="border border-slate-700 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Personnel</TableHead>
                  <TableHead className="text-slate-300">Age</TableHead>
                  <TableHead className="text-slate-300">Medical Status</TableHead>
                  <TableHead className="text-slate-300">Last Checkup</TableHead>
                  <TableHead className="text-slate-300">Next Due</TableHead>
                  <TableHead className="text-slate-300">Records</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersonnel.slice(0, 15).map((person) => {
                  const records = getPersonnelRecords(person.id);
                  const lastRecord = records[0];
                  const nextDue = lastRecord?.nextDue || '2024-12-31';
                  const overdue = isOverdue(nextDue);
                  
                  return (
                    <TableRow key={person.id} className="border-slate-700">
                      <TableCell>
                        <div>
                          <div className="text-slate-200">{person.name}</div>
                          <div className="text-sm text-slate-400">{person.rank} • {person.specialization}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{person.age}</TableCell>
                      <TableCell>{getStatusBadge(person.medicalStatus)}</TableCell>
                      <TableCell className="text-slate-300">
                        {lastRecord ? new Date(lastRecord.date).toLocaleDateString() : 'No records'}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center space-x-2 ${overdue ? 'text-red-400' : 'text-slate-300'}`}>
                          <span>{new Date(nextDue).toLocaleDateString()}</span>
                          {overdue && (
                            <Badge className="bg-red-700 text-red-100 text-xs">Overdue</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-slate-300 border-slate-500">
                          {records.length} record{records.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Medical Concerns Alert */}
      {medicalAnalytics.medicalConcerns.length > 0 && (
        <Alert className="bg-yellow-900/50 border-yellow-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-200">
            {medicalAnalytics.medicalConcerns.length} personnel require medical attention or have fitness concerns.
            Regular monitoring and follow-up recommended.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};