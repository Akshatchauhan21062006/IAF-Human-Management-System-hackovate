import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, Award, AlertTriangle } from 'lucide-react';

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

interface WorkforceAnalyticsProps {
  data: PersonnelData[];
}

export const WorkforceAnalytics: React.FC<WorkforceAnalyticsProps> = ({ data }) => {
  const analytics = useMemo(() => {
    // Age distribution
    const ageGroups = data.reduce((acc, person) => {
      const ageGroup = person.age < 30 ? '<30' : person.age < 40 ? '30-39' : person.age < 50 ? '40-49' : '50+';
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ageDistribution = Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    // Experience distribution
    const experienceGroups = data.reduce((acc, person) => {
      const expGroup = person.experience < 5 ? '0-4' : person.experience < 10 ? '5-9' : person.experience < 15 ? '10-14' : '15+';
      acc[expGroup] = (acc[expGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const experienceDistribution = Object.entries(experienceGroups).map(([range, count]) => ({
      range: `${range} years`,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    // Rank distribution
    const rankDistribution = data.reduce((acc, person) => {
      acc[person.rank] = (acc[person.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const rankData = Object.entries(rankDistribution)
      .map(([rank, count]) => ({
        rank,
        count,
        percentage: ((count / data.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);

    // Specialization distribution
    const specializationDistribution = data.reduce((acc, person) => {
      acc[person.specialization] = (acc[person.specialization] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const specializationData = Object.entries(specializationDistribution)
      .map(([specialization, count]) => ({
        specialization,
        count,
        percentage: ((count / data.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 specializations

    // Skill level distribution
    const skillLevels = data.reduce((acc, person) => {
      acc[person.skillLevel] = (acc[person.skillLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const skillData = Object.entries(skillLevels).map(([level, count]) => ({
      level,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    // Training score distribution
    const trainingScoreGroups = data.reduce((acc, person) => {
      const scoreGroup = person.trainingScore >= 90 ? '90-100' : 
                        person.trainingScore >= 80 ? '80-89' : 
                        person.trainingScore >= 70 ? '70-79' : 
                        person.trainingScore >= 60 ? '60-69' : '<60';
      acc[scoreGroup] = (acc[scoreGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trainingData = Object.entries(trainingScoreGroups).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    // Readiness status
    const readinessStats = data.reduce((acc, person) => {
      acc[person.missionReadiness] = (acc[person.missionReadiness] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const readinessData = Object.entries(readinessStats).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    // Medical status
    const medicalStats = data.reduce((acc, person) => {
      acc[person.medicalStatus] = (acc[person.medicalStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const medicalData = Object.entries(medicalStats).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    // Leadership potential
    const leadershipStats = data.reduce((acc, person) => {
      acc[person.leadershipPotential] = (acc[person.leadershipPotential] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadershipData = Object.entries(leadershipStats).map(([potential, count]) => ({
      potential,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    return {
      ageDistribution,
      experienceDistribution,
      rankData,
      specializationData,
      skillData,
      trainingData,
      readinessData,
      medicalData,
      leadershipData
    };
  }, [data]);

  const COLORS = ['#7c3aed', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#84cc16'];

  const averageTrainingScore = data.reduce((sum, person) => sum + person.trainingScore, 0) / data.length;
  const averageExperience = data.reduce((sum, person) => sum + person.experience, 0) / data.length;
  const readyPersonnel = data.filter(p => p.missionReadiness?.toLowerCase() === 'ready').length;
  const highPerformers = data.filter(p => p.trainingScore >= 85).length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-stone-600 font-medium">Avg Training Score</CardTitle>
            <Award className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-stone-800 font-semibold">{averageTrainingScore.toFixed(1)}</div>
            <Progress value={averageTrainingScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-stone-600 font-medium">Avg Experience</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-stone-800 font-semibold">{averageExperience.toFixed(1)} yrs</div>
            <p className="text-xs text-stone-500">Years of service</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-stone-600 font-medium">Mission Ready</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-stone-800 font-semibold">{((readyPersonnel / data.length) * 100).toFixed(1)}%</div>
            <p className="text-xs text-stone-500">{readyPersonnel} personnel</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-stone-600 font-medium">High Performers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-stone-800 font-semibold">{((highPerformers / data.length) * 100).toFixed(1)}%</div>
            <p className="text-xs text-stone-500">{highPerformers} personnel</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-stone-800 font-semibold">Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="range" stroke="#57534e" />
                <YAxis stroke="#57534e" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                  labelStyle={{ color: '#1c1917' }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Experience Distribution */}
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-stone-800 font-semibold">Experience Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.experienceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="range" stroke="#57534e" />
                <YAxis stroke="#57534e" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                  labelStyle={{ color: '#1c1917' }}
                />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rank Distribution */}
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-stone-800 font-semibold">Rank Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.rankData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ rank, percentage }) => `${rank}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.rankData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                  labelStyle={{ color: '#1c1917' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Level Distribution */}
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-stone-800 font-semibold">Skill Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.skillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="level" stroke="#57534e" />
                <YAxis stroke="#57534e" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                  labelStyle={{ color: '#1c1917' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Scores */}
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-stone-800 font-semibold">Training Score Ranges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.trainingData.map((item) => (
              <div key={item.range} className="flex items-center justify-between">
                <span className="text-stone-700 font-medium">{item.range}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-stone-500">{item.count}</span>
                  <Badge variant="outline" className="text-violet-700 border-violet-300 bg-violet-50">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mission Readiness */}
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-stone-800 font-semibold">Mission Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.readinessData.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-stone-700 font-medium">{item.status}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-stone-500">{item.count}</span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      item.status.toLowerCase() === 'ready' ? 'text-emerald-700 border-emerald-300 bg-emerald-50' :
                      item.status.toLowerCase() === 'training' ? 'text-amber-700 border-amber-300 bg-amber-50' :
                      'text-red-700 border-red-300 bg-red-50'
                    }`}
                  >
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leadership Potential */}
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-stone-800 font-semibold">Leadership Potential</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.leadershipData.map((item) => (
              <div key={item.potential} className="flex items-center justify-between">
                <span className="text-stone-700 font-medium">{item.potential}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-stone-500">{item.count}</span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      item.potential.toLowerCase() === 'high' ? 'text-cyan-700 border-cyan-300 bg-cyan-50' :
                      item.potential.toLowerCase() === 'medium' ? 'text-amber-700 border-amber-300 bg-amber-50' :
                      'text-stone-700 border-stone-300 bg-stone-50'
                    }`}
                  >
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Specializations */}
      <Card className="bg-white border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-stone-800 font-semibold">Top Specializations</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.specializationData} layout="horizontal" margin={{ left: 120, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis type="number" stroke="#57534e" />
              <YAxis dataKey="specialization" type="category" stroke="#57534e" width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                labelStyle={{ color: '#1c1917' }}
              />
              <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};