# Architecture & Layer Patterns

## 1. Domain-Driven Layer Separation

Maintain clean boundaries across full-stack applications:

### Data Flow Pattern
1. **User Action / Route Request** triggers Page or Client Component.
2. **Server Action / Route Handler** validates parameters with Zod schema.
3. **Domain Service** enforces business logic, transactions, and transformations.
4. **Data Access Layer** communicates with Database / Supabase with proper RLS.
5. **Response** returns standardized payload `{ success: true, data }` or `{ success: false, error: { message, code } }`.

```typescript
// Example: Domain Service Layer (lib/services/courses.ts)
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface CourseFilter {
  category?: string;
  isPublished?: boolean;
}

export async function getCourses(filter?: CourseFilter) {
  const supabase = await createServerSupabaseClient();
  
  let query = supabase
    .from('courses')
    .select('id, title, description, level, created_at, modules(count)');

  if (filter?.category) {
    query = query.eq('category', filter.category);
  }
  if (filter?.isPublished !== undefined) {
    query = query.eq('is_published', filter.isPublished);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
  return data;
}
```

---

## 2. API Response & Error Standards

Always structure backend endpoints to return predictable schemas:

```typescript
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };
```
