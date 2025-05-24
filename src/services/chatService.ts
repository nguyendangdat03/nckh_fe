import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { getCurrentUser } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Message {
  id: number;
  content: string;
  sender: {
    user_id: number;
    username: string;
    role: string;
  };
  receiver: {
    user_id: number;
    username: string;
    role: string;
  };
  is_read: boolean;
  created_at: string;
  chat_box_id?: number;
}

export interface User {
  user_id: number;
  username: string;
  role: string;
  email?: string;
}

export interface ChatBox {
  id: number;
  student_id: number;
  advisor_id: number;
  student?: {
    user_id: number;
    username: string;
    role: string;
  };
  advisor?: {
    user_id: number;
    username: string;
    role: string;
  };
  messages?: Message[];
  created_at: string;
}

class ChatService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];
  private messageReadCallbacks: ((data: { messageId: number, readBy: number }) => void)[] = [];

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('newMessage', (message: Message) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('messageRead', (data: { messageId: number, readBy: number }) => {
      this.messageReadCallbacks.forEach(callback => callback(data));
    });
  }

  public reconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.initSocket();
  }

  public onNewMessage(callback: (message: Message) => void) {
    this.messageCallbacks.push(callback);
  }

  public onMessageRead(callback: (data: { messageId: number, readBy: number }) => void) {
    this.messageReadCallbacks.push(callback);
  }

  public removeListener(callback: (message: Message) => void) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  public removeMessageReadListener(callback: (data: { messageId: number, readBy: number }) => void) {
    this.messageReadCallbacks = this.messageReadCallbacks.filter(cb => cb !== callback);
  }

  public async getMessages(otherUserId: number): Promise<Message[]> {
    try {
      const response = await axios.get(`${API_URL}/chat/messages/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn:', error);
      throw error;
    }
  }

  public async getUnreadMessages(): Promise<Message[]> {
    try {
      const response = await axios.get(`${API_URL}/chat/unread`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn chưa đọc:', error);
      throw error;
    }
  }

  public async sendMessage(receiverId: number, content: string): Promise<Message> {
    try {
      // Sử dụng socket để gửi tin nhắn nếu đang kết nối
      if (this.socket && this.socket.connected) {
        return new Promise((resolve) => {
          this.socket!.emit('sendMessage', { receiverId, content }, (response: Message) => {
            resolve(response);
          });
        });
      } else {
        // Sử dụng REST API nếu không có kết nối socket
        const response = await axios.post(`${API_URL}/chat/messages`, { receiverId, content });
        return response.data;
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      throw error;
    }
  }

  public async markAsRead(messageId: number): Promise<Message> {
    try {
      // Sử dụng socket để đánh dấu đã đọc nếu đang kết nối
      if (this.socket && this.socket.connected) {
        return new Promise((resolve) => {
          this.socket!.emit('markAsRead', messageId, (response: Message) => {
            resolve(response);
          });
        });
      } else {
        // Sử dụng REST API nếu không có kết nối socket
        const response = await axios.post(`${API_URL}/chat/messages/${messageId}/read`);
        return response.data;
      }
    } catch (error) {
      console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
      throw error;
    }
  }
  
  // Lấy danh sách sinh viên cố vấn (cho advisor)
  public async getStudentsForAdvisor(): Promise<User[]> {
    try {
      const user = getCurrentUser();
      if (!user || user.role !== 'advisor') {
        throw new Error('Không có quyền truy cập');
      }
      
      const response = await axios.get(`${API_URL}/students`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sinh viên:', error);
      throw error;
    }
  }

  // API mới - Lấy tất cả sinh viên
  public async getAllStudents(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_URL}/students`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sinh viên:', error);
      throw error;
    }
  }
  
  // API mới - Lấy tất cả cố vấn
  public async getAllAdvisors(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_URL}/advisors`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cố vấn:', error);
      throw error;
    }
  }

  // API mới cho ChatBox
  public async createChatBox(studentId: number, advisorId: number): Promise<ChatBox> {
    try {
      const response = await axios.post(`${API_URL}/chat/boxes`, {
        student_id: studentId,
        advisor_id: advisorId
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo box chat:', error);
      throw error;
    }
  }

  // Tạo box chat với advisor ID cụ thể
  public async createChatBoxWithAdvisorId(advisorId: number): Promise<ChatBox> {
    try {
      const response = await axios.post(`${API_URL}/chat/boxes/${advisorId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo box chat:', error);
      throw error;
    }
  }

  public async getChatBoxes(): Promise<ChatBox[]> {
    try {
      const response = await axios.get(`${API_URL}/chat/boxes`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách box chat:', error);
      throw error;
    }
  }

  public async getChatBoxById(id: number): Promise<ChatBox> {
    try {
      const response = await axios.get(`${API_URL}/chat/boxes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin box chat:', error);
      throw error;
    }
  }

  public async getMessagesByChatBoxId(chatBoxId: number): Promise<Message[]> {
    try {
      const response = await axios.get(`${API_URL}/chat/boxes/${chatBoxId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn trong box chat:', error);
      throw error;
    }
  }

  public async sendMessageToChatBox(chatBoxId: number, content: string): Promise<Message> {
    try {
      const response = await axios.post(`${API_URL}/chat/boxes/${chatBoxId}/messages`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn trong box chat:', error);
      throw error;
    }
  }
}

export default new ChatService(); 