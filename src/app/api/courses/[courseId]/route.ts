import { NextRequest, NextResponse } from 'next/server';
import { courseStore } from '@/lib/localCourseStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  const course = courseStore.get(params.courseId);
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}
