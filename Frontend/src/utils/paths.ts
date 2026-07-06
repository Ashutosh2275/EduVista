export function collegePath(college: { id: string; slug?: string }): string {
  return `/college/${college.slug ?? college.id}`;
}

export function coursePath(course: { id: string; slug?: string }): string {
  return `/course/${course.slug ?? course.id}`;
}
