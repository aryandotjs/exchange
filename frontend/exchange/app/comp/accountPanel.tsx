import { useEffect, useState } from "react";
import {
  cancleOrder,
  getMultipleTickers,
  getTicker,
  getUserBalance,
  getUserOpenOrders,
  orderHistory,
  tradeHistory,
} from "../utils/httpinitials";
import { useRouter } from "next/navigation";
import { promises } from "dns";
import { Toast } from "../trade/market/[market]/page";

export const selectedMarkets = [
  { name: "US dollar", sign: "usd" },
  { name: "Solana", sign: "sol" },
  { name: "Bitcoin", sign: "btc" },
  { name: "Ethereum", sign: "eth" },
  { name: "USDT", sign: "usdt" },
];
export function AccountPanel({
  callback,
  toast,
}: {
  callback: any;
  toast: Toast;
}) {
  const [selected, setselected] = useState("Balances");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);
  if (!isLoggedIn) {
    return (
      <div className="min-h-140 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-sm font-medium mb-1">
            Not signed in
          </div>

          <div className="text-[#8b90a0] text-xs">
            View your balance, orders and history —{" "}
            <span
              onClick={() => router.push("/auth")}
              className="text-[#3b82f6] cursor-pointer hover:underline"
            >
              sign in
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className=" min-h-140  w-full">
      <div className="flex my-4 gap-0.5 ml-2 border-b border-[#ffffff08] pb-0">
        {["Balances", "OpenOrders", "FillHistory", "OrderHistory"].map(
          (tab) => {
            const labels: Record<string, string> = {
              Balances: "Balances",
              OpenOrders: "Open Orders",
              FillHistory: "Fill History",
              OrderHistory: "Order History",
            };
            return (
              <div
                key={tab}
                onClick={() => setselected(tab)}
                className={`relative px-3 py-2.5 text-xs font-medium cursor-pointer tracking-wide transition-colors duration-150
          ${
            selected === tab
              ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0  after:bg-[#3b82f6] after:rounded-full"
              : "text-[#475569] hover:text-[#94a3b8]"
          }`}
              >
                {labels[tab]}
              </div>
            );
          },
        )}
      </div>

      {selected == "Balances" ? (
        <Balances toast={toast}></Balances>
      ) : selected == "OpenOrders" ? (
        <OpenOrders toast={toast} callback={callback}></OpenOrders>
      ) : selected == "FillHistory" ? (
        <FillHistory toast={toast}></FillHistory>
      ) : selected == "OrderHistory" ? (
        <OrderHistory toast={toast}></OrderHistory>
      ) : (
        ""
      )}
    </div>
  );
}

function Balances({ toast }: { toast: Toast }) {
  const [Balanceui, setBalancesui] = useState("0.00");
  const [balance, setbalance] = useState<any>({});
  const [prices, setprices] = useState<any>({});
  useEffect(() => {
    getUserBalance().then((a) => {
      setbalance(a.userbalance);
    });
    getMultipleTickers(["SOL_USDC", "BTC_USDC", "ETH_USDC", "USDT_USDC"]).then(
      (a) => {
        setprices(a);
      },
    );
    setBalancesui("1");
  }, [toast]);
  if (!balance || Object.keys(balance).length === 0) {
    return (
      <div className="flex items-center justify-center mt-40 text-[#475569] text-xs tracking-widest uppercase animate-pulse">
        Loading balances...
      </div>
    );
  }
  let sum = 0;
  if (balance && prices) {
    selectedMarkets.forEach((a) => {
      let asset = a.sign.toUpperCase();
      let assetwithUSDC = a.sign.toUpperCase() + "_USDC";
      const bal = balance?.[asset];
      const price = prices?.[assetwithUSDC] ?? 1;
      const totalBalance =
        Number(bal?.available ?? 0) + Number(bal?.locked ?? 0);
      sum += totalBalance * price;
    });
  }
  return (
    <div className="w-full">
      <div className="ml-4 py-5 border-b border-[#ffffff08]">
        <div className="text-[10px] tracking-widest uppercase text-[#475569] mb-1">
          Your Balance
        </div>
        <div className="text-2xl font-light text-white tracking-tight">
          ${(sum / 1000).toLocaleString()}
          <span className="text-sm text-[#475569] ml-1">USD</span>
        </div>
      </div>

      <div className="flex cursor-pointer w-full text-[10px] select-none text-[#475569] tracking-widest uppercase pt-4 pb-2 px-4 border-b border-[#ffffff08]">
        <div className={`flex gap-1 w-[6.6%] mr-25 ml-0`}>Asset</div>
        <div className={`flex gap-1 justify-end w-[16%]`}>Total Balance</div>
        <div className={`flex gap-1 justify-end w-[16%]`}>
          Available Balance
        </div>
        {/* <div className={`flex gap-1 justify-end w-[15%]`}>Open Orders</div> */}
      </div>

      {selectedMarkets.map((a, b) => {
        let assetbalance;
        if (balance) {
          let assetsign = a.sign.toUpperCase();
          let finalsign = assetsign + "_USDC";
          assetbalance = balance[assetsign];
        }
        let assetsign = a.sign.toUpperCase();
        let finalsign = assetsign + "_USDC";
        return (
          <div
            key={b}
            className="flex w-full border-b border-[#ffffff07] h-16 items-center px-4 hover:bg-[#ffffff05] transition-colors duration-150 group"
          >
            <div className="w-[62%] flex items-center">
              <div className="flex cursor-pointer gap-3 items-center text-xs select-none w-[25%]">
                <img
                  className="h-8 w-8 rounded-full ml-2 ring-1 ring-[#ffffff10]"
                  src={`https://backpack.exchange/coins/${a.sign}.png`}
                />
                <div>
                  <div className="text-[#e2e8f0] text-sm font-medium text-left leading-tight">
                    {a.name}
                  </div>
                  <div className="text-[#475569] text-[10px] font-medium text-left tracking-wider mt-0.5">
                    {a.sign.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="w-[25%]">
                <div className="flex justify-end text-sm font-mono text-[#cbd5e1]">
                  {balance
                    ? (
                        (assetbalance.available + assetbalance.locked) /
                        1000
                      ).toFixed(3)
                    : "0"}
                </div>
                <div className="flex justify-end text-[12px] text-[#00c278] mt-0.5">
                  $
                  {Number(
                    (
                      ((assetbalance.available + assetbalance.locked) / 1000) *
                      (prices?.[finalsign] ?? 1)
                    ).toFixed(2),
                  ).toLocaleString()}
                </div>
              </div>

              <div className="w-[25%]">
                <div className="flex justify-end text-sm font-mono text-[#cbd5e1]">
                  {balance ? (assetbalance.available / 1000).toFixed(3) : "0"}
                </div>
                <div className="flex justify-end text-[12px] text-[#00c278]  mt-0.5">
                  $
                  {(
                    (assetbalance.available / 1000) *
                    (prices?.[finalsign] ?? 1)
                  )
                    .toFixed(3)
                    .toLocaleString()}
                </div>
              </div>

              {/* <div className="w-[25%] flex items-center justify-end">
                <div className="text-sm font-mono text-[#475569]">0</div>
              </div> */}
            </div>
            {/* <div className="w-[38%] flex justify-end pr-6">
              <div className="cursor-pointer px-4 py-1.5 text-[11px] font-semibold tracking-wider text-[#3b82f6] border border-[#3b82f620] rounded hover:bg-[#3b82f615] hover:border-[#3b82f650] transition-all duration-150">
                Deposit
              </div>
            </div> */}
          </div>
        );
      })}
    </div>
  );
}
function OpenOrders({ callback, toast }: { callback: any; toast: Toast }) {
  const [OpenOrders, setOpenOrders] = useState<any[]>([]);
  useEffect(() => {
    getUserOpenOrders().then((a) => {
      setOpenOrders(a.openOrders);
    });
  }, [toast]);
  if (!OpenOrders) {
    return (
      <div className="flex items-center justify-center mt-40 text-[#475569] text-xs tracking-widest uppercase ">
        no open orders
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-[#475569] border-b border-[#ffffff10]">
        <div className="w-[8%] flex justify-center">Filled</div>
        <div className="w-[18%]  flex justify-center">Market</div>
        <div className="w-[14%]  flex justify-center">Order ID</div>
        <div className="w-[10%]  flex justify-center">Price</div>
        <div className="w-[10%]  flex justify-center">Quantity</div>
        <div className="w-[10%]  flex justify-center">Side</div>
        <div className="w-[10%]  flex justify-center text-right"></div>
      </div>

      {OpenOrders.map((a, b) => {
        return (
          <div
            key={b}
            className="flex  justify-between items-center px-4 py-2.5 border-b border-[#ffffff07] hover:bg-[#ffffff06] transition-colors duration-150"
          >
            <div className="w-[8%] flex justify-center text-xs font-mono text-[#94a3b8]">
              {a.filled / 1000}
            </div>

            <div className="w-[18%]  flex justify-center items-center text-xs ">
              <div className="flex items-center -space-x-2">
                <img
                  className="h-5 w-5 rounded-full ring-1 ring-[#1a1f2e] z-10"
                  src={`https://backpack.exchange/coins/${a.market.split("_")[0].toLowerCase()}.png`}
                />
                <img
                  className="h-5 w-5 rounded-full ring-1 ring-[#1a1f2e] z-0"
                  src={`https://backpack.exchange/coins/usd.png`}
                />
              </div>
              <div className=" ml-3 font-medium text-[#e2e8f0] tracking-wide">
                {a.market}
              </div>
            </div>

            <div className="w-[14%]  flex justify-center text-[10px] font-mono text-[#475569] truncate">
              {a.orderId}
            </div>

            <div className="w-[10%]  flex justify-center text-xs font-mono text-[#cbd5e1]">
              {a.price / 1000}
            </div>

            <div className="w-[10%]  flex justify-center text-xs font-mono text-[#94a3b8]">
              {a.quantity / 1000}
            </div>

            <div
              className={`w-[10%]  flex justify-center text-xs font-bold tracking-wide
              ${a.side === "buy" ? "text-[#22c55e]" : "text-[#f43f5e]"}`}
            >
              {a.side?.toUpperCase()}
            </div>

            <div className="w-[10%]  flex justify-end">
              <button
                onClick={() => {
                  cancleOrder(a.orderId, a.userId, a.market).then((a) => {
                    callback({
                      msg: a.error ?? a.msg ?? "",
                      type: a.error ? "error" : "success",
                      id: Date.now(),
                    });
                  });
                }}
                className="px-3 py-1 text-[10px] w-20 font-semibold tracking-wider uppercase text-[#f43f5e] border border-[#f43f5e30] rounded hover:bg-[#f43f5e15] hover:border-[#f43f5e60] transition-all duration-150"
              >
                cancle
              </button>
            </div>
          </div>
        );
      })}

      {OpenOrders.length === 0 && (
        <div className="flex items-center justify-center mt-40 text-[#475569] text-xs tracking-widest uppercase">
          No open orders
        </div>
      )}
    </div>
  );
}

function FillHistory({ toast }: { toast: Toast }) {
  const [trades, settrades] = useState<any[]>();
  const [uid, setuid] = useState();
  useEffect(() => {
    tradeHistory().then((a) => {
      settrades(a.rows);
      setuid(a.userId);
    });
  }, [toast]);
  if (!trades) {
    return (
      <div className="flex items-center justify-center mt-40 text-[#475569] text-xs tracking-widest uppercase animate-pulse">
        Loading balances...
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-[#475569] border-b border-[#ffffff10]">
        <div className="w-[12.5%] pl-5">Market</div>
        <div className="w-[12.5%] flex justify-center">Type</div>
        <div className="w-[12.5%] flex justify-center">Side</div>
        <div className="w-[12.5%] flex justify-center">Maker/Taker</div>
        <div className="w-[12.5%] flex justify-center">price</div>
        <div className="w-[12.5%] flex justify-center">Quantity</div>
        <div className="w-[12.5%] flex justify-center">value</div>
        <div className="w-[12.5%] flex justify-end">Created</div>
      </div>
      {trades.map((a, b) => {
        let user;
        if (uid == a.makerid) {
          user = "Maker";
        }
        if (uid == a.takerid) {
          user = "Taker";
        }
        const sign = a.market.split("_")[0];
        let side = "Sell";
        if (user == "Maker" && a.isbuyermaker) {
          side = "Buy";
        }
        return (
          <div
            key={b}
            className="px-5 py-2.5 text-xs hover:bg-[#ffffff08] flex transition-colors duration-150 border-b border-[#ffffff07]"
          >
            <div className="w-[12.5%]">
              <div className="flex items-center text-xs ">
                <div className="flex items-center -space-x-2">
                  <img
                    className="h-5 w-5 rounded-full ring-1 ring-[#1a1f2e] z-10"
                    src={`https://backpack.exchange/coins/${sign.toLowerCase()}.png`}
                  />
                  <img
                    className="h-5 w-5 rounded-full ring-1 ring-[#1a1f2e] z-0"
                    src={`https://backpack.exchange/coins/usd.png`}
                  />
                </div>
                <div className=" ml-3 font-medium text-[#e2e8f0] tracking-wide">
                  {a.market}
                </div>
              </div>
            </div>
            <div className=" w-[12.5%] flex justify-center text-[#64748b]">
              {"limit"}
            </div>

            <div
              className={` w-[12.5%] flex justify-center  ${side == "Buy" ? "text-[#22c55e] " : "text-[#f43f5e]"}`}
            >
              {side}
            </div>
            <div className="w-[12.5%] flex justify-center ">
              <div
                className={`flex items-center  px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  user == "Maker"
                    ? "bg-[#3b82f615] text-[#3b82f6]"
                    : "bg-[#f59e0b15] text-[#f59e0b]"
                }`}
              >
                {user}
              </div>
            </div>

            <div className="text-[#cbd5e1] w-[12.5%] flex justify-center">
              {a.price}
            </div>
            <div className="text-[#cbd5e1] w-[12.5%] flex justify-center">
              {a.volume}
            </div>
            <div className="text-[#cbd5e1] w-[12.5%] flex justify-center">
              ${(a.price * a.volume).toFixed(4)}
            </div>

            <div className="text-[#475569] w-[12.5%] flex justify-end">
              {timeAgo(a.time)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderHistory({ toast }: { toast: Toast }) {
  const [orders, setorders] = useState<any[]>();

  useEffect(() => {
    orderHistory().then((a) => {
      setorders(a);
    });
  }, [toast]);

  if (!orders) {
    return (
      <div className="flex items-center justify-center mt-40 text-[#475569] text-xs tracking-widest uppercase animate-pulse">
        Loading history...
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center px-4 py-2 text-[10px] font-semibold tracking-widest uppercase text-[#475569] border-b border-[#ffffff10]">
        <div className="w-[15%] pl-5">Market</div>
        <div className="w-[12%] flex justify-center">Type</div>
        <div className="w-[12%] flex justify-center">Side</div>
        <div className="w-[12%] flex justify-center">Status</div>
        <div className="w-[12%] flex justify-center">TIF</div>
        <div className="w-[12%] flex justify-center">Filled/ Total</div>
        <div className="w-[12%] flex justify-center">price</div>
        <div className="w-[12%] flex justify-end">Created</div>
      </div>
      {orders.map((a, b) => {
        const sign = a.market.split("_")[0];

        return (
          <div
            key={b}
            className="px-5 py-2.5 hover:bg-[#ffffff08] transition-colors duration-150 border-b border-[#ffffff07]"
          >
            <div className="flex justify-between items-center text-xs">
              <div className="w-[15%]">
                <div className="flex items-center text-xs ">
                  <div className="flex items-center -space-x-2">
                    <img
                      className="h-5 w-5 rounded-full ring-1 ring-[#1a1f2e] z-10"
                      src={`https://backpack.exchange/coins/${sign.toLowerCase()}.png`}
                    />
                    <img
                      className="h-5 w-5 rounded-full ring-1 ring-[#1a1f2e] z-0"
                      src={`https://backpack.exchange/coins/usd.png`}
                    />
                  </div>
                  <div className=" ml-3 font-medium text-[#e2e8f0] tracking-wide">
                    {a.market}
                  </div>
                </div>
              </div>

              <div className="text-[#64748b] w-[12%] flex justify-center">
                {"limit"}
              </div>

              <div
                className={`w-[12%] flex justify-center font-semibold tracking-wide ${a.side === "buy" ? "text-[#22c55e]" : "text-[#f43f5e]"}`}
              >
                {a.side?.toUpperCase()}
              </div>

              <div className="w-[12%] flex justify-center">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase
                 ${
                   a.status === "FILLED"
                     ? "bg-[#22c55e15] text-[#22c55e]"
                     : a.status === "CANCELLED"
                       ? "bg-[#f43f5e15] text-[#f43f5e]"
                       : a.status === "OPEN"
                         ? "bg-[#3b82f615] text-[#3b82f6]"
                         : "bg-[#f59e0b15] text-[#f59e0b]"
                 }`}
                >
                  {a.status}
                </span>
              </div>

              <div className="text-[#475569] w-[12%] flex justify-center ">
                {"GTC"}
              </div>

              <div className="text-[#94a3b8] w-[12%] flex justify-center">
                <span className="text-[#e2e8f0] ">{a.filled / 1000}</span>
                <span className="text-[#475569]">/</span>
                <span>{a.quantity / 1000}</span>
              </div>

              <div className="text-[#cbd5e1] w-[12%] flex justify-center">
                {a.price / 1000}
              </div>

              <div className="text-[#475569] w-[12%] flex justify-end">
                {timeAgo(a.createat)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const timeAgo = (date: string) => {
  const dff = Date.now() - new Date(date).getTime();
  const min = Math.floor(dff / 60000);
  const hr = Math.floor(dff / 3600000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return new Date(date).toLocaleDateString();
};

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}
