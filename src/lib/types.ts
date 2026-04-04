export type UserRole = "student" | "recruiter" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  skills?: string[];
  bio?: string;
  location?: string;
  experience?: string;
  company?: string;
  online?: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  salary: string;
  skills: string[];
  description: string;
  postedAt: string;
  applicants: number;
  recruiterId: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  studentId: string;
  studentName: string;
  status: "Applied" | "Shortlisted" | "Interview" | "Offered" | "Rejected";
  appliedAt: string;
  skills: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "application" | "message" | "system";
  read: boolean;
  createdAt: string;
}
