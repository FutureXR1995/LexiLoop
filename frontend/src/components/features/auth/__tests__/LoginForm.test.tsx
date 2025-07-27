import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

// Mock the auth service
jest.mock('@/services/authService', () => ({
  login: jest.fn(),
}));

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuthActions: () => ({
    login: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form elements', () => {
    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/remember me/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur event

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const mockLogin = require('@/hooks/useAuth').useAuthActions().login;
    mockLogin.mockResolvedValueOnce({ success: true });

    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle login error', async () => {
    const user = userEvent.setup();
    const mockLogin = require('@/hooks/useAuth').useAuthActions().login;
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should handle remember me checkbox', async () => {
    const user = userEvent.setup();
    const mockLogin = require('@/hooks/useAuth').useAuthActions().login;
    mockLogin.mockResolvedValueOnce({ success: true });

    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(rememberMeCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });
  });

  it('should disable form during submission', async () => {
    const user = userEvent.setup();
    const mockLogin = require('@/hooks/useAuth').useAuthActions().login;
    // Mock a slow login process
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Form should be disabled during submission
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });
});