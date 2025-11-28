// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get Cognito ID token from the auth context
// This function will be called from components that have access to the auth context
let getIdTokenCallback: (() => string | null) | null = null;

export const setGetIdTokenCallback = (callback: () => string | null) => {
  getIdTokenCallback = callback;
};

// Get auth token from localStorage (for backward compatibility with old format)
const getAuthToken = (): string | null => {
  // First try to get Cognito ID token if callback is set
  if (getIdTokenCallback) {
    const idToken = getIdTokenCallback();
    if (idToken) {
      return idToken;
    }
  }
  
  // Fallback to old auth storage format
  const auth = localStorage.getItem('auth');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      return parsed.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Validate session with backend
// TEMPORARILY BYPASSED - Always returns true
export const validateSession = async (): Promise<boolean> => {
  // BYPASS SESSION VALIDATION FOR NOW - Always return true
  return true;

  // ORIGINAL VALIDATION CODE - COMMENTED OUT
  /*
  const token = getAuthToken();
  
  if (!token) {
    return false;
  }

  // Mock validation - check if token exists and is a mock token
  if (token.startsWith('mock-jwt-token-')) {
    return true;
  }

  // For Cognito tokens, validate by checking if token is not expired
  // Cognito tokens are JWTs, so we can decode and check expiration
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      // Decode the payload (second part of JWT)
      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      
      // Check if token is expired
      if (Date.now() >= expirationTime) {
        return false;
      }
      
      // Token is valid (not expired)
      return true;
    }
  } catch (error) {
    console.error('Error validating token:', error);
    // If decode fails, try API validation
  }

  // Real API validation (for when backend is ready)
  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      // Session invalid
      localStorage.removeItem('auth');
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
  */
};

// Password recovery API calls
export const sendPasswordRecoveryCode = async (email: string): Promise<void> => {
  // Mock implementation - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In real implementation, backend generates code and sends email
  // The code is NOT returned to frontend for security
  
  // Mock validation
  if (!email.trim()) {
    throw new Error('Email é obrigatório');
  }

  // Mock success - code is generated on backend and sent via email
  // In production, this would POST to: POST /api/auth/recover-password
  /*
  const response = await fetch(`${API_BASE_URL}/auth/recover-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to send recovery code' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  */
};

export const verifyPasswordRecoveryCode = async (email: string, code: string): Promise<boolean> => {
  // Mock implementation - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock validation - in production this would verify the code
  if (!email.trim() || !code.trim() || code.length !== 6) {
    return false;
  }

  // Mock: accept any 6-digit code for testing
  // In production, this would POST to: POST /api/auth/verify-code
  /*
  const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.valid === true;
  */
  
  return true; // Mock: always return true for testing
};

export const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
  // Mock implementation - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock validation
  if (!email.trim() || !code.trim() || !newPassword.trim()) {
    throw new Error('Todos os campos são obrigatórios');
  }

  if (newPassword.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres');
  }

  // In production, this would POST to: POST /api/auth/reset-password
  /*
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to reset password' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  */
};
