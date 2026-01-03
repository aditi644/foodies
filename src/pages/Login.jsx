import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { theme } from '../styles/theme';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      const userRole = user.user_metadata?.role;
      if (!userRole) {
        navigate('/role-selection');
      } else {
        navigate('/home');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn(formData.email, formData.password);
    
    if (result.success) {
      const userRole = result.data.user.user_metadata?.role;
      if (!userRole) {
        navigate('/role-selection');
      } else {
        navigate('/home');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back!</h2>
          <p style={styles.subtitle}>Login to continue your food journey</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>
              Sign up
            </Link>
          </p>
          <p style={styles.footerText}>
            <Link to="/forgot-password" style={styles.link}>
              Forgot password?
            </Link>
          </p>
        </div>

        <div style={styles.backLink}>
          <Link to="/" style={styles.link}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundImage: "url('../assets/main.jpg')",
    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
    // backgroundRepeat: 'no-repeat',
    //background: `linear-gradient(135deg, ${theme.colors.surfaceSecondary} 0%, ${theme.colors.surfaceTertiary} 100%)`,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    
    padding: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.xl,
    width: '100%',
    maxWidth: '450px',
    animation: 'fadeIn 0.4s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.heading,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.primary,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    display: 'block',
    marginBottom: theme.spacing.sm,
    fontWeight: theme.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.heading,
  },
  input: {
    width: '100%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${theme.colors.border}`,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.primary,
    boxSizing: 'border-box',
    transition: theme.transitions.normal,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
  },
  submitButton: {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    color: theme.colors.textInverse,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.extraBold,
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.heading,
    transition: theme.transitions.bounce,
    boxShadow: theme.shadows.md,
  },
  footer: {
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  },
  footerText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    margin: `${theme.spacing.xs} 0`,
    fontFamily: theme.fonts.primary,
  },
  link: {
    color: theme.colors.primary,
    textDecoration: 'none',
    fontWeight: theme.fontWeights.semiBold,
    transition: theme.transitions.normal,
  },
  backLink: {
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 30px rgba(226, 55, 68, 0.4);
  }
  
  .submit-button:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }
  
  input:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(226, 55, 68, 0.1);
  }
`;
if (!document.getElementById('login-styles')) {
  styleSheet.id = 'login-styles';
  document.head.appendChild(styleSheet);
}

export default Login;
