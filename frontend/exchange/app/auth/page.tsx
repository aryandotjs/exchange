"use client";
import { useState } from "react";
import { handleAuth } from "../utils/httpinitials";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setmode] = useState<"signin" | "signup">("signin");
  const [show, setshow] = useState(false);
  const [data, setdata] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [status, setstatus] = useState("");
  const router = useRouter();
  return (
    <div>
      <div className="min-h-screen w-full bg-[#0f1014] flex items-center justify-center">
        <div className="w-full max-w-[380px] px-4">
          <div className="text-center mb-8">
            <div className="text-white font-bold text-xl tracking-tight mb-1">
              Exchange
            </div>
            <div className="text-[#969FAF] text-xs">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </div>
          </div>

          <div className="bg-[#14151b] rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {mode === "signup" && (
                <div>
                  <div className="text-[10px] tracking-widest uppercase text-[#969FAF] mb-1.5">
                    Username
                  </div>
                  <input
                    onChange={(a) => {
                      setdata((prev) => {
                        return {
                          ...prev,
                          username: a.target.value,
                        };
                      });
                    }}
                    type="text"
                    placeholder="aryan"
                    className="w-full h-11 px-4 bg-[#202127] border border-white/5 focus:border-white/20 outline-none rounded-xl text-sm text-white placeholder:text-[#2a2f3a] font-mono transition-colors"
                  />
                </div>
              )}

              <div>
                <div className="text-[10px] tracking-widest uppercase text-[#969FAF] mb-1.5">
                  Email
                </div>
                <input
                  onChange={(a) => {
                    setdata((prev) => {
                      return {
                        ...prev,
                        email: a.target.value,
                      };
                    });
                  }}
                  type="email"
                  placeholder="aryan@gmail.com"
                  className="w-full h-11 px-4 bg-[#202127] border border-white/5 focus:border-white/20 outline-none rounded-xl text-sm text-white placeholder:text-[#2a2f3a] font-mono transition-colors"
                />
              </div>

              <div>
                <div className="text-[10px] tracking-widest uppercase text-[#969FAF] mb-1.5">
                  Password
                </div>
                <div className="relative">
                  <input
                    onChange={(a) => {
                      setdata((prev) => {
                        return {
                          ...prev,
                          password: a.target.value,
                        };
                      });
                    }}
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 pr-11 bg-[#202127] border border-white/5 focus:border-white/20 outline-none rounded-xl text-sm text-white placeholder:text-[#2a2f3a] font-mono transition-colors"
                  />
                  <button
                    onClick={() => setshow(!show)}
                    className="absolute right-3 top-3 text-[#969FAF] hover:text-white transition-colors cursor-pointer"
                  >
                    {show ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!loading) {
                  handleAuth(data, mode).then((a: any) => {
                    setLoading(false);
                    setstatus(a?.msg);
                    if (
                      a.msg == "logged in sucessfully" ||
                      a.msg == "user created sucessfully"
                    ) {
                      router.push(`/trade/market/BTC_USD`);
                    }
                  });

                  setLoading(true);
                }
              }}
              className="w-full h-11 rounded-xl font-semibold text-sm tracking-wide bg-white text-black hover:bg-[#f1f5f9] transition-colors cursor-pointer mt-1"
            >
              {loading ? (
                <Spinner className="h-4 w-4" />
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center text-xs text-[#969FAF]">
              {mode === "signin" ? "No account? " : "Have an account? "}
              <span
                onClick={() => {
                  setmode(mode === "signin" ? "signup" : "signin");
                }}
                className="text-white cursor-pointer underline  underline-offset-4 hover:text-[#969FAF] transition-colors"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </span>
            </div>
          </div>
          <div className="  text-[10px] flex mt-5 justify-center tracking-widest uppercase text-[#969FAF]">
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}

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
