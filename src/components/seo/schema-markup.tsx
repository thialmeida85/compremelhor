/**
 * Componente para renderizar Schema Markup (JSON-LD) no head da página
 * Melhora a indexação e exibição nos resultados de busca
 */

interface SchemaMarkupProps {
  schema: Record<string, any>;
}

export function SchemaMarkup({ schema }: SchemaMarkupProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
