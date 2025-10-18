export enum ExamType {
  MAINS = 'JEE Mains',
  ADVANCED = 'JEE Advanced',
}

export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  section: 'Physics' | 'Chemistry' | 'Mathematics';
  diagramBase64?: string;
}
