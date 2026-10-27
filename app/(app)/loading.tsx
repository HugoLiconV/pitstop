export default function Loading() {
  return (
    <div aria-busy className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none">
      <div className="h-4 w-32 rounded bg-line" />
      <div className="h-14 w-56 rounded bg-line" />
      <div className="h-12 rounded-lg bg-line" />
      <div className="h-24 rounded-lg bg-line" />
    </div>
  );
}
