import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { UserPlus } from "lucide-react"
import Bg from "../assets/bg.jpg"

const Signup = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({ title: "Signup Failed", description: "Passwords do not match", variant: "destructive" })
      return
    }

    // 👉 Replace this with API call to your backend later
    localStorage.setItem("isLoggedIn", "true")
    toast({ title: "Account Created", description: "Welcome aboard!" })
    navigate("/dashboard")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      {/* Signup card */}
      <Card className="relative z-10 w-full max-w-md p-8 space-y-6 shadow-2xl bg-white/90 backdrop-blur-xl border border-white/40">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 text-sm">Join us and start tracking</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border-gray-300 focus:ring-green-500"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border-gray-300 focus:ring-green-500"
            required
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border-gray-300 focus:ring-green-500"
            required
          />
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Sign Up
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default Signup
