import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { blog } from '@repo/content/cms';
import { Body } from '@repo/content/cms/components/body';
import { CodeBlock } from '@repo/content/cms/components/code-block';
import { Image } from '@repo/content/cms/components/image';
import { TableOfContents } from '@repo/content/cms/components/toc';
import { JsonLd } from '@repo/content/seo/json-ld';
import { createMetadata } from '@repo/content/seo/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentSidebar } from '@/components/content-sidebar';
import { env } from '@/env';

const protocol = env.VERCEL_PROJECT_PRODUCTION_URL?.startsWith('https')
  ? 'https'
  : 'http';
const url = new URL(`${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`);

type BlogPostProperties = {
  readonly params: Promise<{
    slug: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: BlogPostProperties): Promise<Metadata> => {
  const { slug } = await params;
  const post = await blog.getPost(slug);

  if (!post) {
    return {};
  }

  return createMetadata({
    title: post._title,
    description: post.description,
    image: post.image.url,
  });
};

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
  const posts = await blog.getPosts();

  return posts.map(({ _slug }) => ({ slug: _slug }));
};

const BlogPost = async ({ params }: BlogPostProperties) => {
  const { slug } = await params;
  const post = await blog.getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd
        code={{
          '@type': 'BlogPosting',
          '@context': 'https://schema.org',
          datePublished: post.date,
          description: post.description,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': new URL(`/blog/${post._slug}`, url).toString(),
          },
          headline: post._title,
          image: post.image.url,
          dateModified: post.date,
          author: post.authors.at(0)?._title,
          isAccessibleForFree: true,
        }}
      />
      <div className="container mx-auto py-16">
        <Link
          className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm focus:underline focus:outline-none"
          href="/blog"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Blog
        </Link>
        <div className="mt-16 flex flex-col items-start gap-8 sm:flex-row">
          <div className="sm:flex-1">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight lg:text-5xl">
                {post._title}
              </h1>
              <p className="text-balance leading-7 [&:not(:first-child)]:mt-6">
                {post.description}
              </p>
              {post.image ? (
                <Image
                  alt={post.image.alt ?? ''}
                  className="my-16 h-full w-full rounded-[var(--radius-xl)]"
                  height={post.image.height}
                  priority
                  src={post.image.url}
                  width={post.image.width}
                />
              ) : undefined}
              <div className="mx-auto max-w-prose">
                <Body
                  components={{
                    pre: ({ code, language }) => {
                      return (
                        <CodeBlock
                          snippets={[{ code, language }]}
                          theme="vesper"
                        />
                      );
                    },
                  }}
                  content={post.body.json.content}
                />
              </div>
            </div>
          </div>
          <div className="sticky top-24 hidden shrink-0 md:block">
            <ContentSidebar
              date={new Date(post.date)}
              readingTime={`${post.body.readingTime} min read`}
              toc={<TableOfContents data={post.body.json.toc} />}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
