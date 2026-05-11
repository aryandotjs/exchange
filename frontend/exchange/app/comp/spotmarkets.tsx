import { useRouter } from "next/navigation";
import { COINGECKO_IDS } from "../utils/coinname";

export function GetSpot({ markets, MarketCap, klinedata }: any) {
  const router = useRouter();

  return (
    <div>
      {markets.map((a: any, index: any) => {
        const newsymbol = a.symbol.replace("USDC", "USD");
        const name = a.symbol.replace("_USDC", "");
        let finalmc: any = "-";
        if (MarketCap) {
          if (!COINGECKO_IDS[name] && MarketCap[name.toLowerCase()]) {
            finalmc = formating(MarketCap[name.toLowerCase()].usd_market_cap);
          }

          if (COINGECKO_IDS[name]) {
            finalmc = formating(MarketCap[COINGECKO_IDS[name]]?.usd_market_cap);
          }
        }
        return (
          <div
            key={index}
            onClick={() => {
              router.push(`market/${newsymbol}`);
            }}
            className="flex justify-between w-full border-t border-[#202127] h-16 items-center text-sm font-medium hover:bg-[#202127]"
          >
            <div
              className="flex w-[16.6%]
                gap-2 cursor-pointer items-center px-1"
            >
              <img
                className="h-8 w-8 rounded-full"
                src={`https://backpack.exchange/coins/${name.toLowerCase()}.png`}
              ></img>
              <div className="">
                <div className="text-white text-left">
                  {COINGECKO_IDS[name] ? (
                    <div>
                      {COINGECKO_IDS[name].charAt(0).toUpperCase() +
                        COINGECKO_IDS[name].slice(1)}
                    </div>
                  ) : (
                    <div>{name.charAt(0) + name.slice(1).toLowerCase()}</div>
                  )}
                </div>
                <div className="text-[#969FAF] text-xs font-medium text-left">
                  {newsymbol}
                </div>
              </div>
            </div>
            <div className=" w-[16.6%] items-center text-right ">
              {a.lastPrice > 1 ? (
                <div>
                  {" "}
                  ${Number(Number(a.lastPrice).toFixed(2)).toLocaleString()}
                </div>
              ) : (
                <div>${a.lastPrice}</div>
              )}
            </div>
            <div className=" w-[16.6%] items-center text-right">
              {formating(a.quoteVolume)}
            </div>
            <div className=" w-[16.6%] items-center text-right">{finalmc}</div>
            {a.priceChangePercent > 0 ? (
              <div
                className={` w-[16.6%] items-center text-right ${
                  a.priceChangePercent > 0 ? "text-[#00c278]" : "text-[#fd4b4e]"
                }`}
              >
                +{(Number(a.priceChangePercent) * 100).toFixed(2)}%
              </div>
            ) : (
              <div
                className={` w-[16.6%] items-center text-right ${
                  a.priceChangePercent > 0 ? "text-[#00c278]" : "text-[#fd4b4e]"
                }`}
              >
                {(Number(a.priceChangePercent) * 100).toFixed(2)}%
              </div>
            )}
            <div className=" w-[16.6%] flex  justify-end pr-4">
              {klinedata ? (
                <Sparkline kl={klinedata[a.symbol]}></Sparkline>
              ) : (
                <svg width="100" height="26">
                  <path
                    d={`
            M 0 13
            C 8 13, 8 13, 16 13
            S 24 13, 32 13
            S 40 13, 48 13
            S 56 13, 64 13
            S 72 13, 80 13
            S 90 13, 100 13
          `}
                    fill="none"
                    stroke="#00c278"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function formating(a: any) {
  const number = Number(a);
  if (number == 0) {
    return "-";
  }
  if (number < 1000) {
    return "$" + number.toFixed(1);
  }
  if (number > 1000000000000) {
    return "$" + (number / 1000000000000).toFixed(1) + "T";
  }
  if (number > 1000000000) {
    return "$" + (number / 1000000000).toFixed(1) + "B";
  }
  if (number > 1000000) {
    return "$" + (number / 1000000).toFixed(1) + "M";
  }
  if (number > 1000) {
    return "$" + (number / 1000).toFixed(1) + "K";
  }
}
function Sparkline({ kl }: any) {
  if (!kl) {
    return (
      <svg width="100" height="26">
        <path
          d={`
            M 0 13
            C 8 13, 8 13, 16 13
            S 24 13, 32 13
            S 40 13, 48 13
            S 56 13, 64 13
            S 72 13, 80 13
            S 90 13, 100 13
          `}
          fill="none"
          className=""
          stroke="#00c278"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  const data = kl.map(Number);
  const width = 100;
  const height = 26;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const diff = max - min;
  const gap = width / (data.length - 1);
  const color = kl[0] < kl[kl.length - 1];

  const points = data.map((a: any, b: any) => {
    const w = b * gap;
    const perc = ((a - min) / diff) * 100;
    const h = (height * perc) / 100;
    return [w.toFixed(0), height - h];
  });
  if (points.length == 28) {
    return (
      <svg width="100" height="26">
        <path
          d={`
  M ${points[0][0]} ${points[0][1]}
  C ${points[0][0] + 5} ${points[0][1]}, ${points[1][0] - 5} ${points[1][1]}, ${
    points[1][0]
  } ${points[1][1]}
   S ${points[2][0] - 1} ${points[2][1]}, ${points[2][0]} ${points[2][1]}
   S ${points[3][0] - 1} ${points[3][1]}, ${points[3][0]} ${points[3][1]}
   S ${points[4][0] - 1} ${points[4][1]}, ${points[4][0]} ${points[4][1]}
   S ${points[5][0] - 1} ${points[5][1]}, ${points[5][0]} ${points[5][1]}
   S ${points[6][0] - 1} ${points[6][1]}, ${points[6][0]} ${points[6][1]}
   S ${points[7][0] - 1} ${points[7][1]}, ${points[7][0]} ${points[7][1]}
   S ${points[8][0] - 1} ${points[8][1]}, ${points[8][0]} ${points[8][1]}
   S ${points[9][0] - 1} ${points[9][1]}, ${points[9][0]} ${points[9][1]}
  S ${points[10][0] - 1} ${points[10][1]}, ${points[10][0]} ${points[10][1]}
  S ${points[11][0] - 1} ${points[11][1]}, ${points[11][0]} ${points[11][1]}  
  S ${points[12][0] - 1} ${points[12][1]}, ${points[12][0]} ${points[12][1]}
  S ${points[13][0] - 1} ${points[13][1]}, ${points[13][0]} ${points[13][1]}
  S ${points[14][0] - 1} ${points[14][1]}, ${points[14][0]} ${points[14][1]}
  S ${points[15][0] - 1} ${points[15][1]}, ${points[15][0]} ${points[15][1]}  
  S ${points[16][0] - 1} ${points[16][1]}, ${points[16][0]} ${points[16][1]}
  S ${points[17][0] - 1} ${points[17][1]}, ${points[17][0]} ${points[17][1]}
  S ${points[18][0] - 1} ${points[18][1]}, ${points[18][0]} ${points[18][1]}
  S ${points[19][0] - 1} ${points[19][1]}, ${points[19][0]} ${points[19][1]}  
  S ${points[20][0] - 1} ${points[20][1]}, ${points[20][0]} ${points[20][1]}
  S ${points[21][0] - 1} ${points[21][1]}, ${points[21][0]} ${points[21][1]}
  S ${points[22][0] - 1} ${points[22][1]}, ${points[22][0]} ${points[22][1]}
  S ${points[23][0] - 1} ${points[23][1]}, ${points[23][0]} ${points[23][1]}
  S ${points[24][0] - 1} ${points[24][1]}, ${points[24][0]} ${points[24][1]}
  S ${points[25][0] - 1} ${points[25][1]}, ${points[25][0]} ${points[25][1]}
  S ${points[26][0] - 1} ${points[26][1]}, ${points[26][0]} ${points[26][1]}
  S ${points[27][0] - 1} ${points[27][1]}, ${points[27][0]} ${points[27][1]}
  
`}
          fill="none"
          stroke={` ${color ? "#00c278" : "#fd4b4e"} `}
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg width="100" height="26">
      <path
        d={`
            M 0 13
            C 8 13, 8 13, 16 13
            S 24 13, 32 13
            S 40 13, 48 13
            S 56 13, 64 13
            S 72 13, 80 13
            S 90 13, 100 13
          `}
        fill="none"
        className=""
        stroke="#00c278"
        strokeWidth="1.6"
      />
    </svg>
  );
}
