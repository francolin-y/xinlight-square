import type { Metadata } from "next";
import {
  Baloo_2,
  Bungee,
  Cormorant_Garamond,
  Liu_Jian_Mao_Cao,
  Ma_Shan_Zheng,
  Noto_Serif_SC,
  Nunito,
  Pacifico,
  Playfair_Display,
  Quicksand,
  Space_Mono,
  ZCOOL_QingKe_HuangYou,
  ZCOOL_XiaoWei,
  Zhi_Mang_Xing,
} from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Navbar } from "@/components/Navbar";

const zcoolXiaoWei = ZCOOL_XiaoWei({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-plaza-cn",
  display: "swap",
});

const maShanZheng = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-magic-cn",
  display: "swap",
});

const zhiMangXing = Zhi_Mang_Xing({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heart-cn",
  display: "swap",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heart",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-studio-cn",
  display: "swap",
});

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-studio",
  display: "swap",
});

const zcoolQingKeHuangYou = ZCOOL_QingKe_HuangYou({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-market-cn",
  display: "swap",
});

const liuJianMaoCao = Liu_Jian_Mao_Cao({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tree-cn",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plaza",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-magic",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heart",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-studio",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-market",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-tree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stella Planet",
  description: "An interactive starlight website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={[
          zcoolXiaoWei.variable,
          maShanZheng.variable,
          zcoolQingKeHuangYou.variable,
          liuJianMaoCao.variable,
          nunito.variable,
          cormorant.variable,
          quicksand.variable,
          baloo.variable,
          spaceMono.variable,
          playfair.variable,
          zhiMangXing.variable,
          pacifico.variable,
          notoSerifSC.variable,
          bungee.variable,
        ].join(" ")}
      >
        <LanguageProvider>
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}