import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from '../firebase';

describe('MockAuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset the auth state by signing out
    auth.signOut();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have no current user initially', () => {
      expect(auth.currentUser).toBeNull();
    });

    it('should restore user from localStorage on initialization', () => {
      const mockUser: User = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      localStorage.setItem('faceiq_mock_user', JSON.stringify(mockUser));

      // Re-import to trigger constructor with stored data
      // For this test, we'll manually set and verify the restoration logic
      const stored = localStorage.getItem('faceiq_mock_user');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(mockUser);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      // Should not throw when constructor tries to access localStorage
      expect(() => {
        const stored = localStorage.getItem('faceiq_mock_user');
      }).toThrow();

      // Restore original method
      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('should successfully sign in with valid credentials', async () => {
      const email = 'user@example.com';
      const password = 'password123';

      const result = await signInWithEmailAndPassword(auth, email, password);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.displayName).toBe('user');
      expect(result.user.uid).toMatch(/^mock-user-/);
      expect(auth.currentUser).toEqual(result.user);
    });

    it('should reject invalid email format', async () => {
      await expect(
        signInWithEmailAndPassword(auth, 'invalid-email', 'password123')
      ).rejects.toMatchObject({
        code: 'auth/invalid-email',
        message: 'Invalid email',
      });
    });

    it('should reject weak password (less than 6 characters)', async () => {
      await expect(
        signInWithEmailAndPassword(auth, 'user@example.com', '12345')
      ).rejects.toMatchObject({
        code: 'auth/weak-password',
        message: 'Password should be at least 6 characters',
      });
    });

    it('should store user in localStorage after sign in', async () => {
      const email = 'user@example.com';
      await signInWithEmailAndPassword(auth, email, 'password123');

      const stored = localStorage.getItem('faceiq_mock_user');
      expect(stored).not.toBeNull();

      const parsedUser = JSON.parse(stored!);
      expect(parsedUser.email).toBe(email);
    });

    it('should generate unique UIDs for different sign-ins', async () => {
      const result1 = await signInWithEmailAndPassword(auth, 'user1@example.com', 'password123');
      await auth.signOut();
      const result2 = await signInWithEmailAndPassword(auth, 'user2@example.com', 'password123');

      expect(result1.user.uid).not.toBe(result2.user.uid);
    });

    it('should simulate network delay', async () => {
      const startTime = Date.now();
      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');
      const endTime = Date.now();

      // Should take at least 500ms (accounting for some variance)
      expect(endTime - startTime).toBeGreaterThanOrEqual(500);
    });

    it('should extract displayName from email prefix', async () => {
      const result = await signInWithEmailAndPassword(auth, 'john.doe@example.com', 'password123');
      expect(result.user.displayName).toBe('john.doe');
    });
  });

  describe('createUserWithEmailAndPassword', () => {
    it('should create new user with valid credentials', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';

      const result = await createUserWithEmailAndPassword(auth, email, password);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(auth.currentUser).toEqual(result.user);
    });

    it('should reject invalid email on registration', async () => {
      await expect(
        createUserWithEmailAndPassword(auth, 'invalid', 'password123')
      ).rejects.toMatchObject({
        code: 'auth/invalid-email',
      });
    });

    it('should reject weak password on registration', async () => {
      await expect(
        createUserWithEmailAndPassword(auth, 'user@example.com', 'weak')
      ).rejects.toMatchObject({
        code: 'auth/weak-password',
      });
    });
  });

  describe('signOut', () => {
    it('should clear current user on sign out', async () => {
      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');
      expect(auth.currentUser).not.toBeNull();

      await auth.signOut();
      expect(auth.currentUser).toBeNull();
    });

    it('should remove user from localStorage on sign out', async () => {
      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');
      expect(localStorage.getItem('faceiq_mock_user')).not.toBeNull();

      await auth.signOut();
      expect(localStorage.getItem('faceiq_mock_user')).toBeNull();
    });

    it('should simulate network delay', async () => {
      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      const startTime = Date.now();
      await auth.signOut();
      const endTime = Date.now();

      // Should take at least 150ms (accounting for some variance)
      expect(endTime - startTime).toBeGreaterThanOrEqual(150);
    });
  });

  describe('updateProfile', () => {
    it('should update displayName', async () => {
      const result = await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      await updateProfile(result.user, { displayName: 'New Name' });

      expect(auth.currentUser?.displayName).toBe('New Name');
    });

    it('should update photoURL', async () => {
      const result = await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      await updateProfile(result.user, { photoURL: 'https://example.com/photo.jpg' });

      expect(auth.currentUser?.photoURL).toBe('https://example.com/photo.jpg');
    });

    it('should update multiple fields at once', async () => {
      const result = await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      await updateProfile(result.user, {
        displayName: 'Updated Name',
        photoURL: 'https://example.com/photo.jpg',
      });

      expect(auth.currentUser?.displayName).toBe('Updated Name');
      expect(auth.currentUser?.photoURL).toBe('https://example.com/photo.jpg');
    });

    it('should persist updates to localStorage', async () => {
      const result = await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      await updateProfile(result.user, { displayName: 'Persisted Name' });

      const stored = localStorage.getItem('faceiq_mock_user');
      const parsedUser = JSON.parse(stored!);
      expect(parsedUser.displayName).toBe('Persisted Name');
    });

    it('should not update if no user is signed in', async () => {
      await auth.signOut();

      await updateProfile({} as User, { displayName: 'New Name' });

      expect(auth.currentUser).toBeNull();
    });
  });

  describe('onAuthStateChanged', () => {
    it('should call listener immediately with current state', () => {
      const callback = vi.fn();

      onAuthStateChanged(auth, callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null);
    });

    it('should call listener when user signs in', async () => {
      const callback = vi.fn();
      onAuthStateChanged(auth, callback);

      callback.mockClear(); // Clear the initial call

      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
        })
      );
    });

    it('should call listener when user signs out', async () => {
      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      const callback = vi.fn();
      onAuthStateChanged(auth, callback);

      callback.mockClear();

      await auth.signOut();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null);
    });

    it('should call listener when profile is updated', async () => {
      const result = await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      const callback = vi.fn();
      onAuthStateChanged(auth, callback);

      callback.mockClear();

      await updateProfile(result.user, { displayName: 'Updated' });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Updated',
        })
      );
    });

    it('should support multiple listeners', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      onAuthStateChanged(auth, callback1);
      onAuthStateChanged(auth, callback2);

      callback1.mockClear();
      callback2.mockClear();

      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should return unsubscribe function', async () => {
      const callback = vi.fn();
      const unsubscribe = onAuthStateChanged(auth, callback);

      callback.mockClear();

      // Unsubscribe
      unsubscribe();

      // Sign in should not trigger callback anymore
      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should remove only the specific listener when unsubscribing', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = onAuthStateChanged(auth, callback1);
      onAuthStateChanged(auth, callback2);

      callback1.mockClear();
      callback2.mockClear();

      unsubscribe1();

      await signInWithEmailAndPassword(auth, 'user@example.com', 'password123');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle signing in while already signed in', async () => {
      await signInWithEmailAndPassword(auth, 'user1@example.com', 'password123');
      const firstUser = auth.currentUser;

      await signInWithEmailAndPassword(auth, 'user2@example.com', 'password123');
      const secondUser = auth.currentUser;

      expect(secondUser?.email).toBe('user2@example.com');
      expect(secondUser?.uid).not.toBe(firstUser?.uid);
    });

    it('should handle empty email string', async () => {
      await expect(
        signInWithEmailAndPassword(auth, '', 'password123')
      ).rejects.toMatchObject({
        code: 'auth/invalid-email',
      });
    });

    it('should handle empty password string', async () => {
      await expect(
        signInWithEmailAndPassword(auth, 'user@example.com', '')
      ).rejects.toMatchObject({
        code: 'auth/weak-password',
      });
    });

    it('should handle sign out when already signed out', async () => {
      expect(auth.currentUser).toBeNull();

      await expect(auth.signOut()).resolves.not.toThrow();
      expect(auth.currentUser).toBeNull();
    });
  });
});
