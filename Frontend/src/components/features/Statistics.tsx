import { useEffect, useState } from 'react';
import { MapPin, BookOpen, Users, Building } from 'lucide-react';
import { collegeService } from '../../services/collegeService';
import { courseService } from '../../services/courseService';

function formatCount(n: number, suffix = '+'): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K${suffix}`;
  return `${n}${suffix}`;
}

export function Statistics() {
  const [collegeCount, setCollegeCount] = useState<number | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [cityCount, setCityCount] = useState<number | null>(null);
  const [avgPlacement, setAvgPlacement] = useState<number | null>(null);

  useEffect(() => {
    collegeService.getColleges({ limit: 100 }).then((r) => {
      setCollegeCount(r.pagination.total);
      const cities = new Set(r.colleges.map((c) => c.location.city));
      setCityCount(cities.size);
      if (r.colleges.length) {
        setAvgPlacement(Math.round(r.colleges.reduce((s, c) => s + c.placementRate, 0) / r.colleges.length));
      }
    }).catch(() => {});
    courseService.getCourses({ limit: 1, page: 1 }).then((r) => setCourseCount(r.total)).catch(() => {});
  }, []);

  const stats = [
    { value: collegeCount !== null ? formatCount(collegeCount) : '—', label: 'Colleges Listed', icon: <Building className="w-5 h-5" /> },
    {
      value: courseCount !== null ? formatCount(courseCount) : '—',
      label: 'Courses Available',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      value: cityCount !== null ? `${cityCount}+` : '—',
      label: 'Cities Covered',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      value: avgPlacement !== null ? `${avgPlacement}%` : '—',
      label: 'Avg Placement Rate',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-display-sm md:text-display-md font-heading font-semibold text-white mb-4">
            Numbers That Matter
          </h2>
          <p className="text-body text-white/70 max-w-xl mx-auto">
            Our growing community of students and institutions trust EduVista for their educational journey.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 lg:p-8 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                {stat.icon}
              </div>
              <p className="text-display-sm font-heading font-semibold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-body-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
