import { useMemo } from 'react';
import { LayoutDashboard, Users, GraduationCap, CalendarCheck, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import { getStudents, getFaculty, getAttendance } from '@/lib/store';

export default function Dashboard() {
  const students = useMemo(() => getStudents(), []);
  const faculty = useMemo(() => getFaculty(), []);
  const attendance = useMemo(() => getAttendance(), []);

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(r => r.date === today);
  const presentToday = todayAttendance.filter(r => r.status === 'present').length;
  const attendanceRate = students.length > 0
    ? Math.round((presentToday / students.length) * 100)
    : 0;

  const stats = [
    { label: 'Total Students', value: students.length, icon: GraduationCap, color: 'gradient-primary' },
    { label: 'Faculty Members', value: faculty.length, icon: Users, color: 'gradient-accent' },
    { label: 'Present Today', value: presentToday, icon: CalendarCheck, color: 'gradient-primary' },
    { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: TrendingUp, color: 'gradient-accent' },
  ];

  const recentActivity = attendance.slice(-5).reverse();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your attendance system"
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No attendance records yet. Start by registering students and marking attendance.
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-success' : record.status === 'late' ? 'bg-warning' : 'bg-destructive'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{record.studentName}</p>
                    <p className="text-xs text-muted-foreground">{record.rollNumber} · {record.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground capitalize">{record.status}</p>
                  <p className="text-xs text-muted-foreground">{record.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
