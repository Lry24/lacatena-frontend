'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { A, Alert, PageTitle, Spin, useFetch } from '@/components/admin/kit';
import type { ProductDetail } from '@/lib/types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useFetch<ProductDetail>(`/api/v1/admin/products/${id}`);
  return (
    <>
      <Link href="/admin/produits" style={{ fontSize: 12, color: A.muted }}>← Produits</Link>
      {error ? <div className="mt-4"><Alert>{error}</Alert></div> : !data ? <Spin /> : (
        <>
          <div className="mt-3"><PageTitle title={data.name} subtitle={[data.brand, data.sku, `${data.stock} en stock`].filter(Boolean).join(' · ')} /></div>
          <ProductForm key={data.id} product={data} />
        </>
      )}
    </>
  );
}
