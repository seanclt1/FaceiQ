// Mocking Firebase Auth to bypass import errors and dependency issues
// allowing the demo to function without a valid Firebase setup.

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

class MockAuthService {
  private _currentUser: User | null = null;
  private _listeners: ((user: User | null) => void)[] = [];

  constructor() {
    try {
      const stored = localStorage.getItem('faceiq_mock_user');
      if (stored) {
        this._currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to access localStorage", e);
    }
  }

  get currentUser() {
    return this._currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this._listeners.push(callback);
    callback(this._currentUser); // Initial call to sync state
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  }

  private _notify() {
    this._listeners.forEach(l => l(this._currentUser));
    try {
      if (this._currentUser) {
        localStorage.setItem('faceiq_mock_user', JSON.stringify(this._currentUser));
      } else {
        localStorage.removeItem('faceiq_mock_user');
      }
    } catch (e) {
      // ignore
    }
  }

  async signInWithEmailAndPassword(email: string, pass: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    if (!email.includes('@')) throw { code: 'auth/invalid-email', message: 'Invalid email' };
    if (pass.length < 6) throw { code: 'auth/weak-password', message: 'Password should be at least 6 characters' };

    // Mock successful login
    this._currentUser = {
      uid: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      email,
      displayName: email.split('@')[0],
      photoURL: null
    };
    this._notify();
    return { user: this._currentUser };
  }

  async createUserWithEmailAndPassword(email: string, pass: string) {
    return this.signInWithEmailAndPassword(email, pass);
  }

  async signOut() {
    await new Promise(resolve => setTimeout(resolve, 200));
    this._currentUser = null;
    this._notify();
  }

  async updateProfile(user: User, updates: { displayName?: string; photoURL?: string }) {
    if (this._currentUser) {
      this._currentUser = { ...this._currentUser, ...updates };
      this._notify();
    }
  }
}

// Export a singleton instance to be used across the app
export const auth = new MockAuthService();

// Export standalone functions to match Firebase v9 SDK signature used in components
export const onAuthStateChanged = (authInstance: any, callback: (user: User | null) => void) => {
  return authInstance.onAuthStateChanged(callback);
};

export const signInWithEmailAndPassword = (authInstance: any, email: string, pass: string) => {
  return authInstance.signInWithEmailAndPassword(email, pass);
};

export const createUserWithEmailAndPassword = (authInstance: any, email: string, pass: string) => {
  return authInstance.createUserWithEmailAndPassword(email, pass);
};

export const updateProfile = (user: any, updates: { displayName?: string; photoURL?: string }) => {
  return auth.updateProfile(user, updates);
};
