import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Checkbox, Row, Col, DatePicker, Typography, Spin, Alert } from 'antd';
import { API } from '../../helpers/api';
import { showError, showSuccess } from '../../helpers/utils';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const STATISTIC_ITEMS_OPTIONS = [
  { label: '总览', value: '总览', defaultChecked: true, disabled: true }, // Overview is always included
  { label: '渠道统计', value: '渠道统计', defaultChecked: true },
  { label: '用户统计', value: '用户统计', defaultChecked: true },
  { label: 'Token统计', value: 'Token统计', defaultChecked: true },
  { label: '模型统计', value: '模型统计', defaultChecked: true },
  { label: 'IP统计', value: 'IP统计', defaultChecked: true },
];

const UsageReportForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultCheckedValues = STATISTIC_ITEMS_OPTIONS.filter(opt => opt.defaultChecked).map(opt => opt.value);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    const reportData = {
      name: values.reportName || `用量报告 - ${dayjs().format('YYYYMMDD-HHmmss')}`,
      statistic_items: values.statisticItems,
    };

    if (values.timeRange && values.timeRange.length === 2) {
      reportData.start_time = values.timeRange[0].unix();
      reportData.end_time = values.timeRange[1].unix();
    } else {
      // Default to last 24 hours if not specified, backend handles this if not sent
    }

    try {
      const res = await API.post('/api/reports', reportData);
      const { success, data, message } = res.data;
      if (success && data && data.id) {
        showSuccess('报告已成功生成！');
        // Store the generated report in session/local storage to pass to detail page
        // This avoids needing a GET /api/reports/:id immediately if the list page isn't revisited
        // Or, if the backend returns the full report, we can pass it directly.
        // For now, we assume the backend returns the full report in `data`.
        localStorage.setItem(`report_${data.id}`, JSON.stringify(data));
        navigate(`/usage-report/detail/${data.id}`);
      } else {
        showError(message || '生成报告失败');
        setError(message || '生成报告失败');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || '请求失败，请稍后重试';
      showError(errorMessage);
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>生成新用量报告</Title>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card>
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                statisticItems: defaultCheckedValues,
              }}
            >
              <Form.Item
                name="reportName"
                label="报告名称"
                rules={[{ required: false }]}
              >
                <Input placeholder={`可选, 默认为 "用量报告 - ${dayjs().format('YYYYMMDD-HHmmss')}"`} />
              </Form.Item>

              <Form.Item
                name="timeRange"
                label="统计时间范围 (可选)"
              >
                <RangePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                />
              </Form.Item>
              <Text type="secondary" style={{display: 'block', marginBottom: '15px'}}>
                如果不选择时间范围，将默认统计过去24小时的数据。
              </Text>


              <Form.Item
                name="statisticItems"
                label="选择统计项目"
                rules={[{ required: true, message: '请至少选择一个统计项目!' }]}
              >
                <Checkbox.Group style={{width: '100%'}}>
                  <Row gutter={[8,8]}>
                  {STATISTIC_ITEMS_OPTIONS.map(option => (
                    <Col xs={24} sm={12} key={option.value}>
                      <Checkbox value={option.value} disabled={option.disabled}>
                        {option.label}
                      </Checkbox>
                    </Col>
                  ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item style={{ textAlign: 'right', marginTop: '30px' }}>
                <Button type="primary" htmlType="submit" loading={loading} icon={<i className="fa-solid fa-gears" style={{marginRight: '8px'}}></i>}>
                  {loading ? '正在生成...' : '生成报告'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UsageReportForm;
