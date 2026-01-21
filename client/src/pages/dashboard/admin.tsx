import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { toast } = useToast();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const activateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/activate/${userId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to activate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "NFC Activated successfully" });
    },
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin NFC Activation</h1>
      </div>

      <div className="grid gap-4">
        {users?.map((user) => (
          <Card key={user.id} className={user.isActivated ? "border-green-100 bg-green-50/30" : "border-red-100 bg-red-50/30"}>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-lg">{user.username || user.email || "Guest User"}</CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
              </div>
              <div className="flex items-center gap-4">
                {user.isActivated ? (
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Activated</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 font-semibold">
                    <XCircle className="w-4 h-4" />
                    <span>Pending</span>
                  </div>
                )}
                {!user.isActivated && (
                  <Button 
                    size="sm"
                    onClick={() => activateMutation.mutate(user.id)}
                    disabled={activateMutation.isPending}
                  >
                    Activate NFC
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
