import React from 'react';
import { Plus, Layers, Users, DoorOpen, MoreVertical, ChevronRight } from 'lucide-react';

export default function ClassesPage() {
  const classes = [
    { name: 'Grade 10', code: 'G10', sequence: 10, sections: ['A', 'B', 'C'], students: 120 },
    { name: 'Grade 9', code: 'G09', sequence: 9, sections: ['A', 'B'], students: 85 },
    { name: 'Grade 8', code: 'G08', sequence: 8, sections: ['A', 'B', 'C', 'D'], students: 145 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Classes & Sections</h1>
          <p className="text-text-secondary">Structure your academic grades and divisions</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
          <Plus className="w-5 h-5" />
          <span>New Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {classes.map((cls) => (
          <div key={cls.code} className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden group transition-all hover:border-primary/20">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {cls.sequence}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{cls.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface-background px-2 py-1 rounded-md border border-surface-border">
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span>{cls.sections.length} Sections</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface-background px-2 py-1 rounded-md border border-surface-border">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.students} Students</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {cls.sections.map(s => (
                    <div key={s} className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {s}
                    </div>
                  ))}
                  <button className="w-8 h-8 rounded-full border-2 border-dashed border-text-muted bg-white text-text-muted flex items-center justify-center text-xs font-bold hover:bg-surface-background transition-colors">
                    +
                  </button>
                </div>
                <div className="h-10 w-[1px] bg-surface-border mx-2"></div>
                <button className="p-2 hover:bg-surface-background rounded-full text-text-muted transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
