export interface Images {
    small: string;
    large: string;
    poster: string;
}

export interface State {
    stateType: string;
    description?: string;
    targetID?: string;
    targetType?: string;
    targetTitle?: string;
}

export interface Instructor {
    slug: string;
    name: string;
    tagLine: string;
    bio: string;
    imageURL: string;
}

export interface Permissions {
    bookmark: boolean;
}

export interface Course {
    hash: string;
    slug: string;
    title: string;
    description: string;
    excerpt: string;
    thumbnail: string;
    images: Images;
    published: number;
    durationSeconds: number;
    popularity: number;
    state: State;
    hasCC: boolean;
    isTrial: boolean;
    instructors: Instructor[];
    permissions: Permissions;
    resources?: Resource[];
    lessonGroups?: LessonGroup[];
}

export interface Resource {
    label: string;
    url: string;
}

export interface Lesson {
    hash: string;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    timestamp: string;
    durationSeconds: number;
    streamingURL: string;
    pos: number;
    isFree: boolean;
    isTrial: boolean;
    isPremium: boolean;
    permission: string;
    bytes_mpeg360: number;
    bytes_mpeg720: number;
    bytes_mpeg1080: number;
}

export interface LessonGroup {
    title: string;
    lessons: Lesson[];
}

export interface Permissions {
    bookmark: boolean;
}