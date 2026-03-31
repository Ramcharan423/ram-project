import { useState, useCallback } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import WebcamCapture from '@/components/WebcamCapture';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveStudent } from '@/lib/store';
import { loadModels, detectFace } from '@/lib/faceRecognition';

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export default function RegisterStudent() {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleCapture = useCallback(async (video: HTMLVideoElement) => {
    if (!name || !rollNumber || !department || !semester) {
      toast.error('Please fill in all fields before capturing face');
      return;
    }

    setIsProcessing(true);
    try {
      await loadModels();
      const detection = await detectFace(video);

      if (!detection) {
        toast.error('No face detected. Please position your face within the frame.');
        return;
      }

      // Capture photo from video
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const photoUrl = canvas.toDataURL('image/jpeg', 0.8);

      saveStudent({
        id: crypto.randomUUID(),
        name,
        rollNumber,
        department,
        semester,
        faceDescriptor: Array.from(detection.descriptor),
        photoUrl,
        registeredAt: new Date().toISOString(),
      });

      toast.success(`${name} registered successfully!`);
      setRegistered(true);

      // Reset form after delay
      setTimeout(() => {
        setName('');
        setRollNumber('');
        setDepartment('');
        setSemester('');
        setRegistered(false);
      }, 2000);
    } catch (err) {
      toast.error('Failed to process face. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [name, rollNumber, department, semester]);

  return (
    <div>
      <PageHeader
        title="Register Student"
        description="Capture student face and details for attendance tracking"
        icon={UserPlus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold text-foreground">Student Information</h2>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter student name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roll">Roll Number</Label>
            <Input id="roll" value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. CS2024001" />
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
              <SelectContent>
                {semesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {registered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success"
            >
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Student registered successfully!</p>
            </motion.div>
          )}
        </motion.div>

        {/* Camera */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Face Capture</h2>
          <WebcamCapture
            onCapture={handleCapture}
            isProcessing={isProcessing}
            captureLabel="Register Face"
          />
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Position your face within the oval frame and click capture
          </p>
        </motion.div>
      </div>
    </div>
  );
}
