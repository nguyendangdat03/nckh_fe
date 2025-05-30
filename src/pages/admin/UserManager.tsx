import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Space, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import userService, { User, CreateUserDto, UpdateUserDto } from '../../services/userService';
import AdminLayout from '../../layouts/AdminLayout';

const { Option } = Select;

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showCreateModal = () => {
    setEditMode(false);
    setCurrentUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (user: User) => {
    setEditMode(true);
    setCurrentUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
      password: '',
    });
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editMode && currentUser) {
        // Nếu không nhập password thì không gửi lên server
        if (!values.password) {
          delete values.password;
        }
        
        await userService.updateUser(currentUser.user_id, values as UpdateUserDto);
        message.success('Cập nhật người dùng thành công');
      } else {
        await userService.createUser(values as CreateUserDto);
        message.success('Tạo người dùng thành công');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.deleteUser(id);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      message.error('Không thể xóa người dùng');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      sorter: (a: User, b: User) => a.user_id - b.user_id,
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'username',
      key: 'username',
      sorter: (a: User, b: User) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Họ tên đầy đủ',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = '';
        switch (role) {
          case 'ADMIN':
            color = 'red';
            break;
          case 'ADVISOR':
            color = 'green';
            break;
          case 'STUDENT':
            color = 'blue';
            break;
          default:
            color = 'default';
        }
        return <span style={{ color }}>{role}</span>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            type="primary"
            ghost
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.user_id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Thêm người dùng
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="user_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Spin>

        <Modal
          title={editMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          open={modalVisible}
          onCancel={handleCancel}
          onOk={handleSubmit}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
              ]}
            >
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input placeholder="Nhập email" type="email" />
            </Form.Item>

            <Form.Item
              name="fullname"
              label="Họ tên đầy đủ"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên đầy đủ' }]}
            >
              <Input placeholder="Nhập họ tên đầy đủ" />
            </Form.Item>

            <Form.Item
              name="password"
              label={editMode ? 'Mật khẩu (để trống nếu không thay đổi)' : 'Mật khẩu'}
              rules={[
                { required: !editMode, message: 'Vui lòng nhập mật khẩu' },
                editMode
                  ? {}
                  : { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value="ADMIN">Admin</Option>
                <Option value="ADVISOR">Cố vấn</Option>
                <Option value="STUDENT">Sinh viên</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default UserManager; 