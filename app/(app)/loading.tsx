export default function Loading() {
  return (
    <div aria-busy className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none">
      <div className="h-6 w-28 rounded-full bg-line" />
      <div className="panel flex h-80 flex-col gap-4 p-5">
        <div className="h-9 w-40 rounded-full bg-line" />
        <div className="h-6 w-48 rounded-full bg-line/70" />
      </div>
      <div className="panel h-40" />
    </div>
  );
}
