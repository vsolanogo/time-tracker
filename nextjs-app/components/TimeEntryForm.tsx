'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { createTimeEntry } from '@/store/timeTracker/timeTrackerSlice';
import { Project } from '@/types/timeTracker';
import { Button, DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, BookOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface TimeEntryFormData {
  date: string;
  projectId: string;
  hours: number;
  description: string;
}

interface TimeEntryFormProps {
  projects: Project[];
}

export default function TimeEntryForm({ projects }: TimeEntryFormProps) {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.timeTracker);

  const onFinish = (values: any) => {
    const timeEntryData = {
      date: values.date.format('YYYY-MM-DD'),
      projectId: values.projectId,
      hours: values.hours,
      description: values.description,
    };

    dispatch(createTimeEntry(timeEntryData));

    // Reset form after submission
    form.resetFields();
  };

  return (
    <div className="glass-card rounded-2xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center vibrant-text ios-card-title">
        <EditOutlined className="mr-2" /> Add Time Entry
      </h2>

      {error && (
        <div className="mb-4 bg-red-100/30 backdrop-blur-sm border border-red-400/30 text-red-700 px-4 py-3 rounded-xl relative glass-card" role="alert">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <strong className="font-bold">Error! </strong>
              <span className="block mt-1">{error}</span>
            </div>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          date: dayjs(),
          hours: 1,
          description: ''
        }}
      >
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select a date' }]}
          className="ios-label"
        >
          <DatePicker
            className="w-full glass-button ios-input"
            suffixIcon={<CalendarOutlined />}
            defaultValue={dayjs()}
          />
        </Form.Item>

        <Form.Item
          label="Project"
          name="projectId"
          rules={[{ required: true, message: 'Please select a project' }]}
          className="ios-label"
        >
          <Select
            placeholder="Select a project"
            allowClear
            showSearch
            optionFilterProp="children"
            className="glass-button ios-input"
          >
            {projects.map(project => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Hours"
          name="hours"
          rules={[
            { required: true, message: 'Please enter hours' },
            { type: 'number', min: 0.25, max: 24, message: 'Hours must be between 0.25 and 24' }
          ]}
          className="ios-label"
        >
          <InputNumber
            className="w-full glass-button ios-input"
            min={0.25}
            max={24}
            step={0.25}
            precision={2}
            suffix={<ClockCircleOutlined />}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter a description' },
            { max: 1000, message: 'Description cannot exceed 1000 characters' }
          ]}
          className="ios-label"
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe the work done..."
            className="glass-button ios-input"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="glass-button"
          >
            {loading ? 'Saving...' : 'Save Time Entry'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}