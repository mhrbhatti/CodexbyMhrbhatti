import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resultAPI } from '../services/api';
import './DashboardPage.css';

const StatCard = ({ label, value, sub, accent }) => (
  <div className={`stat-card card ${accent ? 'stat-accent' : ''}`}>
    <div className="stat-value" style={accent ? { color: 'var(--accent2)' } : {}}>{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const getBadge = (score) => {
  if (score >= 80) return { label: 'Excellent', cls: 'badge-green' };
  if (score >= 60) return { label: 'Good', cls: 'badge-blue' };
  if (score >= 40) return { label: 'Average', cls: 'badge-yellow' };
  return { label: 'Needs Work', cls: 'badge-red' };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resultAPI.getResults()
      .then(res => setResults(res.data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalTests = results.length;
  const avgScore = totalTests > 0
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalTests)
    : 0;
  const bestScore = totalTests > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const totalMCQs = results.reduce((s, r) => s + (r.totalQuestions || 0), 0);

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="container dashboard fade-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
            <span className="dash-name"> {user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>
            CodexbyMhrbhatti
            {user?.enrolledClass && <> &mdash; <span className="text-accent font-mono">Class {user.enrolledClass}</span></>}
          </p>
        </div>
        <Link to="/new-test" className="btn btn-primary">
          Start New Test
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Tests Taken" value={totalTests} accent />
        <StatCard label="Average Score" value={`${avgScore}%`} sub={avgScore >= 60 ? 'Passing' : 'Below Pass'} />
        <StatCard label="Best Score" value={`${bestScore}%`} />
        <StatCard label="Total MCQs" value={totalMCQs} sub="attempted" />
      </div>

      {/* CTA if no class selected */}
      {!user?.enrolledClass && (
        <div className="card no-class-banner">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2436/2436874.png"
            alt="class"
            className="no-class-img"
          />
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>No class assigned to your account</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
              Please contact your teacher or admin to assign a class to your account before you can take tests.
            </p>
          </div>
        </div>
      )}

      {/* Recent Results */}
      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Recent Tests</h2>
          {results.length > 0 && (
            <Link to="/history" className="btn btn-ghost btn-sm">View All</Link>
          )}
        </div>

        {loading ? (
          <div className="results-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <img
              src="https://cdn-icons-png.flaticon.com/512/6478/6478103.png"
              alt="no tests"
              className="empty-img"
            />
            <p className="text-muted">No tests taken yet. Start your first test now.</p>
            <Link to="/new-test" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
              Take a Test
            </Link>
          </div>
        ) : (
          <div className="results-list">
            {results.slice(0, 5).map((r, i) => {
              const badge = getBadge(r.score);
              return (
                <div key={r._id} className="result-row card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="result-row-left">
                    <div className="result-chapter-num font-mono">Ch.{r.chapterNo}</div>
                    <div>
                      <div className="result-chapter-name">{r.chapterName}</div>
                      <div className="text-xs text-muted">
                        Class {r.class} &bull; {formatDate(r.completedAt)} &bull; {r.totalQuestions} questions
                      </div>
                    </div>
                  </div>
                  <div className="result-row-right">
                    <div className="result-score">{r.score}%</div>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
