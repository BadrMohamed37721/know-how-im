import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema } from "@shared/schema";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-profile";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ExternalLink, Upload } from "lucide-react";
import { Link } from "wouter";
import { useUpload } from "@/hooks/use-upload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload();

  const form = useForm({
    resolver: zodResolver(insertProfileSchema.partial() as any),
    defaultValues: {
      displayName: "",
      bio: "",
      phoneNumber: "",
      slug: "",
      avatarUrl: "",
      themeColor: "#000000",
      backgroundColor: "#ffffff",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName,
        bio: profile.bio || "",
        phoneNumber: profile.phoneNumber || "",
        slug: profile.slug,
        avatarUrl: profile.avatarUrl || "",
        themeColor: profile.themeColor || "#000000",
        backgroundColor: profile.backgroundColor || "#ffffff",
      });
    }
  }, [profile, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const response = await uploadFile(file);
      if (response) {
        form.setValue("avatarUrl", response.objectPath);
        toast({ title: "Success", description: "Image uploaded successfully. Don't forget to save changes!" });
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await updateProfile.mutateAsync(data);
      toast({ title: "Saved", description: "Profile updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold font-display">Edit Profile</h2>
          <p className="text-muted-foreground">Customize how you appear to others</p>
        </div>
        {profile && (
          <Link href={`/p/${profile.slug}`} className="flex items-center text-primary text-sm font-medium hover:underline">
            View Public Page <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-muted shadow-lg">
                  <AvatarImage 
                    src={form.watch("avatarUrl") ? (form.watch("avatarUrl").startsWith('/objects/') ? `/api${form.watch("avatarUrl")}` : form.watch("avatarUrl")) : undefined} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="text-4xl bg-primary/5 text-primary">
                    {form.watch("displayName")?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="avatar-upload"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Label 
                    htmlFor="avatar-upload" 
                    className={`inline-flex items-center justify-center h-10 px-4 rounded-full bg-secondary text-secondary-foreground text-sm font-medium cursor-pointer hover-elevate transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Photo
                  </Label>
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" {...form.register("displayName")} />
                    {form.formState.errors.displayName && <p className="text-red-500 text-xs">{form.formState.errors.displayName.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" placeholder="+1234567890" {...form.register("phoneNumber")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Profile URL Slug</Label>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground bg-gray-50 border border-r-0 rounded-l-xl px-3 py-[10px] h-11 border-input">
                        /p/
                      </span>
                      <Input id="slug" className="rounded-l-none" {...form.register("slug")} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
                  <Input id="avatarUrl" placeholder="https://..." {...form.register("avatarUrl")} readOnly />
                  <p className="text-xs text-muted-foreground">Upload your photo above or provide a direct link</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell people about yourself..." {...form.register("bio")} className="min-h-[100px]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="themeColor">Accent Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="themeColor"
                    type="color"
                    className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                    {...form.register("themeColor")}
                  />
                  <Input
                    type="text"
                    {...form.register("themeColor")}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="backgroundColor"
                    type="color"
                    className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                    {...form.register("backgroundColor")}
                  />
                  <Input
                    type="text"
                    {...form.register("backgroundColor")}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
