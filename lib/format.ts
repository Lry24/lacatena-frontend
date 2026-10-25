export const fcfa = (n: number | null | undefined) =>
  `${Math.round(Number(n) || 0).toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;

export const formatDate = (iso: string, withTime = false) => {
  const d = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

export const ORDER_STATUS: Record<string, { label: string; tone: 'gold' | 'olive' | 'cream' | 'red' | 'green' }> = {
  PENDING: { label: 'En attente', tone: 'gold' },
  CONFIRMED: { label: 'Confirmée', tone: 'cream' },
  PROCESSING: { label: 'En préparation', tone: 'cream' },
  READY: { label: 'Prête', tone: 'olive' },
  SHIPPED: { label: 'Expédiée', tone: 'olive' },
  DELIVERED: { label: 'Livrée', tone: 'green' },
  CANCELLED: { label: 'Annulée', tone: 'red' },
  RETURNED: { label: 'Retournée', tone: 'red' },
};

/** Libellé des boutons d'action de l'équipe, selon le statut visé. */
export const STATUS_ACTION: Record<string, string> = {
  CONFIRMED: 'Confirmer la commande',
  PROCESSING: 'Lancer la préparation',
  READY: 'Marquer prête',
  SHIPPED: 'Marquer expédiée',
  DELIVERED: 'Marquer livrée / remise',
  CANCELLED: 'Annuler la commande',
  RETURNED: 'Enregistrer un retour',
};

/** Étapes montrées au client dans le suivi. */
export const TRACK_STEPS = [
  { status: 'PENDING', label: 'Reçue', hint: 'Nous vous appelons pour confirmer' },
  { status: 'CONFIRMED', label: 'Confirmée', hint: 'Votre commande est validée' },
  { status: 'PROCESSING', label: 'En préparation', hint: 'Vos pièces sont préparées avec soin' },
  { status: 'READY', label: 'Prête', hint: 'Prête à partir ou à retirer' },
  { status: 'SHIPPED', label: 'Expédiée', hint: 'En route vers vous' },
  { status: 'DELIVERED', label: 'Livrée', hint: 'Remise entre vos mains' },
];

export const PAYMENT_METHOD: Record<string, string> = {
  CASH_ON_DELIVERY: 'Paiement à la livraison',
  MOBILE_MONEY: 'Mobile Money (Flooz / T-Money)',
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: 'gold' | 'olive' | 'cream' | 'red' | 'green' }> = {
  PENDING: { label: 'À encaisser', tone: 'gold' },
  PARTIALLY_PAID: { label: 'Acompte reçu', tone: 'olive' },
  PAID: { label: 'Payée', tone: 'green' },
  CANCELLED: { label: 'Annulé', tone: 'red' },
  REFUNDED: { label: 'Remboursée', tone: 'red' },
};

export const MOVEMENT_TYPE: Record<string, string> = {
  PURCHASE: 'Réception',
  SALE: 'Vente',
  RETURN: 'Retour en stock',
  ADJUSTMENT: 'Inventaire',
  LOSS: 'Perte / défaut',
};

export const delay = (r: { days_min: number | null; days_max: number | null }) => {
  if (r.days_min == null && r.days_max == null) return '';
  if (r.days_max === 0) return 'Le jour même';
  if (r.days_min === r.days_max) return `${r.days_min} jour${(r.days_min ?? 0) > 1 ? 's' : ''}`;
  return `${r.days_min ?? 0} à ${r.days_max} jours`;
};
