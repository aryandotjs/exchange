"use client";
import { useEffect, useState } from "react";
import {
  getKlineDataForMiniGraph,
  getKlines,
  getMarketCap,
  getSpotMarket,
} from "../utils/httpinitials";

import { GetSpot } from "./spotmarkets";
import { COINGECKO_IDS } from "../utils/coinname";

let count = 1;
export function AllMarketLanding() {
  const [Markets, setMarkets] = useState<any | null>();
  const [mcap, setmcap] = useState<any | null>();
  const [kline, setkline] = useState<any | null>();
  const [typemarket, settypemarket] = useState<any | null>("SPOT");
  const [sorttype, setsorttype] = useState<any>("Price");
  useEffect(() => {
    getSpotMarket().then((a) => {
      setMarkets(sorter(a, sorttype, mcap));
    });
  }, []);
  useEffect(() => {
    getMarketCap().then((cap) => {
      setmcap(cap);
    });
    getKlineDataForMiniGraph().then((a: any) => {
      setkline(a);
    });
  }, []);
  useEffect(() => {
    if (Markets) {
      setMarkets(sorter(Markets, sorttype, mcap));
    }
  }, [sorttype]);
  if (Markets && count == 1) {
    setsorttype("Price");
    count++;
  }
  if (!Markets) {
    return (
      <div>
        <SpotTableLoader></SpotTableLoader>
      </div>
    );
  }
  return (
    <div className="w-full flex justify-center mt-20 ">
      <div className="bg-[#14151b] w-[83%]  rounded-2xl p-4 ">
        <div className="flex  text-sm gap-2">
          <div
            onClick={() => {
              settypemarket("SPOT");
            }}
            className={` rounded-lg py-1.5 px-3  font-medium cursor-pointer text-[#969FAF] ${
              typemarket == "SPOT" ? "bg-[#202127] text-white" : ""
            } `}
          >
            Spot
          </div>
        </div>
        <div className="flex  cursor-pointer justify-between w-full text-xs select-none text-[#969FAF]  pt-6 pb-3">
          <div className="w-[16.6%] text-left pl-2">Name</div>
          <div
            onClick={() => {
              setsorttype((crval: any) => {
                if (crval == "Price") {
                  return "Pricerev";
                }
                if (crval == "Pricerev") {
                  return "Price";
                }
                return "Price";
              });
            }}
            className={`flex gap-1 justify-end w-[16.6%]  }`}
          >
            {sorttype == "Price" ? <Downarrow></Downarrow> : ""}
            {sorttype == "Pricerev" ? <Uparrow></Uparrow> : ""}
            Price
          </div>
          <div
            onClick={() => {
              setsorttype((crval: any) => {
                if (crval == "Volume") {
                  return "Volumerev";
                }
                if (crval == "Volumerev") {
                  return "Volume";
                }
                return "Volume";
              });
            }}
            className={`flex gap-1 justify-end w-[16.6%]  }`}
          >
            {sorttype == "Volume" ? <Downarrow></Downarrow> : ""}
            {sorttype == "Volumerev" ? <Uparrow></Uparrow> : ""}
            24 Volume
          </div>
          <div
            onClick={() => {
              setsorttype((crval: any) => {
                if (crval == "Mcap") {
                  return "Mcaprev";
                }
                if (crval == "Mcaprev") {
                  return "Mcap";
                }
                return "Mcap";
              });
            }}
            className={`flex gap-1 justify-end w-[16.6%]  }`}
          >
            {sorttype == "Mcap" ? <Downarrow></Downarrow> : ""}
            {sorttype == "Mcaprev" ? <Uparrow></Uparrow> : ""}
            Market Cap
          </div>
          <div
            onClick={() => {
              setsorttype((crval: any) => {
                if (crval == "24hChange") {
                  return "24hChangerev";
                }
                if (crval == "24hChangerev") {
                  return "24hChange";
                }
                return "24hChange";
              });
            }}
            className={`flex gap-1 justify-end w-[16.6%]  }`}
          >
            {sorttype == "24hChange" ? <Downarrow></Downarrow> : ""}
            {sorttype == "24hChangerev" ? <Uparrow></Uparrow> : ""}24h Change
          </div>
          <div className="w-[16.6%] text-right pr-4">Last 7 Days</div>
        </div>
        <GetSpot markets={Markets} MarketCap={mcap} klinedata={kline}></GetSpot>
      </div>
    </div>
  );
}
export function sorter(array: any, type: any, mcap: any) {
  const copy = [...array];
  if (type == "Name") {
    return copy;
  }
  if (type == "Namerev") {
    return copy.reverse();
  }
  if (type == "Price") {
    const sorted = copy.sort((a: any, b: any) => {
      return Number(b.lastPrice) - Number(a.lastPrice);
    });
  }
  if (type == "Pricerev") {
    const sorted = copy.sort((a: any, b: any) => {
      return Number(a.lastPrice) - Number(b.lastPrice);
    });
  }
  if (type == "Volume") {
    const sorted = copy.sort((a: any, b: any) => {
      return Number(b.quoteVolume) - Number(a.quoteVolume);
    });
  }
  if (type == "Volumerev") {
    const sorted = copy.sort((a: any, b: any) => {
      return Number(a.quoteVolume) - Number(b.quoteVolume);
    });
  }
  if (type == "24hChange") {
    const sorted = copy.sort((a: any, b: any) => {
      return Number(b.priceChangePercent) - Number(a.priceChangePercent);
    });
  }
  if (type == "24hChangerev") {
    const sorted = copy.sort((a: any, b: any) => {
      return Number(a.priceChangePercent) - Number(b.priceChangePercent);
    });
  }
  if (type == "Mcap" && mcap) {
    const sorted = copy.sort((a: any, b: any) => {
      function getnum(prop: any) {
        const mk = prop.symbol.replace("_USDC", "");
        if (!COINGECKO_IDS[mk] && mcap[mk.toLowerCase()]) {
          return mcap[mk.toLowerCase()].usd_market_cap;
        }
        if (COINGECKO_IDS[mk]) {
          return mcap[COINGECKO_IDS[mk]].usd_market_cap;
        }
        return 0;
      }
      const one: any = getnum(a);
      const two: any = getnum(b);
      return two - one;
    });
  }
  if (type == "Mcaprev" && mcap) {
    const sorted = copy.sort((a: any, b: any) => {
      function getnum(prop: any) {
        const mk = prop.symbol.replace("_USDC", "");
        if (!COINGECKO_IDS[mk] && mcap[mk.toLowerCase()]) {
          return mcap[mk.toLowerCase()].usd_market_cap;
        }
        if (COINGECKO_IDS[mk]) {
          return mcap[COINGECKO_IDS[mk]].usd_market_cap;
        }
        return 0;
      }
      const one: any = getnum(a);
      const two: any = getnum(b);
      return one - two;
    });
  }

  return copy;
}
export function Downarrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill=""
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      className="size-3.5 mt-[1px]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
      />
    </svg>
  );
}
export function Uparrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill=""
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      className="size-3.5 mt-[1px]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
      />
    </svg>
  );
}

export function SpotTableLoader() {
  return (
    <div className="w-full flex justify-center mt-20">
      <div className="bg-[#14151b] w-[83%] rounded-2xl p-4">
        <div className="flex text-sm gap-2 mb-4">
          <div className="h-7 w-16 bg-[#202127] rounded-lg animate-pulse" />
        </div>

        <div className="flex justify-between w-full text-xs text-[#969FAF] pt-2 pb-3">
          {["Name", "Price", "Volume", "Mcap", "Change", "Chart"].map(
            (_, i) => (
              <div key={i} className="w-[16.6%] flex justify-end">
                <div className="h-3 w-16 bg-[#202127] rounded animate-pulse ml-2" />
              </div>
            ),
          )}
        </div>

        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex justify-between w-full border-t border-[#202127] h-16 items-center"
          >
            <div className="flex w-[16.6%] gap-2 items-center px-1">
              <div className="h-8 w-8 rounded-full bg-[#202127] animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-16 bg-[#202127] rounded animate-pulse" />
                <div className="h-3 w-12 bg-[#202127] rounded animate-pulse" />
              </div>
            </div>

            <div className="w-[16.6%] flex justify-end">
              <div className="h-3 w-16 bg-[#202127] rounded animate-pulse" />
            </div>

            <div className="w-[16.6%] flex justify-end">
              <div className="h-3 w-20 bg-[#202127] rounded animate-pulse" />
            </div>

            <div className="w-[16.6%] flex justify-end">
              <div className="h-3 w-20 bg-[#202127] rounded animate-pulse" />
            </div>

            <div className="w-[16.6%] flex justify-end">
              <div className="h-3 w-12 bg-[#202127] rounded animate-pulse" />
            </div>

            <div className="w-[16.6%] flex justify-end pr-4">
              <div className="h-6 w-24 bg-[#202127] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
