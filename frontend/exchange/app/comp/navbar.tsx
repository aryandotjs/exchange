"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSpotMarket } from "../utils/httpinitials";
import { COINGECKO_IDS } from "../utils/coinname";
import { Profile } from "./profile";

export default function Navbar() {
  const [showdropdown, setshowdropdown] = useState<any>(false);
  const [searchbar, setsearchbar] = useState<any>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const route = usePathname();
  const searchboundary = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    function globleclick(event: MouseEvent) {
      if (
        searchboundary.current &&
        !searchboundary.current.contains(event.target as Node)
      ) {
        setshowdropdown(false);
      }
    }
    document.addEventListener("mousedown", globleclick);

    return () => {
      document.removeEventListener("mousedown", globleclick);
    };
  }, []);

  return (
    <div className="w-full border-white/5">
      <div className="flex justify-between h-14 z-20 relative px-4 items-center">
        <div className="flex items-center gap-6 min-w-100">
          <div
            className="font-semibold text-[18px] tracking-tight text-white cursor-pointer"
            onClick={() => router.push("/trade/allmarkets")}
          >
            Exchange
          </div>

          <div
            className={`text-[13px] font-medium tracking-wide cursor-pointer transition-colors ${
              route.startsWith("/trade")
                ? "text-white"
                : "text-[#969FAF] hover:text-white"
            }`}
            onClick={() => router.push("/trade/market/BTC_USD")}
          >
            Spot
          </div>

          <div ref={searchboundary} className="relative">
            <div
              onClick={() => {
                setshowdropdown((a: any) => !a);
              }}
              tabIndex={0}
              className="ml-110  h-8 items-center w-80 bg-[#202127] border border-white/5  rounded-lg px-3 text-[#969FAF] text-[13px] focus-within:border-white/20 transition-all hidden xl:flex"
            >
              <Search />

              <input
                onChange={(a: any) => {
                  setsearchbar(a.target.value);
                }}
                type="search"
                className="w-full bg-transparent pl-2 outline-none text-white placeholder:text-[#2a2f3a]"
                placeholder="Search markets"
              />

              <div className="ml-2 border border-white/10 h-5 w-5 flex items-center justify-center rounded text-[10px] text-[#969FAF]">
                /
              </div>
            </div>

            <div className="w-117 absolute top-12 left-60 ml-[18.5%]">
              {showdropdown ? (
                <SearchDropdown text={searchbar} callback={setshowdropdown} />
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        {isLoggedIn ? (
          <Profile></Profile>
        ) : (
          <div className="flex items-center gap-2 min-w-50">
            <div
              onClick={() => {
                router.push(`/auth`);
              }}
              className="bg-[#202127] border border-white/5 hover:border-white/20 rounded-lg flex items-center font-medium h-8 px-3 text-[13px] text-white cursor-pointer transition-all"
            >
              Log in
            </div>

            <div
              onClick={() => {
                router.push(`/auth`);
              }}
              className="bg-white rounded-lg flex items-center font-medium h-8 px-3 text-[13px] text-black cursor-pointer"
            >
              Sign up
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function SearchDropdown({ text, callback }: any) {
  const [smarket, setsmarket] = useState<any>("all");
  const [mdata, setmdata] = useState<any>(null);

  useEffect(() => {
    getSpotMarket().then((a: any) => {
      const copy = [...a];

      const searched = copy.filter((i: any) => {
        let res = false;
        if (!COINGECKO_IDS[i.symbol.replace("_USDC", "")]) {
          res = i.symbol
            .replace("_USDC", "USD")
            .toLowerCase()
            .includes(text.toLowerCase());
          return res;
        }
        if (COINGECKO_IDS[i.symbol.replace("_USDC", "")]) {
          res =
            i.symbol
              .replace("_USDC", "USD")
              .toLowerCase()
              .includes(text.toLowerCase()) ||
            COINGECKO_IDS[i.symbol.replace("_USDC", "")]
              .toLowerCase()
              .includes(text.toLowerCase());
        }
        return res;
      });

      const newar = searched.map((h: any) => {
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

      setmdata(newar);
    });
  }, [text]);

  if (!mdata) return <div></div>;

  return (
    <div className="bg-[#14151b] border border-white/10 rounded-xl w-100 font-mono text-gray-200">
      <div className="flex py-3 px-2 items-center justify-between">
        <div className="flex text-[10px] tracking-widest uppercase border border-white/10 rounded-lg overflow-hidden">
          {["all", "Spot"].map((t) => (
            <div
              key={t}
              onClick={() => setsmarket(t)}
              className={`px-3 py-1.5 cursor-pointer ${
                smarket === t
                  ? "text-white border-b-2 border-[#00c278]"
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
            smarket === "fav" ? "text-[#4c94ff]" : "text-gray-500"
          }`}
        >
          <Star fill={smarket === "fav" ? "#4c94ff" : ""} />
        </div>
      </div>

      <div className="flex justify-between w-full py-2 text-[10px] tracking-widest uppercase text-gray-500 border-b border-white/10 px-2">
        <div className="w-[40%]">Market</div>
        <div className="w-[30%] text-right">Price</div>
        <div className="w-[30%] text-right">Change</div>
      </div>

      <div
        onClick={() => callback(false)}
        className="max-h-80 overflow-y-scroll"
      >
        <Mapped data={mdata} smarket={smarket} />
      </div>
    </div>
  );
}
function Mapped({ data, smarket }: any) {
  const router = useRouter();
  const path = usePathname();

  const filtered = smarket === "fav" ? data.filter((a: any) => a.fav) : data;

  return (
    <div className="h-full">
      {filtered.map((a: any, b: any) => {
        const name = a.symbol.replace("_USDC", "");
        const route = a.symbol.replace("_USDC", "_USD");

        return (
          <div
            key={b}
            onClick={() => {
              const split = path.split("/");
              const ismarketthere = split[2] == "market";
              if (!ismarketthere) {
                router.push(`market/${route}`);
                return;
              }
              router.replace(route);
            }}
            className="h-11 flex items-center justify-between px-2 text-xs hover:bg-white/5 cursor-pointer tabular-nums"
          >
            <div className="flex items-center w-[40%] gap-2">
              <img
                className="h-5 w-5 rounded-full"
                src={`https://backpack.exchange/coins/${name.toLowerCase()}.png`}
              />
              <div>
                <div className="flex text-white">
                  {name}
                  <span className="text-gray-500">/USD</span>
                </div>
              </div>
            </div>

            <div className="w-[30%] text-right text-white">{a.lastPrice}</div>

            <div className="w-[30%] flex justify-end items-center gap-2">
              <div
                className={`${
                  a.priceChangePercent > 0 ? "text-[#00c278]" : "text-[#fd4b4e]"
                }`}
              >
                {(a.priceChangePercent * 100).toFixed(2)}%
              </div>

              <div>
                {a.fav ? <Star fill={"#4c94ff"} /> : <Star fill={""} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Dropdown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}
export function Search() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}
export function Slash() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 20.247 6-16.5" />
    </svg>
  );
}
export function Star({ fill }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={`${fill}`}
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke={fill ? `${fill}` : "#969FAF"}
      className="size-4.5 "
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}
