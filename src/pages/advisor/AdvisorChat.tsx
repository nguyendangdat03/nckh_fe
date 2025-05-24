import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../services/AuthContext";
import AdvisorLayout from "../../layouts/AdvisorLayout";
import chatService, { Message, User } from "../../services/chatService";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";

const AdvisorChat: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{[key: number]: number}>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách sinh viên
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const studentsData = await chatService.getStudentsForAdvisor();
        setStudents(studentsData);
        
        // Lấy tin nhắn chưa đọc để hiển thị badge
        const unreadMessages = await chatService.getUnreadMessages();
        const counts = unreadMessages.reduce((acc: {[key: number]: number}, msg) => {
          const senderId = msg.sender.user_id;
          acc[senderId] = (acc[senderId] || 0) + 1;
          return acc;
        }, {});
        setUnreadCounts(counts);

        if (studentsData.length > 0 && !selectedStudent) {
          setSelectedStudent(studentsData[0]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sinh viên:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Lấy tin nhắn khi chọn sinh viên
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedStudent) return;

      try {
        setIsLoading(true);
        const messagesData = await chatService.getMessages(selectedStudent.user_id);
        setMessages(messagesData);

        // Đánh dấu tin nhắn đã đọc
        const unreadMessages = messagesData.filter(
          msg => !msg.is_read && msg.sender.user_id === selectedStudent.user_id
        );
        
        // Cập nhật lại số tin nhắn chưa đọc
        if (unreadMessages.length > 0) {
          setUnreadCounts(prev => ({
            ...prev,
            [selectedStudent.user_id]: 0
          }));
          
          // Đánh dấu là đã đọc
          for (const msg of unreadMessages) {
            await chatService.markAsRead(msg.id);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedStudent]);

  // Cuộn xuống tin nhắn cuối cùng
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Cập nhật tin nhắn nếu đang chat với người gửi
      if (selectedStudent && message.sender.user_id === selectedStudent.user_id) {
        setMessages(prev => [...prev, message]);
        chatService.markAsRead(message.id);
      } else {
        // Cập nhật số tin nhắn chưa đọc
        setUnreadCounts(prev => ({
          ...prev,
          [message.sender.user_id]: (prev[message.sender.user_id] || 0) + 1
        }));
      }
    };

    chatService.onNewMessage(handleNewMessage);

    return () => {
      chatService.removeListener(handleNewMessage);
    };
  }, [selectedStudent]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !newMessage.trim() || !currentUser) return;
    
    try {
      setSendingMessage(true);
      const sentMessage = await chatService.sendMessage(selectedStudent.user_id, newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSelectStudent = (student: User) => {
    setSelectedStudent(student);
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
    <AdvisorLayout>
      <div className="h-full flex flex-col">
        <div className="text-xl font-semibold mb-4 px-4 py-2 bg-indigo-900 text-white rounded-md">
          Tin nhắn trao đổi với sinh viên
        </div>
        <div className="flex flex-1 overflow-hidden border border-gray-200 rounded-md">
          {/* Danh sách sinh viên */}
          <div className="w-1/4 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-2 font-semibold text-gray-700 bg-gray-200">
              Danh sách sinh viên
            </div>
            {isLoading && students.length === 0 ? (
              <div className="flex justify-center items-center h-20">
                <FaSpinner className="animate-spin text-indigo-600 text-xl" />
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.user_id}
                  className={`flex items-center p-3 border-b border-gray-200 cursor-pointer ${
                    selectedStudent?.user_id === student.user_id
                      ? "bg-indigo-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectStudent(student)}
                >
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {student.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{student.username}</div>
                    <div className="text-xs text-gray-500">{student.role === 'student' ? 'Sinh viên' : student.role}</div>
                  </div>
                  {unreadCounts[student.user_id] > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCounts[student.user_id]}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Khu vực chat */}
          <div className="flex-1 flex flex-col">
            {selectedStudent ? (
              <>
                {/* Header */}
                <div className="p-3 border-b border-gray-200 bg-white flex items-center">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {selectedStudent.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{selectedStudent.username}</div>
                    <div className="text-xs text-gray-500">{selectedStudent.role === 'student' ? 'Sinh viên' : selectedStudent.role}</div>
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
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
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
                      Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
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
              <div className="flex items-center justify-center h-full text-gray-500">
                Chọn một sinh viên để bắt đầu trò chuyện
              </div>
            )}
          </div>
        </div>
      </div>
    </AdvisorLayout>
  );
};

export default AdvisorChat; 