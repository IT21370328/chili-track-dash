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

  // Function to log actions to audit log
  const logAction = (user, action, details) => {
    const timestamp = new Date().toISOString()
    const logEntry = { user, action, details, timestamp }
    const existingLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    localStorage.setItem("auditLogs", JSON.stringify([...existingLogs, logEntry]))
  }

  const handleLogin = (e) => {
    e.preventDefault()

    if (username === "Rachitha" && password === "Rachitha123456") {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userRole", "admin")
      logAction("Rachitha", "login", "Admin logged in")
      toast({ title: "Login Successful", description: "Welcome back, Admin!" })
      navigate("/dashboard")
    } else if (username === "Worker1" && password === "Worker123456") {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userRole", "worker")
      logAction("Worker1", "login", "Worker logged in")
      toast({ title: "Login Successful", description: "Welcome, Worker!" })
      navigate("/worker-dashboard")
    } else {
      toast({ title: "Login Failed", description: "Invalid username or password", variant: "destructive" })
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 sm:px-6"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      {/* Login card */}
      <Card className="relative z-10 w-full max-w-md sm:max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl bg-white/90 backdrop-blur-xl border border-white/40">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-500 text-sm sm:text-base text-center">Sign in to access your dashboard</p>
        </div>

        <div className="space-y-4 sm:space-y-5">
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
            onClick={handleLogin}
            className="w-full h-11 sm:h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Login
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Component to display audit logs (visible only to admin)
export const AuditLog = () => {
  const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
  const userRole = localStorage.getItem("userRole")

  if (userRole !== "admin") {
    return <div>Access Denied: Only admins can view audit logs.</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
      {logs.length === 0 ? (
        <p>No logs available.</p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log, index) => (
            <li key={index} className="p-2 bg-gray-100 rounded">
              <strong>{log.user}</strong> - {log.action} - {log.details} at {log.timestamp}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Login