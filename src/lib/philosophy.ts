import raw from '../../content/copy/DGPhilosophy.md?raw';

// Splits DGPhilosophy.md into the pieces the About layout places separately.
// Expected shape: "# Title", an italic tagline, intro paragraphs, then four "## " sections
// (three signatures and the closing), each with an optional italic subtitle line.

export type Section = { title: string; subtitle: string; paragraphs: string[] };

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Markdown inline emphasis to HTML, for use with set:html.
export function inline(s: string): string {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-medium text-ink">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

const italicLine = /^\*([^*].*[^*])\*$/;

function parse(md: string) {
  const blocks = md
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((b) => b.replace(/\n/g, ' ').trim())
    .filter(Boolean);

  let title = '';
  const intro: Section = { title: '', subtitle: '', paragraphs: [] };
  const sections: Section[] = [];
  let current = intro;

  for (const block of blocks) {
    if (block.startsWith('## ')) {
      current = { title: block.slice(3).trim(), subtitle: '', paragraphs: [] };
      sections.push(current);
    } else if (block.startsWith('# ')) {
      title = block.slice(2).trim();
    } else if (italicLine.test(block) && !current.subtitle && current.paragraphs.length === 0) {
      current.subtitle = block.replace(italicLine, '$1');
    } else {
      current.paragraphs.push(block);
    }
  }

  if (!title || sections.length !== 4) {
    throw new Error(
      `content/copy/DGPhilosophy.md: expected a "# " title and 4 "## " sections (3 signatures + closing), found ${sections.length}.`,
    );
  }
  const closing = sections[3];
  if (closing.paragraphs.length < 6) {
    throw new Error(
      'content/copy/DGPhilosophy.md: the closing section needs an intro, three element lines, the aspiration and the final sentence.',
    );
  }

  return {
    title,
    tagline: intro.subtitle,
    intro: intro.paragraphs,
    signatures: sections.slice(0, 3),
    closing: {
      title: closing.title,
      intro: closing.paragraphs[0],
      elements: closing.paragraphs.slice(1, 4),
      aspiration: closing.paragraphs[4],
      quote: closing.paragraphs[5],
    },
  };
}

export const philosophy = parse(raw);
