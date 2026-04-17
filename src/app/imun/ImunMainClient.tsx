"use client";

import HeroSection, { GoldenDust } from "./components/HeroSection";
import MarqueeSection from "./components/MarqueeSection";
import InfoSection from "./components/InfoSection";
import SecGenMessageSection from "./components/SecGenMessageSection";
import PlenaryPresidentMessageSection from "./components/PlenaryPresidentMessageSection";
import RegistrationSection from "./components/RegistrationSection";
import UpdatesSection from "./components/UpdatesSection";
import CommitteesSection from "./components/CommitteesSection";
import VenueSection from "./components/VenueSection";
import ClosingSection from "./components/ClosingSection";
import type { SiteSettingsPublic } from "@/lib/data";

export default function ImunMainClient({ settings }: { settings: SiteSettingsPublic }) {
    return (
        <main className="min-h-screen bg-[#111111] text-[#f2c45f] mx-auto selection:bg-[#f2c45f]/30 selection:text-[#111111] relative overflow-clip w-full">       
            <style jsx global>{`
                @font-face { font-family: 'Trajan Pro Bold'; src: local('Trajan Pro Bold'), local('TrajanPro-Bold'); font-weight: bold; }
                @font-face { font-family: 'Baskerville Old Face'; src: local('Baskerville Old Face'), local('Baskerville'); }
                @font-face { font-family: 'DeVinne Swash Regular'; src: local('DeVinne Swash Regular'), local('DeVinne Swash'); }
                .font-primary { font-family: 'Trajan Pro Bold', var(--font-cinzel), serif; }
                .font-secondary { font-family: 'Baskerville Old Face', var(--font-libre-baskerville), serif; }
                .font-decorative { font-family: 'DeVinne Swash Regular', var(--font-playfair), serif; }
            `}</style>
            
            <GoldenDust />

            <HeroSection />

            <MarqueeSection />

            <div className="relative z-10 w-full flex flex-col items-center">
                <InfoSection settings={settings} />
                <RegistrationSection settings={settings} />
                <SecGenMessageSection />
                <PlenaryPresidentMessageSection />
                <UpdatesSection />
                <CommitteesSection settings={settings} />
                <VenueSection settings={settings} />
                <ClosingSection settings={settings} />
            </div>
        </main>
    );
}

