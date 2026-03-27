import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Database, 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  FileText,
  Mail,
  ClipboardList,
  Calendar,
  LucideIcon
} from "lucide-react";
import { Footer } from "../components/layout";

interface DataField {
  name: string;
  type: string;
  description: string;
}

interface DataModel {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  fields: DataField[];
}

interface ComplexType {
  name: string;
  description: string;
  fields: DataField[];
}

interface ColorScheme {
  bg: string;
  border: string;
  icon: string;
  badge: string;
}

interface ModelCardProps {
  model: DataModel;
  isExpanded: boolean;
  onToggle: () => void;
}

interface TypeBadgeProps {
  type: string;
  isClickable?: boolean;
}

interface FieldRowProps {
  field: DataField;
  depth?: number;
  expandedFields: Set<string>;
  toggleField: (key: string) => void;
}

/**
 * Data model definitions for Tilda
 * Based on JSON schemas from https://api.data.altinn.no/v1/public/metadata/evidencecodes/tilda
 */
const DATA_MODELS: DataModel[] = [
  {
    id: "tilsynsrapport",
    name: "tilsynsrapport (AuditReport)",
    description: "Rapport fra gjennomført tilsyn med funn og reaksjoner",
    icon: ClipboardList,
    color: "blue",
    fields: [
      { name: "tildaenhet", type: "string?", description: "tildaenhet består av et organisasjonsnummer. Org.nr representerer en virksomhets underenhet (per definisjon i Brønnøysundregistrene) som er gjenstand for tilsyn" },
      { name: "tilsynutfoertav", type: "string?", description: "tilsynutfoertav er tilsynsmyndigheten/aktøren som utførte tilsynet. Her skal alltid org.nr. oppføres (selv om det ikke er en lovfestet tilsynsmyndighet som har utført tilsynet)" },
      { name: "ansvarligTilsynsmyndighet", type: "string?", description: "Tilsynsmyndigheten som står ansvarlig for tilsynet, og ikke nødvendigvis den som utførte tilsynet" },
      { name: "tilsynsegenskaper", type: "ControlAttribute?", description: "tilsynsegenskaper består av dataelementer som beskriver bakgrunnen og egenskaper til et tilsyn" },
      { name: "kontrolladresser", type: "AuditAddress[]?", description: "kontrolladresser er en liste over alle adresser som en tilsynsmyndighet har registrert på et tilsynsobjekt" },
      { name: "utfoerteTilsynsaktiviteter", type: "ControlActivity[]?", description: "utfoerteTilsynsaktiviteter skisserer detaljer rundt en aktivitet som ble utført i forbindelse med et tilsyn" },
      { name: "kontaktpunkt", type: "ControlContact[]?", description: "kontaktpunkt består av kontaktinformasjon i listeformat" },
      { name: "tilsynsnotater", type: "string?", description: "tilsynsnotater rundt et tilsyn som består av informasjon i tekst format" },
      { name: "anmerkninger", type: "Remark[]?", description: "Beskrivelse av forhold som tilsynsetatene mener det er nødvendig å påpeke, men som ikke omfattes av definisjonen for avvik" },
      { name: "bruddOgReaksjoner", type: "Reaction[]?", description: "bruddogreaksjoner består av informasjon i listeformat for å beskrive alle brudd og reaksjoner i løpets av et tilsyns livstid" },
    ]
  },
  {
    id: "tilsynskoordinering",
    name: "tilsynskoordinering (AuditCoordination)",
    description: "Planlagte og koordinerte tilsyn mellom myndigheter",
    icon: Calendar,
    color: "purple",
    fields: [
      { name: "tildaenhet", type: "string?", description: "tildaenhet består av et organisasjonsnummer. Org.nr representerer en virksomhets underenhet (per definisjon i Brønnøysundregistrene) som er gjenstand for tilsyn" },
      { name: "tilsynutfoertav", type: "string?", description: "tilsynutfoertav er tilsynsmyndigheten/aktøren som utførte tilsynet. Her skal alltid org.nr. oppføres (selv om det ikke er en lovfestet tilsynsmyndighet som har utført tilsynet)" },
      { name: "ansvarligtilsynsmyndighet", type: "string?", description: "Tilsynsmyndigheten som står ansvarlig for tilsynet, og ikke nødvendigvis den som utførte tilsynet" },
      { name: "tilsynsstatus", type: "ControlState", description: "Er tilsynet i planleggingsfasen, åpen, avbrutt, eller lukket" },
      { name: "uanmeldttilsyn", type: "SurpriseControlAttributeType", description: "Var (det første) besøket uanmeldt?" },
      { name: "storulykketilsyn", type: "MajorAccidentAttributeType", description: "Var dette et storulykke-tilsyn?" },
      { name: "internTilsynsid", type: "string?", description: "En intern identifikator som refererer til et konkret tilsyn eller rapport hos en tilsynsmyndighet som ikke nødvendigvis har noe betydning for andre tilsynsmyndigheter" },
      { name: "kontrolladresser", type: "AuditAddress[]?", description: "kontrolladresser er en liste over alle adresser som en tilsynsmyndighet har registrert på et tilsynsobjekt" },
      { name: "kontaktpunkt", type: "ControlContact[]?", description: "kontaktpunkt består av kontaktinformasjon i listeformat" },
      { name: "meldingTilAnnenMyndighet", type: "AlertFull[]?", description: "Meldinger til andre myndigheter" },
      { name: "aapnetilsyn", type: "integer", description: "aapnetilsyn består av et heltall for å angi antall åpne tilsyn per dags dato" },
      { name: "planlagteKontroller", type: "PlannedControlActivity[]?", description: "planlagtekontroller består av tid/varighet/tema informasjon for tilsyn og kontroller planlagt for tiden fremover, i liste format" },
      { name: "tilsynskampanjer", type: "Campaign[]?", description: "Tilsynskampanjer" },
    ]
  },
  {
    id: "melding",
    name: "meldingTilAnnenMyndighet (AlertMessage)",
    description: "Meldinger mellom tilsynsmyndigheter om en virksomhet",
    icon: Mail,
    color: "green",
    fields: [
      { name: "identifikator", type: "string", description: "Unik meldings-ID (UUID)" },
      { name: "meldingFraMyndighet", type: "string", description: "Organisasjonsnummer til avsendende tilsynsmyndighet" },
      { name: "meldingOmTildaenhet", type: "string", description: "Organisasjonsnummer meldingen gjelder" },
      { name: "datoForMeldingTilAnnenMyndighet", type: "datetime", description: "Tidspunkt for sending" },
      { name: "meldingsinnholdTilAnnenMyndighet", type: "AlertMessageContent", description: "Innhold med meldingsType og fritekst" },
    ]
  },
  {
    id: "npdid",
    name: "npdid (NPDIDAuditReport)",
    description: "Tilsynsrapporter med NPDID-referanse for petroleumsvirksomhet",
    icon: FileText,
    color: "orange",
    fields: [
      { name: "npdid", type: "string?", description: "NPDID-referanse" },
      { name: "tildaenhet", type: "string?", description: "Organisasjonsnummer for tilsynsobjektet" },
      { name: "tilsynutfoertav", type: "string?", description: "Tilsynsmyndighet som utførte tilsynet" },
      { name: "ansvarligtilsynsmyndighet", type: "string?", description: "Ansvarlig tilsynsmyndighet" },
      { name: "tilsynsegenskaper", type: "ControlAttribute?", description: "Egenskaper ved tilsynet" },
      { name: "kontrolladresser", type: "AuditAddress[]?", description: "Adresser hvor tilsynet ble utført" },
      { name: "utfoerteTilsynsaktiviteter", type: "ControlActivity[]?", description: "Liste over utførte tilsynsaktiviteter" },
      { name: "kontaktpunkt", type: "ControlContact[]?", description: "Kontaktpersoner for tilsynet" },
      { name: "tilsynsnotater", type: "string?", description: "Notater fra tilsynet" },
      { name: "anmerkninger", type: "Remark[]?", description: "Anmerkninger og merknader" },
      { name: "bruddOgReaksjoner", type: "Reaction[]?", description: "Brudd og reaksjoner fra tilsynet" },
    ]
  },
  {
    id: "storulykkevirksomhet",
    name: "storulykkevirksomhet (StorulykkevirksomhetKontroll)",
    description: "Informasjon om storulykkevirksomheter",
    icon: FileText,
    color: "red",
    fields: [
      { name: "bedriftsnummer", type: "string?", description: "Bedriftsnummer" },
      { name: "paragraf6", type: "boolean", description: "Omfattet av §6 i storulykkeforskriften" },
      { name: "paragraf9", type: "boolean", description: "Omfattet av §9 i storulykkeforskriften" },
    ]
  },
  {
    id: "tildaregistryentry",
    name: "enhetsinformasjon (TildaRegistryEntry)",
    description: "Registerinformasjon om en Tilda-enhet",
    icon: Database,
    color: "indigo",
    fields: [
      { name: "tildaenhet", type: "string", description: "Organisasjonsnummer" },
      { name: "tildaenhetNavn", type: "string", description: "Navn på enheten" },
      { name: "epostaddresser", type: "array", description: "E-postadresser" },
      { name: "tildaenhetHovedenhet", type: "string", description: "Hovedenhet" },
      { name: "besoeksadresse", type: "ERAddress", description: "Besøksadresse" },
      { name: "naeringskode", type: "string", description: "Næringskode" },
      { name: "organisasjonsform", type: "string", description: "Organisasjonsform" },
      { name: "regnskapsInformasjon", type: "AccountsInformation", description: "Regnskapsinformasjon" },
      { name: "driftsstatus", type: "OperationStatus", description: "Driftsstatus" },
    ]
  },
];

/**
 * Complex type definitions - nested types that can be expanded
 * Based on JSON schemas from https://api.data.altinn.no/v1/public/metadata/evidencecodes/tilda
 */
const COMPLEX_TYPES: Record<string, ComplexType> = {
  ControlAttribute: {
    name: "ControlAttribute",
    description: "Egenskaper ved tilsynet",
    fields: [
      { name: "internTilsynsid", type: "string?", description: "Intern ID for tilsynet" },
      { name: "storulykketilsyn", type: "MajorAccidentAttributeType", description: "Om det er storulykketilsyn" },
      { name: "uanmeldttilsyn", type: "SurpriseControlAttributeType", description: "Om tilsynet er uanmeldt" },
      { name: "tilsynsutvelgelse", type: "string?", description: "Hvordan tilsynet ble valgt ut" },
      { name: "tilsynsstatus", type: "ControlState", description: "Status for tilsynet" },
      { name: "tilsynstema", type: "string?", description: "Tema for tilsynet" },
      { name: "tilsynsnoekkelord", type: "string?", description: "Nøkkelord for tilsynet" },
      { name: "nettrapport", type: "string?", description: "URL til nettrapport" },
    ]
  },
  AuditAddress: {
    name: "AuditAddress",
    description: "Adresseinformasjon for tilsynslokasjon",
    fields: [
      { name: "lokalitetsreferanse", type: "integer", description: "Inkrementelt referansenummer kun til bruk i relasjoner internt i datasettet. Starter på 1 og teller opp for hver kontrolladresse i datasettet" },
      { name: "lokalitetsbeskrivelse", type: "string?", description: "Mulighet for å legge inn en (intern) referanse og/eller beskrivelse som relaterer til en konkret kontrolladresse, for å gi utfyllende informasjon om spesielle forhold" },
      { name: "lokalitetsnoekkelord", type: "string?", description: "Semikolonseparert liste med nøkkelord/stikkord/\"tagger\" som beskriver beliggenheten" },
      { name: "lengdegrad", type: "string?", description: "Lengdegrad i desimalgrader" },
      { name: "breddegrad", type: "string?", description: "Breddegrad i desimalgrader" },
      { name: "bygningsnummer", type: "string?", description: "Bygningsnummer identifiserer en bygning unikt på landsbasis" },
      { name: "bruksenhetsnummer", type: "string?", description: "En bokstav og fire siffer som entydig identifiserer den enkelte bruksenheten innenfor en adresserbar bygning eller bygningsdel" },
      { name: "adressenavn", type: "string?", description: "Navn på gate, veg, sti, plass eller område som er ført i matrikkelen" },
      { name: "adressenummer", type: "string?", description: "Et nummer og en eventuell bokstav som entydig identifiserer eiendommer, anlegg, bygninger eller innganger til bygninger innenfor en adresserbar gate, veg, sti, plass eller område" },
      { name: "postnummer", type: "string?", description: "Firesifret kode som identifiserer et postnummerområde" },
      { name: "poststedsnavn", type: "string?", description: "Navn på bosted i henhold til Postens egne lister" },
      { name: "kommunenummer", type: "string?", description: "Kommune-ID-nummer identifikator" },
      { name: "bydel", type: "string?", description: "Navn på bydel" },
      { name: "fylkesnummer", type: "string?", description: "Fylkes-ID nummer identifikator" },
    ]
  },
  ControlActivity: {
    name: "ControlActivity",
    description: "Utført tilsynsaktivitet",
    fields: [
      { name: "tilsynsaktivitetreferanse", type: "integer", description: "Inkrementelt referansenummer kun til bruk i relasjoner internt i datasettet. Starter på 1 og teller opp for hver aktivitet i datasettet" },
      { name: "lokalitetsreferanse", type: "integer", description: "Datasettreferanse til en spesifikk lokasjon \"definert\" i dataelementet kontrolladresser>lokalitetsreferanse" },
      { name: "internAktivitetsidentifikator", type: "string?", description: "En intern identifikator som refererer til en konkrete kontroll/aktivitet hos en tilsynsmyndighet, og har ikke nødvendigvis noe betydning for andre tilsynsmyndigheter" },
      { name: "kontrollobjekt", type: "string?", description: "En intern referansebeskrivelse som knyttes opp mot et konkret objekt eller prosess (som det utføres kontroll på)" },
      { name: "startdatoForTilsynsaktivitet", type: "datetime", description: "Startdato for angitt aktivitet" },
      { name: "varighetForTilsynsaktivitet", type: "integer", description: "Antall dager kontrollen varte med start angitt i dataelementet kontrolldato" },
      { name: "tilsynsaktivitet", type: "string?", description: "Hva var aktiviteten?" },
      { name: "aktivitetsutfoerelse", type: "string?", description: "Hvordan ble aktiviteten gjennomført (rent praktisk)?" },
      { name: "observasjonFraTilsynsaktivitet", type: "string?", description: "Observasjoner fra aktiviteten" },
      { name: "samtidigeKontroller", type: "CoordinatedControlAgency[]?", description: "Angir hvilke tilsynsmyndigheter som (faktisk) var på samtidig kontroll hos et tilsynsobjekt" },
      { name: "meldingTilAnnenMyndighet", type: "AlertCompact[]?", description: "Meldinger til andre myndigheter" },
    ]
  },
  ControlContact: {
    name: "ControlContact",
    description: "Kontaktinformasjon for tilsyn",
    fields: [
      { name: "kontaktperson", type: "string?", description: "Her kan man legge inn navnet på personen som var ansvarlig, eller tittelen på stillingen innen avdelingen dersom det ikke er ønskelig å dele et navn på en ansatt" },
      { name: "avdeling", type: "string?", description: "Avdeling som behandler tilsyn, helst til det regionale kontoret som utførte kontrollene, hvis mulig" },
      { name: "telefonnummer", type: "string?", description: "Telefonnummeret til avdeling som behandler tilsyn, helst til det regionale kontoret som utførte kontrollene, hvis mulig" },
      { name: "epost", type: "string?", description: "Epostadressen til avdeling som behandler tilsyn, helst til det regionale kontoret som utførte kontrollene, hvis mulig" },
      { name: "adresse", type: "string?", description: "Postadressen til tilsynet, helst til det regionale kontoret som utførte kontrollene, hvis mulig" },
    ]
  },
  Remark: {
    name: "Remark",
    description: "Anmerkning fra tilsyn",
    fields: [
      { name: "anmerkningsreferanse", type: "integer", description: "Inkrementelt referansenummer kun til bruk i relasjoner internt i datasettet. Starter på 1 og teller opp for hver registrert anmerkning" },
      { name: "anmerkning", type: "string?", description: "Beskrivelse av forhold som tilsynsetatene mener det er nødvendig å påpeke, men som ikke omfattes av definisjonen for avvik" },
    ]
  },
  Reaction: {
    name: "Reaction",
    description: "Brudd og reaksjon fra tilsyn",
    fields: [
      { name: "bruddOgReaksjonsreferanse", type: "integer", description: "Referanse til brudd/reaksjon" },
      { name: "tilsynsaktivitetreferanse", type: "integer", description: "Referanse til tilsynsaktivitet" },
      { name: "lokalitetsreferanse", type: "integer", description: "Referanse til lokalitet" },
      { name: "utredningAvBruddOgReaksjon", type: "string?", description: "Utredning av bruddet" },
      { name: "lovparagraf", type: "string?", description: "Relevant lovparagraf" },
      { name: "reaksjonsdato", type: "datetime", description: "Dato for reaksjon" },
      { name: "alvorsgrad", type: "ControlReactionDetails?", description: "Alvorlighetsgrad" },
      { name: "antallGangerVirkemiddelErTattIBruk", type: "integer", description: "Antall ganger virkemiddel er brukt" },
    ]
  },
  ControlReactionDetails: {
    name: "ControlReactionDetails",
    description: "Detaljer om reaksjonsgrad",
    fields: [
      { name: "utmaaltReaksjonsverdi", type: "integer", description: "Størrelsesorden på utmålt reaksjon fra tilsynsmyndigheten" },
      { name: "utmaaltReaksjonstype", type: "string?", description: "En reaksjonstype beskriver hva slags reaksjon er utmålt" },
      { name: "utmaaltReaksjonsklasse", type: "integer", description: "Reaksjonsklasse for reaksjonstypene" },
      { name: "lavreaksjonsverdi", type: "integer", description: "Reaksjonens laveste/minste utmålte verdi" },
      { name: "hoeyreaksjonsverdi", type: "integer", description: "Reaksjonens høyeste/største utmålte verdi" },
      { name: "lavalvorsgradindeks", type: "integer", description: "Reaksjonens laveste alvorsgrensevurdering (for en spesifikk kombinasjon av reaksjonsklasse og reaksjonstype)" },
      { name: "hoeyalvorsgradindeks", type: "integer", description: "Reaksjonens høyeste alvorsgrense (for denne reaksjonsklassen)" },
    ]
  },
  AlertFull: {
    name: "AlertFull",
    description: "Fullstendig melding til annen myndighet",
    fields: [
      { name: "meldingTilMyndighet", type: "string?", description: "Mottakende myndighet" },
      { name: "lokalitetsreferanse", type: "integer", description: "Referanse til lokalitet" },
      { name: "meldingsinnholdTilAnnenMyndighet", type: "string?", description: "Innhold i meldingen" },
      { name: "datoForMeldingTilAnnenMyndighet", type: "datetime", description: "Dato for melding" },
    ]
  },
  AlertCompact: {
    name: "AlertCompact",
    description: "Kompakt melding til annen myndighet",
    fields: [
      { name: "meldingTilmyndighet", type: "string?", description: "Mottakende myndighet" },
      { name: "meldingsinnholdTilAnnenMyndighet", type: "string?", description: "Innhold i meldingen" },
    ]
  },
  PlannedControlActivity: {
    name: "PlannedControlActivity",
    description: "Planlagt kontrollaktivitet",
    fields: [
      { name: "planlagtkontrolldato", type: "datetime", description: "Planlagt kontrolldato" },
      { name: "planlagtkontrollVarighet", type: "integer", description: "Planlagt varighet i minutter" },
      { name: "tilsynstema", type: "string?", description: "Hva slags type tilsyn ble utført? Hva var hovedfokus/tema på tilsynet som ble utført" },
      { name: "tilsynsaktivitet", type: "string?", description: "Hva var aktiviteten?" },
      { name: "aktivitetsutfoerelse", type: "string?", description: "Hvordan ble aktiviteten gjennomført (rent praktisk)?" },
      { name: "samtidigeKontroller", type: "CoordinatedControlAgency[]?", description: "Angir hvilke tilsynsmyndigheter som (faktisk) var på samtidig kontroll hos et tilsynsobjekt" },
    ]
  },
  CoordinatedControlAgency: {
    name: "CoordinatedControlAgency",
    description: "Samtidig tilsynsmyndighet",
    fields: [
      { name: "samtidigTilsynsmyndighet", type: "string?", description: "Tilsynsmyndighet(er) som planlegger å utføre en kontroll hos tildaenhet på samme planlagtkontrolldato. samtidigtilsynsmyndighet består av et organisasjonsnummer" },
      { name: "tilsynstema", type: "string?", description: "Tema for planlagt tilsyn av Samtidigtilsynsmyndighet" },
      { name: "aktivitetsutfoerelse", type: "string?", description: "Hvordan ble den samtidige aktiviteter utført av samtidigtilsynsmyndighet?" },
    ]
  },
  Campaign: {
    name: "Campaign",
    description: "Tilsynskampanje",
    fields: [
      { name: "kampanjenavn", type: "string?", description: "Navn på kampanjen" },
      { name: "kampanjebeskrivelse", type: "string?", description: "Beskrivelse av kampanjen" },
      { name: "startdatoForKampanje", type: "datetime", description: "Startdato for kampanjen" },
      { name: "sluttdatoForKampanje", type: "datetime", description: "Sluttdato for kampanjen" },
    ]
  },
  AlertMessageContent: {
    name: "AlertMessageContent",
    description: "Innhold i melding til annen myndighet",
    fields: [
      { name: "meldingsType", type: "AlertMessageType", description: "Type melding" },
      { name: "relatertDatasettOppslagsUrl", type: "string?", description: "URL til relatert datasett" },
      { name: "fritekst", type: "string?", description: "Fritekst i meldingen" },
    ]
  },
  AlertMessageType: {
    name: "AlertMessageType (enum)",
    description: "Type melding til annen myndighet",
    fields: [
      { name: "varsel-om-rapport", type: "enum", description: "Varsel om rapport" },
      { name: "varsel-om-koordinering", type: "enum", description: "Varsel om koordinering" },
      { name: "varsel-fritekst", type: "enum", description: "Varsel med fritekst" },
    ]
  },
  ERAddress: {
    name: "ERAddress",
    description: "Utvidet adresseinformasjon fra Enhetsregisteret",
    fields: [
      { name: "lengdegrad", type: "string?", description: "Lengdegrad i desimalgrader" },
      { name: "breddegrad", type: "string?", description: "Breddegrad i desimalgrader" },
      { name: "bygningsnummer", type: "string?", description: "Bygningsnummer identifiserer en bygning unikt på landsbasis" },
      { name: "bruksenhetsnummer", type: "string?", description: "En bokstav og fire siffer som entydig identifiserer den enkelte bruksenheten innenfor en adresserbar bygning eller bygningsdel" },
      { name: "adressenavn", type: "string?", description: "Navn på gate, veg, sti, plass eller område som er ført i matrikkelen" },
      { name: "adressenummer", type: "string?", description: "Et nummer og en eventuell bokstav som entydig identifiserer eiendommer, anlegg, bygninger eller innganger til bygninger innenfor en adresserbar gate, veg, sti, plass eller område" },
      { name: "postnummer", type: "string?", description: "Firesifret kode som identifiserer et postnummerområde" },
      { name: "poststedsnavn", type: "string?", description: "Navn på bosted i henhold til Postens egne lister" },
      { name: "kommunenummer", type: "string?", description: "Kommune-ID-nummer identifikator" },
      { name: "bydel", type: "string?", description: "Navn på bydel" },
      { name: "fylkesnummer", type: "string?", description: "Fylkes-ID nummer identifikator" },
    ]
  },
  AccountsInformation: {
    name: "AccountsInformation",
    description: "Regnskapsinformasjon for enheten",
    fields: [
      { name: "regnskapsplikt", type: "boolean?", description: "Om enheten har regnskapsplikt" },
      { name: "revisjonsplikt", type: "boolean?", description: "Om enheten har revisjonsplikt" },
    ]
  },
  ControlState: {
    name: "ControlState (enum)",
    description: "Status for tilsyn",
    fields: [
      { name: "ikkeAngitt", type: "enum", description: "Ikke angitt" },
      { name: "aapen", type: "enum", description: "Tilsynet er åpent" },
      { name: "lukket", type: "enum", description: "Tilsynet er lukket" },
      { name: "avbrutt", type: "enum", description: "Tilsynet er avbrutt" },
      { name: "planlegging", type: "enum", description: "Tilsynet er under planlegging" },
    ]
  },
  SurpriseControlAttributeType: {
    name: "SurpriseControlAttributeType (enum)",
    description: "Om tilsynet er uanmeldt",
    fields: [
      { name: "ikkeAngitt", type: "enum", description: "Ikke angitt" },
      { name: "ja", type: "enum", description: "Uanmeldt tilsyn" },
      { name: "nei", type: "enum", description: "Varslet tilsyn" },
    ]
  },
  MajorAccidentAttributeType: {
    name: "MajorAccidentAttributeType (enum)",
    description: "Om det er storulykketilsyn",
    fields: [
      { name: "ikkeAngitt", type: "enum", description: "Ikke angitt" },
      { name: "nei", type: "enum", description: "Ikke storulykketilsyn" },
      { name: "meldepliktig", type: "enum", description: "Meldepliktig virksomhet" },
      { name: "rapporteringspliktig", type: "enum", description: "Rapporteringspliktig virksomhet" },
      { name: "ja", type: "enum", description: "Er storulykketilsyn" },
    ]
  },
  OperationStatus: {
    name: "OperationStatus (enum)",
    description: "Driftsstatus for enheten",
    fields: [
      { name: "ikkeAngitt", type: "enum", description: "Ikke angitt" },
      { name: "konkurs", type: "enum", description: "Under konkurs" },
      { name: "underAvvikling", type: "enum", description: "Under avvikling" },
      { name: "underTvangsavviklingEllerTvangsopploesning", type: "enum", description: "Under tvangsavvikling eller tvangsoppløsning" },
      { name: "ok", type: "enum", description: "Normal drift" },
      { name: "slettet", type: "enum", description: "Slettet" },
    ]
  },
};

/**
 * Helper to extract base type name from type string (e.g., "AuditAddress[]?" -> "AuditAddress")
 */
function getBaseTypeName(type: string): string {
  return type.replace(/[\[\]\?]/g, '');
}

/**
 * Check if a type is a complex type that can be expanded
 */
function isComplexType(type: string): boolean {
  const baseType = getBaseTypeName(type);
  return COMPLEX_TYPES.hasOwnProperty(baseType);
}

/**
 * Color mapping for model cards
 */
const COLOR_MAP: Record<string, ColorScheme> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", badge: "bg-green-100 text-green-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
  red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", badge: "bg-red-100 text-red-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
};

/**
 * Type badge component
 */
function TypeBadge({ type, isClickable = false }: TypeBadgeProps) {
  const baseClasses = "px-2 py-0.5 rounded text-xs font-mono";
  const clickableClasses = isClickable ? "cursor-pointer hover:ring-2 hover:ring-offset-1" : "";
  
  if (type.includes("string")) return <span className={`${baseClasses} ${clickableClasses} bg-blue-100 text-blue-700 ${isClickable ? 'hover:ring-blue-300' : ''}`}>{type}</span>;
  if (type.includes("number")) return <span className={`${baseClasses} ${clickableClasses} bg-green-100 text-green-700 ${isClickable ? 'hover:ring-green-300' : ''}`}>{type}</span>;
  if (type.includes("boolean")) return <span className={`${baseClasses} ${clickableClasses} bg-purple-100 text-purple-700 ${isClickable ? 'hover:ring-purple-300' : ''}`}>{type}</span>;
  if (type.includes("date")) return <span className={`${baseClasses} ${clickableClasses} bg-orange-100 text-orange-700 ${isClickable ? 'hover:ring-orange-300' : ''}`}>{type}</span>;
  if (type.includes("enum")) return <span className={`${baseClasses} ${clickableClasses} bg-yellow-100 text-yellow-700 ${isClickable ? 'hover:ring-yellow-300' : ''}`}>{type}</span>;
  if (type.includes("object")) return <span className={`${baseClasses} ${clickableClasses} bg-pink-100 text-pink-700 ${isClickable ? 'hover:ring-pink-300' : ''}`}>{type}</span>;
  if (type.includes("array")) return <span className={`${baseClasses} ${clickableClasses} bg-indigo-100 text-indigo-700 ${isClickable ? 'hover:ring-indigo-300' : ''}`}>{type}</span>;
  
  // Complex types get a special style
  if (isClickable) {
    return <span className={`${baseClasses} ${clickableClasses} bg-violet-100 text-violet-700 hover:ring-violet-300`}>{type}</span>;
  }
  
  return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{type}</span>;
}

/**
 * Expandable field row component for complex types
 */
function FieldRow({ field, depth = 0, expandedFields, toggleField }: FieldRowProps) {
  const fieldKey = `${depth}-${field.name}`;
  const isExpanded = expandedFields.has(fieldKey);
  const hasComplexType = isComplexType(field.type);
  const baseTypeName = getBaseTypeName(field.type);
  const complexType = hasComplexType ? COMPLEX_TYPES[baseTypeName] : null;
  
  const indentClass = depth > 0 ? `pl-${Math.min(depth * 4, 12)}` : '';
  
  return (
    <>
      <tr 
        className={`text-sm ${hasComplexType ? 'cursor-pointer hover:bg-neutral-50' : ''}`}
        onClick={hasComplexType ? () => toggleField(fieldKey) : undefined}
      >
        <td className={`py-2.5 pr-4 ${indentClass}`}>
          <div className="flex items-center gap-2">
            <code className="font-mono text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
              {field.name}
            </code>
          </div>
        </td>
        <td className="py-2.5 pr-4">
          <TypeBadge type={field.type} isClickable={hasComplexType} />
        </td>
        <td className="py-2.5 text-neutral-600">
          <div className="flex items-center gap-2">
            {field.description}
            {hasComplexType && (
              <span className="text-xs text-violet-600 font-medium">
                (klikk for å utvide)
              </span>
            )}
          </div>
        </td>
      </tr>
      
      {/* Nested fields for complex types */}
      {isExpanded && complexType && (
        <>
          <tr className="bg-violet-50/50">
            <td colSpan={3} className={`py-1.5 px-4 ${depth > 0 ? 'pl-8' : 'pl-4'}`}>
              <div className="text-xs text-violet-700 font-medium flex items-center gap-2">
                <span className="bg-violet-200 px-1.5 py-0.5 rounded">{complexType.name}</span>
                <span className="text-violet-600">{complexType.description}</span>
              </div>
            </td>
          </tr>
          {complexType.fields.map((nestedField, idx) => (
            <FieldRow
              key={`${fieldKey}-${idx}`}
              field={nestedField}
              depth={depth + 1}
              expandedFields={expandedFields}
              toggleField={toggleField}
            />
          ))}
        </>
      )}
    </>
  );
}

/**
 * Expandable model card component
 */
function ModelCard({ model, isExpanded, onToggle }: ModelCardProps) {
  const Icon = model.icon;
  const colors = COLOR_MAP[model.color] || COLOR_MAP.blue;
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  
  const toggleField = (fieldKey: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldKey)) {
        next.delete(fieldKey);
      } else {
        next.add(fieldKey);
      }
      return next;
    });
  };
  
  return (
    <div
      className={`digdir-card overflow-hidden ${colors.border} border-2`}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className={`w-full p-5 flex items-center gap-4 text-left hover:bg-neutral-50 transition-colors ${isExpanded ? colors.bg : ''}`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900">{model.name}</h3>
          <p className="text-sm text-neutral-600 truncate">{model.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
            {model.fields.length} felt
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-neutral-200">
          <div className="p-5 bg-white">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4 w-1/4">Felt</th>
                  <th className="pb-3 pr-4 w-1/4">Type</th>
                  <th className="pb-3">Beskrivelse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {model.fields.map((field, idx) => (
                  <FieldRow
                    key={idx}
                    field={field}
                    depth={0}
                    expandedFields={expandedFields}
                    toggleField={toggleField}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Data Models Page
 */
export function DataModelsPage() {
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  
  const toggleModel = (modelId: string) => {
    setExpandedModels(prev => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };
  
  const expandAll = () => {
    setExpandedModels(new Set(DATA_MODELS.map(m => m.id)));
  };
  
  const collapseAll = () => {
    setExpandedModels(new Set());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full animate-in">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8"
        >
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake til forsiden
          </Link>

          {/* Header */}
          <div className="border-b border-neutral-200 pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Datamodeller</h1>
                <p className="text-neutral-600">Dokumentasjon av datastrukturer i Tilda</p>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="digdir-card p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-neutral-700">
                  Denne siden viser datamodellene som er i bruk i Tilda-tjenesten. 
                  Klikk på en modell for å se alle feltene og deres beskrivelser.                
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              {DATA_MODELS.length} datamodeller
            </p>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Vis alle
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Skjul alle
              </button>
            </div>
          </div>

          {/* Model cards */}
          <div className="grid gap-4">
            {DATA_MODELS.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isExpanded={expandedModels.has(model.id)}
                onToggle={() => toggleModel(model.id)}
              />
            ))}
          </div>

          {/* NuGet Package Reference */}
          <div className="digdir-card p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-neutral-700 mb-3">
                  Alle modellene i Tilda ligger i en nuget-pakke som kan tas i bruk av konsumenter og tilbydere.
                </p>
                <a 
                  href="https://www.nuget.org/packages/Dan.Tilda.Models" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  <Database className="w-4 h-4" />
                  Dan.Tilda.Models på NuGet
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
