import { Navigate, useParams } from 'react-router-dom';

/** Legacy career detail routes redirect to course search */
export function CareerDetailsPage() {
  const { id } = useParams();
  const stream = id?.replace(/-career$/, '') ?? 'engineering';
  return <Navigate to={`/courses?stream=${stream}`} replace />;
}
