interface WhatsappProduct {
  title: string;
  price: number;
  url: string; // Já com a sua URL que redireciona, ou o link afiliado direto
}

export function generateWhatsappLink(phoneNumber: string, products: WhatsappProduct[]): string {
  let message = "Olá! Aqui estão os produtos que você selecionou no *Compre Melhor*:\n\n";

  products.forEach((prod, index) => {
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.price);
    message += `${index + 1}. *${prod.title}*\nPreço encontrado: ${formattedPrice}\nLink: ${prod.url}\n\n`;
  });

  message += "Aviso: preços e disponibilidade podem mudar sem aviso prévio. A compra é feita diretamente na loja parceira.";

  const encodedMessage = encodeURIComponent(message);
  // Remove todos os caracteres não numéricos do telefone
  const cleanPhone = phoneNumber.replace(/\D/g, ''); 

  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
}
