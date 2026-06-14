export interface BasePageConfig {
    type: 'about' | 'publication' | 'card' | 'text';
    title: string;
    description?: string;
}

export interface PublicationPageConfig extends BasePageConfig {
    type: 'publication';
    source: string;
}

export interface TextPageConfig extends BasePageConfig {
    type: 'text';
    source: string;
    action_links?: Array<{
        label: string;
        href: string;
    }>;
}

export interface CardItem {
    title: string;
    subtitle?: string;
    date?: string;
    content?: string;
    tags?: string[];
    link?: string;
    image?: string;
}

export interface CardSection {
    title: string;
    description?: string;
    items: CardItem[];
}

export interface CardPageConfig extends BasePageConfig {
    type: 'card';
    items?: CardItem[];
    sections?: CardSection[];
}
