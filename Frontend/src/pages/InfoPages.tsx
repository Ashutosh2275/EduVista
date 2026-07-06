import { InfoPage } from './InfoPage';
import { infoPages } from '../data/infoPagesData';

export function RankingsPage() { return <InfoPage page={infoPages.rankings} />; }
export function ScholarshipsPage() { return <InfoPage page={infoPages.scholarships} />; }
export function PressPage() { return <InfoPage page={infoPages.press} />; }
export function HelpPage() { return <InfoPage page={infoPages.help} />; }
export function GuidesPage() { return <InfoPage page={infoPages.guides} />; }
export function ApiPage() { return <InfoPage page={infoPages.api} />; }
export function PartnersPage() { return <InfoPage page={infoPages.partners} />; }
export function PrivacyPage() { return <InfoPage page={infoPages.privacy} />; }
export function TermsPage() { return <InfoPage page={infoPages.terms} />; }
export function CookiesPage() { return <InfoPage page={infoPages.cookies} />; }
export function DisclaimerPage() { return <InfoPage page={infoPages.disclaimer} />; }
