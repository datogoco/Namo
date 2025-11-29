import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signup(form);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Signup failed. Please try again.');
    }
  };

  const handleSocialSignup = provider => {
    setSocialLoading(true);
    const backendOrigin = import.meta.env.VITE_BACKEND_URL;
    if (!backendOrigin) {
      // eslint-disable-next-line no-console
      console.error("VITE_BACKEND_URL is not set");
      setSocialLoading(false);
      return;
    }
    const target = `${backendOrigin}/auth/${provider}`;
    // Debug log to confirm the redirect target
    // eslint-disable-next-line no-console
    console.log("[SOCIAL] Redirecting to", target);
    window.location.href = target;
  };

  return (
    <main>
      <section className="section-signup">
        <div className="signup-container">
          {error && <div className="form-error">{error}</div>}

          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="signup-text-box">
              <h2 className="heading-secondary-log">Create Account</h2>
              <p className="signup-text">Sign up with your social media</p>

              <div className="social-media-container">
                <button
                  type="button"
                  className="social-media--btn"
                  aria-label="Signup with Google"
                  onClick={() => handleSocialSignup('google')}
                  disabled={socialLoading}
                >
                  <i className="fa-brands fa-google fa-xl"></i>
                </button>
                <button
                  type="button"
                  className="social-media--btn"
                  aria-label="Signup with Facebook"
                  onClick={() => handleSocialSignup('facebook')}
                  disabled={socialLoading}
                >
                  <i className="fa-brands fa-facebook-f fa-xl"></i>
                </button>
                <button
                  type="button"
                  className="social-media--btn"
                  aria-label="Signup with Linkedin"
                  onClick={() => handleSocialSignup('linkedin')}
                  disabled={socialLoading}
                >
                  <i className="fa-brands fa-linkedin-in fa-xl"></i>
                </button>
              </div>

              <p className="signup-text">or</p>

              <div className="signup-form">
                <div className="signup-form--group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    name="name"
                    className="signup-form--control"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="signup-form--group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    name="email"
                    className="signup-form--control"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="signup-form--group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    name="password"
                    className="signup-form--control"
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="signup-pass-description--container">
                <p className="signup-pass-description--text">
                  Passwords must be at least 8 characters.
                </p>
              </div>

              <button type="submit" className="sign-up--btn" disabled={loading}>
                {loading ? 'Signing up…' : 'Sign up'}
              </button>
              <p className="new-customer-txt" style={{ marginTop: '1rem' }}>
                Already have an account? <Link className="create-account--btn" to="/login">Log in</Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Signup;
