export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  rank?: string;
  department?: string;
  createdAt: string;
}

export interface UserData {
  personnelData: any[];
  uploadDate: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthService {
  private storageKey = 'iaf_users';
  private currentUserKey = 'iaf_current_user';
  private userDataKey = 'iaf_user_data';

  // Get all registered users
  private getUsers(): Record<string, User & { password: string }> {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : {};
  }

  // Save users to localStorage
  private saveUsers(users: Record<string, User & { password: string }>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Hash password (simple implementation for demo)
  private hashPassword(password: string): string {
    // In a real app, use proper password hashing like bcrypt
    return btoa(password + 'iaf_salt_2024');
  }

  // Register new user
  register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    rank?: string;
    department?: string;
  }): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    
    // Check if username or email already exists
    const existingUser = Object.values(users).find(
      user => user.username === userData.username || user.email === userData.email
    );

    if (existingUser) {
      return {
        success: false,
        message: 'Username or email already exists'
      };
    }

    const userId = this.generateId();
    const newUser: User & { password: string } = {
      id: userId,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      rank: userData.rank,
      department: userData.department,
      createdAt: new Date().toISOString(),
      password: this.hashPassword(userData.password)
    };

    users[userId] = newUser;
    this.saveUsers(users);

    const { password, ...userWithoutPassword } = newUser;
    return {
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword
    };
  }

  // Login user
  login(username: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const user = Object.values(users).find(u => u.username === username);

    if (!user || user.password !== this.hashPassword(password)) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));

    return {
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    };
  }

  // Get current user
  getCurrentUser(): User | null {
    const currentUser = localStorage.getItem(this.currentUserKey);
    return currentUser ? JSON.parse(currentUser) : null;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.currentUserKey);
  }

  // Save user's personnel data
  saveUserData(userId: string, data: any[]): void {
    const allUserData = this.getAllUserData();
    allUserData[userId] = {
      personnelData: data,
      uploadDate: new Date().toISOString()
    };
    localStorage.setItem(this.userDataKey, JSON.stringify(allUserData));
  }

  // Get user's personnel data
  getUserData(userId: string): UserData | null {
    const allUserData = this.getAllUserData();
    return allUserData[userId] || null;
  }

  // Get all user data
  private getAllUserData(): Record<string, UserData> {
    const data = localStorage.getItem(this.userDataKey);
    return data ? JSON.parse(data) : {};
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();