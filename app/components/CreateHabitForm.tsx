'use client';
import { useRef, useState } from 'react';

//nhan prop 'onhabitcreated' mutate tu SWR;
export function CreateHabitForm({ onHabitCreated }: { onHabitCreated: () => void }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    //chuyen tu action sang onsubmit

    const handbleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;
        try {
            //goi API bang petch
            const response = await fetch('/api/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ title }),
            });
            if (!response.ok) {
                throw new Error('Khong the tao habit');

            }
            onHabitCreated();
            formRef.current?.reset();


        } catch (error) {
            console.error(error);
            // Can them xu ly UI o day

        } finally { setIsSubmitting(false); }
    };
    return (
        <form ref={formRef}
            //dung onSubmit
            onSubmit={handbleSubmit}
            className="flex gap-2 w-full max-w-md"
        >
            <input
                type='text'
                name='title'
                placeholder='Ten thoi quen moi'
                required
                disabled={isSubmitting}
                className='flex-grow p-2 border rounded text-black disabled:opacity-50'
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
                {isSubmitting ? 'Đang tạo...' : 'Tạo'}
            </button>


        </form>
    )

}