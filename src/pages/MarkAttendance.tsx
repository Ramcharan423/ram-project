import { useState, useCallback } from 'react';
import { ScanFace, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import WebcamCapture from '@/components/WebcamCapture';
import { getStudents, saveAttendance, type Student } from '@/lib/store';
import { loadModels, detectFace, compareFaces } from '@/lib/faceRecognition';

const MATCH_THRESHOLD = 55; // Minimum confidence for a match

interface MatchResult {
  student: Student;
  confidence: number;
  status: 'present' | 'late';
}

export default function MarkAttendance() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const handleCapture = useCallback(async (video: HTMLVideoElement) => {
    setIsProcessing(true);
    setResult(null);
    setNoMatch(false);

    try {
      await loadModels();
      const detection = await detectFace(video);

      if (!detection) {
        toast.error('No face detected. Please try again.');
        setIsProcessing(false);
        return;
      }

      const students = getStudents();
      if (students.length === 0) {
        toast.error('No students registered. Please register students first.');
        setIsProcessing(false);
        return;
      }

      let bestMatch: Student | null = null;
      let bestConfidence = 0;

      for (const student of students) {
        if (!student.faceDescriptor) continue;
        const confidence = compareFaces(detection.descriptor, student.faceDescriptor);
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = student;
        }
      }

      if (bestMatch && bestConfidence >= MATCH_THRESHOLD) {
        const now = new Date();
        const hour = now.getHours();
        const status = hour >= 9 && hour < 10 ? 'present' : 'late';

        saveAttendance({
          id: crypto.randomUUID(),
          studentId: bestMatch.id,
          studentName: bestMatch.name,
          rollNumber: bestMatch.rollNumber,
          department: bestMatch.department,
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString(),
          status,
          verifiedBy: 'Face Recognition',
          confidence: Math.round(bestConfidence),
        });

        setResult({ student: bestMatch, confidence: bestConfidence, status });
        toast.success(`Attendance marked for ${bestMatch.name}`);
      } else {
        setNoMatch(true);
        toast.error('Face not recognized. Please try again or register first.');
      }
    } catch (err) {
      toast.error('Error during face recognition.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        description="Verify student identity with face recognition"
        icon={ScanFace}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Face Scanner</h2>
          <WebcamCapture
            onCapture={handleCapture}
            isProcessing={isProcessing}
            captureLabel="Verify & Mark Attendance"
          />
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Verification Result</h2>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="match"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10">
                  <CheckCircle className="w-8 h-8 text-success" />
                  <div>
                    <p className="font-semibold text-foreground">Identity Verified</p>
                    <p className="text-sm text-muted-foreground">Confidence: {Math.round(result.confidence)}%</p>
                  </div>
                </div>

                {result.student.photoUrl && (
                  <img
                    src={result.student.photoUrl}
                    alt={result.student.name}
                    className="w-24 h-24 rounded-xl object-cover mx-auto border-2 border-success/20"
                  />
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{result.student.name}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">Roll Number</span>
                    <span className="font-medium text-foreground">{result.student.rollNumber}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium text-foreground">{result.student.department}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-secondary/50">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium capitalize ${result.status === 'present' ? 'text-success' : 'text-warning'}`}>
                      {result.status === 'present' ? (
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Present</span>
                      ) : (
                        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Late</span>
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : noMatch ? (
              <motion.div
                key="no-match"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 p-8"
              >
                <XCircle className="w-16 h-16 text-destructive/60" />
                <p className="text-lg font-semibold text-foreground">No Match Found</p>
                <p className="text-sm text-muted-foreground text-center">
                  Face not recognized. The student may not be registered yet.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 p-8 text-center"
              >
                <ScanFace className="w-16 h-16 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Position a student's face in the camera and click verify
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
