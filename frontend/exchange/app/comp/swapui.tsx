"use client";
import { useEffect, useState } from "react";
import { addOrder, getTicker } from "../utils/httpinitials";
import { useRouter } from "next/navigation";
import { signalingManager } from "../utils/signalingmanager";
import { Ticker } from "../utils/types";
import { Toast } from "../trade/market/[market]/page";

export default function Swapui({
  marketname,
  callback,
}: {
  marketname: any;
  callback: any;
}) {
  const [buysell, setbuysell] = useState("buy");
  const [market, setmarket] = useState("limit");
  const [quantity, setquantity] = useState<any>(null);
  const [ordervalue, setordervalue] = useState<any>("");
  const [price, setPrice] = useState<string | null>(null);
  const [marketprice, setmarketprice] = useState<any>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const logomn = marketname.replace("_USD", "").toLowerCase("");
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    getTicker(marketname + "C").then((data) => {
      setPrice(data.lastPrice);
    });
  }, []);
  return (
    <div className="w-full rounded-xl bg-[#14151b] p-4 border border-white/5 mt-1  isolate">
      <div className="flex cursor-pointer bg-[#202127] rounded-xl my-1 font-medium border border-white/5">
        <BuyButton buysell={buysell} setbuysell={setbuysell} />
        <SellButton buysell={buysell} setbuysell={setbuysell} />
      </div>

      <div className="flex my-6  gap-0.5 border-b border-[#ffffff08]">
        {["limit"].map((tab) => (
          <div
            key={tab}
            onClick={() => setmarket(tab)}
            className={`relative px-3 py-2 text-xs font-medium cursor-pointer tracking-wide transition-colors duration-150
              ${
                market === tab
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#3b82f6] after:rounded-full"
                  : "text-[#475569] hover:text-[#94a3b8]"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {/* <div className="flex justify-between text-xs text-[#969FAF]">
        <div className="underline decoration-dotted underline-offset-4 hover:text-white cursor-pointer">
          Balance
        </div>
        <div>--</div>
      </div> */}

      <div>
        <div className="text-xs mt-3 mb-3 text-[#969FAF] tracking-wide uppercase">
          Price
        </div>
        <div className="relative w-full bg-[#202127] rounded-lg border border-white/5 focus-within:border-white/20">
          <input
            type="number"
            onChange={(a) => setPrice(a.target.value.toString())}
            value={price?.toString() ?? ""}
            className="[&::-webkit-inner-spin-button]:hidden h-12 rounded-lg w-full px-3 text-2xl bg-transparent outline-none font-mono text-white"
          />
          <div className="absolute right-3 top-3">
            <img
              className="rounded-full h-6 w-6 opacity-80"
              src="https://backpack.exchange/coins/usd.svg"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs mt-3 mb-3 text-[#969FAF] tracking-wide uppercase">
          Quantity
        </div>
        <div className="relative w-full bg-[#202127] rounded-lg border border-white/5 focus-within:border-white/20">
          <input
            onChange={(a) => {
              setquantity(a.target.value);
              setordervalue(
                (Number(a.target.value) * Number(price)).toFixed(2),
              );
            }}
            value={quantity ?? " "}
            type="number"
            placeholder="0"
            className="[&::-webkit-inner-spin-button]:hidden h-12 rounded-lg w-full px-3 text-2xl bg-transparent outline-none font-mono text-white placeholder:text-[#2a2f3a]"
          />
          <div className="absolute right-3 top-3">
            <img
              className="rounded-full h-6 w-6"
              src={`https://backpack.exchange/coins/${logomn}.png`}
            />
          </div>
        </div>
      </div>

      <div className="w-full mt-5 mb-2 rounded-full relative cursor-grab">
        <div className="w-full bg-white/10 h-1 rounded-full absolute top-1.5"></div>
        <div className="relative">
          <div className="flex justify-between items-center">
            <div className="rounded-full h-4 w-4 bg-[#4c94ff] shadow-[0_0_8px_#4c94ff66]"></div>
            <div className="rounded-full h-2.5 w-2.5 border border-white/20 bg-[#14151b]"></div>
            <div className="rounded-full h-2.5 w-2.5 border border-white/20 bg-[#14151b]"></div>
            <div className="rounded-full h-2.5 w-2.5 border border-white/20 bg-[#14151b]"></div>
            <div className="rounded-full h-2.5 w-2.5 border border-white/20 bg-[#14151b]"></div>
          </div>
        </div>
      </div>

      <div className="text-xs text-[#969FAF] flex justify-between mt-1 mb-1">
        <div>0%</div>
        <div>100%</div>
      </div>

      <div>
        <div className="text-xs mt-4 mb-2 text-[#969FAF] tracking-wide uppercase">
          Order Value
        </div>
        <div className="relative w-full bg-[#202127] rounded-lg border border-white/5 focus-within:border-white/20">
          <input
            onChange={(a) => {
              setordervalue(a.target.value);
            }}
            value={ordervalue}
            type="number"
            placeholder="0"
            className="[&::-webkit-inner-spin-button]:hidden h-12 rounded-lg w-full px-3 text-2xl bg-transparent outline-none font-mono text-white placeholder:text-[#2a2f3a]"
          />
          <div className="absolute right-3 top-3">
            <img
              className="rounded-full h-6 w-6 opacity-80"
              src="https://backpack.exchange/coins/usd.svg"
            />
          </div>
        </div>
      </div>

      <div className="cursor-pointer mt-6 mb-5">
        <div
          onClick={() => {
            if (!isLoggedIn) {
              router.push("/auth");
              return;
            }
            let finalprice;
            let finalquantity;

            finalprice = price ?? "";
            finalquantity = quantity;

            const a = price?.indexOf(".") ?? -1;
            const b = quantity?.indexOf(".") ?? -1;

            if (a > 0) {
              finalprice = price?.slice(0, a + 4) ?? " ";
            }
            if (b > 0) {
              finalquantity = quantity?.slice(0, b + 4) ?? " ";
            }
            addOrder(marketname, finalprice, finalquantity, buysell).then(
              (a) => {
                callback({
                  msg: a.error ?? a.msg ?? "",
                  type: a.error ? "error" : "success",
                  id: Date.now(),
                });
              },
            );
          }}
          className={`h-15 items-center flex justify-center rounded-xl font-semibold text-sm tracking-wide transition-all duration-150
            ${
              buysell == "buy"
                ? "text-[#00c278] bg-[#00c2781a] border border-[#00c27833] hover:bg-[#00c27826]"
                : "text-[#fd4b4e] bg-[#fd4b4e1a] border border-[#fd4b4e33] hover:bg-[#fd4b4e26]"
            }`}
        >
          {!isLoggedIn
            ? "signin / signup"
            : buysell === "buy"
              ? "Place Buy Order"
              : "Place Sell Order"}
        </div>
      </div>

      {/* <div className="flex gap-5">
        <div className="text-xs flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-[#4c94ff] cursor-pointer"
          />
          <div className="underline decoration-dotted underline-offset-4 text-[#969FAF] group-hover:text-white transition-colors">
            Post Only
          </div>
        </div>
        <div className="text-xs flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-[#4c94ff] cursor-pointer"
          />
          <div className="underline decoration-dotted underline-offset-4 text-[#969FAF] group-hover:text-white transition-colors">
            IOC
          </div>
        </div>
      </div> */}
    </div>
  );
}

function BuyButton({ buysell, setbuysell }: any) {
  return (
    <div
      onClick={() => setbuysell("buy")}
      className={`flex justify-center items-center text-sm w-full rounded-xl py-3.5 font-semibold transition-all duration-150 cursor-pointer
        ${
          buysell == "buy"
            ? "text-[#00c278] bg-[#00c2781a] border border-[#00c27833]"
            : "text-[#969FAF] hover:text-white"
        }`}
    >
      Buy
    </div>
  );
}

function SellButton({ buysell, setbuysell }: any) {
  return (
    <div
      onClick={() => setbuysell("sell")}
      className={`flex justify-center items-center text-sm w-full rounded-xl py-3.5 font-semibold transition-all duration-150 cursor-pointer
        ${
          buysell == "sell"
            ? "text-[#fd4b4e] bg-[#fd4b4e1a] border border-[#fd4b4e33]"
            : "text-[#969FAF] hover:text-white"
        }`}
    >
      Sell
    </div>
  );
}

export function DemoToast({ toast }: { toast: Toast | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!toast) return;

    setShow(true);
    const timer = setTimeout(() => setShow(false), 2500);

    return () => clearTimeout(timer);
  }, [toast?.id]);

  if (!toast || !show) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999]">
      <div className="w-72 bg-[#14151b] border border-white/5 rounded-xl p-3 shadow-xl animate-[fadeIn_0.2s_ease]">
        <div className="flex items-start gap-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${
              toast.type === "error" ? "bg-[#2a1a1a]" : "bg-[#1a2a22]"
            }`}
          >
            <span className="text-sm">
              {toast.type === "error" ? "⚠️" : "✔️"}
            </span>
          </div>

          <div className="flex-1 leading-tight">
            <div className="text-white text-sm font-medium">
              {toast.type === "error" ? "Error" : "Success"}
            </div>

            <div className="text-[#8b90a0] text-xs mt-0.5">{toast.msg}</div>
          </div>
        </div>

        <div
          className={`h-[2px] mt-3 rounded-full ${
            toast.type === "error" ? "bg-red-500/60" : "bg-emerald-500/60"
          }`}
        />
      </div>
    </div>
  );
}
