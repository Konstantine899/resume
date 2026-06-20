export interface DeveloperSkills {
  frontend: string[];
  backend: string[];
  testing: string[];
  devops: string[];
  methodologies: string[];
  architecture: string[];
}

export interface DeveloperProfile {
  fullName: string;
  profession: string;
  specialties: string[];
  skillsLabel: string;
  skills?: DeveloperSkills;
  yearsOfExperience: number;
  age: number;
}
