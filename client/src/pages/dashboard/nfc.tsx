import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Zap, Loader2, Eraser, CheckCircle2, AlertTriangle, Tag, Search, Lock } from "lucide-react";
import { useMyProfile } from "@/hooks/use-profile";
import { Input } from "@/components/ui/input";

export default function NFCPage() {
  const { data: profile } = useMyProfile();
  const { toast } = useToast();
  const [isWriting, setIsWriting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [checkingId, setCheckingId] = useState("");
  const [verificationState, setVerificationState] = useState<{isVerified: boolean, isClaimed: boolean, isYours: boolean} | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const { data: myTag, isLoading: isLoadingTag } = useQuery<any>({
    queryKey: ["/api/nfc/my-tag"],
  });

  useEffect(() => {
    if (myTag) {
      setCheckingId(myTag.tagId);
      setVerificationState({
        isVerified: true,
        isClaimed: true,
        isYours: true
      });
    }
  }, [myTag]);

  if (isLoadingTag) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  const checkNFC = async () => {
    if (!checkingId) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/nfc/check/${checkingId}`);
      const data = await res.json();
      setVerificationState(data);
      
      if (!data.isVerified) {
        toast({ title: "Invalid NFC", description: "That's not our NFC!", variant: "destructive" });
      } else if (data.isClaimed && !data.isYours) {
        toast({ title: "Tag Claimed", description: "This tag is already linked to another account.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to verify NFC tag", variant: "destructive" });
    } finally {
      setIsChecking(false);
    }
  };

  const claimTag = async () => {
    try {
      const res = await fetch("/api/nfc/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId: checkingId }),
      });
      if (!res.ok) throw new Error("Failed to claim tag");
      setVerificationState(prev => prev ? {...prev, isClaimed: true, isYours: true} : null);
      toast({ title: "Success", description: "Tag linked to your account!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to link tag", variant: "destructive" });
    }
  };

  const writeToTag = async () => {
    if (!profile) return;
    if (!('NDEFReader' in window)) {
      toast({ title: "Not Supported", description: "Web NFC is not supported.", variant: "destructive" });
      return;
    }

    setIsWriting(true);
    try {
      // @ts-ignore
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: "url", data: `${window.location.origin}/p/${profile.slug}` }]
      });
      toast({ title: "Success", description: "Profile written to NFC tag!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to write.", variant: "destructive" });
    } finally {
      setIsWriting(false);
    }
  };

  const clearTag = async () => {
    if (!('NDEFReader' in window)) {
      toast({ title: "Not Supported", description: "Web NFC is not supported.", variant: "destructive" });
      return;
    }

    setIsClearing(true);
    try {
      // @ts-ignore
      const ndef = new NDEFReader();
      // Scan first to "wake up" the connection and ensure tag is present
      await ndef.scan();
      
      // Using an empty message to clear NDEF data
      await ndef.write({ records: [] });
      
      toast({ title: "Success", description: "Tag cleared successfully!" });
    } catch (error: any) {
      console.error("NFC Clear Error:", error);
      toast({ 
        title: "Error", 
        description: error.name === 'NotAllowedError' ? "Permission denied" : "Failed to clear tag. Try holding it closer.", 
        variant: "destructive" 
      });
    } finally {
      setIsClearing(false);
    }
  };

  const canWrite = verificationState?.isVerified && verificationState?.isYours;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-display">NFC Setup</h2>
        <p className="text-muted-foreground">Link and program your "Know Who I Am" tag</p>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              1. Verification & Linking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input 
                placeholder="Enter Tag ID" 
                value={checkingId}
                onChange={(e) => setCheckingId(e.target.value)}
              />
              <Button onClick={checkNFC} disabled={isChecking || !checkingId}>
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check ID"}
              </Button>
            </div>

            {verificationState && (
              <div className={`p-4 rounded-xl space-y-3 ${verificationState.isVerified ? "bg-green-100/50 border-green-200" : "bg-red-100/50 border-red-200"}`}>
                <div className="flex items-center gap-3">
                  {verificationState.isVerified ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
                  <p className="font-bold">{verificationState.isVerified ? "Official Tag Detected" : "Unknown Tag ID"}</p>
                </div>
                
                {verificationState.isVerified && !verificationState.isClaimed && (
                  <Button size="sm" onClick={claimTag} className="w-full">Link Tag to My Account</Button>
                )}
                
                {verificationState.isVerified && verificationState.isClaimed && !verificationState.isYours && (
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> This tag is already linked to someone else.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={`transition-opacity ${!canWrite ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <Zap className="w-6 h-6 text-primary mb-2" />
              <CardTitle>2. Write Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full rounded-full" onClick={writeToTag} disabled={isWriting}>
                {isWriting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                Write to Tag
              </Button>
            </CardContent>
          </Card>

          <Card className={`transition-opacity ${!canWrite ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <Eraser className="w-6 h-6 text-destructive mb-2" />
              <CardTitle>Clear Tag</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full rounded-full border-destructive/20 text-destructive" onClick={clearTag} disabled={isClearing}>
                {isClearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eraser className="w-4 h-4 mr-2" />}
                Clear Tag
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
