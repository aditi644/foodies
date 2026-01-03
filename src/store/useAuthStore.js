import { create } from 'zustand';
import supabase from '../lib/supabase.js';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    loading: false,

    // Initialize auth state
    initAuth: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            set({ user: session?.user ?? null, session });
            
            // Listen for auth changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({ user: session?.user ?? null, session });
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
        }
    },

    // Sign up with email and password
    signUp: async (email, password, metadata = {}) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata // Additional user metadata (name, etc.)
                }
            });

            if (error) throw error;

            set({ user: data.user, session: data.session, loading: false });
            toast.success('Account created successfully! Please check your email to verify your account.');
            return { success: true, data };
        } catch (error) {
            set({ loading: false });
            toast.error(error.message || 'Failed to create account');
            return { success: false, error };
        }
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            set({ user: data.user, session: data.session, loading: false });
            toast.success('Welcome back!');
            return { success: true, data };
        } catch (error) {
            set({ loading: false });
            toast.error(error.message || 'Invalid email or password');
            return { success: false, error };
        }
    },

    // Sign out
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            set({ user: null, session: null });
            toast.success('Signed out successfully');
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Failed to sign out');
            return { success: false, error };
        }
    },

    // Reset password
    resetPassword: async (email) => {
        set({ loading: true });
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            set({ loading: false });
            toast.success('Password reset email sent! Check your inbox.');
            return { success: true };
        } catch (error) {
            set({ loading: false });
            toast.error(error.message || 'Failed to send reset email');
            return { success: false, error };
        }
    },
}));
