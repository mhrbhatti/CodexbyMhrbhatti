import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resultAPI } from '../services/api';
import './HistoryPage.css';

const getBadge = (score) => {
  if (score >= 80) return { label: 'Excellent', cls: 'badge-green' };
  if (score >= 60) return { label: 'Good', cls: 'badge-blue' };
  if (score >= 40) return { label: 'Average', cls: 'badge-yellow' };
  return { label: 'Needs Work', cls: 'badge-red' };
};

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (s) => {
  if (!s) return '-';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export default function HistoryPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | 9 | 10 | 11 | 12
  const navigate = useNavigate();

  useEffect(() => {
    resultAPI.getResults()
      .then(res => setResults(res.data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? results : results.filter(r => r.class === filter);

  const totalTests = results.length;
  const avgScore = totalTests > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalTests) : 0;
  const bestScore = totalTests > 0 ? Math.max(...results.map(r => r.score)) : 0;

  return (
    <div className="container history-page fade-in">
      <div className="history-header">
        <div>
          <h1 className="history-title">Test History</h1>
          <p className="text-muted text-sm">All your previous Computer Science tests</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/new-test')}>
          New Test
        </button>
      </div>

      {/* Summary strip */}
      {!loading && results.length > 0 && (
        <div className="history-summary">
          <div className="h-stat">
            <div className="h-stat-val font-mono">{totalTests}</div>
            <div className="h-stat-lbl">Tests</div>
          </div>
          <div className="h-stat-div" />
          <div className="h-stat">
            <div className="h-stat-val font-mono text-accent">{avgScore}%</div>
            <div className="h-stat-lbl">Average</div>
          </div>
          <div className="h-stat-div" />
          <div className="h-stat">
            <div className="h-stat-val font-mono text-green">{bestScore}%</div>
            <div className="h-stat-lbl">Best</div>
          </div>
        </div>
      )}

      {/* Filter */}
      {!loading && results.length > 0 && (
        <div className="filter-bar">
          {['all', '9', '10', '11', '12'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Classes' : `Class ${f}`}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="history-list">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card history-empty">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6478/6478103.png"
            alt="empty"
            style={{ width: 72, opacity: 0.4, marginBottom: 12 }}
          />
          <p className="text-muted">
            {results.length === 0 ? 'No tests taken yet.' : `No tests found for Class ${filter}.`}
          </p>
          {results.length === 0 && (
            <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/new-test')}>
              Start First Test
            </button>
          )}
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((r, i) => {
            const badge = getBadge(r.score);
            return (
              <div
                key={r._id}
                className="history-row card fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="history-row-left">
                  <div className="history-ch-badge font-mono">
                    <span className="history-class-label">Class</span>
                    <span className="history-class-num">{r.class}</span>
                  </div>
                  <div className="history-info">
                    <div className="history-chapter-name">{r.chapterName}</div>
                    <div className="history-meta text-xs text-muted">
                      Chapter {r.chapterNo} &bull; {formatDate(r.completedAt)} &bull; {r.totalQuestions} MCQs
                      {r.timeTaken > 0 && <> &bull; {formatTime(r.timeTaken)}</>}
                    </div>
                  </div>
                </div>

                <div className="history-row-right">
                  <div className="history-score-wrap">
                    <div className="history-score font-mono">{r.score}%</div>
                    <div className="history-sub-stats text-xs text-muted">
                      <span className="text-green">{r.correctAnswers}C</span>
                      {' / '}
                      <span className="text-red">{r.wrongAnswers}W</span>
                      {r.skipped > 0 && <>{' / '}<span className="text-yellow">{r.skipped}S</span></>}
                    </div>
                  </div>
                  <span className={`badge ${badge.cls}`}>{badge.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
