import { NextRequest, NextResponse } from 'next/server';
import { courseStore } from '@/lib/localCourseStore';
import { supabase } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  if (supabase) {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, places, created_at')
      .eq('id', params.courseId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to load course: ${error.message}` },
        { status: 500 },
      );
    }

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  }

  const course = courseStore.get(params.courseId);
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}
