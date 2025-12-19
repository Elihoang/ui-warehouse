import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-[120px] bg-white overflow-hidden">
      {/* Decorative SVG */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="70%" cy="30%" r="300" fill="#e0e7ff" opacity="0.4" />
        <circle cx="20%" cy="80%" r="200" fill="#bae6fd" opacity="0.3" />
      </svg>

      <div className="flex flex-col items-center relative z-10">
        <div className="mb-4">
          <span className="inline-block text-blue-500 text-[80px] sm:text-[100px] md:text-[120px] font-extrabold drop-shadow-lg animate-bounce">
            404
          </span>
        </div>
        <h4 className="mb-2 text-2xl sm:text-3xl font-bold text-blue-700 drop-shadow">
          Oops! Không tìm thấy trang
        </h4>
        <p className="mb-8 text-gray-700 text-base sm:text-lg text-center">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          <br />
          <span className="text-blue-500">Hãy quay lại trang chủ nhé!</span>
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-blue-500 px-8 py-3 text-base font-semibold text-blue-700 bg-white/80 shadow hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out"
        >
          <Home className="h-5 w-5" />
          Về trang chủ
        </Link>
      </div>

      {/* Extra floating shapes */}
      <div className="pointer-events-none absolute animate-spin-slow left-10 top-10 w-24 h-24 bg-blue-200/60 rounded-full blur-2xl"></div>
      <div className="pointer-events-none absolute animate-pulse right-10 bottom-10 w-32 h-32 bg-blue-400/40 rounded-full blur-3xl"></div>
    </section>
  );
};

export default NotFound;
