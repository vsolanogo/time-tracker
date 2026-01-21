'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6', // Tailwind blue-500
        },
      }}
    >
      <Provider store={store}>{children}</Provider>
    </ConfigProvider>
  );
}