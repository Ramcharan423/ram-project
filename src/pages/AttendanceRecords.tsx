import { useState, useMemo } from 'react';
import { ClipboardList, Download, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAttendance } from '@/lib/store';

export default function AttendanceRecords() {
  const allRecords = useMemo(() => getAttendance(), []);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const uniqueDates = useMemo(() => [...new Set(allRecords.map(r => r.date))].sort().reverse(), [allRecords]);

  const filtered = useMemo(() => {
    return allRecords.filter(r => {
      const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(search.toLowerCase());
      const matchDate = dateFilter === 'all' || r.date === dateFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchDate && matchStatus;
    }).reverse();
  }, [allRecords, search, dateFilter, statusFilter]);

  const exportCSV = () => {
    const headers = 'Name,Roll Number,Department,Date,Time,Status,Confidence\n';
    const rows = filtered.map(r =>
      `${r.studentName},${r.rollNumber},${r.department},${r.date},${r.time},${r.status},${r.confidence}%`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <PageHeader
        title="Attendance Records"
        description="View and export attendance history"
        icon={ClipboardList}
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or roll number..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-44">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                {uniqueDates.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Roll No</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Department</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <tr key={record.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{record.studentName}</td>
                    <td className="p-4 font-mono text-muted-foreground">{record.rollNumber}</td>
                    <td className="p-4 text-muted-foreground">{record.department}</td>
                    <td className="p-4 text-muted-foreground">{record.date}</td>
                    <td className="p-4 text-muted-foreground">{record.time}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'present'
                          ? 'bg-success/10 text-success'
                          : record.status === 'late'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{record.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
