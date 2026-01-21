import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, ShieldCheck, Plus, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { toast } = useToast();
  const [newTagId, setNewTagId] = useState("");
  
  const { data: tags, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/tags"],
  });

  const verifyMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const res = await fetch("/api/admin/verify-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId }),
      });
      if (!res.ok) throw new Error("Failed to verify tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tags"] });
      setNewTagId("");
      toast({ title: "Success", description: "NFC Tag verified and added to inventory" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-display">NFC Inventory Manager</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Verify New NFC Tag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input 
              placeholder="Enter Physical Tag ID (e.g. Serial Number)" 
              value={newTagId}
              onChange={(e) => setNewTagId(e.target.value)}
              className="max-w-md"
            />
            <Button 
              onClick={() => verifyMutation.mutate(newTagId)}
              disabled={!newTagId || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Add Tag"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Add your physical NFC tag IDs here before selling them. Only these IDs will be allowed to host profiles.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Verified Inventory ({tags?.length || 0})
        </h2>
        <div className="grid gap-4">
          {tags?.map((tag) => (
            <Card key={tag.id} className="border-green-100 bg-green-50/30">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-lg font-mono">{tag.tagId}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Verified on {new Date(tag.verifiedAt).toLocaleDateString()} by {tag.verifiedBy}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ready for Sale</span>
                </div>
              </CardHeader>
            </Card>
          ))}
          {tags?.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
              No tags verified yet. Add your first tag above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
