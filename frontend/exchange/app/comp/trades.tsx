import { useEffect, useState } from "react";
import { getTrades, tradesformarket } from "../utils/httpinitials";
import { signalingManager } from "../utils/signalingmanager";
import { myMarkets } from "../utils/coinname";
import { signalingManager2 } from "../utils/signalingmanager2";

export function Trades({ market }: { market: string }) {
  const [trades, settrades] = useState<any>();
  if (!myMarkets.includes(market.split("_")[0])) {
    useEffect(() => {
      getTrades(market).then((a) => {
        settrades(a);
      });

      signalingManager.getInstance().regesterCallback(
        "trade",
        (a: any) => {
          settrades((prevdata: any) => {
            if (prevdata) {
              const final = [
                {
                  timestamp: a.T,
                  isBuyerMaker: a.m,
                  price: a.p,
                  quantity: a.q,
                },
                ...prevdata,
              ];
              if (final.length > 100) {
                final.splice(100, 1);
              }
              return final;
            }
          });
        },
        market,
      );

      signalingManager.getInstance().sendmessages({
        method: "SUBSCRIBE",
        params: [`trade.${market}`],
      });

      return () => {
        signalingManager.getInstance().sendmessages({
          method: "UNSUBSCRIBE",
          params: [`trade.${market}`],
        });
        signalingManager.getInstance().deRegesterCallback("trade", market);
      };
    }, [market]);
  }
  if (myMarkets.includes(market.split("_")[0])) {
    const newmarket = market.replace("_USDC", "_USD");
    useEffect(() => {
      tradesformarket(newmarket).then((a) => {
        const alltrades = a.map((t: any) => {
          return {
            timestamp: t.time,
            isBuyerMaker: t.isbuyermaker,
            price: t.price,
            quantity: t.volume,
          };
        });
        settrades(alltrades);
      });

      signalingManager2.getInstance().regesterCallback(
        "trade",
        (a: any) => {
          settrades((prevdata: any) => {
            const final = [
              {
                timestamp: a.T,
                isBuyerMaker: a.m,
                price: a.p,
                quantity: a.q,
              },
              ...(prevdata ?? []),
            ];
            if (final.length > 100) {
              final.splice(100, 1);
            }
            return final;
          });
        },
        "bhaia",
      );

      // signalingManager2.getInstance().sendmessages({
      //   type: "SUBSCRIBE",
      //   params: [`trade@${newmarket}`],
      // });
      return () => {
        // signalingManager2.getInstance().sendmessages({
        //   type: "UNSUBSCRIBE",
        //   params: [`trade@${newmarket}`],
        // });
        signalingManager2.getInstance().deRegesterCallback("trade", "bhaiya");
      };
    }, [market]);
  }

  if (!trades) {
    return (
      <div className="p-4 bg-[#14151b]  border border-white/5">
        <div className="flex text-xs justify-between mb-2">
          <div className="flex w-[65%] justify-between">
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        </div>

        <div className="overflow-hidden h-115 space-y-2">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="flex justify-between items-center h-6">
              <div className="flex justify-between w-[67%]">
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-4 w-14 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#14151b]  border border-white/5">
      <div className="flex text-xs justify-between mb-2 text-[#969FAF]">
        <div className="flex w-[65%] justify-between">
          <p>Price (USD)</p>
          <p>Qty ({market.replace("_USDC", "")})</p>
        </div>
      </div>

      <div className="overflow-y-scroll h-115 pr-1">
        {trades.map((a: any, b: any) => {
          let date = new Date(a.timestamp);
          let timeString = date.toLocaleTimeString("en-US", {
            hour12: false,
          });

          return (
            <div
              key={b}
              className="flex justify-between text-sm h-7 items-center px-2 rounded-lg hover:bg-[#202127] transition-colors"
            >
              <div className="flex justify-between w-[67%]">
                <div
                  className={`tabular-nums ${
                    a.isBuyerMaker ? "text-[#fd4b4e]" : "text-[#00c278]"
                  }`}
                >
                  {Number(a.price).toLocaleString()}
                </div>

                <div className="tabular-nums text-white">{a.quantity}</div>
              </div>

              <div className="text-[#969FAF] text-xs tabular-nums">
                {timeString}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
