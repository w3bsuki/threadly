import { keys } from './keys';

// Conditional imports and initialization
let basehubClient: any = null;
let fragmentOn: any = null;
let basehub: any = null;

const env = keys();
const hasToken = env.BASEHUB_TOKEN && env.BASEHUB_TOKEN.length > 0;

if (hasToken) {
  try {
    const basehubModule = require('basehub');
    basehubClient = basehubModule.basehub;
    fragmentOn = basehubModule.fragmentOn;
    
    basehub = basehubClient({
      token: env.BASEHUB_TOKEN,
    });
  } catch (error) {
  }
}

/* -------------------------------------------------------------------------------------------------
 * Common Fragments
 * -----------------------------------------------------------------------------------------------*/

const imageFragment = hasToken && fragmentOn ? fragmentOn('BlockImage', {
  url: true,
  width: true,
  height: true,
  alt: true,
  blurDataURL: true,
}) : null;

/* -------------------------------------------------------------------------------------------------
 * Blog Fragments & Queries
 * -----------------------------------------------------------------------------------------------*/

const postMetaFragment = hasToken && fragmentOn ? fragmentOn('PostsItem', {
  _slug: true,
  _title: true,
  authors: {
    _title: true,
    avatar: imageFragment,
    xUrl: true,
  },
  categories: {
    _title: true,
  },
  date: true,
  description: true,
  image: imageFragment,
}) : null;

const postFragment = hasToken && fragmentOn ? fragmentOn('PostsItem', {
  ...postMetaFragment,
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
}) : null;

// Type definitions with fallbacks
export type PostMeta = {
  _slug: string;
  _title: string;
  authors: any[];
  categories: any[];
  date: string;
  description: string;
  image: any;
};

export type Post = PostMeta & {
  body: {
    plainText: string;
    json: any;
    readingTime: number;
  };
};

export const blog = {
  postsQuery: hasToken && fragmentOn ? fragmentOn('Query', {
    blog: {
      posts: {
        items: postMetaFragment,
      },
    },
  }) : null,

  latestPostQuery: hasToken && fragmentOn ? fragmentOn('Query', {
    blog: {
      posts: {
        __args: {
          orderBy: '_sys_createdAt__DESC',
        },
        item: postFragment,
      },
    },
  }) : null,

  postQuery: (slug: string) => hasToken && fragmentOn ? ({
    blog: {
      posts: {
        __args: {
          filter: {
            _sys_slug: { eq: slug },
          },
        },
        item: postFragment,
      },
    },
  }) : null,

  getPosts: async (): Promise<PostMeta[]> => {
    if (!hasToken || !basehub) {
      return [];
    }
    
    try {
      const data = await basehub.query(blog.postsQuery);
      return data.blog.posts.items;
    } catch (error) {
      return [];
    }
  },

  getLatestPost: async (): Promise<Post | null> => {
    if (!hasToken || !basehub) {
      return null;
    }
    
    try {
      const data = await basehub.query(blog.latestPostQuery);
      return data.blog.posts.item;
    } catch (error) {
      return null;
    }
  },

  getPost: async (slug: string): Promise<Post | null> => {
    if (!hasToken || !basehub) {
      return null;
    }
    
    try {
      const query = blog.postQuery(slug);
      const data = await basehub.query(query);
      return data.blog.posts.item;
    } catch (error) {
      return null;
    }
  },
};

/* -------------------------------------------------------------------------------------------------
 * Legal Fragments & Queries
 * -----------------------------------------------------------------------------------------------*/

const legalPostMetaFragment = hasToken && fragmentOn ? fragmentOn('LegalPagesItem', {
  _slug: true,
  _title: true,
  description: true,
}) : null;

const legalPostFragment = hasToken && fragmentOn ? fragmentOn('LegalPagesItem', {
  ...legalPostMetaFragment,
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
}) : null;

// Type definitions with fallbacks
export type LegalPostMeta = {
  _slug: string;
  _title: string;
  description: string;
};

export type LegalPost = LegalPostMeta & {
  body: {
    plainText: string;
    json: any;
    readingTime: number;
  };
};

export const legal = {
  postsQuery: hasToken && fragmentOn ? fragmentOn('Query', {
    legalPages: {
      items: legalPostFragment,
    },
  }) : null,

  latestPostQuery: hasToken && fragmentOn ? fragmentOn('Query', {
    legalPages: {
      __args: {
        orderBy: '_sys_createdAt__DESC',
      },
      item: legalPostFragment,
    },
  }) : null,

  postQuery: (slug: string) => hasToken && fragmentOn ? 
    fragmentOn('Query', {
      legalPages: {
        __args: {
          filter: {
            _sys_slug: { eq: slug },
          },
        },
        item: legalPostFragment,
      },
    }) : null,

  getPosts: async (): Promise<LegalPost[]> => {
    if (!hasToken || !basehub) {
      return [];
    }
    
    try {
      const data = await basehub.query(legal.postsQuery);
      return data.legalPages.items;
    } catch (error) {
      return [];
    }
  },

  getLatestPost: async (): Promise<LegalPost | null> => {
    if (!hasToken || !basehub) {
      return null;
    }
    
    try {
      const data = await basehub.query(legal.latestPostQuery);
      return data.legalPages.item;
    } catch (error) {
      return null;
    }
  },

  getPost: async (slug: string): Promise<LegalPost | null> => {
    if (!hasToken || !basehub) {
      return null;
    }
    
    try {
      const query = legal.postQuery(slug);
      const data = await basehub.query(query);
      return data.legalPages.item;
    } catch (error) {
      return null;
    }
  },
};
