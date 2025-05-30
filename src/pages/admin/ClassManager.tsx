import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Space, Spin, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import classService, { Class, CreateClassDto, AddStudentDto } from '../../services/classService';
import userService, { User } from '../../services/userService';
import AdminLayout from '../../layouts/AdminLayout';

const { Option } = Select;
const { TabPane } = Tabs;

const ClassManager: React.FC = () => {
  // State cho danh sách lớp học
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [classForm] = Form.useForm();
  
  // State cho danh sách sinh viên trong lớp
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [studentForm] = Form.useForm();
  
  // State cho danh sách cố vấn (giáo viên)
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);

  // State cho danh sách sinh viên chưa có lớp
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [loadingAvailableStudents, setLoadingAvailableStudents] = useState(false);

  // Tải danh sách lớp học
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách cố vấn học tập
  const fetchAdvisors = async () => {
    setLoadingAdvisors(true);
    try {
      const allUsers = await userService.getAllUsers();
      // Lọc ra các người dùng có vai trò là cố vấn
      const advisorUsers = allUsers.filter(user => user.role === 'ADVISOR');
      setAdvisors(advisorUsers);
    } catch (error) {
      message.error('Không thể tải danh sách cố vấn học tập');
      console.error(error);
    } finally {
      setLoadingAdvisors(false);
    }
  };

  // Tải danh sách sinh viên chưa có lớp
  const fetchAvailableStudents = async () => {
    setLoadingAvailableStudents(true);
    try {
      const allUsers = await userService.getAllUsers();
      // Lọc ra các người dùng có vai trò là sinh viên và chưa có lớp
      const studentUsers = allUsers.filter(user => 
        user.role === 'STUDENT' && (!user.class_id || user.class_id === null)
      );
      setAvailableStudents(studentUsers);
    } catch (error) {
      message.error('Không thể tải danh sách sinh viên');
      console.error(error);
    } finally {
      setLoadingAvailableStudents(false);
    }
  };

  // Tải danh sách sinh viên của lớp
  const fetchStudentsByClassId = async (classId: number) => {
    setStudentsLoading(true);
    try {
      const data = await classService.getStudentsByClassId(classId);
      setStudents(data);
      setSelectedClassId(classId);
    } catch (error) {
      message.error('Không thể tải danh sách sinh viên của lớp');
      console.error(error);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAdvisors();
  }, []);

  // Modal tạo/sửa lớp học
  const showCreateModal = () => {
    setEditMode(false);
    setCurrentClass(null);
    classForm.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (classItem: Class) => {
    setEditMode(true);
    setCurrentClass(classItem);
    classForm.setFieldsValue({
      class_name: classItem.class_name,
      major: classItem.major,
      year_start: classItem.year_start,
      year_end: classItem.year_end,
      advisor_id: classItem.advisor_id,
    });
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await classForm.validateFields();

      if (editMode && currentClass) {
        await classService.updateClass(currentClass.class_id, values as Partial<CreateClassDto>);
        message.success('Cập nhật lớp học thành công');
      } else {
        await classService.createClass(values as CreateClassDto);
        message.success('Tạo lớp học thành công');
      }
      setModalVisible(false);
      fetchClasses();
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
      await classService.deleteClass(id);
      message.success('Xóa lớp học thành công');
      fetchClasses();
    } catch (error) {
      message.error('Không thể xóa lớp học');
      console.error(error);
    }
  };

  // Modal thêm sinh viên vào lớp
  const showAddStudentModal = (classId: number) => {
    setSelectedClassId(classId);
    // Tìm lớp học hiện tại
    const currentClass = classes.find(c => c.class_id === classId);
    if (currentClass) {
      studentForm.setFieldsValue({
        advisorId: currentClass.advisor_id
      });
    }
    fetchAvailableStudents();
    setStudentModalVisible(true);
  };

  const handleStudentCancel = () => {
    setStudentModalVisible(false);
  };

  const handleAddStudent = async () => {
    try {
      const values = await studentForm.validateFields();
      if (selectedClassId) {
        await classService.addStudentToClass(selectedClassId, values as AddStudentDto);
        message.success('Thêm sinh viên vào lớp thành công');
        setStudentModalVisible(false);
        // Cập nhật lại danh sách sinh viên của lớp nếu đang xem
        if (selectedClassId) {
          fetchStudentsByClassId(selectedClassId);
        }
        // Cập nhật lại danh sách lớp
        fetchClasses();
        // Cập nhật lại danh sách sinh viên có sẵn
        fetchAvailableStudents();
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra');
      }
    }
  };

  const handleRemoveStudent = async (classId: number, userId: number) => {
    try {
      await classService.removeStudentFromClass(classId, userId);
      message.success('Xóa sinh viên khỏi lớp thành công');
      // Cập nhật lại danh sách sinh viên của lớp
      fetchStudentsByClassId(classId);
      // Cập nhật lại danh sách lớp
      fetchClasses();
      // Cập nhật lại danh sách sinh viên có sẵn
      fetchAvailableStudents();
    } catch (error) {
      message.error('Không thể xóa sinh viên khỏi lớp');
      console.error(error);
    }
  };

  // Cột cho bảng lớp học
  const classColumns = [
    {
      title: 'ID',
      dataIndex: 'class_id',
      key: 'class_id',
      width: 80,
      sorter: (a: Class, b: Class) => a.class_id - b.class_id,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'class_name',
      key: 'class_name',
      sorter: (a: Class, b: Class) => a.class_name.localeCompare(b.class_name),
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
      title: 'Cố vấn',
      dataIndex: 'advisor',
      key: 'advisor',
      render: (advisor: User | undefined, record: Class) => {
        if (advisor) {
          return advisor.fullname || advisor.username;
        }
        return 'Chưa có cố vấn';
      },
    },
    {
      title: 'Số sinh viên',
      dataIndex: 'students',
      key: 'students_count',
      render: (students: User[] | undefined) => (students ? students.length : 0),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Class) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            type="primary"
            ghost
          >
            Sửa
          </Button>
          <Button
            icon={<UsergroupAddOutlined />}
            onClick={() => fetchStudentsByClassId(record.class_id)}
            type="default"
          >
            DS sinh viên
          </Button>
          <Button
            icon={<UserAddOutlined />}
            onClick={() => showAddStudentModal(record.class_id)}
            type="dashed"
          >
            Thêm SV
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa lớp học này?"
            onConfirm={() => handleDelete(record.class_id)}
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

  // Cột cho bảng sinh viên
  const studentColumns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 80,
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
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?"
          onConfirm={() => selectedClassId && handleRemoveStudent(selectedClassId, record.user_id)}
          okText="Có"
          cancelText="Không"
        >
          <Button icon={<DeleteOutlined />} danger>
            Xóa khỏi lớp
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Danh sách lớp học" key="1">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Quản lý lớp học</h1>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
              >
                Thêm lớp học
              </Button>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={classColumns}
                dataSource={classes}
                rowKey="class_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
              />
            </Spin>

            <Modal
              title={editMode ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
              open={modalVisible}
              onCancel={handleCancel}
              onOk={handleSubmit}
              width={600}
            >
              <Form
                form={classForm}
                layout="vertical"
              >
                <Form.Item
                  name="class_name"
                  label="Tên lớp"
                  rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}
                >
                  <Input placeholder="Nhập tên lớp" />
                </Form.Item>

                <Form.Item
                  name="major"
                  label="Chuyên ngành"
                  rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành' }]}
                >
                  <Input placeholder="Nhập chuyên ngành" />
                </Form.Item>

                <Form.Item
                  name="year_start"
                  label="Năm bắt đầu"
                  rules={[{ required: true, message: 'Vui lòng nhập năm bắt đầu' }]}
                >
                  <InputNumber placeholder="Nhập năm bắt đầu" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="year_end"
                  label="Năm kết thúc"
                  rules={[{ required: true, message: 'Vui lòng nhập năm kết thúc' }]}
                >
                  <InputNumber placeholder="Nhập năm kết thúc" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="advisor_id"
                  label="Cố vấn học tập"
                  rules={[{ required: true, message: 'Vui lòng chọn cố vấn học tập' }]}
                >
                  <Select placeholder="Chọn cố vấn học tập" loading={loadingAdvisors}>
                    {advisors.map(advisor => (
                      <Option key={advisor.user_id} value={advisor.user_id}>
                        {advisor.fullname || advisor.username}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Modal>
          </TabPane>

          {selectedClassId && (
            <TabPane tab="Danh sách sinh viên lớp" key="2">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">
                  Danh sách sinh viên lớp {classes.find(c => c.class_id === selectedClassId)?.class_name}
                </h1>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showAddStudentModal(selectedClassId)}
                >
                  Thêm sinh viên
                </Button>
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
          )}
        </Tabs>

        <Modal
          title="Thêm sinh viên vào lớp"
          open={studentModalVisible}
          onCancel={handleStudentCancel}
          onOk={handleAddStudent}
          width={600}
        >
          <Form
            form={studentForm}
            layout="vertical"
          >
            <Form.Item
              name="userId"
              label="Sinh viên"
              rules={[{ required: true, message: 'Vui lòng chọn sinh viên' }]}
            >
              <Select placeholder="Chọn sinh viên" loading={loadingAvailableStudents}>
                {availableStudents.map(student => (
                  <Option key={student.user_id} value={student.user_id}>
                    {student.fullname || student.username} {student.student_code ? `(${student.student_code})` : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="advisorId"
              label="Cố vấn học tập"
              rules={[{ required: true, message: 'Vui lòng chọn cố vấn học tập' }]}
            >
              <Select placeholder="Chọn cố vấn học tập" loading={loadingAdvisors}>
                {advisors.map(advisor => (
                  <Option key={advisor.user_id} value={advisor.user_id}>
                    {advisor.fullname || advisor.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ClassManager; 