import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Row, Spin, Typography, Empty, Tag, Space } from 'antd';
import { API } from '../../helpers/api'; // Assuming API helper exists
import { showError, showSuccess }s '../../helpers/utils'; // Assuming utility functions exist
import dayjs from 'dayjs'; // For date formatting

const { Title, Text } = Typography;

const UsageReportPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/reports');
      const { success, data, message } = res.data;
      if (success) {
        // Sort reports by creation date, newest first
        data.sort((a, b) => b.created_at - a.created_at);
        setReports(data || []);
      } else {
        showError(message || '无法加载报告列表');
        setReports([]);
      }
    } catch (error) {
      showError('请求报告列表失败: ' + (error.message || '未知错误'));
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <Title level={3}>用量报告历史</Title>
        </Col>
        <Col>
          <Link to="/usage-report/new">
            <Button type="primary" icon={<i className="fa-solid fa-plus" style={{marginRight: '8px'}}></i>}>
              生成新报告
            </Button>
          </Link>
        </Col>
      </Row>

      {loading ? (
        <Spin tip="正在加载报告列表..." size="large" style={{ display: 'block', marginTop: '50px' }} />
      ) : reports.length === 0 ? (
        <Empty description="暂无历史报告记录。" style={{marginTop: '50px'}}/>
      ) : (
        <Row gutter={[16, 16]}>
          {reports.map((report) => (
            <Col xs={24} sm={12} md={8} lg={6} key={report.id}>
              <Card
                title={report.name || '未命名报告'}
                hoverable
                actions={[
                  <Link to={`/usage-report/detail/${report.id}`}>
                    <Button type="link" icon={<i className="fa-solid fa-eye" style={{marginRight: '8px'}}></i>}>查看详情</Button>
                  </Link>,
                  // Future actions like delete can be added here
                ]}
              >
                <Text type="secondary">生成时间:</Text> <br/>
                <Text>{dayjs.unix(report.created_at).format('YYYY-MM-DD HH:mm:ss')}</Text> <br/><br/>
                <Tag color="blue">ID: {report.id.substring(0,8)}...</Tag>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default UsageReportPage;
