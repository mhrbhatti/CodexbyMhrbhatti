import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { mcqAPI, resultAPI } from '../services/api';
import './TestPage.css';

const SECONDS_PER_QUESTION = 60;

export default function TestPage() {
  const { classNo, chapterNo } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const chapterName = location.state?.chapterName || `Chapter ${chapterNo}`;
  const mcqLimit = location.state?.mcqLimit || 0;
  const totalAvailable = location.state?.totalAvailable || 0;

  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { mcqId: { selected, timeTaken } }
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    mcqAPI.getMCQs(classNo, chapterNo, mcqLimit)
      .then(res => {
        setMcqs(res.data.mcqs || []);
      })
      .catch(() => setError('Failed to load questions. Please go back and try again.'))
      .finally(() => setLoading(false));
  }, [classNo, chapterNo, mcqLimit]);

  // Per-question timer
  useEffect(() => {
    if (!mcqs.length || loading) return;
    setTimeLeft(SECONDS_PER_QUESTION);
    setQuestionStartTime(Date.now());

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSkip();
          return SECONDS_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line
  }, [currentIndex, mcqs.length, loading]);

  const handleAutoSkip = useCallback(() => {
    clearInterval(timerRef.current);
    const mcq = mcqs[currentIndex];
    if (!mcq) return;
    setAnswers(prev => ({
      ...prev,
      [mcq._id]: { selected: null, timeTaken: SECONDS_PER_QUESTION }
    }));
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, mcqs]);

  const handleSelect = (optionKey) => {
    const mcq = mcqs[currentIndex];
    if (answers[mcq._id]?.selected !== undefined && answers[mcq._id]?.selected !== null) return;
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    clearInterval(timerRef.current);
    setAnswers(prev => ({
      ...prev,
      [mcq._id]: { selected: optionKey, timeTaken }
    }));
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    const mcq = mcqs[currentIndex];
    // Mark as skipped if unanswered
    if (!answers[mcq._id]) {
      const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
      setAnswers(prev => ({
        ...prev,
        [mcq._id]: { selected: null, timeTaken }
      }));
    }
    setCurrentIndex(i => i + 1);
  };

  const handlePrev = () => {
    clearInterval(timerRef.current);
    setCurrentIndex(i => i - 1);
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    setShowConfirm(false);

    try {
      const answersArr = mcqs.map(mcq => ({
        mcqId: mcq._id,
        selectedAnswer: answers[mcq._id]?.selected || null,
        timeTaken: answers[mcq._id]?.timeTaken || 0
      }));

      const res = await mcqAPI.submitAnswers({
        class: classNo,
        chapterNo: parseInt(chapterNo),
        answers: answersArr
      });

      const result = res.data.result;

      // Save result
      await resultAPI.saveResult({
        class: classNo,
        chapterNo: parseInt(chapterNo),
        chapterName,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        skipped: result.skipped,
        score: result.score,
        timeTaken: Object.values(answers).reduce((s, a) => s + (a.timeTaken || 0), 0),
        attempts: result.attempts
      });

      navigate('/result', { state: { result, chapterName, classNo, chapterNo } });
    } catch (err) {
      setError('Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="test-loading">
      <div className="spinner" />
      <p className="text-muted" style={{ marginTop: 16 }}>Loading questions...</p>
    </div>
  );

  if (error) return (
    <div className="test-loading">
      <p className="text-red" style={{ marginBottom: 16 }}>{error}</p>
      <button className="btn btn-ghost" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  if (!mcqs.length) return (
    <div className="test-loading">
      <p className="text-muted">No questions found.</p>
      <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const mcq = mcqs[currentIndex];
  const answered = answers[mcq._id];
  const progress = ((currentIndex + 1) / mcqs.length) * 100;
  const timerPct = (timeLeft / SECONDS_PER_QUESTION) * 100;
  const answeredCount = Object.values(answers).filter(a => a.selected !== null).length;
  const isLast = currentIndex === mcqs.length - 1;
  const timerColor = timeLeft <= 10 ? 'var(--red)' : timeLeft <= 20 ? 'var(--yellow)' : 'var(--accent)';

  const optionLabels = { a: 'A', b: 'B', c: 'C', d: 'D' };

  return (
    <div className="test-page grid-bg">
      {/* Header */}
      <div className="test-header">
        <div className="test-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(true)}>
            Exit Test
          </button>
          <div className="test-meta">
            <span className="font-mono text-xs text-muted">Class {classNo}</span>
            <span className="text-muted" style={{ margin: '0 6px' }}>|</span>
            <span className="text-xs text-muted">{chapterName}</span>
          </div>
        </div>
        <div className="test-header-right">
          <div className="answered-count text-xs text-muted">
            <span className="text-accent font-mono font-bold">{answeredCount}</span>/{mcqs.length} answered
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Main area */}
      <div className="test-body">
        {/* Question panel */}
        <div className="question-panel fade-in" key={currentIndex}>
          <div className="question-top">
            <div className="question-counter">
              <span className="font-mono text-accent font-bold">{currentIndex + 1}</span>
              <span className="text-muted text-sm"> / {mcqs.length}</span>
            </div>

            {/* Circular timer */}
            <div className="timer-circle" style={{ '--timer-color': timerColor }}>
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border2)" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="22"
                  fill="none"
                  stroke={timerColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="138.2"
                  strokeDashoffset={138.2 * (1 - timerPct / 100)}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
              <span className="timer-text font-mono" style={{ color: timerColor }}>{timeLeft}</span>
            </div>
          </div>

          <p className="question-text">{mcq.question}</p>

          {/* Options */}
          <div className="options-list">
            {Object.entries(mcq.options).map(([key, val]) => {
              let state = 'default';
              if (answered) {
                if (answered.selected === key) state = 'selected';
                else state = 'dimmed';
              }
              return (
                <button
                  key={key}
                  className={`option-btn ${state}`}
                  onClick={() => handleSelect(key)}
                  disabled={!!answered}
                >
                  <span className="option-label font-mono">{optionLabels[key]}</span>
                  <span className="option-text">{val}</span>
                  {answered?.selected === key && (
                    <span className="option-check">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="test-nav">
            <button
              className="btn btn-ghost"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            <div className="nav-dots">
              {mcqs.map((_, i) => {
                const a = answers[mcqs[i]._id];
                let dotClass = 'dot';
                if (i === currentIndex) dotClass += ' dot-current';
                else if (a?.selected) dotClass += ' dot-answered';
                else if (a?.selected === null) dotClass += ' dot-skipped';
                return <span key={i} className={dotClass} onClick={() => setCurrentIndex(i)} />;
              })}
            </div>

            {isLast ? (
              <button
                className="btn btn-primary"
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
              >
                {submitting ? <><div className="spinner spinner-sm" /> Submitting...</> : 'Submit Test'}
              </button>
            ) : (
              <button className="btn btn-outline" onClick={handleNext}>
                {answered ? 'Next' : 'Skip'}
              </button>
            )}
          </div>
        </div>

        {/* Side panel: question map (desktop only) */}
        <div className="question-map">
          <div className="card">
            <h3 className="map-title">Questions</h3>
            <div className="map-grid">
              {mcqs.map((q, i) => {
                const a = answers[q._id];
                let cls = 'map-btn';
                if (i === currentIndex) cls += ' map-current';
                else if (a?.selected) cls += ' map-answered';
                else if (a?.selected === null) cls += ' map-skipped';
                return (
                  <button key={i} className={cls} onClick={() => setCurrentIndex(i)}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="map-legend">
              <div className="legend-item"><span className="legend-dot map-answered" />Answered</div>
              <div className="legend-item"><span className="legend-dot map-skipped" />Skipped</div>
              <div className="legend-item"><span className="legend-dot" />Pending</div>
            </div>

            <div className="divider" style={{ margin: '16px 0' }} />

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => !submitting && setShowConfirm(false)}>
          <div className="modal card scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              {isLast ? 'Submit Test?' : 'Exit Test?'}
            </h2>
            <p className="text-muted text-sm" style={{ marginBottom: 20 }}>
              {isLast
                ? `You have answered ${answeredCount} of ${mcqs.length} questions. Unanswered questions will be marked as skipped.`
                : 'Are you sure you want to exit? Your progress will be lost.'}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)} disabled={submitting}>
                Cancel
              </button>
              {isLast ? (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><div className="spinner spinner-sm" /> Submitting...</> : 'Submit Test'}
                </button>
              ) : (
                <button className="btn btn-danger" onClick={() => navigate(-1)}>
                  Exit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
