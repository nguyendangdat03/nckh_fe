import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic đăng nhập ở đây
    console.log("Đăng nhập với:", { username, password, role });
    
    // Chuyển hướng dựa vào vai trò
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "advisor") {
      navigate("/advisor");
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-indigo-900 to-indigo-800">
      {/* Overlay và Background */}
      <div className="absolute inset-0 bg-indigo-900 bg-opacity-80 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-[-1]"
          style={{
            backgroundImage: "url('/path/to/background-image.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* Main Container - With Fixed Width */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 flex justify-center">
        <div className="w-full max-w-md">
          {/* Logo trường */}
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src="img/image.png"
              alt="Logo Trường Đại Học Tài Nguyên và Môi Trường Hà Nội"
              className="h-16 md:h-20 object-contain"
            />
            <div className="text-white text-center font-bold mt-2">
              <div className="text-lg md:text-xl">TRƯỜNG ĐẠI HỌC</div>
              <div className="text-lg md:text-xl">
                TÀI NGUYÊN VÀ MÔI TRƯỜNG HÀ NỘI
              </div>
            </div>
          </div>

          {/* Form đăng nhập */}
          <div className="w-full relative">
            {/* Mũi tên trang trí - Responsive positioning */}
            <div className="absolute top-8 right-4 md:right-6 text-blue-300 w-16 h-16 md:w-24 md:h-24 opacity-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 5L21 12L13 19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 md:p-8 relative overflow-hidden">
              {/* Tiêu đề */}
              <h1 className="text-xl md:text-2xl font-bold text-center text-indigo-900 mb-6 md:mb-8">
                ĐĂNG NHẬP
              </h1>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Input tài khoản */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 21C19 17.134 15.866 14 12 14C8.13401 14 5 17.134 5 21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="bg-gray-100 border border-gray-300 text-gray-700 text-sm md:text-base rounded-lg block w-full pl-10 p-2.5 md:p-3"
                    placeholder="Nhập tài khoản hoặc email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Input mật khẩu */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 9V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 14V17"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 9H4V21H20V9Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="bg-gray-100 border border-gray-300 text-gray-700 text-sm md:text-base rounded-lg block w-full pl-10 pr-10 p-2.5 md:p-3"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 12C2 12 5.63636 5 12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 12C2 12 5.63636 5 12 5C18.3636 5 22 12 22 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 3L21 21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>

               

                {/* Quên mật khẩu và Trợ giúp */}
                <div className="flex justify-between mb-6 md:mb-8 text-xs md:text-sm">
                  <a href="#" className="text-indigo-900 hover:underline">
                    Quên mật khẩu
                  </a>
                  <a
                    href="#"
                    className="text-indigo-900 hover:underline flex items-center"
                  >
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 16V12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 8H12.01"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Trợ giúp
                  </a>
                </div>

                {/* Nút đăng nhập */}
                <button
                  type="submit"
                  className={`w-full ${
                    role === "admin" 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : role === "advisor" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white font-medium rounded-lg text-sm md:text-base px-5 py-2.5 md:py-3 text-center transition-colors`}
                >
                  ĐĂNG NHẬP
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
