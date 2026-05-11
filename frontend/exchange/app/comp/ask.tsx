export function Ask({ data }: any) {
  if (!data || data.length === 0)
    return (
      <div className="w-full pr-1">
        {[...Array(15)].map((_, index) => {
          const w1 = 30 + ((index * 7) % 60);
          const w2 = 20 + ((index * 5) % 40);

          return (
            <div
              key={index}
              className="relative h-[22px] my-[1px] pl-1 border-b border-white/5"
            >
              <div
                className="bg-[#fd4b4e33] absolute top-0 right-0 h-full animate-pulse"
                style={{ width: `${w1}%` }}
              />
              <div
                className="bg-[#fd4b4e1a] absolute top-0 right-0 h-full animate-pulse"
                style={{ width: `${w2}%` }}
              />

              <div className="flex justify-between text-[11px] px-2 relative z-10 h-[22px] items-center font-mono">
                <div className="flex justify-between w-[65%]">
                  <div className="h-3 w-12 bg-white/10 animate-pulse" />
                  <div className="h-3 w-10 bg-white/10 animate-pulse" />
                </div>
                <div className="h-3 w-10 bg-white/10 animate-pulse" />
              </div>
            </div>
          );
        })}
      </div>
    );

  let total = 0;
  const bars = [...data].map((row: any) => {
    total += Number(row[1]);
    return [row[0], row[1], total];
  });

  const maxTotal = total;

  return (
    <div className="w-full pr-1 bt-1 ">
      {bars.reverse().map((row: any, index: any) => (
        <div
          key={index}
          className="relative h-[22px] my-[1px] pl-1 border-b border-white/5 text-[11px]"
        >
          <div
            className="bg-[#fd4b4e33] absolute top-0 right-0 h-full transition-[width] duration-300"
            style={{ width: `${(row[1] / maxTotal) * 100}%` }}
          />
          <div
            className="bg-[#fd4b4e1a] absolute top-0 right-0 h-full transition-[width] duration-300"
            style={{ width: `${(row[2] / maxTotal) * 100}%` }}
          />
          <div className="flex justify-between px-2 relative z-10 h-[22px] items-center font-mono">
            <div className="flex justify-between w-[65%]">
              <div className="text-[#fd4b4e]">{row[0]}</div>
              <div className="text-white/80">{row[1]}</div>
            </div>
            <div className="text-white/70">{row[2].toFixed(5)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
