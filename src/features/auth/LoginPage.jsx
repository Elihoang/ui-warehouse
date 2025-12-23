"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Warehouse, Lock, User, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

export default function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!loginIdentifier || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    setLoading(true)
    try {
      await login(loginIdentifier, password)
      toast.success("Đăng nhập thành công!")
      navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3.5 bg-blue-600 rounded-lg shadow-lg">
              <Warehouse className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập</h1>
          <p className="text-slate-600 text-sm">Truy cập hệ thống quản lý kho BeWarehouseHub</p>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700">Tên đăng nhập hoặc Email</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Nhập username hoặc email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-slate-600 text-sm">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
