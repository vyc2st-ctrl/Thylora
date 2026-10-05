// ROOT HOUSE · the Vault: record sources
// Workroom: WR-LINEAGE-001
//
// This is the working catalog, not the limit. Each entry is a COLLECTION; most
// hold thousands to billions of individual records. The catalog grows by adding
// rows — the shape never changes.
//
// access: FREE · FREE_ACCOUNT · PAID · ONSITE · REQUEST (write or file a request)
// desk:   which Root House desk works it (see researchers.js)
// era:    rough years covered

const S = (id, name, holder, region, era, access, desk, url, why) =>
  Object.freeze({ id, name, holder, region, era, access, desk, url, why });

export const SOURCES = Object.freeze([
  // ── Indigenous membership and reclassification (added 2026-10-05, gate 656) ──
  S('lac-indig', 'Indigenous heritage records (Indian Affairs RG10: band lists, treaty annuity paylists)', 'Library and Archives Canada', 'Canada', '1850–1990', 'FREE', 'CANADA', 'https://library-archives.canada.ca', 'Treaty paylists name each family paid per year, by band — incl. Treaty 7 (Blackfoot Confederacy nations).'),
  S('lac-metis', 'Métis scrip applications', 'Library and Archives Canada', 'Canada (Prairies)', '1870–1924', 'FREE', 'CANADA', 'https://library-archives.canada.ca', 'Sworn applications naming the applicant, parents and birthplace.'),
  S('isc-register', 'Indian Register (Status) and genealogy requests', 'Indigenous Services Canada', 'Canada', '1951–present (older band lists behind it)', 'REQUEST', 'CANADA', 'https://www.sac-isc.gc.ca', 'A descendant can request registration and genealogy research back through band lists.'),
  S('hbca', 'Hudson’s Bay Company Archives', 'Archives of Manitoba', 'Canada', '1670–1900s', 'FREE', 'CANADA', 'https://www.gov.mb.ca/chc/archives/hbca/', 'Employee, post and family records for Indigenous and Métis families across the fur-trade country.'),
  S('nara-indian-census', 'Indian Census Rolls 1885–1940 (M595, incl. Blackfeet)', 'NARA', 'US', '1885–1940', 'FREE', 'CENSUS', 'https://www.archives.gov/research/census/native-americans/1885-1940.html', 'Annual rolls by agency: name, age, relation — the US side of the border.'),
  S('guion-miller', 'Guion Miller Roll — Eastern Cherokee applications', 'NARA', 'US Southeast', '1906–1909', 'FREE', 'CENSUS', 'https://www.archives.gov', 'Tens of thousands of applications with family histories, many from people the census listed as colored.'),
  S('census-race-series', 'Race column, census by census (US 1850–1950, Canada 1901–1921)', 'NARA · LAC · FamilySearch', 'US, Canada', '1850–1950', 'FREE_ACCOUNT', 'CENSUS', 'https://www.familysearch.org/search', 'Read the race/colour/origin entry for the same person every year; a change is evidence of reclassification.'),
  S('racial-integrity-1924', 'Virginia Racial Integrity Act 1924 records (documented reclassification of Native families)', 'Library of Virginia', 'Virginia', '1912–1946', 'FREE', 'CENSUS', 'https://www.lva.virginia.gov', 'Documented case of officials rewriting Native people as colored — the pattern the gate checks for.'),

  // ── Big indexes: start here, every line ─────────────────────────────────
  S('fs', 'FamilySearch historical records + Family Tree', 'FamilySearch International', 'World', '1500–present', 'FREE_ACCOUNT', 'CENSUS', 'https://www.familysearch.org/search', 'Largest free index. Census, vital records, Freedmen’s Bureau, Tennessee deaths, Ontario records.'),
  S('fs-catalog', 'FamilySearch Catalog + Full-Text search', 'FamilySearch International', 'World', 'all', 'FREE_ACCOUNT', 'LAND', 'https://www.familysearch.org/search/catalog', 'Unindexed deeds, probate and court books. Full-text search reads handwriting.'),
  S('fs-wiki', 'FamilySearch Research Wiki', 'FamilySearch International', 'World', 'all', 'FREE', 'CENSUS', 'https://www.familysearch.org/en/wiki/', 'How-to for every county: what survives and where it is.'),
  S('ancestry', 'Ancestry', 'Ancestry.com', 'World', 'all', 'PAID', 'CENSUS', 'https://www.ancestry.com', 'Census images, city directories, yearbooks, draft cards, border crossings.'),
  S('myheritage', 'MyHeritage', 'MyHeritage', 'World', 'all', 'PAID', 'CENSUS', 'https://www.myheritage.com', 'Record matching and international collections.'),
  S('findmypast', 'Findmypast', 'Findmypast', 'UK, Canada, US', 'all', 'PAID', 'CANADA', 'https://www.findmypast.com', 'British Empire records touching Canada and the Caribbean.'),
  S('fold3', 'Fold3', 'Ancestry', 'US', '1700s–1990s', 'PAID', 'MILITARY', 'https://www.fold3.com', 'Military service, pension and Southern Claims files.'),
  S('wikitree', 'WikiTree', 'WikiTree community', 'World', 'all', 'FREE', 'CENSUS', 'https://www.wikitree.com', 'Sourced collaborative tree; strong African American project.'),
  S('afrigeneas', 'AfriGeneas', 'AfriGeneas', 'US, Caribbean', 'all', 'FREE', 'ENSLAVEMENT_ERA', 'https://www.afrigeneas.com', 'African-descended genealogy forums and surname boards.'),
  S('cyndi', 'Cyndi’s List', 'Cyndi Ingle', 'World', 'all', 'FREE', 'CENSUS', 'https://www.cyndislist.com', 'Directory of hundreds of thousands of genealogy links.'),
  S('usgenweb', 'USGenWeb county pages', 'USGenWeb volunteers', 'US', 'all', 'FREE', 'LAND', 'http://www.usgenweb.org', 'County-level transcriptions and local guides.'),
  S('linkpendium', 'Linkpendium', 'Linkpendium', 'US', 'all', 'FREE', 'LAND', 'http://www.linkpendium.com', 'Surname and locality link index.'),
  S('ia', 'Internet Archive (books, directories, yearbooks)', 'Internet Archive', 'World', 'all', 'FREE', 'NEWSPAPERS', 'https://archive.org', 'Full-text city directories, county histories, church minutes.'),
  S('hathi', 'HathiTrust Digital Library', 'HathiTrust', 'World', 'all', 'FREE', 'NEWSPAPERS', 'https://www.hathitrust.org', 'Full-text search of millions of digitized books.'),
  S('gbooks', 'Google Books', 'Google', 'World', 'all', 'FREE', 'NEWSPAPERS', 'https://books.google.com', 'Snippet search finds names in printed histories.'),
  S('dpla', 'Digital Public Library of America', 'DPLA', 'US', 'all', 'FREE', 'NEWSPAPERS', 'https://dp.la', 'Aggregates thousands of US library and archive collections.'),
  S('worldcat', 'WorldCat', 'OCLC', 'World', 'all', 'FREE', 'LAND', 'https://search.worldcat.org', 'Finds which library holds a book, microfilm or manuscript.'),
  S('archivegrid', 'ArchiveGrid', 'OCLC Research', 'World', 'all', 'FREE', 'LAND', 'https://researchworks.oclc.org/archivegrid/', 'Finding aids for manuscript collections: family papers, plantation records.'),
  S('wikidata', 'Wikidata', 'Wikimedia Foundation', 'World', 'all', 'FREE', 'CENSUS', 'https://www.wikidata.org', 'Structured data on notable people and places.'),

  // ── US federal ──────────────────────────────────────────────────────────
  S('nara-catalog', 'National Archives Catalog', 'NARA', 'US', '1774–present', 'FREE', 'MILITARY', 'https://catalog.archives.gov', 'Digitized federal records; search by name.'),
  S('census-1950', '1950 US Census', 'NARA', 'US', '1950', 'FREE', 'CENSUS', 'https://1950census.archives.gov', 'Most recent public census; name search.'),
  S('census-1940', '1940 US Census', 'NARA', 'US', '1940', 'FREE', 'CENSUS', 'https://www.archives.gov/research/census/1940', 'Residence in 1935, education, wages.'),
  S('census-1930', '1930 US Census', 'NARA', 'US', '1930', 'FREE_ACCOUNT', 'CENSUS', 'https://www.familysearch.org/search', 'Birthplace of person + both parents — a Canada test.'),
  S('census-1920', '1920 US Census', 'NARA', 'US', '1920', 'FREE_ACCOUNT', 'CENSUS', 'https://www.familysearch.org/search', 'Year of immigration for anyone foreign-born, incl. Canada.'),
  S('census-1910', '1910 US Census', 'NARA', 'US', '1910', 'FREE_ACCOUNT', 'CENSUS', 'https://www.familysearch.org/search', 'Years married, children born/living for each mother.'),
  S('census-1900', '1900 US Census', 'NARA', 'US', '1900', 'FREE_ACCOUNT', 'CENSUS', 'https://www.familysearch.org/search', 'Month and year of birth; immigration year.'),
  S('census-1890-vet', '1890 Veterans Schedule (surviving)', 'NARA', 'US', '1890', 'FREE_ACCOUNT', 'MILITARY', 'https://www.familysearch.org/search', 'Most of 1890 census burned; Union veterans schedule survives, incl. USCT.'),
  S('census-1880', '1880 US Census', 'NARA', 'US', '1880', 'FREE', 'CENSUS', 'https://www.familysearch.org/search', 'First census giving parents’ birthplaces and relationships.'),
  S('census-1870', '1870 US Census', 'NARA', 'US', '1870', 'FREE', 'CENSUS', 'https://www.familysearch.org/search', 'First census to name nearly all formerly enslaved people. The 1870 wall.'),
  S('slave-sched', '1850 and 1860 Slave Schedules', 'NARA', 'US South', '1850–1860', 'FREE_ACCOUNT', 'ENSLAVEMENT_ERA', 'https://www.familysearch.org/search', 'Lists enslavers by name; enslaved people by age, sex, colour only. Pair with probate.'),
  S('mortality', 'Federal mortality schedules', 'NARA / states', 'US', '1850–1880', 'FREE_ACCOUNT', 'CHURCH_CEMETERY', 'https://www.familysearch.org/search', 'Deaths in the year before each census, incl. enslaved people in 1850/1860.'),
  S('freedmens-bureau', 'Freedmen’s Bureau records (RG 105)', 'NARA / FamilySearch / NMAAHC', 'US South + DC', '1865–1872', 'FREE', 'ENSLAVEMENT_ERA', 'https://www.familysearch.org/en/wiki/Freedmen%27s_Bureau', 'Labor contracts, marriages, rations, complaints — names former enslavers.'),
  S('nmaahc-fb', 'Freedmen’s Bureau Search Portal', 'Smithsonian NMAAHC', 'US South', '1865–1872', 'FREE', 'ENSLAVEMENT_ERA', 'https://nmaahc.si.edu/explore/initiatives/freedmens-bureau-records', 'Transcribed and searchable Bureau records.'),
  S('freedmans-bank', 'Freedman’s Savings and Trust Co. registers (M816)', 'NARA', 'US incl. Memphis branch', '1865–1874', 'FREE_ACCOUNT', 'ENSLAVEMENT_ERA', 'https://www.familysearch.org/search', 'Depositor cards list parents, spouse, children, siblings, sometimes former enslaver. Memphis had a branch.'),
  S('southern-claims', 'Southern Claims Commission files', 'NARA', 'US South', '1871–1880', 'PAID', 'LAND', 'https://www.fold3.com', 'Testimony by Black witnesses and claimants about property and neighbors.'),
  S('usct-cmsr', 'US Colored Troops compiled service records', 'NARA', 'US', '1863–1866', 'FREE_ACCOUNT', 'MILITARY', 'https://www.archives.gov/research/military/civil-war/usct', 'About 179,000 men served. Memphis (Fort Pickering) raised USCT regiments.'),
  S('nps-soldiers', 'Civil War Soldiers and Sailors Database', 'National Park Service', 'US', '1861–1865', 'FREE', 'MILITARY', 'https://www.nps.gov/civilwar/search-soldiers.htm', 'Regiment lookup for USCT and Union soldiers.'),
  S('cw-pensions', 'Civil War pension files', 'NARA', 'US', '1861–1934', 'REQUEST', 'MILITARY', 'https://www.archives.gov/research/military/civil-war/pensions', 'Widows had to prove marriage — files hold affidavits, family Bible pages, slavery-era detail.'),
  S('ww1-draft', 'WWI draft registration cards', 'NARA', 'US', '1917–1918', 'FREE_ACCOUNT', 'MILITARY', 'https://www.familysearch.org/search', 'Every man 18–45: birth date, birthplace, nearest relative. Cards marked “colored”.'),
  S('ww2-draft', 'WWII draft registration incl. 1942 “old man’s draft”', 'NARA', 'US', '1940–1947', 'FREE_ACCOUNT', 'MILITARY', 'https://www.familysearch.org/search', 'Men born 1877–1897 registered in 1942 — reaches great-grandfathers.'),
  S('ww2-enlist', 'WWII Army enlistment records', 'NARA AAD', 'US', '1938–1946', 'FREE', 'MILITARY', 'https://aad.archives.gov', 'Searchable enlistment database.'),
  S('ss5', 'Social Security applications (SS-5) and claims index', 'SSA / NARA', 'US', '1936–2007', 'FREE_ACCOUNT', 'CENSUS', 'https://www.familysearch.org/search', 'Applicant names BOTH parents incl. mother’s maiden name. Order full SS-5 by FOIA.'),
  S('ssdi', 'Social Security Death Index', 'SSA', 'US', '1936–2014', 'FREE', 'CHURCH_CEMETERY', 'https://www.familysearch.org/search', 'Birth/death dates and last residence.'),
  S('rrb', 'Railroad Retirement Board records', 'RRB / NARA', 'US', '1936–present', 'REQUEST', 'MILITARY', 'https://www.rrb.gov/OurAgency/Genealogy', 'Railroad men, incl. porters and firemen.'),
  S('border-can', 'Canada → US border crossings', 'NARA (St. Albans lists etc.)', 'US–Canada', '1895–1956', 'FREE_ACCOUNT', 'CANADA', 'https://www.familysearch.org/search', 'Records people crossing into the US from Canada. Direct test of the Canada story.'),
  S('naturalization', 'Naturalization and alien registration', 'NARA / USCIS', 'US', '1790–1950s', 'REQUEST', 'CANADA', 'https://www.uscis.gov/records/genealogy', 'Canadian-born residents sometimes naturalized; 1940 alien registration covered everyone non-citizen.'),
  S('blm-glo', 'BLM General Land Office records', 'Bureau of Land Management', 'US public-land states', '1788–present', 'FREE', 'LAND', 'https://glorecords.blm.gov', 'Federal land patents and homesteads.'),
  S('dawes', 'Dawes Rolls incl. Freedmen of the Five Tribes', 'NARA', 'Indian Territory', '1898–1914', 'FREE', 'ENSLAVEMENT_ERA', 'https://www.archives.gov/research/native-americans/dawes', 'Black freedmen of Cherokee, Creek, Choctaw, Chickasaw, Seminole nations with applications.'),
  S('born-in-slavery', 'Born in Slavery: WPA Slave Narratives', 'Library of Congress', 'US', '1936–1938', 'FREE', 'ORAL_HISTORY', 'https://www.loc.gov/collections/slave-narratives-from-the-federal-writers-project-1936-to-1938/', 'Over 2,300 first-person accounts incl. Tennessee and Arkansas.'),
  S('loc-sanborn', 'Sanborn fire insurance maps', 'Library of Congress', 'US', '1867–1970', 'FREE', 'LAND', 'https://www.loc.gov/collections/sanborn-maps/', 'Shows the actual house on the street a census address names.'),

  // ── Newspapers ──────────────────────────────────────────────────────────
  S('chron-am', 'Chronicling America', 'Library of Congress', 'US', '1756–1963', 'FREE', 'NEWSPAPERS', 'https://www.loc.gov/collections/chronicling-america/', 'Millions of free newspaper pages incl. Black papers. The worker searches this.'),
  S('newspapers-com', 'Newspapers.com', 'Ancestry', 'US, Canada', '1700s–present', 'PAID', 'NEWSPAPERS', 'https://www.newspapers.com', 'Largest paid archive: Commercial Appeal, Memphis Press-Scimitar.'),
  S('genbank', 'GenealogyBank (incl. African American newspapers)', 'NewsBank', 'US', '1690–present', 'PAID', 'NEWSPAPERS', 'https://www.genealogybank.com', 'Dedicated African American newspaper collection and obituaries.'),
  S('newsarchive', 'NewspaperArchive', 'NewspaperArchive', 'US, Canada', '1700s–present', 'PAID', 'NEWSPAPERS', 'https://newspaperarchive.com', 'Small-town papers in both countries.'),
  S('defender', 'Chicago Defender', 'ProQuest / libraries', 'National', '1905–present', 'PAID', 'NEWSPAPERS', 'https://www.proquest.com', 'The Great Migration paper; Southern correspondents column carried Memphis news.'),
  S('courier', 'Pittsburgh Courier', 'ProQuest / libraries', 'National', '1910–present', 'PAID', 'NEWSPAPERS', 'https://www.proquest.com', 'National Black weekly with city editions.'),
  S('afro', 'Baltimore Afro-American', 'Google News Archive / Afro', 'National', '1892–present', 'FREE', 'NEWSPAPERS', 'https://news.google.com/newspapers', 'Long free run on Google News Archive.'),
  S('tsd', 'Tri-State Defender (Memphis)', 'Memphis Public Library / ProQuest', 'Memphis', '1951–present', 'ONSITE', 'NEWSPAPERS', 'https://www.memphislibrary.org', 'Memphis Black weekly: obituaries, church, society.'),
  S('memphis-world', 'Memphis World', 'Memphis Public Library', 'Memphis', '1931–1973', 'ONSITE', 'NEWSPAPERS', 'https://www.memphislibrary.org', 'Memphis Black newspaper of the 1930s–60s.'),
  S('last-seen', 'Last Seen: Finding Family After Slavery', 'Villanova University', 'US', '1863–1902', 'FREE', 'NEWSPAPERS', 'https://informationwanted.org', '“Information Wanted” ads placed by people searching for family separated by slavery.'),
  S('freedom-move', 'Freedom on the Move', 'Cornell University', 'US', '1700s–1865', 'FREE', 'ENSLAVEMENT_ERA', 'https://freedomonthemove.org', 'Runaway advertisements — names, descriptions, destinations incl. Canada.'),
  S('provincial-freeman', 'Provincial Freeman and Voice of the Fugitive', 'Libraries / microfilm', 'Canada West', '1851–1861', 'FREE', 'CANADA', 'https://www.ourontario.ca', 'Black Canadian newspapers of the refugee settlements.'),
  S('canadiana', 'Canadiana', 'Canadiana.org', 'Canada', '1600s–1900s', 'FREE', 'CANADA', 'https://www.canadiana.ca', 'Digitized Canadian books, papers and government documents.'),

  // ── Canada: the great-grandmother lead ──────────────────────────────────
  S('lac-census', 'Canadian census 1851–1931', 'Library and Archives Canada', 'Canada', '1851–1931', 'FREE', 'CANADA', 'https://recherche-collection-search.bac-lac.gc.ca/eng/census', 'Name search; 1901+ gives birth dates and “colour/racial origin” columns.'),
  S('lac-cef', 'CEF personnel files incl. No. 2 Construction Battalion', 'Library and Archives Canada', 'Canada', '1914–1919', 'FREE', 'MILITARY', 'https://www.bac-lac.gc.ca/eng/discover/military-heritage/first-world-war/personnel-records/', 'Full digitized files. No. 2 Construction Battalion was Canada’s Black battalion; it recruited US-born men too.'),
  S('lac-genealogy', 'LAC Collection Search', 'Library and Archives Canada', 'Canada', 'all', 'FREE', 'CANADA', 'https://recherche-collection-search.bac-lac.gc.ca', 'Land petitions, passenger lists, immigration.'),
  S('ont-archives', 'Archives of Ontario vital statistics', 'Archives of Ontario', 'Ontario', '1869–present', 'FREE_ACCOUNT', 'CANADA', 'http://www.archives.gov.on.ca/en/access/our_collection.aspx', 'Births, marriages, deaths (index on FamilySearch and Ancestry).'),
  S('onland', 'OnLand historical land books', 'Ontario Land Registry', 'Ontario', '1790s–present', 'FREE', 'LAND', 'https://www.onland.ca', 'Abstract books show who owned each lot — Buxton, Chatham, Dawn lots.'),
  S('ogs', 'Ontario Ancestors (Ontario Genealogical Society)', 'OGS', 'Ontario', 'all', 'PAID', 'CANADA', 'https://ogs.on.ca', 'Cemetery transcriptions and county branch indexes.'),
  S('ns-vitals', 'Nova Scotia Historical Vital Statistics', 'Nova Scotia Archives', 'Nova Scotia', '1763–1970', 'FREE', 'CANADA', 'https://archives.novascotia.ca/vital-statistics', 'Free images of births, marriages, deaths.'),
  S('ns-archives', 'Nova Scotia Archives — African Nova Scotians', 'Nova Scotia Archives', 'Nova Scotia', '1749–present', 'FREE', 'CANADA', 'https://archives.novascotia.ca/africanns', 'Black Loyalist and Black Refugee records.'),
  S('book-negroes', 'Book of Negroes (1783)', 'NARA / UK National Archives / NS Archives', 'New York → Nova Scotia', '1783', 'FREE', 'ENSLAVEMENT_ERA', 'https://www.blackloyalist.com', 'About 3,000 Black Loyalists evacuated from New York, each described by name.'),
  S('bccns', 'Black Cultural Centre for Nova Scotia', 'BCCNS', 'Nova Scotia', 'all', 'REQUEST', 'CANADA', 'https://bccns.com', 'Community genealogy help for African Nova Scotian families.'),
  S('buxton', 'Buxton National Historic Site & Museum', 'Buxton Museum', 'North Buxton, ON', '1849–present', 'REQUEST', 'CANADA', 'https://buxtonmuseum.com', 'Elgin Settlement families; many returned to the US after 1865.'),
  S('ckbhs', 'Chatham-Kent Black Historical Society', 'CKBHS', 'Chatham, ON', '1800s–present', 'REQUEST', 'CANADA', 'https://ckblackhistoricalsociety.org', 'Chatham was a centre of Black Canada West; local family files.'),
  S('amherstburg', 'Amherstburg Freedom Museum', 'Amherstburg Freedom Museum', 'Amherstburg, ON', '1800s–present', 'REQUEST', 'CANADA', 'https://amherstburgfreedom.org', 'Detroit River crossing point; Nazrey AME Church history.'),
  S('henson', 'Uncle Tom’s Cabin Historic Site (Josiah Henson)', 'Ontario Heritage Trust', 'Dresden, ON', '1830s–1880s', 'REQUEST', 'CANADA', 'https://www.heritagetrust.on.ca/properties/uncle-toms-cabin', 'Dawn Settlement records and families.'),
  S('banq', 'BAnQ Advitam + Drouin Collection', 'Bibliothèque et Archives nationales du Québec / Ancestry', 'Québec', '1621–1967', 'FREE', 'CANADA', 'https://advitam.banq.qc.ca', 'Catholic and Protestant registers; Black Montréal families.'),
  S('union-united', 'Union United Church (Montréal)', 'Union United Church', 'Montréal', '1907–present', 'REQUEST', 'CANADA', 'https://www.unionunited.org', 'Historic Black church; many members were US-born railway porters.'),
  S('cvwm', 'Canadian Virtual War Memorial', 'Veterans Affairs Canada', 'Canada', '1867–present', 'FREE', 'MILITARY', 'https://www.veterans.gc.ca/eng/remembrance/memorials/canadian-virtual-war-memorial', 'War dead with photos and documents.'),
  S('drew-1856', 'Benjamin Drew, A North-Side View of Slavery (1856)', 'Docsouth / Internet Archive', 'Canada West', '1855', 'FREE', 'ORAL_HISTORY', 'https://docsouth.unc.edu/neh/drew/menu.html', 'Interviews with refugees living in Canada West, by name and town.'),
  S('still-1872', 'William Still, The Underground Railroad (1872)', 'Docsouth / Internet Archive', 'Philadelphia → Canada', '1850s', 'FREE', 'ORAL_HISTORY', 'https://www.gutenberg.org/ebooks/15263', 'Still’s records of people he helped, many onward to Canada.'),
  S('ugrr-nps', 'Network to Freedom', 'National Park Service', 'US, Canada', '1700s–1865', 'FREE', 'ENSLAVEMENT_ERA', 'https://www.nps.gov/subjects/ugrr/', 'Documented Underground Railroad sites and stories.'),

  // ── Tennessee and Memphis ───────────────────────────────────────────────
  S('shelby-rod', 'Shelby County Register of Deeds', 'Shelby County, TN', 'Memphis/Shelby', '1820–present', 'FREE', 'LAND', 'https://register.shelby.tn.us', 'Free online deeds, marriage records and Memphis/Shelby death records (1848–1964).'),
  S('shelby-archives', 'Shelby County Archives', 'Shelby County, TN', 'Memphis/Shelby', '1820–present', 'REQUEST', 'LAND', 'https://www.shelbycountytn.gov', 'Court, probate, tax and jail records.'),
  S('mpl-dig', 'DIG Memphis + Memphis & Shelby County Room', 'Memphis Public Library', 'Memphis', '1819–present', 'FREE', 'NEWSPAPERS', 'https://www.memphislibrary.org/diglibrary/', 'Digitized photos, city directories, clipping files, funeral programs.'),
  S('memphis-dir', 'Memphis city directories (marked “c” for colored)', 'Memphis Public Library / Ancestry / Internet Archive', 'Memphis', '1849–1990s', 'FREE', 'CENSUS', 'https://archive.org/search?query=memphis+city+directory', 'Year-by-year address, job and spouse. Fills gaps between censuses.'),
  S('tsla', 'Tennessee State Library and Archives', 'State of Tennessee', 'Tennessee', '1790s–present', 'FREE', 'LAND', 'https://sos.tn.gov/tsla', 'Death records 1908–1970, Black Confederate-era pension applications, county records on film.'),
  S('tn-deaths', 'Tennessee death certificates 1908–1970', 'TSLA / FamilySearch / Ancestry', 'Tennessee', '1908–1970', 'FREE_ACCOUNT', 'CHURCH_CEMETERY', 'https://www.familysearch.org/search', 'Names parents and their birthplaces — tests a Canada birthplace one generation up.'),
  S('tn-colored-pension', 'Tennessee Colored Pension Applications for CSA Service', 'TSLA', 'Tennessee', '1921', 'FREE', 'MILITARY', 'https://sos.tn.gov/tsla', 'Applications by Black men who served as laborers/servants with Confederate units.'),
  S('tn-vtn', 'Volunteer Voices / Tennessee Virtual Archive', 'TSLA', 'Tennessee', 'all', 'FREE', 'NEWSPAPERS', 'https://sos.tn.gov/tsla/tva', 'Digitized photos, letters, maps.'),
  S('memphis-massacre', 'Memphis Riots and Massacres report (1866)', 'US House Report No. 101, 39th Congress', 'Memphis', '1866', 'FREE', 'ORAL_HISTORY', 'https://archive.org/search?query=memphis+riots+and+massacres', 'Sworn testimony naming Black Memphis residents, soldiers and victims of May 1866.'),
  S('zion', 'Zion Christian Cemetery', 'Zion Community Project', 'Memphis', '1876–1920s', 'REQUEST', 'CHURCH_CEMETERY', 'https://www.findagrave.com', 'Founded 1876 by the United Sons of Zion; burial ground of thousands of Black Memphians.'),
  S('elmwood', 'Elmwood Cemetery records', 'Elmwood Cemetery', 'Memphis', '1852–present', 'REQUEST', 'CHURCH_CEMETERY', 'https://www.elmwoodcemetery.org', 'Burial registers incl. a historic section for Black Memphians.'),
  S('mt-carmel', 'Mt. Carmel, New Park and Rose Hill cemeteries', 'Cemetery offices / Find a Grave', 'Memphis', '1900s–present', 'REQUEST', 'CHURCH_CEMETERY', 'https://www.findagrave.com', 'Major 20th-century Black burial grounds.'),
  S('funeral-homes', 'Memphis Black funeral homes (T.H. Hayes, N.J. Ford, R.S. Lewis & Sons and others)', 'Funeral homes / MPL clipping files', 'Memphis', '1900s–present', 'REQUEST', 'CHURCH_CEMETERY', 'https://www.memphislibrary.org', 'Death certificates name the funeral home; its file names next of kin.'),
  S('cogic', 'Church of God in Christ archives (Mason Temple)', 'COGIC', 'Memphis HQ', '1907–present', 'REQUEST', 'CHURCH_CEMETERY', 'https://www.cogic.org', 'COGIC is headquartered in Memphis; congregational and convocation records.'),
  S('cme', 'Christian Methodist Episcopal Church records', 'CME Church', 'TN origin (Jackson, 1870)', '1870–present', 'REQUEST', 'CHURCH_CEMETERY', 'https://www.thecmechurch.org', 'Founded 1870 in Jackson, Tennessee; strong Memphis presence.'),
  S('ame', 'AME Church records', 'AME Church / Wilberforce', 'US, Canada (BME)', '1816–present', 'REQUEST', 'CHURCH_CEMETERY', 'https://www.ame-church.com', 'Also the British Methodist Episcopal Church in Canada West.'),
  S('baptist', 'National Baptist Convention and local association minutes', 'Associations / SBHLA', 'US', '1880s–present', 'REQUEST', 'CHURCH_CEMETERY', 'https://sbhla.org', 'Association minutes list churches, pastors, delegates.'),
  S('lemoyne', 'LeMoyne-Owen College archives', 'LeMoyne-Owen College', 'Memphis', '1862–present', 'REQUEST', 'CENSUS', 'https://www.loc.edu', 'Students and teachers since the Lincoln Chapel school.'),
  S('umemphis', 'University of Memphis Special Collections', 'University of Memphis Libraries', 'Memphis', 'all', 'REQUEST', 'NEWSPAPERS', 'https://www.memphis.edu/libraries/special-collections/', 'Press-Scimitar morgue, photos, oral histories.'),
  S('withers', 'Ernest Withers photograph collection', 'Withers Collection Museum & Gallery', 'Memphis', '1940s–2000s', 'REQUEST', 'NEWSPAPERS', 'https://www.thewitherscollection.com', 'Decades of Black Memphis life on film.'),
  S('universal-life', 'Universal Life Insurance Company records', 'Memphis archives', 'Memphis', '1923–2000s', 'REQUEST', 'LAND', 'https://www.memphislibrary.org', 'Black-owned Memphis insurer; policyholder and agent records survive in collections.'),
  S('mdah', 'Mississippi Department of Archives and History', 'State of Mississippi', 'Mississippi', 'all', 'FREE', 'LAND', 'https://www.mdah.ms.gov', 'Delta families moved through Memphis; state census, Freedmen’s labour records.'),
  S('arkansas', 'Arkansas State Archives', 'State of Arkansas', 'Arkansas', 'all', 'FREE', 'LAND', 'https://www.arkansasheritage.com/arkansas-state-archives', 'Across the river from Memphis.'),

  // ── Before 1870 ─────────────────────────────────────────────────────────
  S('probate', 'County probate, wills and estate inventories', 'County courts (film at FamilySearch)', 'US South', '1700s–1865', 'FREE_ACCOUNT', 'ENSLAVEMENT_ERA', 'https://www.familysearch.org/search/catalog', 'Enslaved people named as property in inventories and divisions — the main bridge across 1870.'),
  S('plantation', 'Records of Ante-Bellum Southern Plantations', 'Univ. Publications of America / libraries', 'US South', '1700s–1865', 'ONSITE', 'ENSLAVEMENT_ERA', 'https://www.worldcat.org', 'Plantation ledgers and birth lists by name.'),
  S('enslaved-org', 'Enslaved.org', 'Matrix, Michigan State University', 'Atlantic world', '1500s–1900', 'FREE', 'ENSLAVEMENT_ERA', 'https://enslaved.org', 'Linked database of people in historical slavery records.'),
  S('slavevoyages', 'SlaveVoyages + African Origins', 'SlaveVoyages consortium', 'Atlantic', '1514–1866', 'FREE', 'DNA', 'https://www.slavevoyages.org', 'Voyages, intra-American trade, and African names recorded from liberated captives.'),
  S('beyond-kin', 'Beyond Kin Project', 'Beyond Kin', 'US', '1600s–1865', 'FREE', 'ENSLAVEMENT_ERA', 'https://beyondkin.org', 'Enslaver descendants documenting enslaved people in their family papers.'),
  S('georgetown', 'Georgetown Slavery Archive and university enslavement projects', 'Georgetown and others', 'US', '1700s–1865', 'FREE', 'ENSLAVEMENT_ERA', 'https://slaveryarchive.georgetown.edu', 'Named sale and transfer records.'),
  S('cohab', 'Freedmen’s marriage and cohabitation registers', 'NARA / state archives', 'US South', '1865–1869', 'FREE_ACCOUNT', 'ENSLAVEMENT_ERA', 'https://www.familysearch.org/search', 'Couples registered marriages formed in slavery, with years together.'),

  // ── Community institutions ──────────────────────────────────────────────
  S('pullman', 'Pullman Company employee records', 'Newberry Library', 'US', '1900–1969', 'REQUEST', 'MILITARY', 'https://www.newberry.org', 'Porter personnel files; the Brotherhood of Sleeping Car Porters reached Canada too.'),
  S('prince-hall', 'Prince Hall Masons, Eastern Star, Elks (IBPOEW), Knights of Pythias', 'Grand lodges', 'US, Canada', '1775–present', 'REQUEST', 'CHURCH_CEMETERY', 'https://www.mwphglus.org', 'Lodge rolls and burial benefits; emblems on headstones point here.'),
  S('rosenwald', 'Rosenwald Fund schools database', 'Fisk University', 'US South', '1917–1932', 'FREE', 'CENSUS', 'http://rosenwald.fisk.edu', 'Which school a grandparent could have attended.'),
  S('green-book', 'Negro Motorist Green Book', 'NYPL Digital Collections', 'US, Canada', '1936–1967', 'FREE', 'LAND', 'https://digitalcollections.nypl.org/collections/the-green-book', 'Lists Black-owned businesses by city — family businesses show up.'),
  S('hbcu-yearbooks', 'HBCU yearbooks and catalogs', 'HBCU libraries / Ancestry', 'US', '1880s–present', 'FREE', 'CENSUS', 'https://www.hbculibraries.org', 'Students, hometowns, photos.'),

  // ── Graves ──────────────────────────────────────────────────────────────
  S('findagrave', 'Find a Grave', 'Ancestry', 'World', 'all', 'FREE', 'CHURCH_CEMETERY', 'https://www.findagrave.com', 'Volunteer memorials with photos and family links.'),
  S('billiongraves', 'BillionGraves', 'BillionGraves', 'World', 'all', 'FREE', 'CHURCH_CEMETERY', 'https://billiongraves.com', 'GPS-tagged headstone photos.'),
  S('va-gravesite', 'VA Nationwide Gravesite Locator', 'US Dept. of Veterans Affairs', 'US', '1862–present', 'FREE', 'MILITARY', 'https://gravelocator.cem.va.gov', 'Memphis National Cemetery holds USCT burials.'),

  // ── DNA ─────────────────────────────────────────────────────────────────
  S('ancestrydna', 'AncestryDNA', 'Ancestry', 'World', 'living', 'PAID', 'DNA', 'https://www.ancestry.com/dna', 'Largest match database; ThruLines suggests shared ancestors.'),
  S('23andme', '23andMe', '23andMe', 'World', 'living', 'PAID', 'DNA', 'https://www.23andme.com', 'Matches plus Y and mt haplogroups.'),
  S('ftdna', 'FamilyTreeDNA (Y-DNA, mtDNA, Family Finder)', 'Gene by Gene', 'World', 'living', 'PAID', 'DNA', 'https://www.familytreedna.com', 'Y-DNA tests the father’s-father line; full mtDNA tests the mother’s-mother line.'),
  S('myheritage-dna', 'MyHeritage DNA', 'MyHeritage', 'World', 'living', 'PAID', 'DNA', 'https://www.myheritage.com/dna', 'Strong international match pool; accepts uploads.'),
  S('gedmatch', 'GEDmatch', 'Qiagen', 'World', 'living', 'FREE', 'DNA', 'https://www.gedmatch.com', 'Compare raw data across companies.'),
  S('african-ancestry', 'African Ancestry', 'African Ancestry Inc.', 'Africa', 'living', 'PAID', 'DNA', 'https://africanancestry.com', 'Y/mt lineage comparison against African reference samples — read with its stated limits.')
]);

export const ACCESS_LABEL = Object.freeze({
  FREE: 'Free', FREE_ACCOUNT: 'Free account', PAID: 'Paid', ONSITE: 'On site', REQUEST: 'Write / request'
});

export function sourcesFor({ desk, region, access, query } = {}) {
  const q = query ? String(query).toLowerCase() : null;
  return SOURCES.filter(s =>
    (!desk || s.desk === desk) &&
    (!access || s.access === access) &&
    (!region || s.region.toLowerCase().includes(String(region).toLowerCase())) &&
    (!q || `${s.name} ${s.holder} ${s.region} ${s.why}`.toLowerCase().includes(q)));
}
