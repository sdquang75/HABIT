// Trang chủ (Cập nhật)
// 1. Chuyển thành Client Component để quản lý state
'use client';

import { AuthButtons } from '@/app/components/AuthButtons';
import { CreateHabitForm } from '@/app/components/CreateHabitForm';
import { HabitList } from '@/app/components/HabitList';
import { Suspense } from 'react';
// 2. Import SWR để fetch data (cách hiện đại)
import useSWR from 'swr';
import { useSession } from 'next-auth/react';

// Hàm 'fetcher' cho SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 3. Không còn 'async' vì đây là Client Component
export default function Home() {
  const { data: session } = useSession();

  // 4. Dùng SWR để fetch /api/habits
  // Nó tự động cache, revalidate, v.v.
  const { 
    data: habits, 
    error, 
    isLoading,
    mutate // 'mutate' là hàm để chúng ta trigger refetch
  } = useSWR(
    session ? '/api/habits' : null, // Chỉ fetch khi đã đăng nhập
    fetcher
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-12 md:p-24">
      <div className="absolute top-4 right-4">
        <AuthButtons />
      </div>

      <h1 className="text-4xl font-bold mb-8">Habitify Clone</h1>

      {/* 5. Truyền 'mutate' xuống Form để nó refresh list */}
      <CreateHabitForm onHabitCreated={mutate} />

      {/* 6. Hiển thị HabitList dựa trên SWR state */}
      <div className="w-full max-w-md mt-8">
        {isLoading && <div className="text-white">Đang tải habits...</div>}
        {error && <div className="text-red-500">Lỗi khi tải habits</div>}
        {/* === CẬP NHẬT: Truyền 'mutate' xuống HabitList === */}
        {habits && <HabitList habits={habits} onHabitUpdated={mutate} />}
      </div>
    </main>
  );
}