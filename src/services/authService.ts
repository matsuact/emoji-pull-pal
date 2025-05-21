
import { supabase, getRedirectTo } from "@/integrations/supabase/client";
import { GithubUser } from '@/types/github';

/**
 * Initiates the GitHub OAuth flow using Supabase
 */
export const loginWithGithub = async () => {
  try {
    // Use the current origin as the redirectTo to make development and production work
    const redirectUrl = getRedirectTo();
    console.log("Redirecting to:", redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectUrl,
        scopes: 'repo'
      }
    });
    
    if (error) {
      console.error("GitHub OAuth error:", error.message);
      throw error;
    }
    
    // Supabase handles the redirect automatically
    return true;
  } catch (error) {
    console.error("Failed to initiate GitHub login:", error);
    return false;
  }
};

/**
 * Handles the OAuth callback
 */
export const handleAuthCallback = async (): Promise<boolean> => {
  try {
    // Supabase automatically extracts the token from the URL
    // Just check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error("Auth callback error:", error);
    return false;
  }
};

/**
 * Gets the stored access token from Supabase session
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.provider_token || null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

/**
 * No need to save token manually, Supabase handles this
 */
export const saveToken = (): void => {
  // No-op, Supabase handles token storage
};

/**
 * Logout using Supabase
 */
export const logout = async (): Promise<void> => {
  try {
    await cleanupAuthState();
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Gets the authenticated user's info
 */
export const getUser = async (): Promise<GithubUser | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    // Get user profile from user metadata
    const githubUser: GithubUser = {
      login: session.user.user_metadata.user_name || session.user.user_metadata.preferred_username,
      avatar_url: session.user.user_metadata.avatar_url,
      name: session.user.user_metadata.name
    };
    
    return githubUser;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

/**
 * Cleans up any auth-related local storage items
 */
export const cleanupAuthState = async () => {
  // Clean up any leftover custom auth state
  localStorage.removeItem("github_access_token");
  localStorage.removeItem("github_user");
  
  // Clean up all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};
