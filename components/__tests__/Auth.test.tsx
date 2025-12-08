import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Auth from '../Auth';
import * as firebaseService from '../../services/firebase';

// Mock the firebase service
vi.mock('../../services/firebase', () => ({
  auth: {
    currentUser: null,
  },
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the FaceiQ title', () => {
      render(<Auth />);
      expect(screen.getByText('FaceiQ')).toBeInTheDocument();
    });

    it('should render in login mode by default', () => {
      render(<Auth />);
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render email and password fields', () => {
      render(<Auth />);
      expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('should not render name field in login mode', () => {
      render(<Auth />);
      expect(screen.queryByPlaceholderText('Your Name')).not.toBeInTheDocument();
    });

    it('should not render confirm password field in login mode', () => {
      render(<Auth />);
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      expect(passwordFields).toHaveLength(1);
    });

    it('should render toggle link to create account', () => {
      render(<Auth />);
      expect(screen.getByText('Create an account')).toBeInTheDocument();
    });
  });

  describe('Mode Toggle', () => {
    it('should switch to signup mode when clicking create account', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      const createAccountLink = screen.getByText('Create an account');
      await user.click(createAccountLink);

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should show name field in signup mode', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument();
    });

    it('should show confirm password field in signup mode', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      expect(passwordFields).toHaveLength(2);
    });

    it('should switch back to login mode', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      // Switch to signup
      await user.click(screen.getByText('Create an account'));
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();

      // Switch back to login
      await user.click(screen.getByText('Sign in'));
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should clear error when toggling modes', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      // Trigger an error
      vi.mocked(firebaseService.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credentials',
      });

      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'password');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/password or email incorrect/i)).toBeInTheDocument();
      });

      // Toggle mode
      await user.click(screen.getByText('Create an account'));

      // Error should be cleared
      expect(screen.queryByText(/password or email incorrect/i)).not.toBeInTheDocument();
    });
  });

  describe('Login Flow', () => {
    it('should call signInWithEmailAndPassword on form submit', async () => {
      const user = userEvent.setup();
      vi.mocked(firebaseService.signInWithEmailAndPassword).mockResolvedValue({
        user: { uid: '123', email: 'test@example.com', displayName: 'Test', photoURL: null },
      });

      render(<Auth />);

      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(firebaseService.signInWithEmailAndPassword).toHaveBeenCalledWith(
          firebaseService.auth,
          'test@example.com',
          'password123'
        );
      });
    });

    it('should display error for invalid credentials', async () => {
      const user = userEvent.setup();
      vi.mocked(firebaseService.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credentials',
      });

      render(<Auth />);

      await user.type(screen.getByPlaceholderText('name@example.com'), 'wrong@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/password or email incorrect/i)).toBeInTheDocument();
      });
    });

    it('should require email field', () => {
      render(<Auth />);
      const emailInput = screen.getByPlaceholderText('name@example.com');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should require password field', () => {
      render(<Auth />);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('Signup Flow', () => {
    it('should call createUserWithEmailAndPassword on signup', async () => {
      const user = userEvent.setup();
      const mockUser = { uid: '123', email: 'new@example.com', displayName: null, photoURL: null };
      vi.mocked(firebaseService.createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser });
      vi.mocked(firebaseService.updateProfile).mockResolvedValue(undefined);

      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      await user.type(screen.getByPlaceholderText('Your Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'new@example.com');

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'password123');
      await user.type(passwordFields[1], 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(firebaseService.createUserWithEmailAndPassword).toHaveBeenCalledWith(
          firebaseService.auth,
          'new@example.com',
          'password123'
        );
      });
    });

    it('should update profile with display name after signup', async () => {
      const user = userEvent.setup();
      const mockUser = { uid: '123', email: 'new@example.com', displayName: null, photoURL: null };
      vi.mocked(firebaseService.createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser });
      vi.mocked(firebaseService.updateProfile).mockResolvedValue(undefined);

      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      await user.type(screen.getByPlaceholderText('Your Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'new@example.com');

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'password123');
      await user.type(passwordFields[1], 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(firebaseService.updateProfile).toHaveBeenCalledWith(mockUser, {
          displayName: 'John Doe',
        });
      });
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      await user.type(screen.getByPlaceholderText('Your Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'new@example.com');

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'password123');
      await user.type(passwordFields[1], 'differentpassword');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      expect(firebaseService.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should display error for weak password', async () => {
      const user = userEvent.setup();
      vi.mocked(firebaseService.createUserWithEmailAndPassword).mockRejectedValue({
        code: 'auth/weak-password',
        message: 'Weak password',
      });

      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      await user.type(screen.getByPlaceholderText('Your Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'new@example.com');

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], '12345');
      await user.type(passwordFields[1], '12345');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/password should be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should display error for existing user', async () => {
      const user = userEvent.setup();
      vi.mocked(firebaseService.createUserWithEmailAndPassword).mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      });

      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      await user.type(screen.getByPlaceholderText('Your Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('name@example.com'), 'existing@example.com');

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'password123');
      await user.type(passwordFields[1], 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/user already exists. sign in\?/i)).toBeInTheDocument();
      });
    });

    it('should require name field in signup mode', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      const nameInput = screen.getByPlaceholderText('Your Name');
      expect(nameInput).toHaveAttribute('required');
    });

    it('should require confirm password field in signup mode', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      expect(passwordFields[1]).toHaveAttribute('required');
    });
  });

  describe('Error Handling', () => {
    it('should display generic error message for unknown errors', async () => {
      const user = userEvent.setup();
      vi.mocked(firebaseService.signInWithEmailAndPassword).mockRejectedValue({
        code: 'unknown-error',
        message: 'Something went wrong',
      });

      render(<Auth />);

      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });

    it('should clear previous error on new submit', async () => {
      const user = userEvent.setup();
      vi.mocked(firebaseService.signInWithEmailAndPassword)
        .mockRejectedValueOnce({
          code: 'auth/invalid-credential',
          message: 'Invalid credentials',
        })
        .mockResolvedValueOnce({
          user: { uid: '123', email: 'test@example.com', displayName: 'Test', photoURL: null },
        });

      render(<Auth />);

      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/password or email incorrect/i)).toBeInTheDocument();
      });

      // Clear and retry
      await user.clear(screen.getByPlaceholderText('••••••••'));
      await user.type(screen.getByPlaceholderText('••••••••'), 'correctpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.queryByText(/password or email incorrect/i)).not.toBeInTheDocument();
      });
    });

    it('should display error with alert icon', async () => {
      const user = userEvent.setup();
      vi.mocked(firebaseService.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credentials',
      });

      render(<Auth />);

      await user.type(screen.getByPlaceholderText('name@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should have email input with type email', () => {
      render(<Auth />);
      const emailInput = screen.getByPlaceholderText('name@example.com');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have password inputs with type password', () => {
      render(<Auth />);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should prevent form submission without email', () => {
      render(<Auth />);
      const emailInput = screen.getByPlaceholderText('name@example.com');
      expect(emailInput).toBeRequired();
    });

    it('should prevent form submission without password', () => {
      render(<Auth />);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('UI Elements', () => {
    it('should render icons for form fields', () => {
      render(<Auth />);

      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('should render user icon in signup mode', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      await user.click(screen.getByText('Create an account'));

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should render chevron icon on submit button', () => {
      render(<Auth />);
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('should have styled submit button', () => {
      render(<Auth />);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveClass('bg-brand-primary');
    });
  });
});
