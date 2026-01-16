export enum StudentStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

export enum IdeaStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected'
}

export interface Student {
  _id: string;
  fullName: string;
  email: string;
  studentId?: string;
  department: string;
  program?: string;
  year?: string;
  isActive: boolean;
  avatar?: string;
  totalIdeas: number;
  approvedIdeas: number;
  pendingIdeas: number;
  rejectedIdeas: number;
  status: StudentStatus;
  lastActivityDate?: string;
  recentIdeas: Idea[];
}

export interface Idea {
  _id: string;
  id?: string;
  title: string;
  domain: string;
  status: IdeaStatus;
  submissionDate?: string;
  createdAt?: string;
}
