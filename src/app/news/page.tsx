import type { Metadata } from 'next';
import { getMarkdownContent, getPageConfig } from '@/lib/content';
import TextPage from '@/components/pages/TextPage';
import type { TextPageConfig } from '@/types/page';

export const metadata: Metadata = {
  title: 'News',
  description: 'All news updates.',
};

export default function NewsPage() {
  const config = getPageConfig<TextPageConfig>('news-page') || {
    type: 'text',
    title: 'News',
    description: 'All news updates.',
    source: 'news.md',
  };
  const content = getMarkdownContent(config.source);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <TextPage config={config} content={content} />
    </div>
  );
}
