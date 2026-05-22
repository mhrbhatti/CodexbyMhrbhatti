import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chapterAPI } from '../services/api';
import './SelectPages.css';

const MCQ_OPTIONS = [5, 10, 15, 20, 30];

export default function SelectChapterPage() {
  const { classNo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [mcqCount, setMcqCount] = useState(10);
  const [customCount, setCustomCount] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Lock: if user's class doesn't match, redirect
  useEffect(() => {
    if (user?.enrolledClass && user.enrolledClass !== classNo) {
      navigate(`/select-chapter/${user.enrolledClass}`, { replace: true });
    }
  }, [user, classNo, navigate]);

  useEffect(() => {
    chapterAPI.getChapters(classNo)
      .then(res => setChapters(res.data.chapters || []))
      .catch(() => setError('Failed to load chapters. Please try again.'))
      .finally(() => setLoading(false));
  }, [classNo]);

  const handleChapterClick = (ch) => {
    setSelectedChapter(ch);
    setMcqCount(Math.min(10, ch.totalMCQs));
    setUseCustom(false);
    setCustomCount('');
  };

  const handleStart = () => {
    if (!selectedChapter) return;
    const finalCount = useCustom
      ? (parseInt(customCount) || 10)
      : mcqCount;
    const count = Math.min(Math.max(1, finalCount), selectedChapter.totalMCQs);
    navigate(`/test/${classNo}/${selectedChapter.chapterNo}`, {
      state: {
        chapterName: selectedChapter.chapterName,
        mcqLimit: count,
        totalAvailable: selectedChapter.totalMCQs
      }
    });
  };

  const handleCustomInput = (val) => {
    setCustomCount(val);
    setUseCustom(true);
  };

  const getEffectiveCount = () => {
    if (!selectedChapter) return 0;
    const raw = useCustom ? parseInt(customCount) : mcqCount;
    return Math.min(Math.max(1, raw || 1), selectedChapter.totalMCQs);
  };

  if (user?.enrolledClass && user.enrolledClass !== classNo) return null;

  return (
    <div className="container select-page fade-in">
      <div className="select-header">
        <div className="select-breadcrumb">
          <span className="font-mono text-accent">Class {classNo}</span>
          <span style={{ color: 'var(--text3)', margin: '0 8px' }}>/</span>
          <span className="text-muted">Computer Science</span>
        </div>
        <h1 className="select-title">Select Chapter</h1>
        <p className="text-muted text-sm">Choose a chapter, then set how many MCQs you want to attempt</p>
      </div>

      {loading ? (
        <div className="chapter-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />
          ))}
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', borderColor: 'rgba(239,68,68,0.3)' }}>
          <p className="text-red">{error}</p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : chapters.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/6478/6478103.png" alt="empty" style={{ width: 64, opacity: 0.4, marginBottom: 12 }} />
          <p className="text-muted">No chapters found for Class {classNo}.</p>
        </div>
      ) : (
        <>
          <div className="chapter-grid">
            {chapters.map((ch, i) => (
              <button
                key={ch.chapterNo}
                className={`chapter-card card fade-in ${selectedChapter?.chapterNo === ch.chapterNo ? 'chapter-selected' : ''}`}
                onClick={() => handleChapterClick(ch)}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="chapter-num font-mono">Chapter {ch.chapterNo}</div>
                <div className="chapter-name">{ch.chapterName}</div>
                <div className="chapter-footer">
                  <span className="badge badge-blue">{ch.totalMCQs} MCQs</span>
                  {selectedChapter?.chapterNo === ch.chapterNo ? (
                    <svg width="18" height="18" fill="var(--accent)" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="arrow-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* MCQ Count selector — shown after chapter selected */}
          {selectedChapter && (
            <div className="mcq-count-panel card card-glow fade-in">
              <div className="mcq-count-header">
                <div>
                  <h3 className="mcq-count-title">
                    Number of MCQs
                    <span className="font-mono text-accent" style={{ marginLeft: 8, fontSize: '0.85rem' }}>
                      — {selectedChapter.chapterName}
                    </span>
                  </h3>
                  <p className="text-muted text-xs" style={{ marginTop: 3 }}>
                    {selectedChapter.totalMCQs} questions available in this chapter
                  </p>
                </div>
                <div className="selected-count-badge">
                  <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent2)', lineHeight: 1 }}>
                    {getEffectiveCount()}
                  </span>
                  <span className="text-xs text-muted" style={{ marginTop: 2 }}>MCQs</span>
                </div>
              </div>

              {/* Quick select pills */}
              <div className="count-pills">
                {MCQ_OPTIONS.filter(n => n <= selectedChapter.totalMCQs).map(n => (
                  <button
                    key={n}
                    className={`count-pill ${!useCustom && mcqCount === n ? 'active' : ''}`}
                    onClick={() => { setMcqCount(n); setUseCustom(false); setCustomCount(''); }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className={`count-pill ${!useCustom && mcqCount === selectedChapter.totalMCQs ? 'active' : ''}`}
                  onClick={() => { setMcqCount(selectedChapter.totalMCQs); setUseCustom(false); setCustomCount(''); }}
                >
                  All ({selectedChapter.totalMCQs})
                </button>
              </div>

              {/* Custom input */}
              <div className="count-custom">
                <label className="label" style={{ marginBottom: 6 }}>Or enter a custom number</label>
                <div className="count-custom-row">
                  <input
                    className={`input count-input ${useCustom ? 'input-active' : ''}`}
                    type="number"
                    min={1}
                    max={selectedChapter.totalMCQs}
                    placeholder={`1 – ${selectedChapter.totalMCQs}`}
                    value={customCount}
                    onChange={e => handleCustomInput(e.target.value)}
                  />
                  <span className="text-muted text-sm" style={{ whiteSpace: 'nowrap' }}>
                    max {selectedChapter.totalMCQs}
                  </span>
                </div>
              </div>

              {/* Start button */}
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 8 }}
                onClick={handleStart}
              >
                Start Test &mdash; {getEffectiveCount()} MCQs
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
