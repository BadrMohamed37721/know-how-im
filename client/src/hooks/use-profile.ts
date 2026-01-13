import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { type InsertProfile, type InsertLink, type Profile, type Link } from "@shared/schema";
import { z } from "zod";

// Fetch current user's profile and links
export function useMyProfile() {
  return useQuery({
    queryKey: [api.profiles.me.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.me.path, { credentials: "include" });
      if (res.status === 401) return null; // Not authenticated
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.me.responses[200].parse(await res.json());
    },
  });
}

// Fetch public profile by slug
export function usePublicProfile(slug: string) {
  return useQuery({
    queryKey: [api.profiles.getBySlug.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.profiles.getBySlug.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch public profile");
      return api.profiles.getBySlug.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

// Update profile details
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<InsertProfile>) => {
      const validated = api.profiles.update.input.parse(updates);
      const res = await fetch(api.profiles.update.path, {
        method: api.profiles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to update profile");
      }
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}

// Create a new link
export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertLink) => {
      const validated = api.links.create.input.parse(data);
      const res = await fetch(api.links.create.path, {
        method: api.links.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create link");
      return api.links.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}

// Update an existing link
export function useUpdateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertLink>) => {
      const validated = api.links.update.input.parse(updates);
      const url = buildUrl(api.links.update.path, { id });
      const res = await fetch(url, {
        method: api.links.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update link");
      return api.links.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}

// Delete a link
export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.links.delete.path, { id });
      const res = await fetch(url, {
        method: api.links.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete link");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}

// Reorder links
export function useReorderLinks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (linkIds: number[]) => {
      const res = await fetch(api.links.reorder.path, {
        method: api.links.reorder.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reorder links");
      return api.links.reorder.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}
