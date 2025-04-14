import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import React from 'react'

const page = async () => {
    const session = await getServerSession(authOptions);
    console.log(session);

    if (session?.user) {
        return (
            <h2 className='text-2xl'>User Dashboard - Welcome back {session?.user.username}</h2>
        )
    }

    return <h2 className='text-2xl'>Please login to access the User Dashboard</h2>
}

export default page