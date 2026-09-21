export interface FormattedTextPart {
  type: 'text' | 'bold' | 'bullet' | 'currency';
  content: string;
}

export function parseMessageContent(content: string): FormattedTextPart[] {
  const parts: FormattedTextPart[] = [];
  let lastEnd = 0;
  let match: RegExpExecArray | null;

  const combinedRegex = /(\*\*.+?\*\*|Rp\s?[\d.,]+|^[\s]*[•\-\*]\s+.+$)/gm;

  while ((match = combinedRegex.exec(content)) !== null) {
    const [matched, bold, currency, bullet] = match;
    const start = match.index;
    const end = start + matched.length;

    if (start > lastEnd) {
      parts.push({ type: 'text', content: content.slice(lastEnd, start) });
    }

    if (bold) {
      parts.push({ type: 'bold', content: bold.slice(2, -2) });
    } else if (currency) {
      parts.push({ type: 'currency', content: currency });
    } else if (bullet) {
      const bulletContent = bullet.replace(/^[\s]*[•\-\*]\s+/, '');
      parts.push({ type: 'bullet', content: bulletContent });
    }

    lastEnd = end;
  }

  if (lastEnd < content.length) {
    parts.push({ type: 'text', content: content.slice(lastEnd) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }];
}

export function formatCurrency(text: string): string {
  return text.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}