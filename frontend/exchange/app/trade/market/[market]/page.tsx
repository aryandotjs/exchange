"use client";
import { useParams } from "next/navigation";
import { OrderBook } from "@/app/comp/orderbook";
import { Chart } from "@/app/comp/chart";
import { useRef, useState } from "react";
import { MarketSearch } from "@/app/comp/searchbarinticker";
import { AccountPanel } from "@/app/comp/accountPanel";
import Swapui, { DemoToast } from "@/app/comp/swapui";
import { TickerBar } from "@/app/comp/marketbar";
export type Toast = {
  msg: string;
  type: "success" | "error";
  id: number;
};
export default function Trade() {
  const tickerscrollref = useRef<HTMLDivElement>(null);
  const idivref = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const { market } = useParams();
  const finalmarket = market + "C";

  return (
    <div className="flex gap-1 w-full text-white font-mono">
      <DemoToast toast={toast}></DemoToast>
      <div className=" min-w-[337px] max-w-[345px] h-149 overflow-y-scroll ">
        <div className="relative">
          <Swapui callback={setToast} marketname={market}></Swapui>
        </div>
      </div>
      <div className="w-[76.5%] h-149 overflow-y-scroll pr-1  border-white/5">
        <div className="relative  border-white/5  py-1 ">
          <TickerBar market={finalmarket as string}></TickerBar>
        </div>

        <div ref={idivref} className="flex w-full gap-2">
          <div className="min-w-[270px] max-w-[304px] grow border border-white/5 bg-[#14151b] rounded-xl overflow-hidden">
            <OrderBook market={finalmarket as string}></OrderBook>
          </div>
          <div className="max-w-207.5 min-w-0 grow bg-[#14151b] border border-white/5 rounded-xl overflow-hidden">
            <div className="w-full min-w-0 overflow-hidden" dir="rtl">
              <Chart market={finalmarket as string}></Chart>
            </div>
          </div>
        </div>

        <div className="w-full  bg-[#14151b] border border-white/5 rounded-xl mt-2 p-2 flex justify-center items-center">
          <AccountPanel callback={setToast} toast={toast}></AccountPanel>
        </div>
      </div>
    </div>
  );
}
