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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    state: '',
    role: 'producer'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(), // mantém “SP”
        role: formData.role
      };
      const { user, error } = await register(payload);

      if (error) {
        toast({
          title: 'Erro no cadastro',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Cadastro realizado com sucesso!',
          description: `Bem-vindo, ${user.name}!`,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Erro no cadastro',
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
        <title>Cadastro - MilkTech</title>
        <meta name="description" content="Cadastre-se na plataforma MilkTech e comece a gerenciar suas atividades no setor leiteiro de forma eficiente." />
        <meta property="og:title" content="Cadastro - MilkTech" />
        <meta property="og:description" content="Cadastre-se na plataforma MilkTech e comece a gerenciar suas atividades no setor leiteiro de forma eficiente." />
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
              <CardTitle>Criar sua conta</CardTitle>
              <CardDescription>
                Preencha os dados para se cadastrar no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Sua cidade"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="SP"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Tipo de usuário</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="role"
                        value="producer"
                        checked={formData.role === 'producer'}
                        onChange={handleChange}
                        className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span>Produtor</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="role"
                        value="dairy"
                        checked={formData.role === 'dairy'}
                        onChange={handleChange}
                        className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span>Queijeira</span>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    Faça login aqui
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

export default Register;