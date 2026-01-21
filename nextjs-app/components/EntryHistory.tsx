"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { deleteTimeEntry } from "@/store/timeTracker/timeTrackerSlice";
import { TimeEntry } from "@/types/timeTracker";
import { Button, Card, Divider, List, Popconfirm, Tag, Typography } from "antd";
import { DeleteOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function EntryHistory() {
  const {
    timeEntries,
    dailyTotals,
    grandTotal,
    loading: appLoading,
  } = useAppSelector((state) => state.timeTracker);
  const [localLoading, setLocalLoading] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleDelete = async (id: string) => {
    setLocalLoading(id);
    try {
      await dispatch(deleteTimeEntry(id));
    } catch (error) {
      console.error("Error deleting time entry:", error);
    } finally {
      setLocalLoading(null);
    }
  };

  // Group entries by date
  const groupedEntries: { [date: string]: TimeEntry[] } = {};
  timeEntries.forEach((entry) => {
    if (!groupedEntries[entry.date]) {
      groupedEntries[entry.date] = [];
    }
    groupedEntries[entry.date].push(entry);
  });

  // Sort dates by newest first
  const sortedDates = Object.keys(groupedEntries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <div className="glass-card rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <Title level={2} className="vibrant-text ios-card-title">
          Entry History
        </Title>
        <div className="text-right">
          <Text type="secondary" className="ios-input">
            Grand Total:
          </Text>
          <br />
          <Title level={3} className="!text-blue-600 !mb-0 ios-input">
            {(Number(grandTotal) || 0).toFixed(2)}hours
          </Title>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Text className="ios-input">
            No time entries yet. Add your first entry!
          </Text>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <Card
              key={date}
              title={
                <div className="flex justify-between items-center">
                  <Text strong className="ios-input">
                    {dayjs(date).format("MMMM D, YYYY")}
                  </Text>
                  <Tag color="blue" className="ios-input">
                    Total: {(Number(grandTotal) || 0).toFixed(2)}hrs
                  </Tag>
                </div>
              }
              className="glass-card shadow-sm"
            >
              <List
                dataSource={groupedEntries[date]}
                renderItem={(entry) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        title="Delete time entry"
                        description="Are you sure you want to delete this time entry?"
                        onConfirm={() => handleDelete(entry.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          loading={localLoading === entry.id || appLoading}
                          className="glass-button"
                        >
                          {localLoading === entry.id || appLoading
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center">
                          <Text strong className="ios-input">
                            {entry.project?.name || "Unknown Project"}
                          </Text>
                          <Tag
                            icon={<ClockCircleOutlined />}
                            color="green"
                            className="ml-2 ios-input"
                          >
                            {entry.hours} hrs
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary" className="ios-input">
                            {entry.description}
                          </Text>
                          <Divider type="vertical" />
                          <Text type="secondary" className="ios-input">
                            {dayjs(entry.createdAt).format("HH:mm")}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
