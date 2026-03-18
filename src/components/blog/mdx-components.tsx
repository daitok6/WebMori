import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-10 mb-4 text-3xl font-bold text-navy-dark" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-8 mb-3 text-2xl font-bold text-navy-dark" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold text-navy-dark" {...props} />
  ),
  p: (props) => (
    <p className="mb-4 text-text-body leading-relaxed" {...props} />
  ),
  ul: (props) => (
    <ul className="mb-4 ml-6 list-disc space-y-1 text-text-body" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1 text-text-body" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: (props) => (
    <a
      className="text-gold underline underline-offset-2 hover:text-gold-light transition-colors"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-4 border-l-4 border-gold pl-4 italic text-text-muted"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-bg-cream px-1.5 py-0.5 text-sm font-mono text-navy-dark"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg bg-navy-dark p-4 text-sm font-mono text-white/90"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-border-light" />,
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border border-border-light bg-bg-cream px-4 py-2 text-left font-semibold text-navy-dark"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-border-light px-4 py-2 text-text-body" {...props} />
  ),
  strong: (props) => (
    <strong className="font-semibold text-navy-dark" {...props} />
  ),
};
