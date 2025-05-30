import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Space, Spin, Tabs, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined, TeamOutlined } from '@ant-design/icons';
import advisorService, { Advisor, CreateAdvisorDto } from '../../services/advisorService';
import userService, { User } from '../../services/userService';
import classService, { Class } from '../../services/classService';
import AdminLayout from '../../layouts/AdminLayout';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title } = Typography;

const AdvisorManager: React.FC = () => {
  // State cho danh sách cố vấn
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAdvisor, setCurrentAdvisor] = useState<User | null>(null);
  const [detailAdvisor, setDetailAdvisor] = useState<Advisor | null>(null);
  const [advisorForm] = Form.useForm();
  
  // State cho danh sách người dùng không phải cố vấn
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // State cho lớp học và sinh viên của cố vấn
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  
  // State cho form thông tin chi tiết cố vấn
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailForm] = Form.useForm();
  
  // Tải danh sách cố vấn
  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const data = await advisorService.getAllAdvisors();
      setAdvisors(data);
    } catch (error) {
      message.error('Không thể tải danh sách cố vấn');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách người dùng có thể được gán làm cố vấn
  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await userService.getAllUsers();
      // Lọc ra các người dùng chưa là cố vấn
      const nonAdvisors = allUsers.filter(user => 
        user.role !== 'ADVISOR'
      );
      setAvailableUsers(nonAdvisors);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Tải danh sách lớp học của cố vấn
  const fetchClassesByAdvisorId = async (advisorId: number) => {
    setClassesLoading(true);
    try {
      const data = await advisorService.getClassesByAdvisorId(advisorId);
      setClasses(data);
      setSelectedAdvisorId(advisorId);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học của cố vấn');
      console.error(error);
    } finally {
      setClassesLoading(false);
    }
  };

  // Tải danh sách sinh viên của cố vấn
  const fetchStudentsByAdvisorId = async (advisorId: number) => {
    setStudentsLoading(true);
    try {
      const data = await advisorService.getStudentsByAdvisorId(advisorId);
      setStudents(data);
      setSelectedAdvisorId(advisorId);
    } catch (error) {
      message.error('Không thể tải danh sách sinh viên của cố vấn');
      console.error(error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Tải thông tin chi tiết của cố vấn
  const fetchAdvisorDetail = async (advisorId: number) => {
    try {
      const data = await advisorService.getAdvisorById(advisorId);
      setDetailAdvisor(data);
      
      // Cập nhật form với dữ liệu cố vấn
      detailForm.setFieldsValue({
        full_name: data.full_name,
        department: data.department,
        contact_email: data.contact_email,
        phone_number: data.phone_number || '',
        office_location: data.office_location || '',
        advisor_code: data.advisor_code || ''
      });
      
      setDetailVisible(true);
    } catch (error) {
      message.error('Không thể tải thông tin chi tiết cố vấn');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  // Modal tạo/sửa cố vấn
  const showCreateModal = () => {
    setEditMode(false);
    setCurrentAdvisor(null);
    advisorForm.resetFields();
    fetchAvailableUsers();
    setModalVisible(true);
  };

  const showEditModal = (user: User) => {
    setEditMode(true);
    setCurrentAdvisor(user);
    fetchAdvisorDetail(user.user_id);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleDetailCancel = () => {
    setDetailVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await advisorForm.validateFields();
      
      // Từ user_id, lấy thông tin user để tạo advisor
      const user = await userService.getUserById(values.user_id);
      
      const advisorData: CreateAdvisorDto = {
        user_id: values.user_id,
        full_name: user.fullname || user.username,
        department: values.department || 'Chưa có bộ môn',
        contact_email: user.email,
        phone_number: values.phone_number,
        office_location: values.office_location,
        advisor_code: values.advisor_code
      };
      
      await advisorService.createAdvisor(advisorData);
      
      // Cập nhật role của user thành ADVISOR
      await userService.updateUser(values.user_id, { role: 'ADVISOR' });
      
      message.success('Tạo cố vấn học tập thành công');
      
      setModalVisible(false);
      fetchAdvisors();
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleDetailSubmit = async () => {
    if (!detailAdvisor) return;
    
    try {
      const values = await detailForm.validateFields();
      
      await advisorService.updateAdvisor(detailAdvisor.advisor_id, values);
      message.success('Cập nhật thông tin cố vấn thành công');
      
      setDetailVisible(false);
      fetchAdvisors();
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleDelete = async (user: User) => {
    try {
      // Lấy thông tin advisor theo user_id
      const advisor = await advisorService.getAdvisorById(user.user_id);
      
      // Xóa advisor
      await advisorService.deleteAdvisor(advisor.advisor_id);
      
      // Cập nhật role của user thành USER 
      await userService.updateUser(user.user_id, { role: 'USER' });
      
      message.success('Xóa cố vấn học tập thành công');
      fetchAdvisors();
    } catch (error) {
      message.error('Không thể xóa cố vấn học tập');
      console.error(error);
    }
  };

  // Cột cho bảng cố vấn
  const advisorColumns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 60,
    },
    {
      title: 'Mã cố vấn',
      dataIndex: 'advisor_code',
      key: 'advisor_code',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (fullname: string, record: User) => fullname || record.username,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            type="primary"
            ghost
          >
            Xem & Sửa
          </Button>
          <Button
            icon={<TeamOutlined />} 
            onClick={() => fetchStudentsByAdvisorId(record.user_id)}
          >
            DS Sinh viên
          </Button>
          <Button
            icon={<UsergroupAddOutlined />}
            onClick={() => fetchClassesByAdvisorId(record.user_id)}
          >
            DS Lớp
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa cố vấn học tập này?"
            onConfirm={() => handleDelete(record)}
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

  // Cột cho bảng lớp học của cố vấn
  const classColumns = [
    {
      title: 'ID',
      dataIndex: 'class_id',
      key: 'class_id',
      width: 60,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'class_name',
      key: 'class_name',
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'major',
      key: 'major',
    },
    {
      title: 'Năm bắt đầu',
      dataIndex: 'year_start',
      key: 'year_start',
    },
    {
      title: 'Năm kết thúc',
      dataIndex: 'year_end',
      key: 'year_end',
    },
    {
      title: 'Số sinh viên',
      dataIndex: 'students',
      key: 'students_count',
      render: (students: User[] | undefined) => (students ? students.length : 0),
    },
  ];

  // Cột cho bảng sinh viên của cố vấn
  const studentColumns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 60,
    },
    {
      title: 'Mã sinh viên',
      dataIndex: 'student_code',
      key: 'student_code',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (fullname: string, record: User) => fullname || record.username,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Lớp',
      dataIndex: 'class_name',
      key: 'class_name',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Danh sách cố vấn học tập" key="1">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Quản lý cố vấn học tập</h1>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
              >
                Thêm cố vấn học tập
              </Button>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={advisorColumns}
                dataSource={advisors}
                rowKey="user_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
              />
            </Spin>

            <Modal
              title="Thêm cố vấn học tập mới"
              open={modalVisible}
              onCancel={handleCancel}
              onOk={handleSubmit}
              width={600}
            >
              <Form
                form={advisorForm}
                layout="vertical"
              >
                <Form.Item
                  name="user_id"
                  label="Người dùng"
                  rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
                >
                  <Select 
                    placeholder="Chọn người dùng" 
                    loading={loadingUsers}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {availableUsers.map(user => (
                      <Option key={user.user_id} value={user.user_id}>
                        {user.fullname || user.username} ({user.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="department"
                  label="Bộ môn/Khoa"
                >
                  <Input placeholder="Nhập bộ môn/khoa" />
                </Form.Item>

                <Form.Item
                  name="phone_number"
                  label="Số điện thoại"
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                  name="office_location"
                  label="Vị trí văn phòng"
                >
                  <Input placeholder="Nhập vị trí văn phòng" />
                </Form.Item>

                <Form.Item
                  name="advisor_code"
                  label="Mã cố vấn"
                >
                  <Input placeholder="Nhập mã cố vấn" />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Thông tin chi tiết cố vấn học tập"
              open={detailVisible}
              onCancel={handleDetailCancel}
              onOk={handleDetailSubmit}
              width={600}
            >
              <Form
                form={detailForm}
                layout="vertical"
              >
                <Form.Item
                  name="full_name"
                  label="Họ tên đầy đủ"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input placeholder="Nhập họ tên đầy đủ" />
                </Form.Item>

                <Form.Item
                  name="department"
                  label="Bộ môn/Khoa"
                  rules={[{ required: true, message: 'Vui lòng nhập bộ môn/khoa' }]}
                >
                  <Input placeholder="Nhập bộ môn/khoa" />
                </Form.Item>

                <Form.Item
                  name="contact_email"
                  label="Email liên hệ"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input placeholder="Nhập email liên hệ" type="email" />
                </Form.Item>

                <Form.Item
                  name="phone_number"
                  label="Số điện thoại"
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                  name="office_location"
                  label="Vị trí văn phòng"
                >
                  <Input placeholder="Nhập vị trí văn phòng" />
                </Form.Item>

                <Form.Item
                  name="advisor_code"
                  label="Mã cố vấn"
                >
                  <Input placeholder="Nhập mã cố vấn" />
                </Form.Item>
              </Form>
            </Modal>
          </TabPane>

          {selectedAdvisorId && (
            <>
              <TabPane tab="Danh sách lớp quản lý" key="2">
                <div className="mb-4">
                  <Title level={4}>
                    Danh sách lớp của cố vấn: {advisors.find(a => a.user_id === selectedAdvisorId)?.fullname}
                  </Title>
                </div>

                <Spin spinning={classesLoading}>
                  <Table
                    columns={classColumns}
                    dataSource={classes}
                    rowKey="class_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                  />
                </Spin>
              </TabPane>

              <TabPane tab="Danh sách sinh viên quản lý" key="3">
                <div className="mb-4">
                  <Title level={4}>
                    Danh sách sinh viên của cố vấn: {advisors.find(a => a.user_id === selectedAdvisorId)?.fullname}
                  </Title>
                </div>

                <Spin spinning={studentsLoading}>
                  <Table
                    columns={studentColumns}
                    dataSource={students}
                    rowKey="user_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                  />
                </Spin>
              </TabPane>
            </>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdvisorManager; 