/**
 * Componente para renderizar Schema Markup (JSON-LD) no head da página
 * Melhora a indexação e exibição nos resultados de busca
 */

interface schema-markupProps {
  schema: Record<string, any>;
}

export function schema-markup({ schema }: schema-markupProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
