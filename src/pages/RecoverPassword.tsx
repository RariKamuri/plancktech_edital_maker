import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { sendPasswordRecoveryCode } from '@/lib/api';

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Convert email to lowercase and trim
    const normalizedEmail = email.trim().toLowerCase();
    
    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      const errorMessage = 'Por favor, insira um email válido';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    
    setIsLoading(true);

    try {
      await sendPasswordRecoveryCode(normalizedEmail);
      toast.success('Código enviado com sucesso! Verifique seu email.');
      // Store email in sessionStorage for the next step
      sessionStorage.setItem('recoveryEmail', normalizedEmail);
      navigate('/new-password');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao enviar código. Por favor, tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-24 w-24 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-primary">Planck Edital Maker</CardTitle>
            <CardDescription className="text-base mt-2">
              Sistema de Criação de Editais
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
                autoComplete="email"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar código de recuperação'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoverPassword;

