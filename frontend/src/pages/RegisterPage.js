import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', enrolledClass: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (!form.enrolledClass) return setError('Please select your class.');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page grid-bg">
      <div className="auth-glow auth-glow-left" />
      <div className="auth-glow auth-glow-right" />

      <div className="auth-container fade-in">
        <div className="auth-header">
          <div className="auth-logo">CM</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join the MCQ Platform today</p>
        </div>

        <div className="card auth-card">
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="Ali Hassan"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Class <span style={{ color: 'var(--red)' }}>*</span></label>
              <select
                className="input"
                value={form.enrolledClass}
                onChange={e => setForm({ ...form, enrolledClass: e.target.value })}
                style={{ cursor: 'pointer' }}
                required
              >
                <option value="">Select your class</option>
                {['9','10','11','12'].map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
              <p className="text-xs text-muted" style={{ marginTop: 6 }}>
                You will only be able to take tests for your assigned class.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><div className="spinner spinner-sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <div className="divider" />
            <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
