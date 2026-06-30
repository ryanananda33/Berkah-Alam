import React from "react";
import { createClient } from "@/utils/supabase/server";
import HeroClient from "./HeroClient";

export default async function AdminHeroPage() {
  let hero = null;

  try {
    const supabase = await createClient();

    // Fetch hero records
    const { data } = await supabase
      .from("hero")
      .select("*")
      .order("id", { ascending: true })
      .limit(1);

    if (data && data.length > 0) {
      hero = data[0];
    }
  } catch (error) {
    console.error("Gagal memuat banner hero:", error);
  }

  // Fallback data
  if (!hero) {
    hero = {
      id: 1,
      judul: "BERKAH ALAM",
      subjudul: "Menghadirkan Batu Nisan, Prasasti, dan Monumen Berkualitas dengan Sentuhan Seni dan Presisi.",
      gambar: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1920&q=80",
    };
  }

  return (
    <HeroClient 
      hero={hero} 
    />
  );
}
