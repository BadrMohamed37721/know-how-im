import { useParams } from "wouter";
import { usePublicProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Share2, FileText, Phone, QrCode } from "lucide-react";
import { SiInstagram, SiLinkedin, SiGithub, SiX, SiYoutube, SiTiktok, SiFacebook, SiTwitch, SiWhatsapp, SiGmail } from "react-icons/si";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

const ICONS: Record<string, any> = {
  instagram: SiInstagram,
  linkedin: SiLinkedin,
  github: SiGithub,
  twitter: SiX,
  youtube: SiYoutube,
  tiktok: SiTiktok,
  facebook: SiFacebook,
  twitch: SiTwitch,
  whatsapp: SiWhatsapp,
  email: SiGmail,
  default: ExternalLink,
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  github: "GitHub",
  twitter: "X",
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
  twitch: "Twitch",
  whatsapp: "WhatsApp",
  email: "Email",
  default: "Link",
};

const COLORS: Record<string, string> = {
  instagram: "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
  linkedin: "#0A66C2",
  github: "#181717",
  twitter: "#000000",
  youtube: "#FF0000",
  tiktok: "#000000",
  facebook: "#1877F2",
  twitch: "#9146FF",
  whatsapp: "#25D366",
  email: "#EA4335",
  default: "#71717a",
};

export default function PublicProfile() {
  const { slug } = useParams();
  const { data: profile, isLoading } = usePublicProfile(slug || "");
  const profileRef = useRef<HTMLDivElement>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<{ token: string, expiresAt: string } | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (qrData && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && qrData) {
      setQrData(null);
    }
    return () => clearInterval(timer);
  }, [qrData, timeLeft]);

  const generateQR = async () => {
    setIsGeneratingQR(true);
    try {
      // Check if user is logged in first by fetching profile/me or similar
      // but simpler: just try the generation and handle 401
      const res = await fetch("/api/profiles/qr/generate", { method: "POST" });
      
      if (res.status === 401 || res.status === 403) {
        // GUEST MODE: Show direct link QR
        setQrData({ token: "public", expiresAt: new Date(Date.now() + 3600000).toISOString() });
        setTimeLeft(3600);
        setShowQR(true);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to generate QR");
      }

      const data = await res.json();
      setQrData(data);
      const expiry = new Date(data.expiresAt).getTime();
      setTimeLeft(Math.floor((expiry - Date.now()) / 1000));
      setShowQR(true);
    } catch (err) {
      console.error("QR Generate Error:", err);
      // Fallback for any error: show public QR
      setQrData({ token: "public", expiresAt: new Date(Date.now() + 3600000).toISOString() });
      setTimeLeft(3600);
      setShowQR(true);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile Not Found</h1>
          <p className="text-gray-500 mt-2">The user you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  // Placeholder for NFC check - in a real scenario, this would check the physical tag ID
  // For now, we'll keep the profile accessible once created, but you can use the inventory 
  // to pre-verify IDs.
  
  const links = [...(profile.links || [])].sort((a, b) => a.order - b.order);

  const handleDownloadPDF = async () => {
    if (!profileRef.current) return;
    
    try {
      const canvas = await html2canvas(profileRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: profile.backgroundColor || "#f9fafb"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${profile.slug}-business-card.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const handleSaveContact = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.displayName}
TEL:${profile.phoneNumber || ""}
NOTE:${profile.bio || ""}
URL:${window.location.href}
END:VCARD`;
    
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.slug}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.displayName,
        text: `Check out ${profile.displayName}'s profile!`,
        url: window.location.href,
      });
    }
  };

  return (
    <div 
      className="min-h-screen w-full py-12 px-4 flex justify-center"
      style={{ backgroundColor: profile.backgroundColor || "#f9fafb" }}
    >
      <div className="w-full max-w-md space-y-8">
        <div ref={profileRef} className="p-4 rounded-3xl" style={{ backgroundColor: profile.backgroundColor || "#f9fafb" }}>
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 shadow-xl"
              style={{ borderColor: profile.themeColor || "#000000" }}
            >
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl.startsWith('/objects/') ? `/api${profile.avatarUrl}` : profile.avatarUrl} 
                  alt={profile.displayName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-bold font-display text-gray-900">{profile.displayName}</h1>
              {profile.bio && (
                <p className="text-gray-600 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
                  {profile.bio}
                </p>
              )}
              {profile.phoneNumber && (
                <a 
                  href={`tel:${profile.phoneNumber}`}
                  className="mt-4 inline-flex items-center text-primary hover:underline font-medium"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {profile.phoneNumber}
                </a>
              )}
            </motion.div>
          </div>

          {/* Links Grid */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            {links.map((link, index) => {
              const platform = link.icon.toLowerCase();
              const Icon = ICONS[platform] || ICONS.default;
              const color = COLORS[platform] || COLORS.default;
              const label = PLATFORM_LABELS[platform] || link.title || PLATFORM_LABELS.default;
              
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform"
                    style={{ background: color.startsWith('linear') ? color : undefined, backgroundColor: color.startsWith('linear') ? undefined : color }}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-black text-center truncate w-full">
                    {label}
                  </span>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleSaveContact}
              className="flex-1 rounded-full shadow-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: profile.themeColor || "#000000", color: "#fff" }}
            >
              <Download className="w-4 h-4 mr-2" />
              vCard
            </Button>
            <Button 
              onClick={handleDownloadPDF}
              variant="secondary"
              className="flex-1 rounded-full shadow-md bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button 
              variant="secondary"
              onClick={generateQR}
              disabled={isGeneratingQR}
              className="flex-1 rounded-full shadow-md bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
            >
              {isGeneratingQR ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
              QR
            </Button>
          </div>
          <Button 
            variant="ghost"
            onClick={handleShare}
            className="w-full rounded-full text-gray-500 hover:text-gray-900"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
        </div>

        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Scan to Connect</DialogTitle>
              <DialogDescription className="text-center">
                {timeLeft > 0 
                  ? `This QR code will expire in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                  : "QR Code expired. Please generate a new one."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              {qrData && timeLeft > 0 ? (
                <div className="p-4 bg-white rounded-2xl shadow-inner border">
                  <QRCodeSVG 
                    value={qrData.token === "public" ? window.location.href : `${window.location.origin}/qr/${qrData.token}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              ) : (
                <div className="w-[232px] h-[232px] flex flex-col items-center justify-center bg-gray-100 rounded-2xl border border-dashed">
                  <QrCode className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Expired</p>
                  <Button variant="link" onClick={generateQR} className="mt-2">Generate New</Button>
                </div>
              )}
              <p className="text-sm text-center text-muted-foreground">
                Anyone who scans this will be taken directly to your profile.
              </p>
              <Button onClick={() => setShowQR(false)} className="w-full rounded-full">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
          {/* Footer Brand */}
          <div className="pt-8 text-center space-y-2">
            <a href="/" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
              Know Who I Am
            </a>
            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
              Credits for Badr
            </p>
          </div>
      </div>
    </div>
  );
}
