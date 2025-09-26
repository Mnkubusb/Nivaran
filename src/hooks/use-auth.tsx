"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  loginWithGoogle: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Check for redirect result from Google
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          // This will trigger the redirect effect below
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      }).finally(() => {
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Redirect to screening page if user is logged in and not already there
    // and not on a page that is part of the flow (like resources)
    const protectedPaths = ['/screening', '/resources', '/peer-support', '/counsellor'];
    if (user && !loading && !protectedPaths.includes(pathname)) {
      router.push("/screening");
    }
  }, [user, loading, router, pathname]);

  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    setUser(userCredential.user);
    return userCredential;
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
    return signOut(auth);
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    return signInWithRedirect(auth, provider);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
