import { useParams } from "wouter";
import { usePublicProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Share2, FileText } from "lucide-react";
import { SiInstagram, SiLinkedin, SiGithub, SiX, SiYoutube, SiTiktok, SiFacebook, SiTwitch } from "react-icons/si";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

const ICONS: Record<string, any> = {
  instagram: SiInstagram,
  linkedin: SiLinkedin,
  github: SiGithub,
  twitter: SiX,
  youtube: SiYoutube,
  tiktok: SiTiktok,
  facebook: SiFacebook,
  twitch: SiTwitch,
  default: ExternalLink,
};

export default function PublicProfile() {
  const { slug } = useParams();
  const { data: profile, isLoading } = usePublicProfile(slug || "");
  const profileRef = useRef<HTMLDivElement>(null);

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
                  {profile.displayName.charAt(0)}
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
            </motion.div>
          </div>

          {/* Links List */}
          <div className="mt-8 space-y-4">
            {links.map((link, index) => {
              const Icon = ICONS[link.icon.toLowerCase()] || ICONS.default;
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100 flex items-center group"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 mr-4 transition-colors"
                    style={{ backgroundColor: profile.themeColor || "#000000" }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-800 group-hover:text-black">{link.title}</span>
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
        
        {/* Footer Brand */}
        <div className="pt-8 text-center">
          <a href="/" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
            LinkTap
          </a>
        </div>
      </div>
    </div>
  );
}
