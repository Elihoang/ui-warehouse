"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Warehouse, Lock, User, Mail, UserCircle, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Staff",
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.userName || !formData.email || !formData.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    setLoading(true)
    try {
      await register(formData.userName, formData.email, formData.password, formData.role)
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.")
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại")
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký tài khoản</h1>
          <p className="text-slate-600 text-sm">Tạo tài khoản mới cho hệ thống quản lý kho</p>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tên đăng nhập</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-500" />
                  <input
                    type="text"
                    name="userName"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.userName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-500" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Vai trò</label>
                <div className="relative">
                  <UserCircle className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-500 pointer-events-none" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none"
                  >
                    <option value="Staff">Nhân viên</option>
                    <option value="Manager">Quản lý</option>
                    <option value="Admin">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-500" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-slate-600 text-sm">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                  >
                    Đăng nhập ngay
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
