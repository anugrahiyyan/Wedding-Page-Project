import { signOut } from '@/auth';
import DashboardClient from './DashboardClient';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const handleSignOut = async () => {
        'use server';
        await signOut();
    };

    return <DashboardClient signOutAction={handleSignOut}>{children}</DashboardClient>;
}
