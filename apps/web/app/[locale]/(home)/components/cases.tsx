import type { Dictionary } from '@repo/content/internationalization';

type CasesProps = {
  dictionary: Dictionary;
};

// This component has been removed as it contained placeholder brand logos
// that made the site appear as a demo. If real brand partnerships exist
// in the future, they can be added back here with authentic content.
export const Cases = ({ dictionary: _dictionary }: CasesProps) => {
  return null;
};
