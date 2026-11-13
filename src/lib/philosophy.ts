import raw from '../../content/copy/DGPhilosophy.md?raw';

// Splits DGPhilosophy.md into the pieces the About layout places separately.
// Expected shape:
//   "# Title", an italic tagline, then the general philosophy paragraphs
//   "## " the About section (the maker's biography)
//   "## " the signature contributions: intro paragraphs, then three "### " items,
//         each with an optional italic subtitle line

export type Section = { title: string; subtitle: string; paragraphs: string[] };

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Markdown inline emphasis to HTML, for use with set:html.
export function inline(s: string): string {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-medium text-ink">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

const italicLine = /^\*([^*].*[^*])\*$/;
const file = 'content/copy/DGPhilosophy.md';

function parse(md: string) {
  const blocks = md
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((b) => b.replace(/\n/g, ' ').trim())
    .filter(Boolean);

  let title = '';
  const intro: Section = { title: '', subtitle: '', paragraphs: [] };
  const sections: (Section & { items: Section[] })[] = [];
  let current: Section = intro;

  for (const block of blocks) {
    if (block.startsWith('### ')) {
      const parent = sections.at(-1);
      if (!parent) throw new Error(`${file}: a "### " heading must come after a "## " heading.`);
      current = { title: block.slice(4).trim(), subtitle: '', paragraphs: [] };
      parent.items.push(current);
    } else if (block.startsWith('## ')) {
      const section = { title: block.slice(3).trim(), subtitle: '', paragraphs: [], items: [] };
      sections.push(section);
      current = section;
    } else if (block.startsWith('# ')) {
      title = block.slice(2).trim();
    } else if (italicLine.test(block) && !current.subtitle && current.paragraphs.length === 0) {
      current.subtitle = block.replace(italicLine, '$1');
    } else {
      current.paragraphs.push(block);
    }
  }

  const [about, contributions] = sections;
  if (!title || sections.length !== 2 || contributions.items.length !== 3) {
    throw new Error(
      `${file}: expected a "# " title, then two "## " sections (About, then the signature contributions with three "### " items). Found ${sections.length} sections and ${contributions?.items.length ?? 0} items.`,
    );
  }

  return {
    title,
    tagline: intro.subtitle,
    intro: intro.paragraphs,
    about: { title: about.title, paragraphs: about.paragraphs },
    contributions: { title: contributions.title, intro: contributions.paragraphs, items: contributions.items },
  };
}

export const philosophy = parse(raw);
