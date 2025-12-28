import db from '@/lib/db';
import UsersClient from './UsersClient';



export default async function UsersPage() {
    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return <UsersClient users={users} />;
}
