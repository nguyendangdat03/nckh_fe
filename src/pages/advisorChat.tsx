import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdvisorLayout from "../layouts/AdvisorLayout";
import StudentLayout from "../layouts/StudentLayout";
import { useAuth } from "../services/AuthContext";
import chatService, { ChatBox, Message } from "../services/chatService";
import { FaPaperPlane, FaSpinner, FaArrowLeft, FaUserCircle, FaPlus } from "react-icons/fa";

const AdvisorChat: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const chatBoxId = id ? parseInt(id) : undefined;

  const [chatBoxes, setChatBoxes] = useState<ChatBox[]>([]);
  const [selectedChatBox, setSelectedChatBox] = useState<ChatBox | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách chat boxes
  useEffect(() => {
    const fetchChatBoxes = async () => {
      try {
        const boxes = await chatService.getChatBoxes();
        setChatBoxes(boxes);

        // Nếu có chatBoxId trong URL, chọn box đó
        if (chatBoxId) {
          const box = boxes.find(b => b.id === chatBoxId);
          if (box) {
            setSelectedChatBox(box);
          } else {
            // Nếu không tìm thấy box với ID đó, chọn box đầu tiên nếu có
            if (boxes.length > 0) {
              setSelectedChatBox(boxes[0]);
            }
          }
        } else if (boxes.length > 0) {
          // Nếu không có chatBoxId trong URL, chọn box đầu tiên
          setSelectedChatBox(boxes[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách box chat:", error);
        // Hiển thị lỗi và vẫn cho phép người dùng tạo box chat mới
        setChatBoxes([]);
        setSelectedChatBox(null);
        setLoading(false);
      }
    };

    fetchChatBoxes();
    
    // Thiết lập listener cho tin nhắn mới
    const messageHandler = (message: Message) => {
      if (selectedChatBox && message.chat_box_id === selectedChatBox.id) {
        setMessages(prev => [...prev, message]);
      }
    };
    
    chatService.onNewMessage(messageHandler);
    
    return () => {
      chatService.removeListener(messageHandler);
    };
  }, [chatBoxId]);

  // Lấy tin nhắn khi chọn chat box
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatBox) return;
      
      try {
        const msgs = await chatService.getMessagesByChatBoxId(selectedChatBox.id);
        setMessages(msgs);
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };

    if (selectedChatBox) {
      fetchMessages();
      
      // Cập nhật URL để lưu trạng thái
      navigate(`/advisor-chat/${selectedChatBox.id}`, { replace: true });
    }
  }, [selectedChatBox, navigate]);

  // Cuộn xuống tin nhắn cuối cùng
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectChatBox = (chatBox: ChatBox) => {
    setSelectedChatBox(chatBox);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChatBox) return;
    
    try {
      setSendingMessage(true);
      
      const sentMessage = await chatService.sendMessageToChatBox(
        selectedChatBox.id,
        newMessage
      );
      
      // Thêm tin nhắn vừa gửi vào danh sách
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

  // Lấy tên người dùng trong chat box dựa trên role
  const getChatPartner = (chatBox: ChatBox) => {
    if (!currentUser) return "Không xác định";
    
    if (currentUser.role === "student") {
      return chatBox.advisor?.username || "Giảng viên";
    } else {
      return chatBox.student?.username || "Sinh viên";
    }
  };

  if (loading) {
    // Sử dụng layout phù hợp với vai trò người dùng
    const Layout = currentUser?.role === "advisor" ? AdvisorLayout : 
                  currentUser?.role === "student" ? StudentLayout : MainLayout;
    
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <FaSpinner className="animate-spin text-indigo-600" size={40} />
        </div>
      </Layout>
    );
  }

  // Sử dụng layout phù hợp với vai trò người dùng
  const Layout = currentUser?.role === "advisor" ? AdvisorLayout : 
                currentUser?.role === "student" ? StudentLayout : MainLayout;

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="text-xl font-semibold mb-4 px-4 py-2 bg-indigo-900 text-white rounded-md">
          Trao đổi với {currentUser?.role === "student" ? "Giảng viên" : "Sinh viên"}
        </div>
        <div className="flex flex-1 overflow-hidden border border-gray-200 rounded-md">
          {/* Danh sách chat boxes */}
          <div className="w-1/4 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 font-medium text-gray-700 flex justify-between items-center">
              <span>Danh sách hội thoại</span>
              <button 
                onClick={() => navigate("/create-chat")}
                className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-indigo-700"
                title="Tạo cuộc trò chuyện mới"
              >
                <FaPlus size={12} />
              </button>
            </div>
            
            {chatBoxes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 flex flex-col items-center">
                <div className="mb-2">Không có hội thoại nào</div>
                <button
                  onClick={() => navigate(currentUser?.role === "student" ? "/student-create-chat" : "/create-chat")}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                >
                  <FaPlus className="mr-2" /> Tạo cuộc trò chuyện
                </button>
              </div>
            ) : (
              chatBoxes.map(box => (
                <div
                  key={box.id}
                  className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                    selectedChatBox?.id === box.id ? "bg-indigo-50" : ""
                  }`}
                  onClick={() => handleSelectChatBox(box)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-semibold mr-3">
                      <FaUserCircle size={20} />
                    </div>
                    <div>
                      <div className="font-medium">{getChatPartner(box)}</div>
                      <div className="text-xs text-gray-500">
                        {box.created_at ? formatDate(box.created_at) : "Mới"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Khu vực chat */}
          {selectedChatBox ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-3 border-b border-gray-200 bg-white flex items-center">
                <button 
                  className="md:hidden mr-2"
                  onClick={() => setSelectedChatBox(null)}
                >
                  <FaArrowLeft />
                </button>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-semibold mr-3">
                  <FaUserCircle size={20} />
                </div>
                <div>
                  <div className="font-semibold">{getChatPartner(selectedChatBox)}</div>
                  <div className="text-xs text-gray-500">
                    {currentUser?.role === "student" ? "Giảng viên" : "Sinh viên"}
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {Object.entries(messageGroups).map(([date, msgs]) => (
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
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 text-xs font-medium mr-2">
                              {getChatPartner(selectedChatBox).substring(0, 1).toUpperCase()}
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
                              {!isCurrentUser && msg.is_read && (
                                <span className="ml-1">• Đã xem</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
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
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <div className="text-5xl mb-4">💬</div>
                <div className="text-xl font-medium">Chọn một hội thoại để bắt đầu</div>
                {chatBoxes.length === 0 && (
                  <div className="mt-2">Bạn chưa có hội thoại nào</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdvisorChat; 