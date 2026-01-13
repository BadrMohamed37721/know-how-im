import { useState } from "react";
import { useMyProfile } from "@/hooks/use-profile";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Smartphone, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function NFCPage() {
  const { data: profile } = useMyProfile();
  const { toast } = useToast();
  const [isWriting, setIsWriting] = useState(false);
  const [status, setStatus] = useState<"idle" | "writing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const hasNFC = 'NDEFReader' in window;

  const handleWriteNFC = async () => {
    if (!profile) return;
    if (!hasNFC) {
      toast({ title: "Not Supported", description: "Your device/browser doesn't support Web NFC.", variant: "destructive" });
      return;
    }

    try {
      setIsWriting(true);
      setStatus("writing");
      
      const ndef = new (window as any).NDEFReader();
      await ndef.scan(); // Permission request
      
      const url = `${window.location.origin}/p/${profile.slug}`;
      
      await ndef.write({
        records: [{ recordType: "url", data: url }]
      });

      setStatus("success");
      toast({ title: "Success!", description: "Profile URL written to NFC tag." });
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "Failed to write to NFC tag.");
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-display">NFC Writer</h2>
        <p className="text-muted-foreground">Program your NFC card to open your profile</p>
      </div>

      <div className="grid gap-6">
        {!hasNFC && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>NFC Not Supported</AlertTitle>
            <AlertDescription>
              Your current browser or device does not support Web NFC. Try using Chrome on Android.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-primary/5 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <Radio className="w-8 h-8" />
            </div>
            <CardTitle>Write to Tag</CardTitle>
            <CardDescription>
              Hold your phone near the NFC tag and click the button below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Data to write:</p>
              <code className="bg-gray-100 px-3 py-1 rounded text-primary text-sm">
                {profile ? `${window.location.origin}/p/${profile.slug}` : "Loading..."}
              </code>
            </div>

            <Button 
              size="lg" 
              className="w-full max-w-xs h-14 text-lg font-semibold shadow-lg shadow-primary/25"
              onClick={handleWriteNFC}
              disabled={!hasNFC || isWriting || !profile}
            >
              {isWriting ? "Hold near tag..." : "Write to NFC Tag"}
            </Button>

            {status === "success" && (
              <div className="flex items-center text-green-600 font-medium animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Successfully written!
              </div>
            )}
            
            {status === "error" && (
              <div className="text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>1. Ensure NFC is enabled on your device settings.</p>
            <p>2. Use a compatible browser (Chrome on Android is recommended).</p>
            <p>3. Click "Write to NFC Tag" and hold your device against the NFC chip.</p>
            <p>4. Wait for the success confirmation vibration or message.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
