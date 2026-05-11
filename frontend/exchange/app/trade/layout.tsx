import { AllMarketLanding } from "../comp/allmarketslanding";
import Navbar from "../comp/navbar";

export default function Layoutforothers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="">
      <Navbar></Navbar>
      {children}
    </div>
  );
}
