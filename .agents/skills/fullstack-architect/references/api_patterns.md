# API & Server Action Best Practices

## 1. Server Actions with Validation

```typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const CreateEnrollmentSchema = z.object({
  courseId: z.string().uuid(),
})

export async function enrollCourseAction(formData: FormData) {
  const parseResult = CreateEnrollmentSchema.safeParse({
    courseId: formData.get('courseId'),
  })

  if (!parseResult.success) {
    return { success: false, error: 'Invalid input parameters.' }
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('enrollments')
    .insert({
      user_id: user.id,
      course_id: parseResult.data.courseId,
      status: 'active',
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/student')
  return { success: true }
}
```

## 2. API Route Handlers (`app/api/.../route.ts`)

```typescript
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from('courses').select('*')

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Internal Server Error' } },
      { status: 500 }
    )
  }
}
```
