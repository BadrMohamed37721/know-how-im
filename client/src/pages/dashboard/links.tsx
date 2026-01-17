import { useState } from "react";
import { useMyProfile, useCreateLink, useUpdateLink, useDeleteLink, useReorderLinks } from "@/hooks/use-profile";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { LinkCard } from "@/components/link-card";
import { useToast } from "@/hooks/use-toast";
import { Link as LinkType } from "@shared/schema";
import { motion, Reorder } from "framer-motion";

const ICON_OPTIONS = [
  { value: "globe", label: "Website (Globe)" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "twitch", label: "Twitch" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

export default function LinksPage() {
  const { data, isLoading } = useMyProfile();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const reorderLinks = useReorderLinks();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);

  // Form state
  const [formData, setFormData] = useState({ title: "", url: "", icon: "globe" });

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!data) return null;

  // Sorting links locally for display
  const links = [...(data.links || [])].sort((a, b) => a.order - b.order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await updateLink.mutateAsync({ id: editingLink.id, ...formData });
        toast({ title: "Updated", description: "Link updated successfully." });
      } else {
        await createLink.mutateAsync({ ...formData, order: links.length });
        toast({ title: "Created", description: "New link added." });
      }
      setIsDialogOpen(false);
      setEditingLink(null);
      setFormData({ title: "", url: "", icon: "globe" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save link.", variant: "destructive" });
    }
  };

  const openCreateDialog = () => {
    setEditingLink(null);
    setFormData({ title: "", url: "", icon: "globe" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (link: LinkType) => {
    setEditingLink(link);
    setFormData({ title: link.title, url: link.url, icon: link.icon });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await deleteLink.mutateAsync(id);
      toast({ title: "Deleted", description: "Link removed." });
    }
  };

  const handleReorder = (newOrder: LinkType[]) => {
    // Optimistic update would be complex here, so we just trigger the mutation
    // In a real app we'd update local state immediately
    const ids = newOrder.map(l => l.id);
    reorderLinks.mutate(ids);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold font-display">Your Links</h2>
          <p className="text-muted-foreground">Manage the links on your public profile</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add Link
        </Button>
      </div>

      <div className="space-y-4">
        {links.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed">
            <p className="text-muted-foreground">No links yet. Add your first one!</p>
          </div>
        ) : (
          <Reorder.Group axis="y" values={links} onReorder={handleReorder} className="space-y-3">
            {links.map((link) => (
              <Reorder.Item key={link.id} value={link}>
                <LinkCard
                  link={link}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit Link" : "Add New Link"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. My Portfolio"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="mr-2">
                Cancel
              </Button>
              <Button type="submit" disabled={createLink.isPending || updateLink.isPending}>
                {(createLink.isPending || updateLink.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingLink ? "Save Changes" : "Create Link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
