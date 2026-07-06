import type { NavigateFunction } from 'react-router-dom';

interface SearchSuggestion {
  text: string;
  type?: 'college' | 'course' | 'location' | 'career';
}

export function navigateFromSearch(query: string, navigate: NavigateFunction): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const lower = trimmed.toLowerCase();

  if (lower.includes('course') || lower.includes('mba') || lower.includes('engineering') || lower.includes('medical') || lower.includes('b.tech') || lower.includes('mbbs')) {
    navigate(`/courses?q=${encodeURIComponent(trimmed)}`);
    return;
  }

  if (lower.includes('insight') || lower.includes('article') || lower.includes('blog') || lower.includes('scholarship') || lower.includes('jee')) {
    navigate(`/insights?q=${encodeURIComponent(trimmed)}`);
    return;
  }

  if (lower.includes('career')) {
    navigate('/careers');
    return;
  }

  navigate(`/colleges?q=${encodeURIComponent(trimmed)}`);
}

export function navigateFromSuggestion(suggestion: SearchSuggestion, navigate: NavigateFunction): void {
  switch (suggestion.type) {
    case 'course':
      navigate(`/courses?q=${encodeURIComponent(suggestion.text)}`);
      break;
    case 'career':
      navigate('/careers');
      break;
    case 'location':
      navigate(`/colleges?location=${encodeURIComponent(suggestion.text)}`);
      break;
    default:
      navigate(`/colleges?q=${encodeURIComponent(suggestion.text)}`);
  }
}
