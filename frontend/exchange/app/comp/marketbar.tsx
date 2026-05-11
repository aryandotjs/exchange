"use client";
import { useEffect, useRef, useState } from "react";
import { getTicker, getTickerFromDb } from "../utils/httpinitials";
import { Ticker } from "../utils/types";
import { signalingManager } from "../utils/signalingmanager";
import { MarketSearch } from "./searchbarinticker";
import { myMarkets } from "../utils/coinname";
import { signalingManager2 } from "../utils/signalingmanager2";

export function TickerBar({ market }: { market: string }) {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [lastPrice, setlastPrice] = useState<any>("");
  const [showsearchmarket, setshowsearchmarket] = useState(false);

  const [color, setcolor] = useState("[#00c278]");
  const tickerref = useRef<any>(null);
  const tickerscrollref = useRef<HTMLDivElement>(null);
  const innerdivscrollref = useRef<HTMLDivElement>(null);

  if (!myMarkets.includes(market.replace("_USDC", ""))) {
    useEffect(() => {
      getTicker(market).then((data) => {
        setTicker(data);
        tickerref.current = data.lastPrice;
      });

      signalingManager.getInstance().regesterCallback(
        "ticker",
        (a: any) => {
          setTicker((us: any) => {
            if (a.firstPrice == us?.firstPrice && a.volume == us?.volume) {
              return us;
            }
            return {
              firstPrice: a.firstPrice ?? us?.firstPrice ?? "",
              high: a.high ?? us?.high ?? "",
              lastPrice: a.lastPrice ?? us?.lastPrice ?? "",
              low: a.low ?? us?.low ?? "",
              priceChange: a.us ?? us?.priceChange ?? "",
              priceChangePercent:
                a.priceChangePercent ?? us?.priceChangePercent ?? "",
              quoteVolume: a.quoteVolume ?? us?.quoteVolume ?? "",
              symbol: a.fax ?? us?.symbol ?? "",
              trade: a.trades ?? us?.trades ?? "",
              volume: a.volume ?? us?.volume ?? "",
            };
          });
        },
        market,
      );

      signalingManager.getInstance().sendmessages({
        method: "SUBSCRIBE",
        params: [`ticker.${market}`],
      });

      return () => {
        signalingManager.getInstance().sendmessages({
          method: "UNSUBSCRIBE",
          params: [`ticker.${market}`],
        });
        signalingManager.getInstance().deRegesterCallback("ticker", market);
      };
    }, [market]);
  }
  if (myMarkets.includes(market.replace("_USDC", ""))) {
    const newmarket = market.replace("_USDC", "_USD");
    useEffect(() => {
      getTickerFromDb(newmarket).then((data) => {
        setTicker(data);
        tickerref.current = data.lastPrice;
      });
    }, [lastPrice]);
    useEffect(() => {
      signalingManager2.getInstance().regesterCallback(
        "trade",
        (a: any) => {
          setlastPrice(a.p);
        },
        newmarket,
      );
      signalingManager2.getInstance().sendmessages({
        type: "SUBSCRIBE",
        params: [`trade@${newmarket}`],
      });

      return () => {
        signalingManager2.getInstance().sendmessages({
          type: "UNSUBSCRIBE",
          params: [`trade@${newmarket}`],
        });
        signalingManager2.getInstance().deRegesterCallback("tarde", newmarket);
      };
    }, [market]);
  }

  useEffect(() => {
    if (Number(tickerref.current) > Number(ticker?.lastPrice)) {
      setcolor("[#fd4b4e]");
    } else setcolor("[#00c278]");
    tickerref.current = ticker?.lastPrice;
  }, [ticker?.lastPrice, market]);

  if (!ticker) {
    return (
      <div className="w-full flex bg-[#14151b] h-[74px] rounded-xl items-center  mb-1 px-4 border border-white/5">
        <div className="flex gap-3 items-center border-r border-white/5 pr-4">
          <div className="h-7 w-7 rounded-full bg-white/10 animate-pulse"></div>
          <div className="h-5 w-24 bg-white/10 rounded animate-pulse"></div>
        </div>

        <div className="flex gap-8 items-center ml-6 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-16 bg-white/5 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div
        ref={tickerscrollref}
        className="w-full flex bg-[#14151b] h-[74px] rounded-xl items-center border border-white/5 overflow-x-scroll [scrollbar-width:none] mb-1 relative"
      >
        <div
          ref={innerdivscrollref}
          className="flex gap-6 items-center w-max px-4"
        >
          <div
            onClick={() => setshowsearchmarket((a) => !a)}
            className="h-12 flex items-center cursor-pointer"
          >
            <div className="flex gap-2 items-center">
              <img
                className="h-6 w-6 rounded-full opacity-90"
                src={`https://backpack.exchange/coins/${market.replace("_USDC", "").toLowerCase()}.png`}
              />
              <div className="font-medium flex text-sm">
                <div>{market.split("_")[0]}</div>
                <div className="text-[#969FAF] ml-1">/USD</div>
              </div>
              <div className="text-[#969FAF]">
                {showsearchmarket ? <DropUp /> : <Dropdown />}
              </div>
            </div>
          </div>

          <div className="flex gap-8 items-center">
            <div>
              <div className={`font-medium text-lg tabular-nums text-${color}`}>
                {lastPrice
                  ? lastPrice
                  : Number(ticker.lastPrice).toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#969FAF] mb-1">24H Change</div>
              <div
                className={`text-sm ${
                  Number(ticker?.priceChange) > 0
                    ? "text-[#00c278]"
                    : "text-[#fd4b4e]"
                }`}
              >
                {Number(ticker?.priceChange) > 0 ? "+" : ""}
                {Number(ticker?.priceChange).toLocaleString()}{" "}
                {Number(ticker?.priceChangePercent).toFixed(2)}%
              </div>
            </div>

            <div>
              <div className="text-xs text-[#969FAF] mb-1">24H High</div>
              <div className="text-sm">
                {Number(ticker?.high).toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#969FAF] mb-1">24H Low</div>
              <div className="text-sm">
                {Number(ticker?.low).toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#969FAF] mb-1">
                24H Volume (USD)
              </div>
              <div className="text-sm tabular-nums">
                {Number(ticker?.quoteVolume).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute z-20 left-2 top-[70px] ">
        {showsearchmarket ? (
          <MarketSearch callback={setshowsearchmarket} />
        ) : null}
      </div>
    </div>
  );
}

function Dropdown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-5 text-[#969FAF]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

function DropUp() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-5 text-[#969FAF]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 15.75 7.5-7.5 7.5 7.5"
      />
    </svg>
  );
}
