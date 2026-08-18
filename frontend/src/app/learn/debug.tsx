'use client';
export function Debug(props: any) {
  return <pre className="text-white z-50 fixed bottom-0 left-0 bg-black/80 p-4">{JSON.stringify(props, null, 2)}</pre>;
}
