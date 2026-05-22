import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SelectPages.css';

const classes = [
  { no: '9', desc: 'Introduction to CS, Windows, Word Processing', chapters: 3 },
  { no: '10', desc: 'Networks, Databases, Spreadsheets', chapters: 3 },
  { no: '11', desc: 'Number Systems, Boolean Algebra, Architecture', chapters: 3 },
  { no: '12', desc: 'C++ Programming, OOP, Data Structures', chapters: 3 },
];

export default function SelectClassPage() {
  const navigate = useNavigate();
  const { user, updateClass } = useAuth();

  const handleSelect = async (classNo) => {
    try {
      if (user?.enrolledClass !== classNo) await updateClass(classNo);
    } catch {}
    navigate(`/select-chapter/${classNo}`);
  };

  return (
    <div className="container select-page fade-in">
      <div className="select-header">
        <div className="select-breadcrumb">New Test</div>
        <h1 className="select-title">Select Class</h1>
        <p className="text-muted text-sm">Choose the class for your Computer Science test</p>
      </div>

      <div className="class-grid">
        {classes.map((cls, i) => (
          <button
            key={cls.no}
            className={`class-card card ${user?.enrolledClass === cls.no ? 'card-glow current' : ''}`}
            onClick={() => handleSelect(cls.no)}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="class-card-header">
              <div className="class-number">
                <span className="class-no-label font-mono">Class</span>
                <span className="class-no">{cls.no}</span>
              </div>
              {user?.enrolledClass === cls.no && (
                <span className="badge badge-blue">Your Class</span>
              )}
            </div>
            <div className="class-desc">{cls.desc}</div>
            <div className="class-meta">
              <span className="text-xs text-muted">{cls.chapters} chapters available</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="arrow-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="select-hint card">
        <img src="https://cdn-icons-png.flaticon.com/512/3176/3176369.png" alt="info" style={{ width: 32, opacity: 0.6 }} />
        <p className="text-sm text-muted">
          You can take tests from any class regardless of your enrolled class. Your enrolled class is saved for quick access.
        </p>
      </div>
    </div>
  );
}
