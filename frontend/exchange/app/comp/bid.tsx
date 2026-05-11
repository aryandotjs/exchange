export function Bid({ data }: any) {
  if (!data || data.length === 0) return <div></div>;

  let total = 0;
  const bars = [...data].reverse().map((row: any) => {
    total += Number(row[1]);
    return [row[0], row[1], total];
  });

  const maxTotal = total;

  return (
    <div className="w-full pr-1 border-t border-white/5 ">
      {bars.map((row: any, index: any) => (
        <div
          key={index}
          className="relative h-[22px] my-[1px] pl-1 border-b border-white/5 text-[11px]"
        >
          <div
            className="bg-[#00c27833] absolute top-0 right-0 h-full transition-[width] duration-300"
            style={{ width: `${(row[1] / maxTotal) * 100}%` }}
          />
          <div
            className="bg-[#00c2781a] absolute top-0 right-0 h-full transition-[width] duration-300"
            style={{ width: `${(row[2] / maxTotal) * 100}%` }}
          />
          <div className="flex justify-between px-2 relative z-10 h-[22px] items-center font-mono">
            <div className="flex justify-between w-[65%]">
              <div className="text-[#00c278]">{row[0]}</div>
              <div className="text-white/80">{row[1]}</div>
            </div>
            <div className="text-white/70">{row[2].toFixed(5)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
