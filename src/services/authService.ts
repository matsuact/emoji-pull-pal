
import { GithubUser } from '@/types/github';

// GitHub OAuth configuration
const CLIENT_ID = "your_github_client_id"; // You'll need to replace this with your actual GitHub OAuth App client ID
const REDIRECT_URI = encodeURIComponent(window.location.origin);
const SCOPE = "repo"; // Minimum scope needed for repository operations

// Storage keys
const TOKEN_KEY = "github_access_token";
const USER_KEY = "github_user";

/**
 * Initiates the GitHub OAuth flow
 */
export const loginWithGithub = () => {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
  window.location.href = authUrl;
};

/**
 * Handles the OAuth callback
 * Note: This would typically require a backend service to exchange the code for a token
 * For demo purposes, we're simulating this process
 */
export const handleAuthCallback = async (code: string): Promise<boolean> => {
  // In a real app, you would:
  // 1. Send the code to your backend
  // 2. Backend exchanges code for an access token using client_secret
  // 3. Backend returns the token to the frontend

  console.log("Auth code received:", code);
  
  // Simulate token exchange
  // In a production app, this would be an actual API call to your backend
  try {
    // Simulate successful authentication
    const mockToken = `mock_${code}_token`;
    saveToken(mockToken);
    
    // Fetch user info with token
    await fetchAndSaveUserInfo(mockToken);
    return true;
  } catch (error) {
    console.error("Authentication failed:", error);
    return false;
  }
};

/**
 * Gets the stored access token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Saves the access token
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clears the stored token and user info
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Gets the authenticated user's info
 */
export const getUser = (): GithubUser | null => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Fetches and saves the user's GitHub profile info
 */
const fetchAndSaveUserInfo = async (token: string): Promise<void> => {
  try {
    // In a real app, this would be:
    // const response = await fetch('https://api.github.com/user', {
    //   headers: { Authorization: `token ${token}` }
    // });

    // Simulate a successful API response
    const mockUser: GithubUser = {
      login: "github_user",
      avatar_url: "https://picsum.photos/200",
      name: "GitHub User"
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};
