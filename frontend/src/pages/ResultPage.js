import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './ResultPage.css';

const optionLabels = { a: 'A', b: 'B', c: 'C', d: 'D' };

const ScoreRing = ({ score }) => {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--accent2)' : score >= 40 ? 'var(--yellow)' : 'var(--red)';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs Work';

  return (
    <div className="score-ring-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--border2)" strokeWidth="10" />
        <circle
          cx="90" cy="90" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="score-ring-inner">
        <div className="score-ring-value font-mono" style={{ color }}>{score}%</div>
        <div className="score-ring-label" style={{ color }}>{label}</div>
      </div>
    </div>
  );
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, chapterName, classNo, chapterNo } = location.state || {};
  const [activeTab, setActiveTab] = useState('summary'); // summary | wrong | all

  if (!result) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p className="text-muted">No result data found.</p>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const wrongAttempts = result.attempts?.filter(a => !a.isCorrect && a.selectedAnswer) || [];
  const skippedAttempts = result.attempts?.filter(a => !a.selectedAnswer) || [];
  const correctAttempts = result.attempts?.filter(a => a.isCorrect) || [];

  const formatTime = (s) => {
    if (!s) return '0s';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="container result-page fade-in">
      {/* Top */}
      <div className="result-top">
        <div className="result-top-left">
          <div className="result-breadcrumb text-xs text-muted font-mono">
            Class {classNo} / {chapterName}
          </div>
          <h1 className="result-title">Test Complete</h1>
          <p className="text-muted text-sm">Here's how you performed</p>
        </div>
        <div className="result-actions">
          <button
            className="btn btn-outline"
            onClick={() => navigate(`/test/${classNo}/${chapterNo}`, { state: { chapterName } })}
          >
            Retry
          </button>
          <Link to="/select-class" className="btn btn-primary">New Test</Link>
        </div>
      </div>

      <div className="result-layout">
        {/* Score card */}
        <div className="score-card card card-glow">
          <ScoreRing score={result.score} />
          <div className="score-stats">
            <div className="score-stat">
              <div className="score-stat-val text-green font-mono">{result.correctAnswers}</div>
              <div className="score-stat-label">Correct</div>
            </div>
            <div className="score-stat">
              <div className="score-stat-val text-red font-mono">{result.wrongAnswers}</div>
              <div className="score-stat-label">Wrong</div>
            </div>
            <div className="score-stat">
              <div className="score-stat-val text-yellow font-mono">{result.skipped}</div>
              <div className="score-stat-label">Skipped</div>
            </div>
            <div className="score-stat">
              <div className="score-stat-val font-mono">{result.totalQuestions}</div>
              <div className="score-stat-label">Total</div>
            </div>
          </div>
          {result.timeTaken > 0 && (
            <div className="time-taken text-sm text-muted" style={{ marginTop: 12, textAlign: 'center' }}>
              Time taken: <span className="font-mono text-accent">{formatTime(result.timeTaken)}</span>
            </div>
          )}
        </div>

        {/* Review panel */}
        <div className="review-panel">
          <div className="tabs">
            <button className={`tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
              Summary
            </button>
            <button className={`tab ${activeTab === 'wrong' ? 'active' : ''}`} onClick={() => setActiveTab('wrong')}>
              Wrong ({wrongAttempts.length})
            </button>
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All Questions
            </button>
          </div>

          <div className="review-content">
            {activeTab === 'summary' && (
              <div className="summary-tab fade-in">
                <div className="summary-row">
                  <span className="text-muted text-sm">Chapter</span>
                  <span className="font-semibold text-sm">{chapterName}</span>
                </div>
                <div className="summary-row">
                  <span className="text-muted text-sm">Total Questions</span>
                  <span className="font-mono font-bold">{result.totalQuestions}</span>
                </div>
                <div className="summary-row">
                  <span className="text-muted text-sm">Correct Answers</span>
                  <span className="font-mono font-bold text-green">{result.correctAnswers}</span>
                </div>
                <div className="summary-row">
                  <span className="text-muted text-sm">Wrong Answers</span>
                  <span className="font-mono font-bold text-red">{result.wrongAnswers}</span>
                </div>
                <div className="summary-row">
                  <span className="text-muted text-sm">Skipped</span>
                  <span className="font-mono font-bold text-yellow">{result.skipped}</span>
                </div>
                <div className="summary-row">
                  <span className="text-muted text-sm">Score</span>
                  <span className="font-mono font-bold" style={{ fontSize: '1.1rem' }}>{result.score}%</span>
                </div>
                {wrongAttempts.length > 0 && (
                  <div className="wrong-hint card" style={{ marginTop: 20, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
                    <p className="text-sm" style={{ marginBottom: 8 }}>
                      You got <span className="text-red font-bold">{wrongAttempts.length}</span> question{wrongAttempts.length > 1 ? 's' : ''} wrong.
                      Review them below.
                    </p>
                    <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('wrong')}>
                      Review Wrong Answers
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wrong' && (
              <div className="fade-in">
                {wrongAttempts.length === 0 ? (
                  <div className="review-empty">
                    <img src="https://cdn-icons-png.flaticon.com/512/2583/2583344.png" alt="perfect" style={{ width: 64, opacity: 0.5, marginBottom: 12 }} />
                    <p className="text-muted">No wrong answers. Great job!</p>
                  </div>
                ) : (
                  <div className="mcq-review-list">
                    {wrongAttempts.map((a, i) => (
                      <MCQReviewCard key={i} attempt={a} index={i} type="wrong" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div className="fade-in">
                <div className="mcq-review-list">
                  {result.attempts?.map((a, i) => (
                    <MCQReviewCard key={i} attempt={a} index={i} type="all" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MCQReviewCard({ attempt, index, type }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = attempt.isCorrect ? 'var(--green)' : !attempt.selectedAnswer ? 'var(--yellow)' : 'var(--red)';
  const statusLabel = attempt.isCorrect ? 'Correct' : !attempt.selectedAnswer ? 'Skipped' : 'Wrong';

  return (
    <div className={`mcq-review-card card ${attempt.isCorrect ? 'review-correct' : !attempt.selectedAnswer ? 'review-skipped' : 'review-wrong'}`}>
      <div className="review-card-header" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <div className="review-q-num font-mono" style={{ color: statusColor }}>Q{index + 1}</div>
        <div className="review-q-text">{attempt.question}</div>
        <div className="review-status-wrap">
          <span className={`badge ${attempt.isCorrect ? 'badge-green' : !attempt.selectedAnswer ? 'badge-yellow' : 'badge-red'}`}>
            {statusLabel}
          </span>
          <svg
            width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: 'var(--text3)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="review-card-body fade-in">
          <div className="review-options">
            {Object.entries(attempt.options || {}).map(([key, val]) => {
              let cls = 'review-option';
              if (key === attempt.correctAnswer) cls += ' correct-option';
              if (key === attempt.selectedAnswer && key !== attempt.correctAnswer) cls += ' wrong-option';
              return (
                <div key={key} className={cls}>
                  <span className="review-option-label font-mono">{optionLabels[key]}</span>
                  <span className="review-option-text">{val}</span>
                  {key === attempt.correctAnswer && (
                    <span className="review-correct-tag">Correct Answer</span>
                  )}
                  {key === attempt.selectedAnswer && key !== attempt.correctAnswer && (
                    <span className="review-wrong-tag">Your Answer</span>
                  )}
                </div>
              );
            })}
          </div>
          {attempt.explanation && (
            <div className="explanation">
              <span className="explanation-label">Explanation:</span> {attempt.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
