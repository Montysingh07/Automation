import dynamic from 'next/dynamic';
const BuyerForm = dynamic(() => import('@/components/BuyerForm'), { ssr: false });
import { useRouter } from 'next/navigation';

export default function NewBuyerPage() {
  // This is a client component because BuyerForm uses client hooks
  return (
    <div>
      <h1>Create Buyer</h1>
      {/* @ts-expect-error client component */}
      <BuyerForm onSaved={(b:any)=> { window.location.href = `/buyers/${b.id}` }} />
    </div>
  );
}
