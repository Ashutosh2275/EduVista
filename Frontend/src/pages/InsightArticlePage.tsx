import { Navigate, useParams } from 'react-router-dom';

export function InsightArticlePage() {
  const { id } = useParams();
  return <Navigate to={`/courses?q=${encodeURIComponent(id ?? '')}`} replace />;
}
