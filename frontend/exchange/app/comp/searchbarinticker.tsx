"use client";
import { useEffect, useState } from "react";
import { Search, Star } from "./navbar";
import { getMarketCap, getSpotMarket } from "../utils/httpinitials";
import { formating } from "./spotmarkets";
import { COINGECKO_IDS } from "../utils/coinname";
import { sorter } from "./allmarketslanding";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export function MarketSearch(params: any) {
  const [mcap, setmcap] = useState<any>();
  const [allmarketsname, setallmarketsname] = useState<any>();
  const [sorttype, setsorttype] = useState<any>("Price");
  const [smarket, setsmarket] = useState<any>("Spot");
  const [searchbar, setsearchbar] = useState<any>("");

  useEffect(() => {
    getSpotMarket().then((a: any) => {
      const copy = [...a];
      let newar = copy.map((h: any) => {
        const syb = h.symbol.replace("_USDC", "");
        if (
          syb == "BTC" ||
          syb == "BNB" ||
          syb == "XRP" ||
          syb == "SOL" ||
          syb == "ETH" ||
          syb == "USDT"
        ) {
          return { ...h, fav: true };
        }
        return { ...h, fav: false };
      });
      if (smarket == "fav") {
        const favs = newar.filter((a: any) => {
          return a.fav;
        });

        newar = favs;
      }
      const searched = newar.filter((i: any) => {
        let res = false;
        if (!COINGECKO_IDS[i.symbol.replace("_USDC", "")]) {
          res = i.symbol
            .replace("_USDC", "USD")
            .toLowerCase()
            .includes(searchbar.toLowerCase());
          return res;
        }
        if (COINGECKO_IDS[i.symbol.replace("_USDC", "")]) {
          res =
            i.symbol
              .replace("_USDC", "USD")
              .toLowerCase()
              .includes(searchbar.toLowerCase()) ||
            COINGECKO_IDS[i.symbol.replace("_USDC", "")]
              .toLowerCase()
              .includes(searchbar.toLowerCase());
        }

        return res;
      });

      const sorted = sorter(searched, sorttype, "");
      setallmarketsname(sorted);
    });

    getMarketCap().then((b: any) => {
      setmcap(b);
    });
  }, [sorttype, smarket, searchbar]);

  if (!allmarketsname) {
    return <div></div>;
  }

  return (
    <div className="bg-[#14151b] text-gray-200 font-mono rounded-xl shadow-black shadow-2xl border border-white/10 w-100 px-1">
      <div className="flex py-3 px-2  items-center justify-between">
        <div className="flex text-xs tracking-widest uppercase border rounded-lg overflow-hidden border-white/10">
          {["Spot"].map((t) => (
            <div
              key={t}
              onClick={() => setsmarket(t)}
              className={`px-3 py-1.5 cursor-pointer ${
                smarket === t
                  ? "text-white border-b-2 border-green-500"
                  : "text-gray-500"
              }`}
            >
              {t}
            </div>
          ))}
        </div>
        <div
          onClick={() => setsmarket("fav")}
          className={`px-2 cursor-pointer ${
            smarket === "fav" ? "text-blue-400" : "text-gray-500"
          }`}
        >
          <Star fill={""} />
        </div>
      </div>

      <div className="px-2">
        <div className="flex items-center bg-[#202127] border border-white/10 h-8 px-2 text-xs text-gray-400">
          <Search />
          <input
            onChange={(a: any) => setsearchbar(a.target.value)}
            type="search"
            className="w-full bg-transparent pl-2 outline-none"
            placeholder="SEARCH MARKETS"
          />
        </div>
      </div>

      <div className="flex justify-between w-full py-2 text-[10px] tracking-widest uppercase text-gray-500 border-b border-white/10 mt-2">
        <div className="w-[33%] flex gap-2 pl-2">
          <div
            onClick={() => {
              setsorttype((crval: any) => {
                if (crval == "Name") return "Namerev";
                if (crval == "Namerev") return "Name";
                return "Name";
              });
            }}
            className="flex cursor-pointer"
          >
            Market
          </div>
          /
          <div
            onClick={() => {
              setsorttype((crval: any) => {
                if (crval == "Volume") return "Volumerev";
                if (crval == "Volumerev") return "Volume";
                return "Volume";
              });
            }}
            className="flex cursor-pointer"
          >
            Volume
          </div>
        </div>

        <div className="w-[33%] flex justify-end gap-2">
          <div
            onClick={() => {
              setsorttype((crval: any) => {
                if (crval == "Price") return "Pricerev";
                if (crval == "Pricerev") return "Price";
                return "Price";
              });
            }}
            className="cursor-pointer"
          >
            Price
          </div>
          /
          <div
            onClick={() => {
              setsorttype((crval: any) => {
                if (crval == "24hChange") return "24hChangerev";
                if (crval == "24hChangerev") return "24hChange";
                return "24hChange";
              });
            }}
            className="cursor-pointer"
          >
            Change
          </div>
        </div>

        <div className="w-[33%] pl-6">Market Cap</div>
      </div>

      <div className="overflow-y-scroll">
        <Mapped marketdata={allmarketsname} capdata={mcap}></Mapped>
      </div>
    </div>
  );
}

export function Mapped({ marketdata, capdata }: any) {
  const router = useRouter();
  const path = usePathname();

  return (
    <div className="h-102">
      {marketdata.map((a: any, b: any) => {
        const name = a.symbol.replace("_USDC", "");
        const route = a.symbol.replace("_USDC", "_USD");
        let mcapdata: any = "-";

        if (capdata) {
          if (!COINGECKO_IDS[name] && capdata[name.toLowerCase()]) {
            mcapdata = formating(capdata[name.toLowerCase()]?.usd_market_cap);
          }
          if (COINGECKO_IDS[name]) {
            mcapdata = formating(capdata[COINGECKO_IDS[name]]?.usd_market_cap);
          }
        }

        return (
          <div
            onClick={() => {
              if (!path.includes("trade")) {
                router.replace(`trade/${route}`);
              }
              if (path.includes("trade")) {
                router.replace(`${route}`);
              }
            }}
            key={b}
            className="h-11 flex items-center text-xs  hover:bg-white/5 justify-between px-1 tabular-nums"
          >
            <div className="flex w-[33%] pl-2 items-center">
              <img
                className="h-5 w-5 rounded-full"
                src={`https://backpack.exchange/coins/${name.toLowerCase()}.png`}
              />
              <div className="ml-2">
                <div className="flex">
                  {name}
                  <span className="text-gray-500">/USD</span>
                </div>
                <div className="text-gray-500">{formating(a.quoteVolume)}</div>
              </div>
            </div>

            <div className="flex w-[33%] justify-end">
              <div>
                <div className="text-right">{a.lastPrice.toLocaleString()}</div>
                <div
                  className={`text-right ${
                    a.priceChangePercent > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {(a.priceChangePercent * 100).toFixed(4)}%
                </div>
              </div>
            </div>

            <div className="flex w-[33%] justify-end items-center">
              <div className="text-gray-500">{mcapdata}</div>
              <div className="px-2">
                {a.fav ? <Star fill={"#4c94ff"} /> : <Star fill={""} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Downarrow2() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill=""
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="size-3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
      />
    </svg>
  );
}

export function Uparrow2() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill=""
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="size-3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
      />
    </svg>
  );
}
