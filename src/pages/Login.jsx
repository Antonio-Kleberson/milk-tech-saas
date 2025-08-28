import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Milk } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, error } = await login(email.trim(), password.trim());
      
      if (error) {
        toast({
          title: 'Erro no login',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login realizado com sucesso!',
          description: `Bem-vindo, ${user.name}!`,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - MilkTech</title>
        <meta name="description" content="Faça login na plataforma MilkTech para acessar sua conta e gerenciar suas atividades no setor leiteiro." />
        <meta property="og:title" content="Login - MilkTech" />
        <meta property="og:description" content="Faça login na plataforma MilkTech para acessar sua conta e gerenciar suas atividades no setor leiteiro." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="flex justify-center mb-4">
              <div className="p-3 bg-green-600 rounded-full">
                <Milk className="h-8 w-8 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">MilkTech</h1>
            <p className="text-gray-600 mt-2">Plataforma do Setor Leiteiro</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Entrar na sua conta</CardTitle>
              <CardDescription>
                Digite suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    Cadastre-se aqui
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Login;