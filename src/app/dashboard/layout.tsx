import { signOut } from '@/auth';
import DashboardClient from './DashboardClient';
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const handleSignOut = async () => {
        'use server';
        await signOut();
    };

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="dashboard-theme"
        >
            <DashboardClient signOutAction={handleSignOut}>{children}</DashboardClient>
        </ThemeProvider>
    );
}
