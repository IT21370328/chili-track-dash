import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Lock } from "lucide-react"
import Bg from "../assets/bg.jpg"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (username === "Rachitha" && password === "Rachitha123456") {
      localStorage.setItem("isLoggedIn", "true")
      toast({ title: "Login Successful", description: "Welcome back, Admin!" })
      navigate("/dashboard")
    } else {
      toast({ title: "Login Failed", description: "Invalid username or password", variant: "destructive" })
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${Bg})` }}
    >

      {/* Login card */}
      <Card className="relative z-10 w-full max-w-md p-8 space-y-6 shadow-2xl bg-white/90 backdrop-blur-xl border border-white/40">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-gray-300 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-gray-300 focus:ring-indigo-500"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Login
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default Login
