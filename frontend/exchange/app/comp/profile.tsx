import { useEffect, useState } from "react";
import { getme } from "../utils/httpinitials";
import { useRouter } from "next/navigation";

export function Profile() {
  const [show, setshow] = useState(false);
  const [userDetail, setuserDetail] = useState<{
    username: string;
    email: string;
  } | null>(null);
  useEffect(() => {
    getme().then((a) => {
      if (a.msg == "token not valid") {
        localStorage.removeItem("token");
        window.location.reload();
      }
      setuserDetail(a);
    });
  }, []);
  if (userDetail) {
    return (
      <div className="relative">
        <div
          onClick={() => setshow(!show)}
          className="rounded-full h-9 w-9 bg-[#4c94ff] flex items-center justify-center text-m font-semibold text-white cursor-pointer hover:brightness-110 transition"
        >
          {userDetail?.username.split("")[0].toUpperCase()}
        </div>

        {show && <Drop userDetail={userDetail} />}
      </div>
    );
  }
  return (
    <div className="relative">
      <div
        onClick={() => setshow(!show)}
        className="rounded-full h-9 w-9 bg-[#4c94ff] flex items-center justify-center text-m font-semibold text-white cursor-pointer hover:brightness-110 transition"
      >
        {"A"}
      </div>

      {show && <Drop userDetail={userDetail} />}
    </div>
  );

  function Drop({
    userDetail,
  }: {
    userDetail: { username: string; email: string } | null;
  }) {
    const router = useRouter();
    if (!userDetail) {
      return (
        <div className="absolute right-0 mt-2 w-56 bg-[#14151b] border border-white/5 rounded-xl p-2 z-50">
          <div className="flex items-center gap-3 px-3 py-2 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-[#202127]" />

            <div className="flex-1 space-y-1">
              <div className="h-3 w-24 bg-[#202127] rounded" />
              <div className="h-3 w-32 bg-[#202127] rounded" />
            </div>
          </div>

          <div className="border-t border-white/5 my-2"></div>

          <div className="flex items-center gap-2 px-3 py-2 animate-pulse">
            <div className="h-4 w-4 bg-[#202127] rounded" />
            <div className="h-3 w-16 bg-[#202127] rounded" />
          </div>
        </div>
      );
    }
    return (
      <div className="absolute right-0 mt-2 w-65 bg-[#14151b] border border-white/5 rounded-xl p-2 z-50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-[#202127] flex items-center justify-center">
            <ProfileIcon />
          </div>

          <div className="leading-tight overflow-hidden">
            <div className="text-white text-sm font-medium">
              {userDetail.username ?? ""}
            </div>
            <div className="text-[#8b90a0] text-xs">
              {userDetail.email ?? " "}{" "}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 my-2"></div>

        <div
          onClick={() => {
            localStorage.removeItem("token");
            setshow(!show);
            window.location.reload();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm text-[#fd4b4e] hover:bg-[#202127] transition"
        >
          <LogoutIcon />
          Logout
        </div>
      </div>
    );
  }
}

function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-4 text-white"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
      />
    </svg>
  );
}

function LogoutIcon() {
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
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 12h-9m0 0 3-3m-3 3 3 3"
      />
    </svg>
  );
}
