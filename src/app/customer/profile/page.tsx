import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProfileClient from "./ProfileClient";

export default async function CustomerProfilePage() {
  let user = null;
  let profile = null;

  const supabase = await createClient();

  // Fetch user
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) {
    redirect("/login");
  }
  user = supabaseUser;

  try {

    // Fetch profile
    const { data: profileData } = await supabase
      .from("users")
      .select("name, phone, address")
      .eq("id", user.id)
      .single();

    if (profileData) {
      profile = profileData;
    } else {
      // Fallback
      profile = {
        name: user.user_metadata?.name || user.email?.split("@")[0] || "",
        phone: user.user_metadata?.phone || "",
        address: user.user_metadata?.address || "",
      };
    }
  } catch (error) {
    console.error("Gagal memuat profil pengguna:", error);
  }

  return (
    <ProfileClient 
      user={user} 
      profile={profile} 
    />
  );
}
