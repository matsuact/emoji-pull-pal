
import { GithubUser } from '@/types/github';

// GitHub OAuth configuration
// Use environment variable if available, otherwise fallback to the provided client ID
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "Ov23liRRv54GQOL20K38"; 
const REDIRECT_URI = encodeURIComponent(`${window.location.origin}/auth/callback`);
const SCOPE = "repo"; // Minimum scope needed for repository operations

// Log the redirect URI for debugging purposes
console.log("GitHub OAuth redirect URI:", decodeURIComponent(REDIRECT_URI));

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
 * Handles the OAuth callback by exchanging the code for an access token via a proxy server
 */
export const handleAuthCallback = async (code: string): Promise<boolean> => {
  try {
    console.log("Auth code received:", code);
    
    // Using a proxy server to exchange the code for an access token
    // This avoids exposing the client secret in the frontend
    const tokenResponse = await fetch('https://lovable-github-oauth-proxy.vercel.app/api/exchange-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: CLIENT_ID,
        redirect_uri: decodeURIComponent(REDIRECT_URI)
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return false;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      console.error("No access token received");
      return false;
    }

    // Save the token
    saveToken(accessToken);
    
    // Fetch user info with the token
    const success = await fetchAndSaveUserInfo(accessToken);
    return success;
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
const fetchAndSaveUserInfo = async (token: string): Promise<boolean> => {
  try {
    // Real GitHub API call to get user profile
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`
      }
    });
    
    if (!response.ok) {
      console.error("Failed to fetch user info:", await response.text());
      return false;
    }
    
    const userData = await response.json();
    
    const githubUser: GithubUser = {
      login: userData.login,
      avatar_url: userData.avatar_url,
      name: userData.name || userData.login
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(githubUser));
    return true;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return false;
  }
};
