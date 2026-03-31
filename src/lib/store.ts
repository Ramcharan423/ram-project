// Simple localStorage-based store for the attendance system

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  semester: string;
  faceDescriptor: number[] | null;
  photoUrl: string | null;
  registeredAt: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  courses: string[];
  phone: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  verifiedBy: string;
  confidence: number;
}

const STUDENTS_KEY = 'fras_students';
const FACULTY_KEY = 'fras_faculty';
const ATTENDANCE_KEY = 'fras_attendance';

function getItem<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Students
export const getStudents = (): Student[] => getItem<Student>(STUDENTS_KEY, []);
export const saveStudent = (student: Student) => {
  const students = getStudents();
  students.push(student);
  setItem(STUDENTS_KEY, students);
};
export const updateStudent = (id: string, updates: Partial<Student>) => {
  const students = getStudents().map(s => s.id === id ? { ...s, ...updates } : s);
  setItem(STUDENTS_KEY, students);
};
export const deleteStudent = (id: string) => {
  setItem(STUDENTS_KEY, getStudents().filter(s => s.id !== id));
};

// Faculty
export const getFaculty = (): Faculty[] => getItem<Faculty>(FACULTY_KEY, []);
export const saveFaculty = (faculty: Faculty) => {
  const list = getFaculty();
  list.push(faculty);
  setItem(FACULTY_KEY, list);
};
export const updateFaculty = (id: string, updates: Partial<Faculty>) => {
  const list = getFaculty().map(f => f.id === id ? { ...f, ...updates } : f);
  setItem(FACULTY_KEY, list);
};
export const deleteFaculty = (id: string) => {
  setItem(FACULTY_KEY, getFaculty().filter(f => f.id !== id));
};

// Attendance
export const getAttendance = (): AttendanceRecord[] => getItem<AttendanceRecord>(ATTENDANCE_KEY, []);
export const saveAttendance = (record: AttendanceRecord) => {
  const records = getAttendance();
  records.push(record);
  setItem(ATTENDANCE_KEY, records);
};
export const getAttendanceByDate = (date: string) => getAttendance().filter(r => r.date === date);
export const getAttendanceByStudent = (studentId: string) => getAttendance().filter(r => r.studentId === studentId);
