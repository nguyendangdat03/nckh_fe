import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { FaPaperPlane, FaImage, FaFile, FaSmile } from "react-icons/fa";

interface Message {
  id: number;
  sender: "student" | "teacher";
  content: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "student",
      content: "Chào thầy, em có thắc mắc về bài tập tuần trước ạ",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      sender: "teacher",
      content: "Chào em, thầy đang rảnh, em cứ hỏi nhé",
      timestamp: "10:31 AM",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        sender: "student",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  return (
    <MainLayout>
      <div className="flex h-full w-full">
        {/* Danh sách người dùng */}
        <div className="w-1/4 bg-white border-r border-gray-200 h-full">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div
            className="overflow-y-auto"
            style={{ height: "calc(100% - 72px)" }}
          >
            {/* Danh sách giảng viên */}
            <div className="p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  TH
                </div>
                <div className="ml-4">
                  <div className="font-semibold">TS. Trần Hưng</div>
                  <div className="text-sm text-gray-500">Khoa CNTT</div>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  NT
                </div>
                <div className="ml-4">
                  <div className="font-semibold">ThS. Nguyễn Thành</div>
                  <div className="text-sm text-gray-500">Khoa CNTT</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Khu vực chat */}
        <div className="flex-1 flex flex-col bg-gray-50 h-full">
          {/* Header chat */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                TH
              </div>
              <div className="ml-4">
                <div className="font-semibold">TS. Trần Hưng</div>
                <div className="text-sm text-green-500">Đang hoạt động</div>
              </div>
            </div>
          </div>

          {/* Khu vực tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "student" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "student"
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "student"
                        ? "text-indigo-200"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thanh nhập tin nhắn */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <FaSmile className="text-gray-500 text-xl" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <FaImage className="text-gray-500 text-xl" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <FaFile className="text-gray-500 text-xl" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 mx-4 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatPage;
