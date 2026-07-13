type RichTextProps = {
  html: string;
  className?: string;
};

/**
 * Renderizza contenuto HTML editoriale (WYSIWYG WordPress). Il markup è
 * sanificato lato CMS al salvataggio (wp_kses dell'editor): qui viene solo
 * incapsulato in `.rich-text` per l'ereditarietà tipografica del design system.
 */
export function RichText({ html, className }: RichTextProps) {
  return (
    <div
      className={`rich-text${className ? ` ${className}` : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
