// Cardápio oficial do Quintal do Roger (usado pelo seed e pelo sync-menu)
// Carnes: vendidas por grama (mínimo 300g) — preço em centavos por kg, estoque em gramas
// Demais itens: preço em centavos por unidade, estoque em unidades

const MEATS = [
  { name: 'Picanha', pricePerKg: 17800, description: 'Corte nobre, sal grosso.', stock: 40000 },
  { name: 'Fraldinha', pricePerKg: 14400, description: 'Macia e suculenta.', stock: 30000 },
  { name: 'Maçã de Peito', pricePerKg: 12000, description: 'Assada na brasa, bem macia.', stock: 20000 },
  { name: 'Cupim', pricePerKg: 13600, description: 'Assado lentamente.', stock: 8000 },
  { name: 'Bananinha', pricePerKg: 10400, description: 'Costela em tiras finas.', stock: 25000 },
];

const ITEMS = [
  { name: 'Arroz', category: 'ACOMPANHAMENTO', price: 1400, description: 'Arroz branco soltinho.', stock: 50 },
  { name: 'Tropeiro', category: 'ACOMPANHAMENTO', price: 2800, description: 'Feijão, farinha, bacon, linguiça e couve.', stock: 20 },
  { name: 'Fritas', category: 'ACOMPANHAMENTO', price: 2200, description: 'Batata frita crocante.', stock: 35 },
  { name: 'Fritas com Cheddar', category: 'ACOMPANHAMENTO', price: 2900, description: 'Batata frita com cheddar cremoso.', stock: 7 },
  { name: 'Caldo de Feijão', category: 'CALDO', price: 2600, description: 'Feijão preto, bacon e linguiça.', stock: 30 },
  { name: 'Caldo de Frango', category: 'CALDO', price: 2400, description: 'Frango desfiado com legumes e ervas.', stock: 30 },
  { name: 'Cerveja Brahma 600ml', category: 'BEBIDA', price: 1200, description: 'Garrafa gelada.', stock: 40 },
  { name: 'Cerveja Heineken 600ml', category: 'BEBIDA', price: 1500, description: 'Garrafa gelada.', stock: 30 },
  { name: 'Cerveja Skol 600ml', category: 'BEBIDA', price: 1000, description: 'Garrafa gelada.', stock: 9 },
  { name: 'Cerveja Itaipava 600ml', category: 'BEBIDA', price: 900, description: 'Garrafa gelada.', stock: 40 },
  { name: 'Guaraná Antarctica 600ml', category: 'BEBIDA', price: 800, description: 'Garrafa gelada.', stock: 40 },
  { name: 'Coca-Cola 600ml', category: 'BEBIDA', price: 900, description: 'Garrafa gelada.', stock: 40 },
  { name: 'Coca-Cola Lata 350ml', category: 'BEBIDA', price: 600, description: 'Lata gelada.', stock: 5 },
  { name: 'Fanta Laranja 350ml', category: 'BEBIDA', price: 600, description: 'Lata gelada.', stock: 30 },
  { name: 'Sprite 350ml', category: 'BEBIDA', price: 600, description: 'Lata gelada.', stock: 30 },
  { name: 'Água Sem Gás 500ml', category: 'BEBIDA', price: 400, description: 'Água mineral natural.', stock: 50 },
  { name: 'Água Com Gás 500ml', category: 'BEBIDA', price: 500, description: 'Água mineral com gás.', stock: 6 },
  { name: 'Suco Natural 400ml', category: 'BEBIDA', price: 1200, description: 'Laranja, limão, maracujá ou abacaxi.', stock: 30 },
  { name: 'Energético 473ml', category: 'BEBIDA', price: 1400, description: 'Lata gelada.', stock: 8 },
  { name: 'Dose de Cachaça', category: 'BEBIDA', price: 800, description: 'Cachaça 51 ou artesanal da casa.', stock: 50 },
  { name: 'Caipirinha', category: 'BEBIDA', price: 1800, description: 'Cachaça, limão, açúcar e gelo.', stock: 50 },
];

export function buildMenu() {
  return [
    ...MEATS.map((m) => ({
      name: m.name,
      description: m.description,
      category: 'CARNE',
      isMeat: true,
      price: 0,
      pricePerKg: m.pricePerKg,
      minGrams: 300,
      quantidadeDisponivel: m.stock,
      quantidadeMinima: 10000, // alerta abaixo de 10 kg
    })),
    ...ITEMS.map((i) => ({
      name: i.name,
      description: i.description,
      category: i.category,
      isMeat: false,
      price: i.price,
      pricePerKg: null as number | null,
      minGrams: null as number | null,
      quantidadeDisponivel: i.stock,
      quantidadeMinima: 10, // alerta abaixo de 10 unidades
    })),
  ];
}
