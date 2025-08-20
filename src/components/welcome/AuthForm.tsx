import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { User, Lock, LogIn, Shield } from 'lucide-react';
import { tohAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
  onToggle: () => void;
}

export function AuthForm({ type, onSubmit, onToggle }: AuthFormProps) {
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newErrors: Record<string, string> = {};
    if (!loginData.username.trim()) newErrors.username = 'Kullanıcı adı zorunludur';
    if (!loginData.password.trim()) newErrors.password = 'Şifre zorunludur';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await tohAPI.login(loginData.username, loginData.password);
        const user = await tohAPI.getCurrentUser();
        onSubmit(user);
        toast.success('Başarıyla giriş yapıldı!');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
    setLoading(false);
  };

  const updateField = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (type === 'register') {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Kayıt Sistemi</h3>
        <p className="text-gray-600 mb-8">
          Kayıt işlemleri şu anda yöneticiler tarafından yapılmaktadır. 
          TÖH'e katılmak için Discord sunucumuzdan iletişime geçin.
        </p>
        
        <Button
          onClick={onToggle}
          variant="outline"
          size="lg"
          icon={LogIn}
          className="w-full"
        >
          Giriş Sayfasına Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">TÖH'e Hoş Geldin!</h3>
        <p className="text-gray-600">Hesabına giriş yap ve yönetim paneline erişim sağla</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <Input
          label="Kullanıcı Adı"
          placeholder="Kullanıcı adın"
          value={loginData.username}
          onChange={(e) => updateField('username', e.target.value)}
          error={errors.username}
          icon={User}
          fullWidth
        />

        <Input
          label="Şifre"
          type="password"
          placeholder="Şifren"
          value={loginData.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={errors.password}
          icon={Lock}
          fullWidth
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
          icon={LogIn}
          size="lg"
          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
        >
          Giriş Yap
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Hesabın yok mu?
          {' '}
          <button
            type="button"
            onClick={onToggle}
            className="text-primary-500 hover:text-primary-600 font-semibold"
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
}