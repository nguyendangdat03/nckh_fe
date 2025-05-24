import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../services/AuthContext";
import StudentLayout from "../../layouts/StudentLayout";
import chatService, { Message, User } from "../../services/chatService";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const StudentChat: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [advisor, setAdvisor] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy thông tin cố vấn học tập và tin nhắn chưa đọc
  useEffect(() => {
    const fetchAdvisor = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        // Lấy thông tin cố vấn học tập
        const response = await axios.get(`${API_URL}/users/my-advisor`);
        const advisorData = response.data;
        setAdvisor(advisorData);
        
        // Nếu có cố vấn, lấy lịch sử tin nhắn
        if (advisorData) {
          const messagesData = await chatService.getMessages(advisorData.user_id);
          setMessages(messagesData);
          
          // Đánh dấu tin nhắn đã đọc
          const unreadMessages = messagesData.filter(
            msg => !msg.is_read && msg.sender.user_id === advisorData.user_id
          );
          
          setUnreadCount(unreadMessages.length);
          
          // Đánh dấu là đã đọc
          for (const msg of unreadMessages) {
            await chatService.markAsRead(msg.id);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin cố vấn:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvisor();
  }, [currentUser]);

  // Cuộn xuống tin nhắn cuối cùng
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (advisor && message.sender.user_id === advisor.user_id) {
        setMessages(prev => [...prev, message]);
        chatService.markAsRead(message.id);
      }
    };

    chatService.onNewMessage(handleNewMessage);

    return () => {
      chatService.removeListener(handleNewMessage);
    };
  }, [advisor]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!advisor || !newMessage.trim() || !currentUser) return;
    
    try {
      setSendingMessage(true);
      const sentMessage = await chatService.sendMessage(advisor.user_id, newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Định dạng thời gian
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Định dạng ngày
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  // Nhóm tin nhắn theo ngày
  const groupMessagesByDate = () => {
    const groups: {[date: string]: Message[]} = {};
    messages.forEach(msg => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <StudentLayout>
      <div className="h-full flex flex-col">
        <div className="text-xl font-semibold mb-4 px-4 py-2 bg-indigo-900 text-white rounded-md">
          Tin nhắn với cố vấn học tập
        </div>
        <div className="flex flex-1 overflow-hidden border border-gray-200 rounded-md">
          {/* Khu vực chat */}
          <div className="flex-1 flex flex-col">
            {advisor ? (
              <>
                {/* Header */}
                <div className="p-3 border-b border-gray-200 bg-white flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {advisor.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{advisor.username}</div>
                    <div className="text-xs text-gray-500">Cố vấn học tập</div>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-20">
                      <FaSpinner className="animate-spin text-indigo-600 text-xl" />
                    </div>
                  ) : Object.entries(messageGroups).length > 0 ? (
                    Object.entries(messageGroups).map(([date, msgs]) => (
                      <div key={date}>
                        <div className="text-center my-3">
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {formatDate(msgs[0].created_at)}
                          </span>
                        </div>
                        {msgs.map((msg) => {
                          const isCurrentUser = currentUser?.user_id === msg.sender.user_id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex mb-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                              {!isCurrentUser && (
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                                  {msg.sender.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div
                                className={`max-w-[70%] px-3 py-2 rounded-lg ${
                                  isCurrentUser
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white border border-gray-200 text-gray-800"
                                }`}
                              >
                                <div className="text-sm">{msg.content}</div>
                                <div
                                  className={`text-xs mt-1 ${
                                    isCurrentUser ? "text-indigo-100" : "text-gray-500"
                                  }`}
                                >
                                  {formatTime(msg.created_at)}
                                  {isCurrentUser && msg.is_read && (
                                    <span className="ml-1">✓</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện với cố vấn học tập!
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-3 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      className={`bg-indigo-600 text-white px-4 rounded-r-md flex items-center justify-center ${
                        sendingMessage || !newMessage.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-indigo-700"
                      }`}
                      disabled={sendingMessage || !newMessage.trim()}
                    >
                      {sendingMessage ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaPaperPlane />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                {isLoading ? (
                  <FaSpinner className="animate-spin text-indigo-600 text-xl mb-2" />
                ) : (
                  <>
                    <div className="text-gray-500 text-center mb-2">
                      Không tìm thấy thông tin cố vấn học tập.
                    </div>
                    <div className="text-sm text-gray-400 text-center">
                      Vui lòng liên hệ với phòng đào tạo để được hỗ trợ.
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentChat; 