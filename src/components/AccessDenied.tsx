import { AlertTriangle, Clock, Ban, CreditCard, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  status: string;
  message: string;
  onSignOut: () => void;
}

export function AccessDenied({ status, message, onSignOut }: AccessDeniedProps) {
  const getIcon = () => {
    switch (status) {
      case 'PENDENTE': return <Clock className="h-16 w-16 text-yellow-500" />;
      case 'BLOQUEADO': return <Ban className="h-16 w-16 text-muted-foreground" />;
      case 'INADIMPLENTE': return <CreditCard className="h-16 w-16 text-destructive" />;
      default: return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'PENDENTE': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'BLOQUEADO': return 'border-muted/30 bg-muted/5';
      case 'INADIMPLENTE': return 'border-destructive/30 bg-destructive/5';
      default: return 'border-primary/30';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className={`w-full max-w-md ${getColor()}`}>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{getIcon()}</div>
          <CardTitle className="text-xl">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">{message}</p>
          <Button onClick={onSignOut} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
