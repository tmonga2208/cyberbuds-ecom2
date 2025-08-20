"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc-client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignupForm = z.infer<typeof signupSchema>

function SignupFormComponent({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })
  const signup = trpc.users.signup.useMutation()

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup.mutateAsync(data)
      toast.success("Account created! You can now log in.")
      reset()
      onSuccess()
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        toast.error((err as { message?: string })?.message || "Signup failed")
      } else if (err && typeof err === "object" && "data" in err && (err as any).data?.message) {
        toast.error((err as any).data.message)
      } else {
        toast.error("Signup failed")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")}/>
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")}/>
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")}/>
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  )
}

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex justify-center gap-4">
            <button
              className={`px-4 py-2 rounded-t ${tab === "login" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 rounded-t ${tab === "signup" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              onClick={() => setTab("signup")}
            >
              Sign Up
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tab === "login" ? <LoginForm /> : <SignupFormComponent onSuccess={() => setTab("login")} />}
        </CardContent>
      </Card>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin",
    })
    setLoading(false)
    if (res?.ok) {
      toast.success("Logged in successfully!")
      router.push("/admin")
    } else {
      toast.error(res?.error || "Invalid credentials")
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  )
}
