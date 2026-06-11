'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import type { SiteConfig } from '@/lib/config';
import { useLocaleStore } from '@/lib/stores/localeStore';
import { useMessages } from '@/lib/i18n/useMessages';
import type { I18nRuntimeConfig } from '@/types/i18n';

interface NavigationProps {
  items: SiteConfig['navigation'];
  siteTitle: string;
  enableOnePageMode?: boolean;
  i18n: I18nRuntimeConfig;
  itemsByLocale?: Record<string, SiteConfig['navigation']>;
  siteTitleByLocale?: Record<string, string>;
}

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function pathMatches(pathname: string, href: string): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return target === '/' ? current === '/' : current === target || current.startsWith(`${target}/`);
}

export default function Navigation({
  items,
  siteTitle,
  enableOnePageMode,
  i18n,
  itemsByLocale,
  siteTitleByLocale,
}: NavigationProps) {
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isMobilePostOpen, setIsMobilePostOpen] = useState(false);
  const messages = useMessages();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const visibleSections = useRef(new Set<string>());
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);
  const resolvedLocale = i18n.enabled ? locale : i18n.defaultLocale;

  const postLinks = useMemo(() => [
    { title: 'Note', href: '/post/note' },
    { title: 'Gallery', href: '/post/gallery' },
  ], []);

  const effectiveItems = useMemo(() => {
    return itemsByLocale?.[resolvedLocale] || itemsByLocale?.[i18n.defaultLocale] || items;
  }, [i18n.defaultLocale, items, itemsByLocale, resolvedLocale]);

  const effectiveSiteTitle = useMemo(() => {
    return siteTitleByLocale?.[resolvedLocale] || siteTitleByLocale?.[i18n.defaultLocale] || siteTitle;
  }, [i18n.defaultLocale, resolvedLocale, siteTitle, siteTitleByLocale]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!enableOnePageMode) return;

    setActiveHash(window.location.hash);
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);

    visibleSections.current.clear();

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.current.add(entry.target.id);
        } else {
          visibleSections.current.delete(entry.target.id);
        }
      });

      const firstVisible = effectiveItems.find(
        (item) => item.type === 'page' && visibleSections.current.has(item.target)
      );
      if (firstVisible) {
        setActiveHash(firstVisible.target === 'about' ? '' : `#${firstVisible.target}`);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    });

    effectiveItems.forEach((item) => {
      if (item.type === 'page') {
        const element = document.getElementById(item.target);
        if (element) observer.observe(element);
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      observer.disconnect();
    };
  }, [enableOnePageMode, effectiveItems]);

  useEffect(() => {
    setIsPostOpen(false);
    setIsMobilePostOpen(false);
    setHoveredHref(null);
  }, [pathname]);

  const getDesktopItemHref = (item: SiteConfig['navigation'][number]) =>
    enableOnePageMode ? `/#${item.target}` : item.href;

  const isDesktopItemActive = (item: SiteConfig['navigation'][number]) =>
    enableOnePageMode
      ? activeHash === `#${item.target}` || (!activeHash && item.target === 'about')
      : pathMatches(pathname, item.href);

  const isPostActive = pathMatches(pathname, '/post');
  const activeItem = effectiveItems.find((item) => isDesktopItemActive(item)) ?? null;
  const activeHref = isPostActive ? '/post' : activeItem ? getDesktopItemHref(activeItem) : null;
  const indicatorHref = hoveredHref ?? activeHref;

  const measureIndicator = useCallback(() => {
    const container = navContainerRef.current;
    if (!container || !indicatorHref) {
      setIndicatorStyle(null);
      return;
    }
    const el = Array.from(container.querySelectorAll<HTMLElement>('[data-nav-href]'))
      .find((node) => node.dataset.navHref === indicatorHref);
    if (!el) {
      setIndicatorStyle(null);
      return;
    }
    setIndicatorStyle({
      left: el.offsetLeft,
      width: el.offsetWidth,
      top: el.offsetTop,
      height: el.offsetHeight,
    });
  }, [indicatorHref]);

  useEffect(() => {
    measureIndicator();
  }, [measureIndicator]);

  useEffect(() => {
    window.addEventListener('resize', measureIndicator);
    return () => window.removeEventListener('resize', measureIndicator);
  }, [measureIndicator]);

  return (
    <Disclosure as="nav" className="fixed top-0 left-0 right-0 z-50">
      {({ open }) => (
        <>
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className={cn(
              'transition-all duration-300 ease-out',
              scrolled
                ? 'bg-background/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-lg'
                : 'bg-transparent'
            )}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 lg:h-20">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0"
                >
                  <Link
                    href="/"
                    className="text-xl lg:text-2xl font-serif font-semibold text-primary hover:text-accent transition-colors duration-200"
                  >
                    {effectiveSiteTitle}
                  </Link>
                </motion.div>

                <div className="hidden lg:block">
                  <div className="ml-10 flex items-center space-x-3">
                    <div
                      ref={navContainerRef}
                      className="relative flex items-baseline space-x-1"
                      onMouseLeave={() => setHoveredHref(null)}
                    >
                      {indicatorStyle && (
                        <motion.div
                          className={cn(
                            'absolute rounded-lg pointer-events-none',
                            hoveredHref && hoveredHref !== activeHref
                              ? 'bg-accent/[0.07]'
                              : 'bg-accent/10'
                          )}
                          initial={false}
                          animate={indicatorStyle}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        />
                      )}
                      {effectiveItems.map((item) => {
                        const isActive = isDesktopItemActive(item);
                        const href = getDesktopItemHref(item);

                        return (
                          <Link
                            key={item.target}
                            href={href}
                            data-nav-href={href}
                            prefetch={true}
                            onClick={() => enableOnePageMode && setActiveHash(`#${item.target}`)}
                            onMouseEnter={() => setHoveredHref(href)}
                            className={cn(
                              'relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                              isActive || hoveredHref === href ? 'text-primary' : 'text-neutral-600'
                            )}
                          >
                            {item.title}
                          </Link>
                        );
                      })}

                      <div
                        className="relative"
                        onMouseEnter={() => {
                          setIsPostOpen(true);
                          setHoveredHref('/post');
                        }}
                        onMouseLeave={() => {
                          setIsPostOpen(false);
                          setHoveredHref(null);
                        }}
                      >
                        <button
                          type="button"
                          data-nav-href="/post"
                          onClick={() => setIsPostOpen((value) => !value)}
                          className={cn(
                            'relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 inline-flex items-center gap-1',
                            isPostActive || hoveredHref === '/post' ? 'text-primary' : 'text-neutral-600'
                          )}
                          aria-expanded={isPostOpen}
                          aria-label="Open post menu"
                        >
                          <span className="relative z-10">Post</span>
                          <motion.span
                            animate={{ rotate: isPostOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10"
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {isPostOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.98 }}
                              transition={{ duration: 0.18 }}
                              className="absolute left-0 top-full mt-2 w-40 rounded-lg border border-neutral-200/60 bg-background/95 backdrop-blur-xl shadow-lg py-1 z-50"
                            >
                              {postLinks.map((link) => {
                                const active = pathMatches(pathname, link.href);
                                return (
                                  <Link
                                    key={link.title}
                                    href={link.href}
                                    prefetch={true}
                                    onClick={() => setIsPostOpen(false)}
                                    className={cn(
                                      'block px-3 py-2 text-sm transition-colors duration-200',
                                      active
                                        ? 'text-primary bg-accent/10'
                                        : 'text-neutral-600 hover:text-primary hover:bg-neutral-50 dark:hover:bg-neutral-900'
                                    )}
                                  >
                                    {link.title}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <LanguageToggle i18n={i18n} />
                    <ThemeToggle />
                  </div>
                </div>

                <div className="lg:hidden flex items-center space-x-2">
                  <LanguageToggle i18n={i18n} />
                  <ThemeToggle />
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent transition-colors duration-200">
                    <span className="sr-only">{messages.navigation.openMainMenu}</span>
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </motion.div>
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {open && (
              <Disclosure.Panel static>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-neutral-200/50 shadow-lg"
                >
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {effectiveItems.map((item, index) => {
                      const isActive = enableOnePageMode
                        ? (item.href === '/' ? pathname === '/' && !activeHash : activeHash === `#${item.target}`)
                        : pathMatches(pathname, item.href);

                      const href = enableOnePageMode
                        ? (item.href === '/' ? '/' : `/#${item.target}`)
                        : item.href;

                      return (
                        <motion.div
                          key={item.target}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Disclosure.Button
                            as={Link}
                            href={href}
                            prefetch={true}
                            onClick={() => enableOnePageMode && setActiveHash(item.href === '/' ? '' : `#${item.target}`)}
                            className={cn(
                              'block px-3 py-2 rounded-md text-base font-medium transition-all duration-200',
                              isActive
                                ? 'text-primary bg-accent/10 border-l-4 border-accent'
                                : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'
                            )}
                          >
                            {item.title}
                          </Disclosure.Button>
                        </motion.div>
                      );
                    })}

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: effectiveItems.length * 0.1 }}
                    >
                      <button
                        type="button"
                        onClick={() => setIsMobilePostOpen((value) => !value)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-all duration-200',
                          isPostActive
                            ? 'text-primary bg-accent/10 border-l-4 border-accent'
                            : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'
                        )}
                        aria-expanded={isMobilePostOpen}
                        aria-label="Open post menu"
                      >
                        <span>Post</span>
                        <motion.span animate={{ rotate: isMobilePostOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDownIcon className="h-4 w-4" />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {isMobilePostOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 ml-3 overflow-hidden border-l border-neutral-200 dark:border-neutral-700"
                          >
                            {postLinks.map((link) => {
                              const active = pathMatches(pathname, link.href);
                              return (
                                <Disclosure.Button
                                  key={link.title}
                                  as={Link}
                                  href={link.href}
                                  prefetch={true}
                                  onClick={() => setIsMobilePostOpen(false)}
                                  className={cn(
                                    'block px-3 py-2 text-sm transition-colors duration-200',
                                    active
                                      ? 'text-primary bg-accent/10'
                                      : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'
                                  )}
                                >
                                  {link.title}
                                </Disclosure.Button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
}
