import { Link } from "@shared/schema";
import { GripVertical, Trash2, Edit2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { SiInstagram, SiLinkedin, SiGithub, SiTwitter, SiYoutube, SiTiktok, SiFacebook, SiTwitch } from "react-icons/si";

const ICONS: Record<string, any> = {
  instagram: SiInstagram,
  linkedin: SiLinkedin,
  github: SiGithub,
  twitter: SiTwitter,
  youtube: SiYoutube,
  tiktok: SiTiktok,
  facebook: SiFacebook,
  twitch: SiTwitch,
  default: ExternalLink,
};

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: number) => void;
  isDragging?: boolean;
}

export function LinkCard({ link, onEdit, onDelete, isDragging }: LinkCardProps) {
  const Icon = ICONS[link.icon.toLowerCase()] || ICONS.default;

  return (
    <Card className={`p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md border-border/60 ${isDragging ? 'opacity-50' : ''}`}>
      <div className="text-muted-foreground cursor-move hover:text-foreground">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{link.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(link)}>
          <Edit2 className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)} className="hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
