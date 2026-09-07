import { Children, isValidElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 检测内容是否为 HTML（富文本编辑器生成）
function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  // 内容以 HTML 标签开头，或包含 HTML 块级标签
  const startsWithTag = /^</.test(trimmed);
  const hasBlockTags = /<(p|div|h[1-6]|table|tr|td|th|ul|ol|li|article|section|header|footer|br|img|a|span|strong|em|blockquote|pre|code|figure|figcaption|hr)\b[\s\S]*>/i.test(trimmed);
  const hasClosingTag = /<\/[a-z][\s\S]*?>/i.test(trimmed);
  return (startsWithTag || hasBlockTags) && hasClosingTag;
}

// 检测内容是否包含 Markdown 语法特征
function isMarkdownContent(content: string): boolean {
  const lines = content.split('\n');
  for (const raw of lines) {
    const trimmed = raw.trimStart();
    if (/^#{1,6}\s/.test(trimmed)) return true; // 标题
    if (/^>\s?/.test(trimmed)) return true; // 引用
    if (/^[-*+]\s/.test(trimmed)) return true; // 无序列表
    if (/^\d+\.\s/.test(trimmed)) return true; // 有序列表
    if (/^\|/.test(trimmed)) return true; // 表格
    if (/^(---|\*\*\*|___)\s*$/.test(trimmed)) return true; // 水平线
    if (/^```/.test(trimmed)) return true; // 代码块
  }
  // 行内语法：粗体/斜体/删除线/代码/链接/图片
  if (/\*\*|__|~~|`|!\[[^\]]*\]|\[[^\]]+\]\([^)]+\)/.test(content)) return true;
  return false;
}

// 解码基础 HTML 实体
function decodeHtmlEntities(content: string): string {
  return content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

// 基础 HTML 清理：移除 script/style 标签、事件处理器、javascript: 伪协议
function sanitizeHtml(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\s*on\w+="[^"]*"/gi, '')
    .replace(/\s*on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

// 自定义提示框组件
function Callout({ type, children }: { type: 'tip' | 'warning' | 'info'; children: React.ReactNode }) {
  const styles = {
    tip: 'bg-emerald-50 border-emerald-500 text-emerald-800',
    warning: 'bg-amber-50 border-amber-500 text-amber-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };
  const icons = {
    tip: '💡',
    warning: '⚠️',
    info: 'ℹ️',
  };
  return (
    <div className={`callout ${styles[type]} border-l-4 p-4 my-4 rounded-r-lg`}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
}

// 解析 blockquote 中的 [!TIP], [!WARNING], [!INFO] 语法
function parseCallout(text: string): { type: 'tip' | 'warning' | 'info'; content: string } | null {
  const match = text.match(/^\[!(TIP|WARNING|INFO)\]\s*([\s\S]*)/i);
  if (match) {
    return {
      type: match[1].toLowerCase() as 'tip' | 'warning' | 'info',
      content: match[2].trim(),
    };
  }
  return null;
}

// 递归提取 React children 中的文本内容
function extractTextContent(children: ReactNode): string {
  let text = '';
  Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      text += child;
    } else if (typeof child === 'number') {
      text += String(child);
    } else if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      text += extractTextContent(child.props.children);
    }
  });
  return text;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // 预处理：将字面量 \n 转换为真正的换行符
  const processedContent = content.replace(/\\n/g, '\n');

  // 先解码 HTML 实体，再检测是否为 HTML（API 可能返回实体编码的 HTML）
  const decodedContent = decodeHtmlEntities(processedContent);

  // 如果内容是 HTML（富文本编辑器生成），直接渲染为 HTML
  if (isHtmlContent(decodedContent)) {
    return (
      <div
        className={`markdown-renderer ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(decodedContent) }}
      />
    );
  }

  // 纯文本（不含 Markdown 语法）：按文本原样显示，避免被 Markdown 误解析
  if (!isMarkdownContent(processedContent)) {
    return (
      <div className={`markdown-renderer ${className}`}>
        <p className="whitespace-pre-wrap">{processedContent}</p>
      </div>
    );
  }

  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeRaw]}
        components={{
          // 自定义图片渲染
          img: ({ src, alt }) => {
            if (!src || typeof src !== 'string') return null;
            // 外部图片使用普通 img 标签
            if (src.startsWith('http')) {
              return (
                <span className="block my-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={alt || ''}
                    className="rounded-xl max-w-full h-auto mx-auto"
                    loading="lazy"
                  />
                  {alt && <span className="block text-center text-sm text-muted-foreground mt-2">{alt}</span>}
                </span>
              );
            }
            // 本地图片使用 Next.js Image
            return (
              <span className="block my-6">
                <Image
                  src={src}
                  alt={alt || ''}
                  width={800}
                  height={450}
                  className="rounded-xl"
                />
                {alt && <span className="block text-center text-sm text-muted-foreground mt-2">{alt}</span>}
              </span>
            );
          },
          // 自定义 blockquote 支持提示框语法
          blockquote: ({ children }) => {
            // 提取文本内容检查是否是 callout
            const textContent = extractTextContent(children);
            const callout = parseCallout(textContent);
            if (callout) {
              return <Callout type={callout.type}>{callout.content}</Callout>;
            }
            return (
              <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">
                {children}
              </blockquote>
            );
          },
          // 自定义链接，外部链接新窗口打开
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
          // 自定义代码块
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 my-4 overflow-x-auto">
              {children}
            </pre>
          ),
          // 自定义表格
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-gray-50 border border-gray-200 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
