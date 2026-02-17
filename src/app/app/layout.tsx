import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/nav/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/app");
  }

  // Check if profile is complete
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  // Check if suspended
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suspendedAt: true },
  });

  if (user?.suspendedAt) {
    redirect("/auth/sign-in?error=suspended");
  }

  return (
    <AppShell
      user={{
        id: session.user.id,
        name: session.user.name || "",
        role: session.user.role,
        screenLightMode: profile.screenLightMode,
      }}
    >
      {children}
    </AppShell>
  );
}
