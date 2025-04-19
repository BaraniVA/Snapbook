export interface Photo {
  id: string;
  imageData: string; // Base64 encoded image data
  quote: string;
  studentName: string;
  timestamp: Date;
}

export interface Student {
  id: string;
  name: string;
  photoCount: number;
  isCompleted: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalPhotos: number;
  completedSubmissions: number;
}