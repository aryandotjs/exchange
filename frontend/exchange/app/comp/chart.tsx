import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { getKlinefromDb, getKlines } from "../utils/httpinitials";
import { myMarkets } from "../utils/coinname";

export function Chart({ market }: { market: string }) {
  const [interval, setinterval] = useState("1h");
  const [starttime, setstarttime] = useState<any>("1772351701");
  const [realdata, setrealdata] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const seriesref = useRef<any>(null);

  if (!myMarkets.includes(market.replace("_USDC", ""))) {
    useEffect(() => {
      getKlines(market, interval).then((d) => {
        const newarr = d.map((a) => {
          return {
            open: parseFloat(a.open),
            high: parseFloat(a.high),
            low: parseFloat(a.low),
            close: parseFloat(a.close),
            time: new Date(a.end).getTime() / 1000,
          };
        });
        setrealdata(newarr);
      });
    }, [market, interval]);
  }

  if (myMarkets.includes(market.replace("_USDC", ""))) {
    useEffect(() => {
      getKlinefromDb(market.replace("_USDC", "_USD"), interval).then(
        (a: any) => {
          setrealdata(a);
        },
      );
    }, [interval, market]);
  }

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        textColor: "#9ca3af",
        background: { type: "solid", color: "#14151b" },
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(255,255,255,0.2)",
          width: 1,
          style: 0,
        },
        horzLine: {
          color: "rgba(255,255,255,0.2)",
          width: 1,
          style: 0,
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.1)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartRef.current.clientWidth,
      height: 480,
    } as any);

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00c278",
      downColor: "#fd4b4e",
      borderVisible: false,
      wickUpColor: "#00c278",
      wickDownColor: "#fd4b4e",
    });
    series.setData(realdata);
    seriesref.current = series;

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        chart.applyOptions({
          width: chartRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [realdata]);

  return (
    <div className="bg-[#14151b] border border-white/10">
      <div className="  bg-[#14151b] border border-white/5 rounded-lg p-1 inline-flex  mx-1">
        {["1d", "1h", "1m"].map((a) => {
          const active = interval === a;

          return (
            <button
              key={a}
              onClick={() => setinterval(a)}
              className={`
          px-3 py-1 text-xs font-mono rounded-md transition-all
          ${
            active
              ? "bg-[#1f2937] text-white"
              : "text-[#6b7280] hover:text-white hover:bg-white/5"
          }
        `}
            >
              {a}
            </button>
          );
        })}
      </div>
      <div ref={chartRef} className="w-full border-t border-white/5" />
    </div>
  );
}
