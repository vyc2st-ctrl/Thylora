// THE ROOT HOUSE · record source registry
// Workroom: WR-ROOTHOUSE-001
//
// Every source here is a real collection held by a real institution. Each one
// says which eras, places and family lines it can help with, and what it
// actually yields, so the planner can pick sources from facts rather than hope.
//
// era: [startYear, endYear] the records cover.
// places: 'US', 'TN', 'MEMPHIS', 'CANADA', 'ONTARIO', 'NOVA_SCOTIA', 'QUEBEC',
//         'AFRICA', 'ATLANTIC', 'ANY'.
// kind: CENSUS · VITAL · MILITARY · FREEDOM · ENSLAVEMENT · BORDER · LAND ·
//       PROBATE · NEWSPAPER · CHURCH · CEMETERY · ORAL · DNA · DIRECTORY ·
//       INDEX · SOCIAL · COMMUNITY
// access: FREE · PAID · REQUEST (FOIA / archive request / fee per copy)

export const SOURCES = [
  // ── United States · federal ──────────────────────────────────────────────
  { code: 'US_CENSUS_1950', name: 'US Federal Census 1950', holder: 'National Archives (NARA)', kind: 'CENSUS', access: 'FREE', era: [1950, 1950], places: ['US'],
    yields: 'Everyone in the household, ages, birthplaces (state or country, e.g. "Canada").' },
  { code: 'US_CENSUS_1900_1940', name: 'US Federal Census 1900–1940', holder: 'NARA · FamilySearch · Ancestry', kind: 'CENSUS', access: 'FREE', era: [1900, 1940], places: ['US'],
    yields: 'Birthplace of each person AND (1900–1930) of their father and mother; year of immigration — the census column that proves or disproves a Canadian birth.' },
  { code: 'US_CENSUS_1880', name: 'US Federal Census 1880', holder: 'NARA · FamilySearch', kind: 'CENSUS', access: 'FREE', era: [1880, 1880], places: ['US'],
    yields: 'First census to state each person\'s relationship to the head and both parents\' birthplaces.' },
  { code: 'US_CENSUS_1870', name: 'US Federal Census 1870', holder: 'NARA · FamilySearch', kind: 'CENSUS', access: 'FREE', era: [1870, 1870], places: ['US'],
    yields: 'First census that names nearly every formerly enslaved person. The "1870 brick wall" starts here.' },
  { code: 'US_SLAVE_SCHEDULES', name: '1850 and 1860 Slave Schedules', holder: 'NARA · FamilySearch · Ancestry', kind: 'ENSLAVEMENT', access: 'FREE', era: [1850, 1860], places: ['US'],
    yields: 'Enslaver named; enslaved people listed by age, sex and colour only. Matched against 1870 neighbours to bridge the wall.' },
  { code: 'FREEDMENS_BUREAU', name: 'Freedmen\'s Bureau Records (BRFAL)', holder: 'NARA · FamilySearch · Smithsonian Transcription Center', kind: 'FREEDOM', access: 'FREE', era: [1865, 1872], places: ['US', 'TN', 'MEMPHIS'],
    yields: 'Labour contracts, marriage registers, ration lists, complaints — often naming the former enslaver. The Memphis field office records are part of the Tennessee series.' },
  { code: 'FREEDMANS_BANK', name: 'Freedman\'s Savings and Trust Company records', holder: 'NARA · FamilySearch', kind: 'FREEDOM', access: 'FREE', era: [1865, 1874], places: ['US', 'MEMPHIS'],
    yields: 'Depositor cards listing parents, spouse, children, siblings and sometimes the plantation. Memphis had a branch.' },
  { code: 'USCT_SERVICE_PENSION', name: 'US Colored Troops service and pension files', holder: 'NARA · Fold3', kind: 'MILITARY', access: 'REQUEST', era: [1863, 1930], places: ['US', 'TN', 'MEMPHIS'],
    yields: 'Pension files hold affidavits from family and neighbours, marriage proof, children\'s births. Units were raised at Memphis (Fort Pickering).' },
  { code: 'MEMPHIS_MASSACRE_1866', name: 'Memphis Riots and Massacres, 1866 — Congressional report', holder: 'US House of Representatives (39th Congress) · digitised libraries', kind: 'FREEDOM', access: 'FREE', era: [1866, 1866], places: ['MEMPHIS'],
    yields: 'Sworn testimony naming Black Memphis residents, victims and witnesses — people otherwise missing from paper.' },
  { code: 'SOUTHERN_CLAIMS', name: 'Southern Claims Commission files', holder: 'NARA · Fold3', kind: 'FREEDOM', access: 'PAID', era: [1871, 1880], places: ['US', 'TN'],
    yields: 'Claims by Unionists, including freedpeople, for property taken by the Union army; testimony about family and neighbours.' },
  { code: 'WWI_DRAFT', name: 'WWI Draft Registration Cards 1917–1918', holder: 'NARA · FamilySearch', kind: 'MILITARY', access: 'FREE', era: [1917, 1918], places: ['US'],
    yields: 'Men born ~1872–1900: exact birth date, birthplace, nearest relative, signature. Black registrants\' cards had a corner torn off.' },
  { code: 'WWII_DRAFT', name: 'WWII Draft Registrations incl. 1942 "Old Man\'s Draft"', holder: 'NARA · FamilySearch · Fold3', kind: 'MILITARY', access: 'FREE', era: [1940, 1947], places: ['US'],
    yields: 'Exact birth date and place, a person who will always know your address.' },
  { code: 'SS5_APPLICATION', name: 'Social Security application (SS-5)', holder: 'Social Security Administration', kind: 'VITAL', access: 'REQUEST', era: [1936, 2000], places: ['US'],
    yields: 'In the person\'s own hand: birth date and place, father\'s full name, mother\'s maiden name.' },
  { code: 'US_CANADA_BORDER', name: 'US–Canada border crossings 1895–1956 (St. Albans and port lists)', holder: 'NARA · FamilySearch · Ancestry', kind: 'BORDER', access: 'FREE', era: [1895, 1956], places: ['US', 'CANADA'],
    yields: 'Everyone entering the US from Canada: birthplace, last address in Canada, relative left behind, destination.' },
  { code: 'US_PASSPORTS', name: 'US passport applications 1795–1925', holder: 'NARA · FamilySearch', kind: 'BORDER', access: 'FREE', era: [1795, 1925], places: ['US'],
    yields: 'Birth date and place, father\'s birthplace, often a photo after 1914.' },
  { code: 'DAWES_FREEDMEN', name: 'Dawes Rolls — Freedmen of the Five Tribes (incl. Chickasaw)', holder: 'NARA · Oklahoma Historical Society', kind: 'FREEDOM', access: 'FREE', era: [1898, 1914], places: ['US'],
    yields: 'Enrollment cards and interview packets for people of African descent held by or born among the Five Tribes. Memphis sits on Chickasaw land.' },

  // ── Tennessee · Memphis · Shelby County ──────────────────────────────────
  { code: 'SHELBY_REGISTER', name: 'Shelby County Register of Deeds — online death, marriage and deed indexes', holder: 'Shelby County Register of Deeds', kind: 'VITAL', access: 'FREE', era: [1820, 1970], places: ['MEMPHIS', 'TN'],
    yields: 'Death certificates and marriage records for Memphis and Shelby County; deeds that can include bills of sale before 1865.' },
  { code: 'TSLA_VITALS', name: 'Tennessee death records 1908–1970 and delayed birth records', holder: 'Tennessee State Library and Archives (TSLA)', kind: 'VITAL', access: 'FREE', era: [1908, 1970], places: ['TN'],
    yields: 'Death certificates naming parents and their birthplaces; the informant is usually a child or spouse.' },
  { code: 'TN_COLORED_PENSIONS', name: 'Tennessee Colored Pension Applications', holder: 'Tennessee State Library and Archives', kind: 'MILITARY', access: 'FREE', era: [1921, 1940], places: ['TN'],
    yields: 'Applications by Black men who served Confederate units as servants or labourers, with sworn life histories.' },
  { code: 'MEMPHIS_ROOM', name: 'Memphis and Shelby County Room — city directories, photographs, clippings', holder: 'Memphis Public Libraries (Benjamin L. Hooks Central Library)', kind: 'DIRECTORY', access: 'FREE', era: [1849, 1990], places: ['MEMPHIS'],
    yields: 'Year-by-year address and occupation; older directories marked Black residents, which narrows a common name fast.' },
  { code: 'MEMPHIS_BLACK_PRESS', name: 'Memphis Black press — Memphis World, Tri-State Defender', holder: 'Memphis Public Libraries · University of Memphis', kind: 'NEWSPAPER', access: 'FREE', era: [1931, 2000], places: ['MEMPHIS'],
    yields: 'Obituaries, church and social news, visiting-relative notices ("Mrs. X of Windsor, Canada visited her sister").' },
  { code: 'MEMPHIS_CEMETERIES', name: 'Historic Black cemeteries — Zion Christian Cemetery and others', holder: 'Cemetery associations · Find a Grave · BillionGraves', kind: 'CEMETERY', access: 'FREE', era: [1876, 2026], places: ['MEMPHIS'],
    yields: 'Burial dates, family plots grouped together.' },
  { code: 'BLACK_FUNERAL_HOMES', name: 'Black-owned funeral home records (e.g. T. H. Hayes & Sons)', holder: 'Funeral homes · Memphis Public Libraries collections', kind: 'CEMETERY', access: 'REQUEST', era: [1900, 2026], places: ['MEMPHIS'],
    yields: 'Programs and registers naming survivors, out-of-town relatives and home churches.' },
  { code: 'FISK_NARRATIVES', name: 'Fisk University 1929–30 interviews and WPA "Born in Slavery" narratives', holder: 'Fisk University · Library of Congress', kind: 'ORAL', access: 'FREE', era: [1820, 1865], places: ['TN', 'US'],
    yields: 'First-person testimony from formerly enslaved Tennesseans, searchable by name and county.' },

  // ── Canada ───────────────────────────────────────────────────────────────
  { code: 'LAC_CENSUS', name: 'Census of Canada 1851–1931', holder: 'Library and Archives Canada (LAC)', kind: 'CENSUS', access: 'FREE', era: [1851, 1931], places: ['CANADA', 'ONTARIO', 'NOVA_SCOTIA', 'QUEBEC'],
    yields: 'Households in Canada West (Ontario), Nova Scotia and beyond; 1851 and 1861 often record "colored" and US birthplaces — the freedom-seeker generation.' },
  { code: 'BOOK_OF_NEGROES', name: 'Book of Negroes, 1783', holder: 'Library and Archives Canada · The National Archives (UK) · NARA', kind: 'FREEDOM', access: 'FREE', era: [1783, 1783], places: ['NOVA_SCOTIA', 'CANADA', 'ATLANTIC'],
    yields: 'About 3,000 Black Loyalists evacuated from New York to Nova Scotia: name, age, description, former enslaver, how they gained freedom.' },
  { code: 'NS_ARCHIVES_BLACK', name: 'Nova Scotia Archives — Black Loyalists and Black Refugees of 1812–1815', holder: 'Nova Scotia Archives', kind: 'FREEDOM', access: 'FREE', era: [1783, 1900], places: ['NOVA_SCOTIA'],
    yields: 'Land grants, ship lists and settlement records for Birchtown, Preston, Hammonds Plains and other African Nova Scotian communities.' },
  { code: 'ONTARIO_VITALS', name: 'Ontario births (1869+), marriages and deaths', holder: 'Archives of Ontario · FamilySearch', kind: 'VITAL', access: 'FREE', era: [1869, 1940], places: ['ONTARIO'],
    yields: 'Civil registration naming parents; the place to confirm a Canadian-born great-grandmother.' },
  { code: 'BUXTON_ELGIN', name: 'Buxton (Elgin Settlement) records', holder: 'Buxton National Historic Site & Museum', kind: 'COMMUNITY', access: 'REQUEST', era: [1849, 1900], places: ['ONTARIO'],
    yields: 'Lot holders and families of the Elgin Settlement founded for freedom seekers near Chatham.' },
  { code: 'CHATHAM_KENT_BHS', name: 'Chatham-Kent Black Historical Society', holder: 'Chatham-Kent Black Historical Society', kind: 'COMMUNITY', access: 'REQUEST', era: [1830, 1950], places: ['ONTARIO'],
    yields: 'Family files and research help for Chatham, a main destination of the Underground Railroad.' },
  { code: 'AMHERSTBURG_MUSEUM', name: 'Amherstburg Freedom Museum', holder: 'Amherstburg Freedom Museum', kind: 'COMMUNITY', access: 'REQUEST', era: [1830, 1950], places: ['ONTARIO'],
    yields: 'Church and community records from a Detroit River crossing point.' },
  { code: 'CANADA_BLACK_PRESS', name: 'Provincial Freeman and Voice of the Fugitive', holder: 'Digitised by Canadian and US libraries', kind: 'NEWSPAPER', access: 'FREE', era: [1851, 1857], places: ['ONTARIO'],
    yields: 'Black-run newspapers of Canada West (Mary Ann Shadd Cary; Henry Bibb): arrivals, meetings, marriages.' },
  { code: 'BANQ_DROUIN', name: 'Québec church registers (Drouin Collection)', holder: 'BAnQ · Ancestry · Généalogie Québec', kind: 'CHURCH', access: 'PAID', era: [1621, 1967], places: ['QUEBEC'],
    yields: 'Baptisms, marriages and burials — including enslaved and free Black Montrealers and any French-Canadian line.' },

  // ── Enslavement, freedom and the Atlantic ────────────────────────────────
  { code: 'PROBATE_ENSLAVERS', name: 'County probate: wills, estate inventories and divisions of enslavers', holder: 'County probate courts · FamilySearch', kind: 'PROBATE', access: 'FREE', era: [1700, 1865], places: ['US', 'TN'],
    yields: 'The single best pre-1865 source: enslaved people named, often as families, when an estate was divided.' },
  { code: 'DEEDS_BILLS_OF_SALE', name: 'Deed books — bills of sale and mortgages of enslaved people', holder: 'County registers of deeds', kind: 'LAND', access: 'FREE', era: [1700, 1865], places: ['US', 'TN', 'MEMPHIS'],
    yields: 'Names, ages, prices and movements between enslavers.' },
  { code: 'LAST_SEEN', name: 'Last Seen: Finding Family After Slavery', holder: 'Villanova University', kind: 'FREEDOM', access: 'FREE', era: [1863, 1920], places: ['US', 'CANADA'],
    yields: '"Information Wanted" ads placed by freedpeople searching for parents, children and siblings sold away.' },
  { code: 'FREEDOM_ON_THE_MOVE', name: 'Freedom on the Move', holder: 'Cornell University', kind: 'ENSLAVEMENT', access: 'FREE', era: [1700, 1865], places: ['US'],
    yields: 'Runaway advertisements: names, descriptions, skills, where the person was believed headed — sometimes Canada.' },
  { code: 'ENSLAVED_ORG', name: 'Enslaved.org', holder: 'Michigan State University and partners', kind: 'ENSLAVEMENT', access: 'FREE', era: [1500, 1900], places: ['ANY'],
    yields: 'Linked person-records drawn from many slavery datasets.' },
  { code: 'SLAVEVOYAGES', name: 'SlaveVoyages — Trans-Atlantic, Intra-American and African Origins databases', holder: 'SlaveVoyages consortium', kind: 'ENSLAVEMENT', access: 'FREE', era: [1514, 1866], places: ['ATLANTIC', 'AFRICA'],
    yields: 'Voyage-level data (port of departure in Africa, arrival port) and African names recorded from liberated captives.' },
  { code: 'CHRONICLING_AMERICA', name: 'Chronicling America', holder: 'Library of Congress', kind: 'NEWSPAPER', access: 'FREE', era: [1770, 1963], places: ['US'],
    yields: 'Millions of digitised newspaper pages, searchable by name.' },

  // ── Index sites and DNA ──────────────────────────────────────────────────
  { code: 'FAMILYSEARCH', name: 'FamilySearch', holder: 'FamilySearch', kind: 'INDEX', access: 'FREE', era: [1500, 2026], places: ['ANY'],
    yields: 'Billions of indexed names plus un-indexed image sets (Full-Text search reads handwriting).' },
  { code: 'ANCESTRY', name: 'Ancestry', holder: 'Ancestry', kind: 'INDEX', access: 'PAID', era: [1500, 2026], places: ['ANY'],
    yields: 'Largest paid record and DNA network; free at many public libraries.' },
  { code: 'NEWSPAPERS_COM', name: 'Newspapers.com and GenealogyBank', holder: 'Ancestry · NewsBank', kind: 'NEWSPAPER', access: 'PAID', era: [1700, 2026], places: ['US', 'CANADA'],
    yields: 'Obituaries and notices, including Black newspapers.' },
  { code: 'YDNA', name: 'Y-DNA test', holder: 'FamilyTreeDNA and others', kind: 'DNA', access: 'PAID', era: [0, 2026], places: ['ANY'],
    yields: 'Follows the father\'s-father line only, father to son. A male in that line must test.' },
  { code: 'MTDNA', name: 'Mitochondrial DNA (mtDNA) test', holder: 'FamilyTreeDNA and others', kind: 'DNA', access: 'PAID', era: [0, 2026], places: ['ANY'],
    yields: 'Follows the mother\'s-mother line only, mother to child. Anyone descended through that unbroken female line can test.' },
  { code: 'AUTOSOMAL', name: 'Autosomal DNA test', holder: 'AncestryDNA · 23andMe · MyHeritage · FamilyTreeDNA', kind: 'DNA', access: 'PAID', era: [1750, 2026], places: ['ANY'],
    yields: 'Matches cousins on all four lines about 5–7 generations back. The father\'s mother and mother\'s father lines are reached this way.' },
  { code: 'ELDER_INTERVIEW', name: 'Elder interviews and the family\'s own papers', holder: 'The family', kind: 'ORAL', access: 'FREE', era: [1900, 2026], places: ['ANY'],
    yields: 'Names, nicknames, places, Bibles, funeral programs, letters — the leads every other source needs.' }
];

export const SOURCE_BY_CODE = new Map(SOURCES.map(s => [s.code, s]));

// A source fits a person when it covers one of their places and its records
// overlap the years they were alive.
export function sourcesFor({ places = [], born = null, died = null } = {}) {
  const wanted = new Set([...places, 'ANY']);
  const start = born ?? -Infinity;
  const end = died ?? (born !== null ? born + 85 : Infinity);
  return SOURCES.filter(s =>
    s.places.some(p => wanted.has(p)) && s.era[0] <= end && s.era[1] >= start);
}
