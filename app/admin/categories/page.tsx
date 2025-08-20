"use client"
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc-client';
import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogDemo() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Add Category</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

function Page() {
  const { data: categories, isLoading } = trpc.categories.getAll.useQuery();
  const [onDelete, setOnDelete] = useState(false);

    if (isLoading) {
        return <div>Loading...</div>;
    }
  
  const handleDelete = () => {
    setOnDelete(!onDelete);
  }
    
  return (
    <div>
      <div className='flex justify-between items-center pb-2 mb-4  border-b-2 border-black'>
        <h1>Categories</h1>
        <div className='flex gap-4'>
          <DialogDemo/>
        <Button onClick={handleDelete}>Remove Category</Button>
        </div>
      </div>
      <div>
        <ul className='grid gap-2'>
          {categories?.map((category) => (
          <li className='flex justify-between items-center' key={category._id}>{category.name}{onDelete?(
            <Checkbox />
          ):null}</li>
        ))}
        </ul>
        {onDelete ? (
          <Button className='my-4'>
            Delete 
        </Button>
        ):null}
      </div>
    </div>
  )
}

export default Page
