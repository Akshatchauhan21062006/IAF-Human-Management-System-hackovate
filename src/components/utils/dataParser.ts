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

export const parseCSVData = async (file: File): Promise<PersonnelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('File must contain at least a header row and one data row'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data: PersonnelData[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length !== headers.length) continue;
          
          const record: any = {};
          headers.forEach((header, index) => {
            const value = values[index];
            
            // Map common header variations to standard fields
            const normalizedHeader = normalizeHeader(header);
            
            // Convert numeric fields
            if (['experience', 'age', 'trainingscore', 'score'].includes(normalizedHeader.toLowerCase())) {
              record[normalizedHeader] = parseFloat(value) || 0;
            } else {
              record[normalizedHeader] = value || '';
            }
          });
          
          // Ensure required fields exist with defaults
          const personnelRecord: PersonnelData = {
            id: record.id || record.ID || `IAF${String(i).padStart(4, '0')}`,
            name: record.name || record.Name || record.fullname || record.FullName || `Personnel ${i}`,
            rank: record.rank || record.Rank || record.grade || record.Grade || 'Officer',
            branch: record.branch || record.Branch || record.service || record.Service || 'Air Force',
            specialization: record.specialization || record.Specialization || record.specialty || record.Specialty || 'General',
            experience: record.experience || record.Experience || record.yearsofservice || record.YearsOfService || Math.floor(Math.random() * 20) + 1,
            age: record.age || record.Age || Math.floor(Math.random() * 20) + 25,
            medicalStatus: record.medicalstatus || record.MedicalStatus || record.medical || record.Medical || ['Fit', 'Under Review', 'Limited Duty'][Math.floor(Math.random() * 3)],
            trainingScore: record.trainingscore || record.TrainingScore || record.score || record.Score || Math.floor(Math.random() * 40) + 60,
            missionReadiness: record.missionreadiness || record.MissionReadiness || record.readiness || record.Readiness || ['Ready', 'Training', 'Not Ready'][Math.floor(Math.random() * 3)],
            lastDeployment: record.lastdeployment || record.LastDeployment || record.deployment || record.Deployment || '2024-01-01',
            skillLevel: record.skilllevel || record.SkillLevel || record.level || record.Level || ['Expert', 'Advanced', 'Intermediate', 'Beginner'][Math.floor(Math.random() * 4)],
            leadershipPotential: record.leadershippotential || record.LeadershipPotential || record.leadership || record.Leadership || ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            ...record
          };
          
          data.push(personnelRecord);
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
};

export const calculateReadinessScore = (personnel: PersonnelData): number => {
  let score = 0;
  
  // Medical status contribution (40%)
  switch (personnel.medicalStatus?.toLowerCase()) {
    case 'fit':
      score += 40;
      break;
    case 'limited duty':
      score += 25;
      break;
    case 'under review':
      score += 10;
      break;
    default:
      score += 20;
  }
  
  // Training score contribution (30%)
  score += (personnel.trainingScore / 100) * 30;
  
  // Experience contribution (20%)
  const expScore = Math.min(personnel.experience / 20, 1) * 20;
  score += expScore;
  
  // Skill level contribution (10%)
  switch (personnel.skillLevel?.toLowerCase()) {
    case 'expert':
      score += 10;
      break;
    case 'advanced':
      score += 8;
      break;
    case 'intermediate':
      score += 6;
      break;
    case 'beginner':
      score += 4;
      break;
    default:
      score += 5;
  }
  
  return Math.round(score);
};

export const predictAttritionRisk = (personnel: PersonnelData): 'Low' | 'Medium' | 'High' => {
  let riskScore = 0;
  
  // Age factor
  if (personnel.age > 45) riskScore += 2;
  else if (personnel.age > 40) riskScore += 1;
  
  // Experience factor
  if (personnel.experience > 15) riskScore += 2;
  else if (personnel.experience > 10) riskScore += 1;
  
  // Medical status
  if (personnel.medicalStatus?.toLowerCase() !== 'fit') riskScore += 1;
  
  // Training score
  if (personnel.trainingScore < 70) riskScore += 1;
  
  // Mission readiness
  if (personnel.missionReadiness?.toLowerCase() === 'not ready') riskScore += 1;
  
  if (riskScore >= 4) return 'High';
  if (riskScore >= 2) return 'Medium';
  return 'Low';
};

export const generateTrainingRecommendations = (personnel: PersonnelData): string[] => {
  const recommendations: string[] = [];
  
  if (personnel.trainingScore < 70) {
    recommendations.push('Core Skills Refresher Training');
  }
  
  if (personnel.skillLevel?.toLowerCase() === 'beginner' || personnel.skillLevel?.toLowerCase() === 'intermediate') {
    recommendations.push('Advanced Technical Training');
  }
  
  if (personnel.leadershipPotential?.toLowerCase() === 'high' && personnel.experience > 5) {
    recommendations.push('Leadership Development Program');
  }
  
  if (personnel.missionReadiness?.toLowerCase() === 'training') {
    recommendations.push('Mission Readiness Assessment');
  }
  
  const daysSinceDeployment = Math.floor((new Date().getTime() - new Date(personnel.lastDeployment).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceDeployment > 365) {
    recommendations.push('Deployment Readiness Training');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Maintenance Training');
  }
  
  return recommendations;
};