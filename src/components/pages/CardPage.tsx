'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { CardPageConfig } from '@/types/page';

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
    a: ({ ...props }) => (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
        />
    ),
    blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
            {children}
        </blockquote>
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
    em: ({ children }: React.ComponentProps<'em'>) => <em className="italic">{children}</em>,
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
};

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    const sections = config.sections.filter(section => section.items.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className={embedded ? "mb-4" : "mb-8"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <div className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl leading-relaxed`}>
                        <ReactMarkdown components={markdownComponents}>
                            {config.description}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            <div className={embedded ? "space-y-6" : "space-y-8"}>
                {sections.map((section, sectionIndex) => (
                    <motion.section
                        key={section.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.12 * sectionIndex }}
                        className={embedded ? "space-y-3" : "space-y-4"}
                    >
                        <div>
                            <h2 className={`${embedded ? "text-xl" : "text-2xl"} font-serif font-bold text-primary`}>
                                {section.title}
                            </h2>
                            {section.description && (
                                <p className={`${embedded ? "text-sm" : "text-base"} mt-1 text-neutral-600 dark:text-neutral-500`}>
                                    {section.description}
                                </p>
                            )}
                        </div>

                        <div className="border-y border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
                            {section.items.map((item, itemIndex) => (
                                <motion.div
                                    key={`${section.title}-${item.title}-${itemIndex}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.06 * itemIndex }}
                                    className={`${embedded ? "py-3" : "py-4"} grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start`}
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                                            <h3 className={`${embedded ? "text-base" : "text-lg"} font-semibold text-primary leading-snug break-words`}>
                                                {item.title}
                                            </h3>
                                            {item.subtitle && (
                                                <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium leading-snug`}>
                                                    {item.subtitle}
                                                </p>
                                            )}
                                        </div>
                                        {item.content && (
                                            <div className={`${embedded ? "text-sm" : "text-base"} mt-2 text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                                                <ReactMarkdown components={markdownComponents}>
                                                    {item.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                        {item.tags && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {item.tags.map(tag => (
                                                    <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {item.date && (
                                        <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded justify-self-start sm:justify-self-end whitespace-nowrap">
                                            {item.date}
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                ))}
            </div>
        </motion.div>
    );
}
