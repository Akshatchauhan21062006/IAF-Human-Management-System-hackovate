import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Brain, Target, Users, Award } from 'lucide-react';
import { calculateReadinessScore, predictAttritionRisk, generateTrainingRecommendations } from './utils/dataParser';

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

interface PredictiveAnalyticsProps {
  data: PersonnelData[];
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ data }) => {
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [forecastPeriod, setForecastPeriod] = useState('12');

  const analytics = useMemo(() => {
    const filteredData = selectedSpecialization === 'all' 
      ? data 
      : data.filter(p => p.specialization === selectedSpecialization);

    // Attrition Risk Analysis
    const attritionRisks = filteredData.map(person => ({
      ...person,
      attritionRisk: predictAttritionRisk(person),
      readinessScore: calculateReadinessScore(person)
    }));

    const riskDistribution = attritionRisks.reduce((acc, person) => {
      acc[person.attritionRisk] = (acc[person.attritionRisk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Leadership Pipeline
    const leadershipPipeline = filteredData
      .filter(p => p.leadershipPotential?.toLowerCase() === 'high')
      .map(person => ({
        ...person,
        readinessScore: calculateReadinessScore(person),
        promotionReadiness: person.experience >= 5 && person.trainingScore >= 80 ? 'Ready' : 
                           person.experience >= 3 && person.trainingScore >= 70 ? 'Developing' : 'Not Ready'
      }))
      .sort((a, b) => b.readinessScore - a.readinessScore);

    // Training Needs Analysis
    const trainingNeeds = filteredData.reduce((acc, person) => {
      const recommendations = generateTrainingRecommendations(person);
      recommendations.forEach(rec => {
        acc[rec] = (acc[rec] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const trainingPriorities = Object.entries(trainingNeeds)
      .map(([training, count]) => ({ training, count, priority: count / filteredData.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Skill Gap Analysis
    const skillLevels = filteredData.reduce((acc, person) => {
      acc[person.skillLevel] = (acc[person.skillLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const skillGaps = {
      expert: (skillLevels['Expert'] || 0) / filteredData.length * 100,
      advanced: (skillLevels['Advanced'] || 0) / filteredData.length * 100,
      intermediate: (skillLevels['Intermediate'] || 0) / filteredData.length * 100,
      beginner: (skillLevels['Beginner'] || 0) / filteredData.length * 100
    };

    // Performance Trends (simulated based on current data)
    const performanceTrend = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - 11 + i);
      const avgScore = filteredData.reduce((sum, p) => sum + p.trainingScore, 0) / filteredData.length;
      // Add some variation to simulate trends
      const variation = (Math.sin(i * 0.5) * 5) + (Math.random() * 4 - 2);
      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        avgScore: Math.max(60, Math.min(100, avgScore + variation)),
        readiness: Math.max(60, Math.min(100, (attritionRisks.filter(p => p.missionReadiness === 'Ready').length / filteredData.length * 100) + variation))
      };
    });

    // Retirement Forecast
    const retirementForecast = filteredData
      .filter(p => p.age >= 45 || p.experience >= 20)
      .map(person => ({
        ...person,
        yearsToRetirement: Math.max(1, 60 - person.age),
        retirementRisk: person.age >= 55 ? 'High' : person.age >= 50 ? 'Medium' : 'Low'
      }))
      .sort((a, b) => a.yearsToRetirement - b.yearsToRetirement);

    // Deployment Readiness Forecast
    const deploymentReadiness = filteredData.map(person => ({
      specialization: person.specialization,
      readiness: calculateReadinessScore(person),
      count: 1
    }));

    const specializationReadiness = deploymentReadiness.reduce((acc, item) => {
      if (!acc[item.specialization]) {
        acc[item.specialization] = { total: 0, readinessSum: 0, count: 0 };
      }
      acc[item.specialization].readinessSum += item.readiness;
      acc[item.specialization].count += 1;
      return acc;
    }, {} as Record<string, { readinessSum: number; count: number }>);

    const specializationData = Object.entries(specializationReadiness).map(([spec, data]) => ({
      specialization: spec,
      avgReadiness: data.readinessSum / data.count,
      personnel: data.count
    })).sort((a, b) => b.avgReadiness - a.avgReadiness);

    return {
      attritionRisks,
      riskDistribution,
      leadershipPipeline: leadershipPipeline.slice(0, 10),
      trainingPriorities,
      skillGaps,
      performanceTrend,
      retirementForecast: retirementForecast.slice(0, 15),
      specializationData
    };
  }, [data, selectedSpecialization]);

  const specializations = [...new Set(data.map(p => p.specialization))].sort();

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];
  const SKILL_COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-300 mb-2 block">Filter by Specialization</label>
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-slate-200">All Specializations</SelectItem>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec} className="text-slate-200">{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-300 mb-2 block">Forecast Period</label>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="6" className="text-slate-200">6 Months</SelectItem>
                  <SelectItem value="12" className="text-slate-200">12 Months</SelectItem>
                  <SelectItem value="24" className="text-slate-200">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Predictive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">High Attrition Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-100">
              {analytics.attritionRisks.filter(p => p.attritionRisk === 'High').length}
            </div>
            <p className="text-xs text-slate-400">
              {((analytics.attritionRisks.filter(p => p.attritionRisk === 'High').length / analytics.attritionRisks.length) * 100).toFixed(1)}% of personnel
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Leadership Ready</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-100">
              {analytics.leadershipPipeline.filter(p => p.promotionReadiness === 'Ready').length}
            </div>
            <p className="text-xs text-slate-400">Promotion candidates</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Training Priority</CardTitle>
            <Brain className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-100">
              {analytics.trainingPriorities[0]?.count || 0}
            </div>
            <p className="text-xs text-slate-400">{analytics.trainingPriorities[0]?.training || 'No priority'}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-slate-300">Retirement Risk</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-100">
              {analytics.retirementForecast.filter(p => p.retirementRisk === 'High').length}
            </div>
            <p className="text-xs text-slate-400">Next {forecastPeriod} months</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Performance & Readiness Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Line type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={2} name="Avg Training Score" />
                <Line type="monotone" dataKey="readiness" stroke="#10b981" strokeWidth={2} name="Mission Readiness %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attrition Risk Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Attrition Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.riskDistribution).map(([risk, count]) => ({ risk, count }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ risk, count }) => `${risk}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {Object.keys(analytics.riskDistribution).map((entry, index) => (
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

        {/* Training Priorities */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Training Priorities</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.trainingPriorities} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="training" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Specialization Readiness */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Readiness by Specialization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={analytics.specializationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="personnel" stroke="#9ca3af" name="Personnel Count" />
                <YAxis dataKey="avgReadiness" stroke="#9ca3af" name="Avg Readiness" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                  formatter={(value, name) => [value, name === 'avgReadiness' ? 'Avg Readiness' : name]}
                />
                <Scatter dataKey="avgReadiness" fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leadership Pipeline */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Leadership Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.leadershipPipeline.map((person, index) => (
                <div key={person.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex-1">
                    <div className="text-slate-200">{person.name}</div>
                    <div className="text-sm text-slate-400">{person.rank} • {person.specialization}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm text-slate-300">{person.readinessScore}/100</div>
                      <Progress value={person.readinessScore} className="w-16 h-2" />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        person.promotionReadiness === 'Ready' ? 'text-green-200 border-green-500' :
                        person.promotionReadiness === 'Developing' ? 'text-yellow-200 border-yellow-500' :
                        'text-red-200 border-red-500'
                      }`}
                    >
                      {person.promotionReadiness}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retirement Forecast */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-amber-100">Retirement Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.retirementForecast.map((person) => (
                <div key={person.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex-1">
                    <div className="text-slate-200">{person.name}</div>
                    <div className="text-sm text-slate-400">{person.rank} • {person.age} years old</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm text-slate-300">{person.yearsToRetirement} years</div>
                      <div className="text-xs text-slate-400">{person.experience} yrs exp</div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        person.retirementRisk === 'High' ? 'text-red-200 border-red-500' :
                        person.retirementRisk === 'Medium' ? 'text-yellow-200 border-yellow-500' :
                        'text-green-200 border-green-500'
                      }`}
                    >
                      {person.retirementRisk}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};