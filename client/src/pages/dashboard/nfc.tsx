import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Zap, Loader2, Eraser, CheckCircle2, AlertTriangle } from "lucide-react";
import { useMyProfile } from "@/hooks/use-profile";

export default function NFCPage() {
  const { data: profile } = useMyProfile();
  const { toast } = useToast();
  const [isWriting, setIsWriting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
      const profileUrl = `${window.location.origin}/p/${profile.slug}`;
      
      await ndef.write({
        records: [{ recordType: "url", data: profileUrl }]
      });

      toast({
        title: "Success",
        description: "Successfully wrote your profile URL to the NFC tag!",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to write to NFC tag. Make sure NFC is enabled and try again.",
        variant: "destructive",
      });
    } finally {
      setIsWriting(false);
    }
  };

  const clearTag = async () => {
    if (!('NDEFReader' in window)) {
      toast({
        title: "Not Supported",
        description: "Web NFC is not supported on this browser or device.",
        variant: "destructive",
      });
      return;
    }

    setIsClearing(true);
    try {
      // @ts-ignore
      const ndef = new NDEFReader();
      
      // Writing an empty record effectively clears it for most readers
      await ndef.write({
        records: []
      });

      toast({
        title: "Success",
        description: "Successfully cleared the NFC tag!",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to clear NFC tag. Make sure NFC is enabled and try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-display">NFC Management</h2>
        <p className="text-muted-foreground">Program or clear your physical NFC cards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-elevate">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2 text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <CardTitle>Write Profile</CardTitle>
            <CardDescription>
              Write your digital business card URL to your NFC tag
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-xl text-sm">
              <p className="font-medium mb-1">URL to be written:</p>
              <code className="text-primary truncate block">
                {window.location.origin}/p/{profile?.slug || '...'}
              </code>
            </div>
            <Button 
              className="w-full h-12 text-lg rounded-full" 
              onClick={writeToTag}
              disabled={isWriting || isClearing || !profile}
            >
              {isWriting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Ready to Tap...
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

        <Card className="hover-elevate">
          <CardHeader>
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-2 text-destructive">
              <Eraser className="w-6 h-6" />
            </div>
            <CardTitle>Clear Tag</CardTitle>
            <CardDescription>
              Wipe all data from your NFC tag to make it clean again
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/5 rounded-xl text-sm border border-destructive/10">
              <div className="flex gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>This will remove all existing records on the tag. Use with caution.</p>
              </div>
            </div>
            <Button 
              variant="outline"
              className="w-full h-12 text-lg rounded-full border-destructive/20 hover:bg-destructive/5 text-destructive" 
              onClick={clearTag}
              disabled={isWriting || isClearing}
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Eraser className="w-5 h-5 mr-2" />
                  Clear Tag Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1">How to write</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              1. Tap the "Write to Tag" button.<br />
              2. Bring your physical NFC card close to the top-back of your phone.<br />
              3. Hold it still until you see the success message.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
