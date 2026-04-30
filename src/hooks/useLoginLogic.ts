import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useLoginLogic() {
  const { signIn, error } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      setIsSuccess(false);
      setLoading(false);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSuccess) return;

    setLoading(true);
    try {
      const success = await signIn(email.trim(), password);
      if (success) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 900);

    return () => clearTimeout(timer);
  }, [isSuccess, router]);
  
  const togglePassword = () => setShowPassword(prev => !prev);

  return {
    email, setEmail,
    password, setPassword,
    showPassword, togglePassword,
    loading,
    isSuccess,
    error,
    handleSubmit
  };
}
