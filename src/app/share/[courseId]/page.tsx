import type { Metadata } from 'next';
import Link from 'next/link';
import { courseStore, type CourseData } from '@/lib/localCourseStore';
import { supabase } from '@/lib/supabase';
import ShareView from './ShareView';

type Props = { params: { courseId: string } };

async function getCourse(courseId: string): Promise<CourseData | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, places, created_at')
      .eq('id', courseId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      places: Array.isArray(data.places) ? data.places : [],
      created_at: data.created_at,
    } as CourseData;
  }

  return courseStore.get(courseId) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse(params.courseId);
  if (!course) return { title: '코스를 찾을 수 없어요 | 답정너' };

  const description = `${course.places.length}곳을 담은 데이트 코스`;
  const ogImage = course.places.find((p) => p.image_url)?.image_url;

  return {
    title: `${course.title} | 답정너`,
    description,
    openGraph: {
      title: `${course.title} | 답정너`,
      description,
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
  };
}

export default async function SharePage({ params }: Props) {
  const course = await getCourse(params.courseId);

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen max-w-sm mx-auto bg-white">
        <div className="px-5 pt-6 pb-4">
          <Link
            href="/saved"
            className="text-gray-400 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            ← 저장 목록
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-2">
          <p className="text-gray-900 font-bold text-[16px]">코스를 찾을 수 없어요</p>
          <p className="text-gray-400 text-sm text-center">
            링크가 만료됐거나 존재하지 않아요.
          </p>
          <Link
            href="/"
            className="mt-3 px-6 py-3 bg-gray-900 text-white font-bold text-[14px] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    );
  }

  return <ShareView course={course} />;
}
