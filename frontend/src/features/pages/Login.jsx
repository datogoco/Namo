import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
  };

  const handleSocialLogin = provider => {
    setSocialLoading(true);
    const backendOrigin = import.meta.env.VITE_BACKEND_URL;
    if (!backendOrigin) {
      // eslint-disable-next-line no-console
      console.error("VITE_BACKEND_URL is not set");
      setSocialLoading(false);
      return;
    }
    const target = `${backendOrigin}/auth/${provider}`;
    // eslint-disable-next-line no-console
    console.log('[SOCIAL] Redirecting to', target);
    window.location.href = target;
  };

  return (
    <main>
      <section className="section-login">
        <div className="login-container" data-error-message={error || undefined}>
          <div id="loading-spinner" className="loading-spinner" style={{ display: loading ? 'flex' : 'none' }}>
            <div className="spinner"></div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="login-text-box">
              <h2 className="heading-secondary-log">Login</h2>
              <p className="login-text">Log in with your social media</p>
              <div className="social-media-container">
                <button
                  type="button"
                  className="social-media--btn"
                  aria-label="Login with Google"
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading}
                >
                  <i className="fa-brands fa-google fa-xl"></i>
                </button>
                <button
                  type="button"
                  className="social-media--btn"
                  aria-label="Login with Facebook"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={socialLoading}
                >
                  <i className="fa-brands fa-facebook-f fa-xl"></i>
                </button>
                <button
                  type="button"
                  className="social-media--btn"
                  aria-label="Login with Linkedin"
                  onClick={() => handleSocialLogin('linkedin')}
                  disabled={socialLoading}
                >
                  <i className="fa-brands fa-linkedin-in fa-xl"></i>
                </button>
              </div>
              <p className="login-text">or</p>
              {error && <div className="form-error" role="alert">{error}</div>}
              <div className="login-form">
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    name="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
              <button type="submit" className="sign-in--btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <div>
                <p className="new-customer-txt">
                  New customer?
                  <Link className="create-account--btn" to="/signup">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;
