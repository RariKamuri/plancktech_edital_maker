import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { verifyPasswordRecoveryCode, resetPassword } from '@/lib/api';

const NewPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [isCodeIncorrect, setIsCodeIncorrect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from sessionStorage
    const recoveryEmail = sessionStorage.getItem('recoveryEmail');
    if (recoveryEmail) {
      setEmail(recoveryEmail);
    } else {
      // If no email in session, redirect to recover password
      navigate('/recover-password');
    }
  }, [navigate]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCodeIncorrect(false);

    if (!code || code.length !== 6) {
      setError('Por favor, digite o código completo');
      setIsCodeIncorrect(true);
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await verifyPasswordRecoveryCode(email, code);
      
      if (isValid) {
        setCodeVerified(true);
        toast.success('Código verificado com sucesso!');
      } else {
        setIsCodeIncorrect(true);
        setError('Código incorreto, tente novamente');
        toast.error('Código incorreto, tente novamente');
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao verificar código. Por favor, tente novamente.';
      setError(errorMessage);
      setIsCodeIncorrect(true);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email, code, newPassword);
      sessionStorage.removeItem('recoveryEmail');
      toast.success('Senha atualizada com sucesso!');
      navigate('/', { state: { passwordReset: true } });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao alterar senha. Por favor, tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className={`w-full max-w-md shadow-2xl ${isCodeIncorrect ? 'border-red-500' : ''}`}>
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
          {!codeVerified ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <Alert variant="destructive" className={isCodeIncorrect ? 'bg-red-50 border-red-500' : ''}>
                  <AlertDescription className={isCodeIncorrect ? 'text-red-700' : ''}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="code" className={`text-center block ${isCodeIncorrect ? 'text-red-700' : ''}`}>
                  Digite o código enviado para seu email
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => {
                      setCode(value);
                      setIsCodeIncorrect(false);
                      setError(null);
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className={isCodeIncorrect ? 'border-red-500' : ''} />
                      <InputOTPSlot index={1} className={isCodeIncorrect ? 'border-red-500' : ''} />
                      <InputOTPSlot index={2} className={isCodeIncorrect ? 'border-red-500' : ''} />
                      <InputOTPSlot index={3} className={isCodeIncorrect ? 'border-red-500' : ''} />
                      <InputOTPSlot index={4} className={isCodeIncorrect ? 'border-red-500' : ''} />
                      <InputOTPSlot index={5} className={isCodeIncorrect ? 'border-red-500' : ''} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold mt-6"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'Verificando...' : 'Confirmar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                  autoComplete="new-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Alterando...' : 'Mudar senha'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPassword;

