"use client";
import { useEffect, useRef, useState } from "react";
import { getDepth, getDepthFromEngine, getTicker } from "../utils/httpinitials";
import { signalingManager } from "../utils/signalingmanager";
import { Ask } from "./ask";
import { Bid } from "./bid";
import { Trades } from "./trades";
import { myMarkets } from "../utils/coinname";
import { signalingManager2 } from "../utils/signalingmanager2";

export function OrderBook({ market }: { market: string }) {
  const [bid, setbid] = useState<any[]>([]);
  const [ask, setask] = useState<any[]>([]);
  const [booktype, setbooktype] = useState<any | null>("Book");
  const [bookscroll, setbookscroll] = useState<any | null>("mid");
  const scrollref = useRef<HTMLDivElement>(null);
  const bidref = useRef<any[]>([]);
  const Askref = useRef<any[]>([]);
  const [price, setprice] = useState();
  if (!myMarkets.includes(market.split("_")[0])) {
    useEffect(() => {
      getDepth(market).then((data: any) => {
        setask(data.asks);
        setbid(data.bids);
        Askref.current = data.asks;
        bidref.current = data.bids;
      });
      getTicker(market).then((d: any) => {
        setprice(d.lastPrice);
      });

      signalingManager.getInstance().regesterCallback(
        "depth",
        (cask: any, cbids: any) => {
          if (cask) {
            const copy = [...(Askref.current || [])];

            let found = 1;

            for (let i = 0; i < copy.length; i++) {
              if (Number(copy[i][0]) == Number(cask[0])) {
                if (Number(cask[1]) === 0) {
                  copy.splice(i, 1);
                  found = 0;
                  break;
                }
                copy[i][1] = cask[1];
                found = 0;
                break;
              }
            }

            if (found && !(Number(cask[1]) == 0)) {
              copy.push(cask);
            }
            copy.sort((a, b) => Number(a[0]) - Number(b[0]));

            Askref.current = copy;
          }
          if (cbids) {
            const copy2 = [...(bidref.current || [])];

            let found2 = 1;

            for (let i = 0; i < copy2.length; i++) {
              if (Number(copy2[i][0]) == Number(cbids[0])) {
                if (Number(cbids[1]) === 0) {
                  copy2.splice(i, 1);
                  found2 = 0;
                  break;
                }
                copy2[i][1] = cbids[1];
                found2 = 0;
                break;
              }
            }

            if (found2 && !(Number(cbids[1]) == 0)) {
              copy2.push(cbids);
            }
            copy2.sort((a, b) => Number(a[0]) - Number(b[0]));

            bidref.current = copy2;
          }
        },
        market,
      );
      signalingManager
        .getInstance()
        .sendmessages({ method: "SUBSCRIBE", params: [`depth.${market}`] });

      return () => {
        signalingManager.getInstance().deRegesterCallback("depth", market);
        signalingManager
          .getInstance()
          .sendmessages({ method: "UNSUBSCRIBE", params: [`depth.${market}`] });
      };
    }, [market]);

    useEffect(() => {
      const interval = setInterval(() => {
        const top20bids = bidref.current.slice(-20);
        const top20ask = [...Askref.current].slice(0, 20);
        setask(top20ask);
        setbid(top20bids);
      }, 300);

      return () => {
        clearInterval(interval);
      };
    }, [market]);
  }

  if (myMarkets.includes(market.split("_")[0])) {
    const newMarket = market.replace("_USDC", "_USD");
    useEffect(() => {
      getDepthFromEngine(newMarket).then((data) => {
        setask(data.asks);
        setbid(data.bids);
        Askref.current = data.asks;
        bidref.current = data.bids;
      });
      getTicker(market).then((d: any) => {
        setprice(d.lastPrice);
      });

      signalingManager2.getInstance().regesterCallback(
        "depth",
        (cask: any, cbids: any) => {
          if (cask) {
            const copy = [...(Askref.current || [])];

            let found = 1;

            for (let i = 0; i < copy.length; i++) {
              if (Number(copy[i][0]) == Number(cask[0])) {
                if (Number(cask[1]) === 0) {
                  copy.splice(i, 1);
                  found = 0;
                  break;
                }
                copy[i][1] = cask[1];
                found = 0;
                break;
              }
            }

            if (found && !(Number(cask[1]) == 0)) {
              copy.push(cask);
            }
            copy.sort((a, b) => Number(a[0]) - Number(b[0]));

            Askref.current = copy;
          }
          if (cbids) {
            const copy2 = [...(bidref.current || [])];

            let found2 = 1;

            for (let i = 0; i < copy2.length; i++) {
              if (Number(copy2[i][0]) == Number(cbids[0])) {
                if (Number(cbids[1]) === 0) {
                  copy2.splice(i, 1);
                  found2 = 0;
                  break;
                }
                copy2[i][1] = cbids[1];
                found2 = 0;
                break;
              }
            }

            if (found2 && !(Number(cbids[1]) == 0)) {
              copy2.push(cbids);
            }
            copy2.sort((a, b) => Number(a[0]) - Number(b[0]));

            bidref.current = copy2;
          }
        },
        newMarket,
      );
      signalingManager2
        .getInstance()
        .sendmessages({ type: "SUBSCRIBE", params: [`depth@${newMarket}`] });

      return () => {
        signalingManager2.getInstance().deRegesterCallback("depth", newMarket);
        signalingManager2.getInstance().sendmessages({
          type: "UNSUBSCRIBE",
          params: [`depth@${newMarket}`],
        });
      };
    }, [market]);

    useEffect(() => {
      const interval = setInterval(() => {
        const top20bids = bidref.current.slice(-20);
        const top20ask = [...Askref.current].slice(0, 20);
        setask(top20ask);
        setbid(top20bids);
      }, 300);

      return () => {
        clearInterval(interval);
      };
    }, [market]);
  }

  function scrollup() {
    if (scrollref.current) {
      scrollref.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function scrollmid() {
    if (scrollref.current) {
      scrollref.current.scrollTo({ top: 300, behavior: "smooth" });
    }
  }
  function scrolldown() {
    if (scrollref.current) {
      scrollref.current.scrollTo({ top: 600, behavior: "smooth" });
    }
  }

  return (
    <div className="w-full bg-[#14151b]   h-137 border border-white/5 cursor-pointer z-1">
      <div>
        <div className="flex text-[11px] gap-2 py-3 px-3 tracking-wide border-b border-white/5">
          <div
            onClick={() => {
              setbooktype("Book");
            }}
            className={`px-3 py-1 cursor-pointer ${
              booktype == "Book"
                ? "text-white border-b border-white"
                : "text-[#6f7685]"
            }`}
          >
            BOOK
          </div>
          <div
            onClick={() => {
              setbooktype("Trades");
            }}
            className={`px-3 py-1 cursor-pointer ${
              booktype == "Trades"
                ? "text-white border-b border-white"
                : "text-[#6f7685]"
            }`}
          >
            TRADES
          </div>
        </div>

        {booktype == "Book" ? (
          <div>
            <div className="flex gap-1 px-3 pt-3 ">
              <div
                onClick={() => {
                  setbookscroll("mid");
                  scrollup();
                }}
                className={`p-1 border ${
                  bookscroll == "mid"
                    ? "border-white/20"
                    : "border-transparent hover:border-white/10"
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="8" height="2" fill="#6f7685"></rect>
                  <rect x="3" y="11" width="8" height="2" fill="#6f7685"></rect>
                  <rect x="3" y="7" width="8" height="2" fill="#6f7685"></rect>
                  <rect x="3" y="15" width="8" height="2" fill="#6f7685"></rect>
                  <rect x="3" y="19" width="8" height="2" fill="#6f7685"></rect>
                  <rect x="13" y="3" width="8" height="2" fill="#fd4b4e"></rect>
                  <rect
                    x="13"
                    y="11"
                    width="8"
                    height="2"
                    fill="#fd4b4e"
                  ></rect>
                  <rect x="13" y="7" width="8" height="2" fill="#fd4b4e"></rect>
                  <rect
                    x="13"
                    y="15"
                    width="8"
                    height="2"
                    fill="#fd4b4e"
                  ></rect>
                  <rect
                    x="13"
                    y="19"
                    width="8"
                    height="2"
                    fill="#fd4b4e"
                  ></rect>
                </svg>
              </div>
              <div
                onClick={() => {
                  setbookscroll("down");
                  scrollmid();
                }}
                className={`p-1 border ${
                  bookscroll == "down"
                    ? "border-white/20"
                    : "border-transparent hover:border-white/10"
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="8" height="2" fill="#00c278"></rect>
                  <rect x="3" y="11" width="8" height="2" fill="#00c278"></rect>
                  <rect x="3" y="7" width="8" height="2" fill="#00c278"></rect>
                  <rect x="3" y="15" width="8" height="2" fill="#00c278"></rect>
                  <rect x="3" y="19" width="8" height="2" fill="#00c278"></rect>
                  <rect x="13" y="3" width="8" height="2" fill="#fd4b4e"></rect>
                  <rect
                    x="13"
                    y="11"
                    width="8"
                    height="2"
                    fill="#fd4b4e"
                  ></rect>
                  <rect x="13" y="7" width="8" height="2" fill="#fd4b4e"></rect>
                  <rect
                    x="13"
                    y="15"
                    width="8"
                    height="2"
                    fill="#fd4b4e"
                  ></rect>
                  <rect
                    x="13"
                    y="19"
                    width="8"
                    height="2"
                    fill="#fd4b4e"
                  ></rect>
                </svg>
              </div>
              <div
                onClick={() => {
                  setbookscroll("up");
                  scrollmid();
                  scrolldown();
                }}
                className={`p-1 border ${
                  bookscroll == "up"
                    ? "border-white/20"
                    : "border-transparent hover:border-white/10"
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="8" height="2" fill="#00c278"></rect>
                  <rect x="3" y="11" width="8" height="2" fill="#00c278"></rect>
                  <rect x="3" y="7" width="8" height="2" fill="#00c278"></rect>
                  <rect x="3" y="15" width="8" height="2" fill="#00c278"></rect>
                  <rect x="3" y="19" width="8" height="2" fill="#00c278"></rect>
                  <rect x="13" y="3" width="8" height="2" fill="#6f7685"></rect>
                  <rect
                    x="13"
                    y="11"
                    width="8"
                    height="2"
                    fill="#6f7685"
                  ></rect>
                  <rect x="13" y="7" width="8" height="2" fill="#6f7685"></rect>
                  <rect
                    x="13"
                    y="15"
                    width="8"
                    height="2"
                    fill="#6f7685"
                  ></rect>
                  <rect
                    x="13"
                    y="19"
                    width="8"
                    height="2"
                    fill="#6f7685"
                  ></rect>
                </svg>
              </div>
            </div>

            <div className="flex text-[10px] justify-between px-3 py-1.5 tracking-wide uppercase">
              <div className="flex w-[65%] justify-between">
                <p className="text-[#6f7685]">Price (USD)</p>
                <p className="text-[#6f7685]">Size ({market.slice(0, 3)})</p>
              </div>
              <p className="text-[#6f7685]">Total ({market.slice(0, 3)})</p>
            </div>

            <div
              ref={scrollref}
              className="h-107 overflow-scroll flex
               flex-row justify-center [scrollbar-width:none]"
            >
              <div className="w-[97%]">
                <Ask data={ask}></Ask>
                <div className="sticky top-0 z-15 bg-[#14151b]  pl-3 flex my-1 justify-between items-center ">
                  <div
                    onClick={scrollmid}
                    className="text-[10px] text-[#4c94ff] tracking-wide uppercase cursor-pointer"
                  >
                    {scrollref.current?.scrollTop == 300 ? (
                      <div></div>
                    ) : (
                      <div>RE-CENTER</div>
                    )}
                  </div>
                </div>
                <Bid data={bid}></Bid>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <Trades market={market}></Trades>
          </div>
        )}
      </div>
    </div>
  );
}
