import { useState, useMemo } from 'react';
import { GraduationCap, Trash2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getStudents, deleteStudent } from '@/lib/store';

export default function StudentsList() {
  const [students, setStudents] = useState(() => getStudents());
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
    ), [students, search]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove ${name}? This cannot be undone.`)) {
      deleteStudent(id);
      setStudents(getStudents());
      toast.success(`${name} removed`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Registered Students"
        description={`${students.length} students registered in the system`}
        icon={GraduationCap}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="pl-10" />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No students found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-start gap-3">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-14 h-14 rounded-xl object-cover border border-border" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{student.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{student.rollNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">{student.department} · {student.semester} Sem</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id, student.name)} className="text-destructive/60 hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
