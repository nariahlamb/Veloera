import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Spin, Typography, Card, Row, Col, Table, Tag, Button, Collapse, Space, Descriptions, Statistic as AntStatistic } from 'antd';
import { API } from '../../helpers/api';
import { showError } from '../../helpers/utils';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'; // Assuming recharts is available

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Helper to format tokens to million with 'm' suffix
const formatTokensToMillion = (tokens) => {
    if (typeof tokens !== 'number' || isNaN(tokens)) {
        return "0.00m";
    }
    return `${(tokens / 1000000).toFixed(2)}m`;
};

// Helper to calculate percentage and format
const formatPercentage = (value, total) => {
    if (total === 0 || typeof value !== 'number' || typeof total !== 'number') return '0.0%';
    return `${((value / total) * 100).toFixed(1)}%`;
};


const UsageReportDetail = () => {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportDetail = async () => {
            setLoading(true);
            setError(null);
            // Try to get from localStorage first (if stored by form page)
            const storedReport = localStorage.getItem(`report_${id}`);
            if (storedReport) {
                try {
                    const parsedReport = JSON.parse(storedReport);
                    // Basic check to see if it's a valid report structure
                    if (parsedReport && parsedReport.id === id && parsedReport.overview) {
                        setReport(parsedReport);
                        setLoading(false);
                        // Optional: remove from localStorage after use if it's meant to be a one-time pass
                        // localStorage.removeItem(`report_${id}`);
                        return;
                    }
                } catch (e) {
                    console.warn("Failed to parse stored report, fetching from API:", e);
                    localStorage.removeItem(`report_${id}`); // Clear corrupted item
                }
            }

            // If not in localStorage or invalid, fetch from API
            try {
                const res = await API.get(`/api/reports/${id}`);
                const { success, data, message } = res.data;
                if (success && data) {
                    setReport(data);
                } else {
                    showError(message || `无法加载报告详情 (ID: ${id})`);
                    setError(message || `无法加载报告 (ID: ${id})`);
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || '请求失败';
                showError(errorMessage);
                setError(errorMessage);
            }
            setLoading(false);
        };

        if (id) {
            fetchReportDetail();
        } else {
            setError("报告ID未提供");
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return <Spin tip="正在加载报告数据..." size="large" style={{ display: 'block', marginTop: '50px' }} />;
    }

    if (error) {
        return <Alert message={`错误: ${error}`} type="error" showIcon style={{ margin: '20px' }} />;
    }

    if (!report) {
        return <Alert message="未找到报告数据。" type="warning" showIcon style={{ margin: '20px' }} />;
    }

    const { name, createdAt, overview, channelStats, userStats, tokenStats, modelStats, ipStats, rawRequest } = report;

    const overviewData = [
        { name: '总消耗Tokens', value: formatTokensToMillion(overview.total_tokens), color: 'blue' },
        { name: '总请求次数', value: overview.total_requests, color: 'green' },
        { name: '429错误', value: `${overview.error_429_count} (${formatPercentage(overview.error_429_count, overview.total_requests)})`, color: 'orange' },
        { name: '普通错误', value: `${overview.normal_error_count} (${formatPercentage(overview.normal_error_count, overview.total_requests)})`, color: 'red' },
    ];

    const timeRangeText = rawRequest.start_time && rawRequest.end_time
        ? `${dayjs.unix(rawRequest.start_time).format('YYYY-MM-DD HH:mm:ss')} 至 ${dayjs.unix(rawRequest.end_time).format('YYYY-MM-DD HH:mm:ss')}`
        : '过去24小时 (默认)';

    // --- Column Definitions ---
    const channelColumns = [
        { title: '渠道名称(ID)', dataIndex: 'channel_name', key: 'channel_name', render: (text, record) => `${text} (${record.channel_id})` },
        { title: '429错误', dataIndex: 'error_429_count', key: 'error_429_count', render: (text, record) => `${text} (${formatPercentage(text, record.total_requests)})` },
        { title: '普通错误', dataIndex: 'normal_error_count', key: 'normal_error_count', render: (text, record) => `${text} (${formatPercentage(text, record.total_requests)})` },
        { title: '请求总数', dataIndex: 'total_requests', key: 'total_requests', sorter: (a,b) => a.total_requests - b.total_requests, defaultSortOrder: 'descend'},
        { title: '消耗Tokens', dataIndex: 'total_tokens', key: 'total_tokens', render: tokens => formatTokensToMillion(tokens), sorter: (a,b) => a.total_tokens - b.total_tokens },
    ];

    const userColumns = [
        { title: '用户名(ID)', dataIndex: 'username', key: 'username', render: (text, record) => `${text} (${record.user_id})` },
        { title: '请求次数', dataIndex: 'request_count', key: 'request_count', sorter: (a,b) => a.request_count - b.request_count, defaultSortOrder: 'descend'},
        { title: '消耗Tokens', dataIndex: 'total_tokens', key: 'total_tokens', render: tokens => formatTokensToMillion(tokens), sorter: (a,b) => a.total_tokens - b.total_tokens },
    ];

    const tokenColumns = [
        { title: 'Token名称(ID)', dataIndex: 'token_name', key: 'token_name', render: (text, record) => `${text} (${record.token_id})` },
        { title: '请求次数', dataIndex: 'request_count', key: 'request_count', sorter: (a,b) => a.request_count - b.request_count, defaultSortOrder: 'descend'},
        { title: '消耗Tokens', dataIndex: 'total_tokens', key: 'total_tokens', render: tokens => formatTokensToMillion(tokens), sorter: (a,b) => a.total_tokens - b.total_tokens },
    ];

    const modelColumns = [
        { title: '模型名称', dataIndex: 'model_name', key: 'model_name' },
        { title: '请求次数', dataIndex: 'request_count', key: 'request_count', sorter: (a,b) => a.request_count - b.request_count, defaultSortOrder: 'descend'},
        { title: '消耗Tokens', dataIndex: 'total_tokens', key: 'total_tokens', render: tokens => formatTokensToMillion(tokens), sorter: (a,b) => a.total_tokens - b.total_tokens },
    ];

    const ipColumns = [
        { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
        { title: '请求次数', dataIndex: 'request_count', key: 'request_count', sorter: (a,b) => a.request_count - b.request_count, defaultSortOrder: 'descend'},
        { title: '消耗Tokens', dataIndex: 'total_tokens', key: 'total_tokens', render: tokens => formatTokensToMillion(tokens), sorter: (a,b) => a.total_tokens - b.total_tokens },
    ];

    const renderSection = (title, data, columns, chartDataKey = 'total_requests', chartNameKey = 'name') => {
        if (!data || data.length === 0) {
            // Check if this section was requested
            const requestedItemName = title.replace('统计', '').trim(); // e.g. "渠道统计" -> "渠道"
            const isRequested = rawRequest.statistic_items.some(item => item.includes(requestedItemName));
            if (!isRequested && title !== '总览') return null; // Don't render if not requested, unless it's overview

            return (
                <Card title={title} style={{ marginBottom: '20px' }}>
                    <Text type="secondary">此部分无数据，或未在生成报告时选择。</Text>
                    {renderRawJson(data || [])}
                </Card>
            );
        }

        // Prepare data for charts (simple example: top 5 by request count or token count)
        const chartableData = data.slice(0, 5).map(item => ({
            name: item.channel_name || item.username || item.token_name || item.model_name || item.ip,
            value: item[chartDataKey]
        }));


        return (
            <Card title={title} style={{ marginBottom: '20px' }} headStyle={{backgroundColor: '#f0f2f5'}}>
                {title !== "总览" && data.length > 0 && (
                    <div style={{ marginBottom: '20px', height: '300px' }}>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartableData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" name={chartDataKey === 'total_tokens' ? "消耗Tokens" : "请求次数"} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
                <Table
                    columns={columns}
                    dataSource={data.map((item, index) => ({ ...item, key: index }))}
                    pagination={{ pageSize: 5, simple: true }}
                    size="small"
                    scroll={{ x: 'max-content' }}
                />
                {renderRawJson(data)}
            </Card>
        );
    };

    const renderRawJson = (data) => (
        <Collapse ghost style={{marginTop: '10px'}}>
            <Panel header={<Text type="secondary" style={{fontSize: '0.9em'}}>查看原始数据 (JSON)</Text>} key="1">
                <pre style={{ maxHeight: '300px', overflowY: 'auto', background: '#f7f7f7', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </Panel>
        </Collapse>
    );


    return (
        <div style={{ padding: '20px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
                <Col>
                    <Title level={2}>{name}</Title>
                </Col>
                <Col>
                    <Link to="/usage-report">
                        <Button icon={<i className="fa-solid fa-arrow-left" style={{marginRight: '8px'}}></i>}>返回列表</Button>
                    </Link>
                </Col>
            </Row>
            <Space direction="vertical" size="small" style={{width: '100%', marginBottom: '20px'}}>
                <Text type="secondary">报告ID: <Tag>{id}</Tag></Text>
                <Text type="secondary">生成时间: <Tag color="blue">{dayjs.unix(createdAt).format('YYYY-MM-DD HH:mm:ss')}</Tag></Text>
                <Text type="secondary">统计范围: <Tag color="cyan">{timeRangeText}</Tag></Text>
                <Text type="secondary">包含项目: {rawRequest.statistic_items.map(item => <Tag key={item} color="purple">{item}</Tag>)}</Text>
            </Space>

            <Card title="总览" style={{ marginBottom: '20px' }} headStyle={{backgroundColor: '#e6f7ff'}}>
                <Row gutter={[16,16]}>
                    {overviewData.map(item => (
                         <Col xs={24} sm={12} md={6} key={item.name}>
                            <AntStatistic title={item.name} value={item.value} valueStyle={{ color: item.color }}/>
                         </Col>
                    ))}
                </Row>
                {renderRawJson(overview)}
            </Card>

            {rawRequest.statistic_items.includes("渠道统计") && renderSection('渠道统计', channelStats, channelColumns, 'total_requests', 'channel_name')}
            {rawRequest.statistic_items.includes("用户统计") && renderSection('用户统计', userStats, userColumns, 'request_count', 'username')}
            {rawRequest.statistic_items.includes("Token统计") && renderSection('Token统计', tokenStats, tokenColumns, 'request_count', 'token_name')}
            {rawRequest.statistic_items.includes("模型统计") && renderSection('模型统计', modelStats, modelColumns, 'request_count', 'model_name')}
            {rawRequest.statistic_items.includes("IP统计") && renderSection('IP统计', ipStats, ipColumns, 'request_count', 'ip')}

            <Card title="原始请求参数" style={{ marginTop: '20px' }}>
                {renderRawJson(rawRequest)}
            </Card>
        </div>
    );
};

export default UsageReportDetail;
