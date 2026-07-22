import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Mookk - 종이책 크라우드펀딩 플랫폼",
  description: "종이책 출판을 위한 크라우드펀딩 플랫폼 Mookk(묶)입니다.",
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let profile = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: userProfile } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single();
        
      profile = userProfile;
    }
  } catch (error) {
    console.error("Layout auth check failed:", error);
  }

  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col text-mookk-dark bg-background">
        <Header initialUser={profile} />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
