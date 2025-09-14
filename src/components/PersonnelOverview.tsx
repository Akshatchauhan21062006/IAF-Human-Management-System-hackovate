import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, Filter, Users, Award, Shield, Target } from 'lucide-react';

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

interface PersonnelOverviewProps {
  data: PersonnelData[];
}

export const PersonnelOverview: React.FC<PersonnelOverviewProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate statistics
  const totalPersonnel = data.length;
  const activePersonnel = data.filter(p => p.missionReadiness?.toLowerCase() === 'ready').length;
  const highPerformers = data.filter(p => p.trainingScore >= 85).length;
  const leadershipCandidates = data.filter(p => p.leadershipPotential?.toLowerCase() === 'high').length;

  // Get unique values for filters
  const ranks = [...new Set(data.map(p => p.rank))].sort();
  const specializations = [...new Set(data.map(p => p.specialization))].sort();

  // Filter and search data
  const filteredData = data.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = filterRank === 'all' || person.rank === filterRank;
    const matchesSpecialization = filterSpecialization === 'all' || person.specialization === filterSpecialization;
    
    return matchesSearch && matchesRank && matchesSpecialization;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'ready') return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Ready</Badge>;
    if (statusLower === 'training') return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Training</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-red-200">Not Ready</Badge>;
  };

  const getMedicalBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'fit') return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Fit</Badge>;
    if (statusLower === 'limited duty') return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Limited</Badge>;
    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Review</Badge>;
  };

  const getSkillBadge = (level: string) => {
    const levelLower = level.toLowerCase();
    if (levelLower === 'expert') return <Badge className="bg-violet-100 text-violet-800 border-violet-200">Expert</Badge>;
    if (levelLower === 'advanced') return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">Advanced</Badge>;
    if (levelLower === 'intermediate') return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Intermediate</Badge>;
    return <Badge className="bg-stone-100 text-stone-800 border-stone-200">Beginner</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-stone-600 font-medium">Total Personnel</CardTitle>
            <Users className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-stone-800 font-semibold">{totalPersonnel.toLocaleString()}</div>
            <p className="text-xs text-stone-500">Active service members</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-stone-600 font-medium">Mission Ready</CardTitle>
            <Target className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-stone-800 font-semibold">{activePersonnel.toLocaleString()}</div>
            <p className="text-xs text-stone-500">{((activePersonnel / totalPersonnel) * 100).toFixed(1)}% readiness rate</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-stone-600 font-medium">High Performers</CardTitle>
            <Award className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-stone-800 font-semibold">{highPerformers.toLocaleString()}</div>
            <p className="text-xs text-stone-500">Training score ≥85</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-stone-600 font-medium">Leadership Pool</CardTitle>
            <Shield className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-stone-800 font-semibold">{leadershipCandidates.toLocaleString()}</div>
            <p className="text-xs text-stone-500">High leadership potential</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-amber-100">Personnel Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, ID, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200"
              />
            </div>
            
            <Select value={filterRank} onValueChange={setFilterRank}>
              <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-slate-200">
                <SelectValue placeholder="Filter by Rank" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-200">All Ranks</SelectItem>
                {ranks.map(rank => (
                  <SelectItem key={rank} value={rank} className="text-slate-200">{rank}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
              <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-slate-200">
                <SelectValue placeholder="Filter by Specialization" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-200">All Specializations</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec} className="text-slate-200">{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Table */}
          <div className="border border-slate-700 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Personnel</TableHead>
                  <TableHead className="text-slate-300">Rank</TableHead>
                  <TableHead className="text-slate-300">Specialization</TableHead>
                  <TableHead className="text-slate-300">Experience</TableHead>
                  <TableHead className="text-slate-300">Skill Level</TableHead>
                  <TableHead className="text-slate-300">Medical</TableHead>
                  <TableHead className="text-slate-300">Mission Status</TableHead>
                  <TableHead className="text-slate-300">Training Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((person) => (
                  <TableRow key={person.id} className="border-slate-700">
                    <TableCell>
                      <div>
                        <div className="text-slate-200">{person.name}</div>
                        <div className="text-sm text-slate-400">{person.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{person.rank}</TableCell>
                    <TableCell className="text-slate-300">{person.specialization}</TableCell>
                    <TableCell className="text-slate-300">{person.experience} years</TableCell>
                    <TableCell>{getSkillBadge(person.skillLevel)}</TableCell>
                    <TableCell>{getMedicalBadge(person.medicalStatus)}</TableCell>
                    <TableCell>{getStatusBadge(person.missionReadiness)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300">{person.trainingScore}</span>
                        <div className="w-16 h-2 bg-slate-700 rounded-full">
                          <div 
                            className="h-2 bg-amber-500 rounded-full" 
                            style={{width: `${person.trainingScore}%`}}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} personnel
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};