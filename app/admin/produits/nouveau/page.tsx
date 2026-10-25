'use client';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';
import { A, PageTitle } from '@/components/admin/kit';

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/produits" style={{ fontSize: 12, color: A.muted }}>← Produits</Link>
      <div className="mt-3"><PageTitle title="Nouvelle pièce" subtitle="Photos, tailles et stock : la pièce est en ligne dès l'enregistrement." /></div>
      <ProductForm />
    </>
  );
}
