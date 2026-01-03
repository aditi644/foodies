import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.hero}>
          <h1 style={styles.title}>FoodHub</h1>
          <p style={styles.subtitle}>Your favorite food, delivered to your door</p>
          <p style={styles.tagline}>Discover amazing restaurants and order delicious meals with just a few taps</p>
        </div>
        
        <div style={styles.buttonContainer}>
          <button 
            onClick={() => navigate('/login')} 
            style={styles.primaryButton}
            className="landing-button"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')} 
            style={styles.secondaryButton}
            className="landing-button"
          >
            Sign Up
          </button>
        </div>

        <div style={styles.features}>
          <div style={styles.feature} className="feature-card">
            <div style={styles.featureIcon}>🍕</div>
            <h3 style={styles.featureTitle}>Top Restaurants</h3>
            <p style={styles.featureText}>Order from the best restaurants in town</p>
          </div>
          <div style={styles.feature} className="feature-card">
            <div style={styles.featureIcon}>🚀</div>
            <h3 style={styles.featureTitle}>Fast Delivery</h3>
            <p style={styles.featureText}>Get your food delivered in minutes</p>
          </div>
          <div style={styles.feature} className="feature-card">
            <div style={styles.featureIcon}>💳</div>
            <h3 style={styles.featureTitle}>Secure Payments</h3>
            <p style={styles.featureText}>Safe and secure payment options</p>
          </div>
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
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    padding: theme.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
    zIndex: 1,
    animation: 'fadeIn 0.6s ease',
  },
  hero: {
    marginBottom: theme.spacing['3xl'],
  },
  title: {
    fontSize: theme.fontSizes['4xl'],
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.heading,
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  subtitle: {
    fontSize: theme.fontSizes['2xl'],
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.secondary,
    fontWeight: theme.fontWeights.medium,
  },
  tagline: {
    fontSize: theme.fontSizes.base,
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: theme.fonts.primary,
    lineHeight: 1.6,
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing.md,
    justifyContent: 'center',
    marginBottom: theme.spacing['3xl'],
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.extraBold,
    backgroundColor: theme.colors.textInverse,
    color: theme.colors.primary,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    transition: theme.transitions.bounce,
    boxShadow: theme.shadows.xl,
    fontFamily: theme.fonts.heading,
    minWidth: '150px',
  },
  secondaryButton: {
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.extraBold,
    backgroundColor: 'transparent',
    color: theme.colors.textInverse,
    border: `3px solid ${theme.colors.textInverse}`,
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    transition: theme.transitions.bounce,
    fontFamily: theme.fonts.heading,
    minWidth: '150px',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: theme.spacing.lg,
    marginTop: theme.spacing['2xl'],
  },
  feature: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.xl,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: theme.transitions.normal,
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: theme.spacing.xs,
  },
  featureTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.extraBold,
    color: theme.colors.textInverse,
    margin: 0,
    fontFamily: theme.fonts.heading,
  },
  featureText: {
    fontSize: theme.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    fontFamily: theme.fonts.primary,
    lineHeight: 1.5,
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .landing-button:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
  
  .landing-button:active {
    transform: translateY(-2px) scale(1.02);
  }
  
  .feature-card:hover {
    transform: translateY(-8px);
    background-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;
if (!document.getElementById('landing-styles')) {
  styleSheet.id = 'landing-styles';
  document.head.appendChild(styleSheet);
}

export default Landing;
