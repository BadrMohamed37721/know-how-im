import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Zap, Loader2, Eraser, CheckCircle2, AlertTriangle, Tag, Search } from "lucide-react";
import { useMyProfile } from "@/hooks/use-profile";
import { Input } from "@/components/ui/input";

export default function NFCPage() {
  const { data: profile } = useMyProfile();
  const { toast } = useToast();
  const [isWriting, setIsWriting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [checkingId, setCheckingId] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkNFC = async () => {
    if (!checkingId) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/nfc/check/${checkingId}`);
      const data = await res.json();
      setIsValid(data.isVerified);
      if (data.isVerified) {
        toast({ title: "Valid NFC", description: "This NFC tag is official and ready to use." });
      } else {
        toast({ title: "Invalid NFC", description: "That's not our NFC!", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to verify NFC tag", variant: "destructive" });
    } finally {
      setIsChecking(false);
    }
  };

  const writeToTag = async () => {
    if (!profile) return;
    
    if (!('NDEFReader' in window)) {
      toast({
        title: "Not Supported",
        description: "Web NFC is not supported on this browser or device.",
        variant: "destructive",
      });
      return;
    }

    setIsWriting(true);
    try {
      // @ts-ignore
      const ndef = new NDEFReader();
      await ndef.write({
        records: [
          { recordType: "url", data: `${window.location.origin}/p/${profile.slug}` }
        ]
      });

      toast({
        title: "Success",
        description: "Successfully wrote your profile URL to the NFC tag!",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to write to NFC tag.",
        variant: "destructive",
      });
    } finally {
      setIsWriting(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-display">NFC Verification & Setup</h2>
        <p className="text-muted-foreground">Verify your tag authenticity and program your profile</p>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              1. Verify Tag Authenticity
            </CardTitle>
            <CardDescription>
              Enter the ID provided with your card to verify it's an official "Know Who I Am" product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input 
                placeholder="Enter Tag ID or Serial Number" 
                value={checkingId}
                onChange={(e) => setCheckingId(e.target.value)}
              />
              <Button onClick={checkNFC} disabled={isChecking || !checkingId}>
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Tag"}
              </Button>
            </div>

            {isValid !== null && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${isValid ? "bg-green-100/50 text-green-700 border border-green-200" : "bg-red-100/50 text-red-700 border border-red-200"}`}>
                {isValid ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                      <p className="font-bold">Official NFC Verified</p>
                      <p className="text-sm">This tag is genuine. You can now proceed to step 2.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                      <p className="font-bold">Verification Failed</p>
                      <p className="text-sm">That's not our NFC! Please use an official tag.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={`hover-elevate transition-opacity ${!isValid ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2 text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <CardTitle>2. Write Profile</CardTitle>
              <CardDescription>
                Link your digital card to the verified tag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-xl text-sm">
                <p className="font-medium mb-1">Target URL:</p>
                <code className="text-primary truncate block">
                  {window.location.origin}/p/{profile?.slug || '...'}
                </code>
              </div>
              <Button 
                className="w-full h-12 text-lg rounded-full" 
                onClick={writeToTag}
                disabled={isWriting || !profile || !isValid}
              >
                {isWriting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Tapping...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5 mr-2" />
                    Write to Tag
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-dashed">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-2 text-gray-500">
                <Tag className="w-6 h-6" />
              </div>
              <CardTitle className="text-gray-500">Official Tags</CardTitle>
              <CardDescription>
                Always buy from official sources to ensure your card works forever.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
