'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useMessages } from '@/lib/i18n/useMessages';

export interface NewsItem {
    date: string;
    content: string;
}

interface NewsProps {
    items: NewsItem[];
    title?: string;
    limit?: number;
    showViewAll?: boolean;
    viewAllHref?: string;
}

export default function News({ items, title, limit, showViewAll = false, viewAllHref = '/news' }: NewsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.news;
    const visibleItems = typeof limit === 'number' ? items.slice(0, limit) : items;
    const hasMore = visibleItems.length < items.length;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                {showViewAll && hasMore && (
                    <Link
                        href={viewAllHref}
                        prefetch={true}
                        className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                    >
                        View All &rarr;
                    </Link>
                )}
            </div>
            <div className="space-y-3">
                {visibleItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <span className="text-xs text-neutral-500 mt-1 w-16 flex-shrink-0">{item.date}</span>
                        <p className="text-sm text-neutral-700">{item.content}</p>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
