import { useState, useMemo } from 'react';
import { Users, Plus, Trash2, Pencil, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getFaculty, saveFaculty, updateFaculty, deleteFaculty, type Faculty } from '@/lib/store';

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology'];
const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'HOD'];

const emptyForm = { name: '', email: '', department: '', designation: '', phone: '', courses: '' };

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState(() => getFaculty());
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() =>
    faculty.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase())
    ), [faculty, search]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (f: Faculty) => {
    setEditId(f.id);
    setForm({ name: f.name, email: f.email, department: f.department, designation: f.designation, phone: f.phone, courses: f.courses.join(', ') });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.department || !form.designation) {
      toast.error('Please fill all required fields');
      return;
    }

    const courses = form.courses.split(',').map(c => c.trim()).filter(Boolean);

    if (editId) {
      updateFaculty(editId, { ...form, courses });
      toast.success('Faculty updated');
    } else {
      saveFaculty({
        id: crypto.randomUUID(),
        ...form,
        courses,
        createdAt: new Date().toISOString(),
      });
      toast.success('Faculty member added');
    }

    setFaculty(getFaculty());
    setDialogOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove ${name}?`)) {
      deleteFaculty(id);
      setFaculty(getFaculty());
      toast.success(`${name} removed`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Faculty Management"
        description="Manage faculty members, departments, and course assignments"
        icon={Users}
      />

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search faculty..." className="pl-10" />
        </div>
        <Button onClick={openAdd} className="gradient-primary text-primary-foreground border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No faculty members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{f.name}</p>
                  <p className="text-xs text-primary font-medium">{f.designation}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(f)} className="text-muted-foreground hover:text-foreground">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id, f.name)} className="text-destructive/60 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{f.email}</p>
                <p>{f.department} · {f.phone}</p>
                {f.courses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.courses.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Faculty' : 'Add Faculty Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@university.edu" type="email" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Designation *</Label>
                <Select value={form.designation} onValueChange={v => setForm(p => ({ ...p, designation: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2">
              <Label>Courses (comma-separated)</Label>
              <Input value={form.courses} onChange={e => setForm(p => ({ ...p, courses: e.target.value }))} placeholder="Data Structures, Algorithms" />
            </div>
            <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground border-0">
              {editId ? 'Update' : 'Add'} Faculty
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
