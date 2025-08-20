"use client"
import { trpc } from '@/lib/trpc-client'
import React from 'react'
export default function Page() {
    const { data: users, isLoading } = trpc.users.getAll.useQuery();
    
    if (isLoading) {
        return <div>Loading...</div>
    }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all registered users</p>
      </div>   
      <div>
        <ul className='grid gap-3'>
          {users?.map((user) => (
            <li className='flex justify-between items-center p-4 border rounded-lg bg-card' key={user._id}>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
              <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}